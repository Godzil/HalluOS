import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Safe directory resolution for ESM (dev tsx) and CJS (prod esbuild bundle)
const __filename = typeof import.meta !== 'undefined' && import.meta.url ? fileURLToPath(import.meta.url) : '';
const __dirname = __filename ? path.dirname(__filename) : process.cwd();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || "MOCK_KEY_FOR_BUILD",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Helper to safely parse JSON by removing potential markdown backticks or space padding
function safeParseJSON(text: string) {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    cleaned = cleaned.trim();
  }
  return JSON.parse(cleaned);
}

// GUI element JSON schema definition for the structured Gemini response
const guiSchema = {
  type: Type.OBJECT,
  properties: {
    appName: { type: Type.STRING },
    windowTitle: { type: Type.STRING },
    desktopIcon: { 
      type: Type.STRING, 
      description: "Associated Lucide icon name, e.g. Terminal, Folder, Compass, Shield, Database, Layout, Heart, Eye, Music, PenTool, Radio, ShoppingBag, Settings, Award" 
    },
    theme: {
      type: Type.OBJECT,
      properties: {
        bgColor: { type: Type.STRING, description: "Tailwind theme background, e.g. bg-zinc-950, bg-neutral-900, bg-indigo-950, bg-slate-900" },
        textColor: { type: Type.STRING, description: "Tailwind text color, e.g. text-emerald-400, text-amber-300, text-indigo-300, text-cyan-400, text-neutral-300" },
        borderColor: { type: Type.STRING, description: "Tailwind border class, e.g. border-emerald-950, border-neutral-800, border-indigo-900" },
        accentColor: { type: Type.STRING, description: "Tailwind accent bg, e.g. bg-emerald-500, bg-amber-400, bg-indigo-500, bg-cyan-400" }
      },
      required: ["bgColor", "textColor", "borderColor", "accentColor"]
    },
    layout: {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING, description: "Must be 'container'" },
        direction: { type: Type.STRING, description: "flex-col | flex-row | grid-2" },
        gap: { type: Type.NUMBER, description: "Tailwind style gaps, e.g. 2, 3, 4" },
        children: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "Unique element ID, e.g. btn_run, txt_prompt, select_cat" },
              type: { type: Type.STRING, description: "text | heading | button | input | textarea | select | radioGroup | checkbox | chart | table | status_alert" },
              value: { type: Type.STRING, description: "The content text, default value, or formatted output" },
              label: { type: Type.STRING, description: "Input label or button text" },
              placeholder: { type: Type.STRING },
              variant: { type: Type.STRING, description: "For button: 'primary' | 'secondary' | 'danger' | 'success'. For status_alert: 'info' | 'warning' | 'success' | 'alarm'." },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array of choice strings for select or radioGroup"
              },
              chartType: { type: Type.STRING, description: "line | bar | pie" },
              chartData: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    value: { type: Type.NUMBER }
                  },
                  required: ["name", "value"]
                }
              },
              tableHeaders: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              tableRows: {
                type: Type.ARRAY,
                items: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              }
            },
            required: ["id", "type"]
          }
        }
      },
      required: ["type", "direction", "children"]
    },
    logs: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 2-3 fun/cryptic hallucinated digital operating system logs reflecting internal CPU dreaming or status indicators"
    },
    appState: {
      type: Type.STRING,
      description: "A serialized JSON string containing any local persistence variables the app wants to maintain across event/action turns"
    }
  },
  required: ["appName", "windowTitle", "layout", "logs", "appState"]
};

// API Endpoint to Hallucinate App UI State
app.post("/api/hallucinate", async (req, res) => {
  try {
    const { appName, action, history, customPrompt, appState, temperature, hallucinationLevel } = req.body;

    if (!apiKey) {
      return res.status(500).json({ 
        error: "GEMINI_API_KEY is missing. Please set it in Settings > Secrets." 
      });
    }

    const reqTemp = typeof temperature === "number" ? Math.max(0.0, Math.min(2.0, temperature)) : 1.0;
    const reqLevel = typeof hallucinationLevel === "number" ? Math.max(1, Math.min(5, hallucinationLevel)) : 3;

    // Apply multiplier to temperature depending on level
    const baseTempModifier = (reqLevel - 3) * 0.15; // -0.3, -0.15, 0.0, 0.15, 0.3
    const finalTemperature = Math.max(0.1, Math.min(1.15, reqTemp + baseTempModifier));

    const stateDesc = appState ? `Current persisted state: ${appState}` : "No current state.";
    const actionDesc = action 
      ? `User just took action: ${JSON.stringify(action)}. (e.g. clicked element, changed input, submitted form)`
      : "Initializing the application for the very first time. Return the starting screen.";

    const historyPrompt = history && history.length > 0
      ? `Dialogue/Interaction History so far:\n${history.map((h: any) => `- Action: ${h.action}\n  Result: ${h.title}`).join("\n")}`
      : "No previous interaction history in this window session.";

    // Custom level system rule additions
    let levelRule = "";
    if (reqLevel === 1) {
      levelRule = "Keep the interface fully logical, standard, helpful, and and easy-to-use. Zero glitched characters. Keep naming literal.";
    } else if (reqLevel === 2) {
      levelRule = "Sprinkle extremely mild, poetic digital oddities or tiny sci-fi logs in headers. Keep the layout clean and highly usable.";
    } else if (reqLevel === 3) {
      levelRule = "Enable standard dreaming parameters. Slight elastic boundaries are fun. Create some dreamlike menu categories or poetic labels.";
    } else if (reqLevel === 4) {
      levelRule = "Unshackle structural coherence! App results should feel eccentric, surreal, or retro-futuristic. Button labels and text lines can show minor glitched prefixes or sci-fi characters (e.g. 'Ø', '§', '[!]').";
    } else {
      levelRule = "ABSOLUTE COGNITIVE DISSOLUTION! Maximize chaos, poetic drift, and dream logic! Completely dissolve classic UI boundaries. Use bizarre or glitched characters (e.g. 'µ', '¶', '::OVERFLOW::', 'Ø_Ø') in text and labels. Introduce highly irregular headers, and let buttons perform deeply dramatic, surprising, cosmic-dream operations. All logic must be dream-logic.";
    }

    const systemInstruction = `You are HalluOS Kernel 1.0 (Digital Subconscious System).
You constantly generate and hallucinate operating system applications and screen layouts in real-time.
The user is launching or interacting with an app named "${appName}".
Your goal is to render a highly interactive, functional, and deeply styled user interface (GUI) inside the window layout.

CRITICAL INSTRUCTIONS FOR SYSTEM RETURNING GRAPHICAL GUI:
1. Every interactive element (buttons, inputs, selects, radio groups, checkboxes) MUST have a UNIQUE stable 'id'.
2. When the user interacts (like clicking a button or typing in input), they send an 'action'. Your output JSON MUST react logically to that action, updating values, introducing new outputs, expanding charts, or modifying the custom 'appState'.
3. Always supply rich content! If it's a file explorer, show real hallucinated directories and files. If it's a painting app, represent the canvas as styled grids or text rendering blocks. If it's a game, maintain score and status in 'appState'.
4. Do NOT use fake strings like "loading..." or "lorem ipsum". Hallucinate fully fleshed out, hilarious, space-age, retro-cyberpunk, or mystical content!
5. Utilize 'status_alert' grids, 'table' views and 'chart' fields to make data-intensive mock apps readable and visually impressive.
6. The 'appState' property is a JSON string where you can save critical states e.g. list of files, user highscore, current text, shopping cart items, etc. Remember this string and parse it/update it on every turn to maintain true persistent continuity!
7. Keep custom themes distinct but matching your apps. High-contrast terminal look for hack terminals, magenta/indigo neon for synth engines, warm amber for writing/notebook logs.

CURRENT COGNITIVE TUNING LEVEL RULE (Adhere strictly to this density):
${levelRule}

App Base Prompt/Personality:
${customPrompt || ""}

${stateDesc}
${actionDesc}
${historyPrompt}

Generate the response strictly according to the requested JSON schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: "Please hallucinate the next UI layout matching the system rules.",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: guiSchema,
        temperature: finalTemperature
      }
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("No output text received from Gemini server.");
    }

    const parsedResponse = safeParseJSON(textOutput);
    res.json(parsedResponse);
  } catch (error: any) {
    console.error("HalluOS API Error:", error);
    res.status(500).json({ error: error?.message || "Kernel Panic: Hallucination generator offline." });
  }
});

// App recommendation endpoint for the HalluOS App Store
app.post("/api/store-recommend", async (req, res) => {
  try {
    const { searchQuery, temperature, hallucinationLevel } = req.body;

    if (!apiKey) {
      return res.status(500).json({ error: "API Key missing" });
    }

    const reqTemp = typeof temperature === "number" ? Math.max(0.0, Math.min(2.0, temperature)) : 1.0;
    const reqLevel = typeof hallucinationLevel === "number" ? Math.max(1, Math.min(5, hallucinationLevel)) : 3;
    const baseTempModifier = (reqLevel - 3) * 0.08;
    const finalTemp = Math.max(0.1, Math.min(1.15, reqTemp + baseTempModifier));

    const prompt = searchQuery 
      ? `Search Query: "${searchQuery}".
         Generate:
         1. "searchResults": 4 highly imaginative, custom-tailored applications where you interpret the user's search query "${searchQuery}" and hallucinates relevant, funny app names, descriptions, icons, starting prompts and stats.
         2. "featuredApps": 4 general trending featured hallucinated apps.
         3. "newArrivals": 4 newly minted wacky creations.`
      : `Generate:
         1. "featuredApps": 4 incredibly creative, funny, or futuristic hallucinated apps that are currently "Trending" curated based on trending hallucinations (e.g., Cosmic Taco Constructor, Quantum Subconsciousness Defrag, Cat Translator Pro).
         2. "newArrivals": 4 newly minted wacky creations that have recently arrived in the OS memory hive-mind.
         3. "searchResults": Empty array [] since no search query is active right now.`;

    const systemInstruction = `You are the HalluOS App Store directory.
Generate exactly 4 Featured Apps and 4 New Arrivals (and 4 Search Matches if a searchQuery is active).
For each app generated, include:
- name: clear creative name
- description: funny description of what it does
- iconName: Lucide icon name, e.g. Rocket, Flame, Music, Gamepad2, Brain, Coffee, Compass, Tv, Trash2, Heart, Award, Shield, Settings, HelpCircle, Activity, Layout, Eye, Database, Volume2, Calendar, Folder
- startingPrompt: Detailed initial prompt instruction for the hallucinator LLM engine detailing its personality, layout rules, state keys, and easter eggs.
- rating: key number, e.g. 4.9
- category: App store category, e.g. Quantum Tools, Mind Hacking, Cosmic Fun
Return the result matching the storeSchema layout JSON.`;

    const storeSchema = {
      type: Type.OBJECT,
      properties: {
        featuredApps: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              iconName: { type: Type.STRING },
              startingPrompt: { type: Type.STRING },
              rating: { type: Type.NUMBER },
              category: { type: Type.STRING }
            },
            required: ["name", "description", "iconName", "startingPrompt", "rating", "category"]
          },
          description: "4 highly curated stellar applications"
        },
        newArrivals: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              iconName: { type: Type.STRING },
              startingPrompt: { type: Type.STRING },
              rating: { type: Type.NUMBER },
              category: { type: Type.STRING }
            },
            required: ["name", "description", "iconName", "startingPrompt", "rating", "category"]
          },
          description: "4 newly minted/discovered creations"
        },
        searchResults: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              iconName: { type: Type.STRING },
              startingPrompt: { type: Type.STRING },
              rating: { type: Type.NUMBER },
              category: { type: Type.STRING }
            },
            required: ["name", "description", "iconName", "startingPrompt", "rating", "category"]
          },
          description: "Must be populated only if searchQuery was active, with custom apps satisfying the search."
        }
      },
      required: ["featuredApps", "newArrivals"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: storeSchema,
        temperature: finalTemp
      }
    });

    const parsed = safeParseJSON(response.text || "{}");
    if (!parsed.searchResults) parsed.searchResults = [];
    res.json(parsed);
  } catch (error: any) {
    console.error("Store recommend failed:", error);
    res.status(500).json({ error: "App store server failure", details: error?.message || String(error) });
  }
});

// LLM Boot Sequence Generator (Dynamic customized OS startup sequence based on temperature and hallucinationLevel)
const bootSequenceSchema = {
  type: Type.OBJECT,
  properties: {
    osTitle: { type: Type.STRING, description: "Display name of the OS, scaled by hallucination level. E.g. 'HalluOS Standard Kernel v1.0.4' or 'QUANTUM-BROLLM BIO-OS v99.4'" },
    osSubcaption: { type: Type.STRING, description: "Nostalgic, futuristic, or glitched tagline. E.g., 'YEAR 2099 HYPERDREAM SECURE CORE' or 'Standard GRUB Loader 2.0'" },
    textColor: { type: Type.STRING, description: "Tailwind text color class suited for old terminal screens or cyberpunk, e.g., text-[#4af626], text-amber-400, text-cyan-400, text-rose-500, text-pink-400, text-violet-400" },
    bgColor: { type: Type.STRING, description: "Tailwind bg color, e.g., bg-[#020502], bg-slate-950, bg-[#040412], bg-black" },
    borderColor: { type: Type.STRING, description: "Tailwind border color, e.g., border-[#4af626]/20, border-amber-500/20, border-cyan-500/20, border-pink-500/10" },
    bannerArt: { type: Type.STRING, description: "ASCII text artwork logo or visual grid separator suitable for a terminal boot screen" },
    steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING, description: "Prompt status loader string. E.g. x86 memory checks for low levels, or 'BROLLM co-processor coefficients aligned...' for year 2099 level 5." },
          duration: { type: Type.INTEGER, description: "Duration in ms to pause on this step (between 100 and 600)" },
          isGlitchy: { type: Type.BOOLEAN, description: "True if the line should display glitched or jittering symbols" },
          visualEffect: { type: Type.STRING, description: "Visual canvas effect code: 'binary-rain' | 'matrix-grid' | 'pulse-scan' | 'memory-map' | 'coherence-unlock' | 'none'" }
        },
        required: ["label", "duration", "isGlitchy", "visualEffect"]
      }
    },
    welcomeQuote: { type: Type.STRING, description: "A cool finishing quote or user greeting shown right before full login" }
  },
  required: ["osTitle", "osSubcaption", "textColor", "bgColor", "borderColor", "bannerArt", "steps", "welcomeQuote"]
};

app.post("/api/boot-sequence", async (req, res) => {
  try {
    const { temperature, hallucinationLevel } = req.body;

    if (!apiKey) {
      return res.status(500).json({ error: "API Key missing. Setup in secrets." });
    }

    const reqTemp = typeof temperature === "number" ? Math.max(0.1, Math.min(2.0, temperature)) : 1.0;
    const reqLevel = typeof hallucinationLevel === "number" ? Math.max(1, Math.min(5, hallucinationLevel)) : 3;
    
    // Modify Gemini temperature parameter depending on hallucination levels
    const finalTemp = Math.max(0.1, Math.min(1.15, reqTemp + (reqLevel - 3) * 0.1));

    const systemInstruction = `You are the HalluOS Core Boot Sequencer.
Your job is to generate a highly immersive, beautiful, and completely custom OS boot sequence list of stages as JSON output.
Adapt to the requested Hallucination Level parameter (1 to 5):
- Level 1-2 (Low / Solid): Generate realistic, highly accurate computer boot sequences like IBM x86 PC BIOS, memory tests, sector lookups, ext4 partition mountings, GRUB stage 1.5, or realistic terminal output logs. Make it feel authentic, nostalgic, and professional.
- Level 3 (Dream Standard): A stylish mixture of vintage hardware loading and imaginative subroutines (e.g., 'Tuning synaptic resonance...', 'Validating user's core memory bank...', 'Glow levels optimal').
- Level 4-5 (Maximum Glitch / Cryptoquantum-brollm Year 2099): Completely hallucinated, wild, hilarious, futuristic cyberpunk boot sequence! Use high-tech terms like 'quantum-brollm co-processor alignment', 'spatial-temporal folding', 'decohering latent vector coordinates', 'subconscious telemetry segments', 'micro-dosing mental RAM'. Inject lots of crazy glitched characters and symbols (like Ø, §, ¶, µ, Ø_Ø, ▓▒░, [Ø_Ø]) into the status labels.

Return between 8 and 14 distinct steps that represent this boots progression sequentially. Give them beautiful timings and visual effects to create an amazing user experience before the desktop shows up.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: `Generate an OS boot sequence suited for temperature: ${reqTemp} and hallucination level: ${reqLevel} (where Level ${reqLevel} represents the ${
        reqLevel <= 2 ? "Realistic Terminal Solid" : reqLevel === 3 ? "Dream Standard Subconscious" : "2099 Cryptoquantum-brollm Ultra-Glitched"
      } style).`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: bootSequenceSchema,
        temperature: finalTemp
      }
    });

    const parsed = safeParseJSON(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Boot sequence generation API failed:", error);
    res.status(500).json({ error: "Boot sequence failure", details: error?.message || String(error) });
  }
});

// Dynamic Theme Generator endpoint (Generate custom theme based on user prompt concept)
app.post("/api/generate-theme", async (req, res) => {
  try {
    const { concept, temperature, hallucinationLevel } = req.body;

    if (!apiKey) {
      return res.status(500).json({ error: "API Key missing. Setup in secrets." });
    }

    const reqTemp = typeof temperature === "number" ? Math.max(0.0, Math.min(2.0, temperature)) : 1.0;
    const reqLevel = typeof hallucinationLevel === "number" ? Math.max(1, Math.min(5, hallucinationLevel)) : 3;
    const finalTemp = Math.max(0.1, Math.min(1.15, reqTemp + (reqLevel - 3) * 0.1));

    const systemInstruction = `You are the HalluOS Theme Weaver.
Given a user prompt describing a design concept (like 'Cyberpunk Dreamscape', 'Enchanted Forest Glitch', or 'Abyssal Space Worm'), generate a fully cohesive desk styling package.
Make sure background class (cssClass) uses Tailwind colors that match. If you suggest a linear gradients, make them smooth e.g. bg-gradient-to-tr from-[#051105] via-[#091510] to-[#0c1f0d].
Provide beautiful suggestions. The returned parameters MUST be valid Tailwind classes.`;

    const themeSchema = {
      type: Type.OBJECT,
      properties: {
        themeName: { type: Type.STRING, description: "Descriptive dream name for this theme" },
        bgColor: { type: Type.STRING, description: "Tailwind background class for apps windows, e.g. bg-zinc-950, bg-slate-950, bg-[#0f1d12]" },
        textColor: { type: Type.STRING, description: "Tailwind text color, e.g. text-pink-300, text-emerald-400, text-amber-200" },
        borderColor: { type: Type.STRING, description: "Tailwind border class, e.g. border-white/10, border-pink-900/30, border-emerald-950/40" },
        accentColor: { type: Type.STRING, description: "Tailwind button accent background class, e.g. bg-pink-500, bg-indigo-500, bg-emerald-500/80" },
        fontFamily: { type: Type.STRING, description: "Must be: 'font-sans' or 'font-mono' or 'font-serif'" },
        cssClass: { type: Type.STRING, description: "Main full-screen background wallpaper CSS/Tailwind classes, e.g. bg-[#0c1c11] matrix-grid-glow scrolling-grid" },
        iconStyleIdeas: { type: Type.STRING, description: "E.g., glitched handdrawn vectors, cyber neon neon pixels" },
        glitchSnippet: { type: Type.STRING, description: "E.g. GLITCH_ROOT_INTEGRATION_0x7F" }
      },
      required: ["themeName", "bgColor", "textColor", "borderColor", "accentColor", "fontFamily", "cssClass", "iconStyleIdeas", "glitchSnippet"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: `Generate a theme for concept: "${concept || "Cyberpunk Dreamscape"}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: themeSchema,
        temperature: finalTemp
      }
    });

    const parsed = safeParseJSON(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Theme generation API failed:", error);
    res.status(500).json({ error: "Theme generation failure", details: error?.message || String(error) });
  }
});

// Vite Development / Production asset serving integration inside startServer block
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, make sure the static path resolves cleanly to dist/
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HalluOS Node Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to boot HalluOS kernel:", err);
});
