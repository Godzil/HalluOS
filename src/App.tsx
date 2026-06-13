import React, { useState, useEffect } from 'react';
import { 
  Terminal as TerminalIcon, 
  Folder as FolderIcon, 
  PenTool as PenToolIcon, 
  Heart as HeartIcon, 
  ShoppingBag as ShoppingBagIcon, 
  Monitor, 
  Gamepad2, 
  Flame, 
  Compass, 
  Brain, 
  Coffee, 
  Award,
  Settings,
  HelpCircle,
  Database,
  Radio,
  BookOpen,
  Volume2,
  Trash2,
  Calendar,
  Layers,
  ChevronRight,
  Shield,
  Activity,
  Maximize2,
  RefreshCw,
  Info,
  Clock,
  Wifi,
  Menu,
  Sparkles,
  Zap,
  Feather
} from 'lucide-react';
import { PremadeApp, AppInstance, Theme, Layout } from './types';
import { PREMADE_APPS } from './data/premadeApps';
import WindowFrame from './components/WindowFrame';
import WidgetRenderer from './components/WidgetRenderer';
import AppStore from './components/AppStore';
import ThemeWeaver from './components/ThemeWeaver';

// Dynamic Lucide icon lookup component with robust fallback
function getIcon(name: string, className?: string) {
  const iconMap: Record<string, any> = {
    Terminal: TerminalIcon,
    Folder: FolderIcon,
    PenTool: PenToolIcon,
    Heart: HeartIcon,
    ShoppingBag: ShoppingBagIcon,
    Gamepad2, Flame, Compass, Brain, Coffee, Award, Settings, 
    HelpCircle, Database, Radio, BookOpen, Volume2, Trash2, 
    Calendar, Layers, Shield, Activity, Maximize2, Feather
  };
  const IconComponent = iconMap[name] || Monitor;
  return <IconComponent className={className} />;
}

const WALLPAPER_PRESETS = [
  {
    id: 'cyber-dark',
    name: 'Cosmic Frosted Latent Grid',
    cssClass: 'bg-[#0c0c1e] matrix-grid matrix-grid-glow scrolling-grid'
  },
  {
    id: 'abyssal-indigo',
    name: 'Spiritual Aurora Blur',
    cssClass: 'bg-radial from-slate-950 via-[#0c0c1e] to-zinc-950'
  },
  {
    id: 'nebula-flare',
    name: 'Quantum Lavender Mesh',
    cssClass: 'bg-gradient-to-tr from-[#0f0c24] via-[#0c0c1e] to-[#040410] matrix-grid'
  }
];

export default function App() {
  const [temperature, setTemperature] = useState<number>(1.0);
  const [hallucinationLevel, setHallucinationLevel] = useState<number>(3);
  const [showBios, setShowBios] = useState<boolean>(true);
  const [showBootSequence, setShowBootSequence] = useState<boolean>(false);
  const [customTheme, setCustomTheme] = useState<any>(null);
  const [debugLogs, setDebugLogs] = useState<any[]>([]);
  const [showDebugWindow, setShowDebugWindow] = useState<boolean>(false);

  // Persistent Multiple OS sessions storage state
  const [savedSessions, setSavedSessions] = useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [saveSessionName, setSaveSessionName] = useState<string>('');

  const [wallpaper, setWallpaper] = useState(WALLPAPER_PRESETS[0]);
  const [time, setTime] = useState(new Date());
  const [quantumShift, setQuantumShift] = useState(0.0);
  
  const [installedApps, setInstalledApps] = useState<PremadeApp[]>([
    ...PREMADE_APPS,
    {
      appKey: "themeweaver",
      name: "Subconscious Theme Weaver",
      description: "Harness LLM parameters to rewrite color palettes, wallpapers, and fonts on the fly.",
      iconName: "Feather",
      rating: 4.9,
      category: "System Core",
      startingPrompt: "Subconscious Theme Weaver launcher"
    }
  ]);
  const [windows, setWindows] = useState<AppInstance[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [nextZIndex, setNextZIndex] = useState(10);
  
  // OS Shell status
  const [showSystemMenu, setShowSystemMenu] = useState(false);
  const [showNotificationSidebar, setShowNotificationSidebar] = useState(false);
  const [kernelMode, setKernelMode] = useState<'Chaos' | 'Lucid' | 'Cryptic'>('Lucid');
  const [generalLogs, setGeneralLogs] = useState<string[]>([
    "HalluOS Kernel 1.0 booted successfully.",
    "Connecting synaptic mesh with Gemini flash cores.",
    "Desktop environment fully projected in browser iFrame.",
  ]);

  // Load saved sessions from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('halluos_saved_sessions');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSavedSessions(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to read saved sessions", e);
    }
  }, []);

  // Save specific sessions array to storage
  const saveSavedSessionsToStorage = (updatedList: any[]) => {
    try {
      localStorage.setItem('halluos_saved_sessions', JSON.stringify(updatedList));
      setSavedSessions(updatedList);
    } catch (e) {
      console.error("Failed to write saved sessions", e);
    }
  };

  // Perform delete of an existing session
  const handleDeleteSession = (id: string) => {
    const nextList = savedSessions.filter(s => s.id !== id);
    saveSavedSessionsToStorage(nextList);
    if (activeSessionId === id) {
      setActiveSessionId(null);
    }
  };

  // Resume/Boot an existing session from BIOS Screen
  const handleResumeSession = (session: any, quickBoot: boolean) => {
    setTemperature(session.temperature);
    setHallucinationLevel(session.hallucinationLevel);
    
    const matchedWall = WALLPAPER_PRESETS.find(w => w.id === session.wallpaperId) || WALLPAPER_PRESETS[0];
    setWallpaper(matchedWall);
    setKernelMode(session.kernelMode || 'Lucid');
    setInstalledApps(session.installedApps || PREMADE_APPS);
    setWindows(session.windows || []);
    setCustomTheme(session.customTheme || null);
    setGeneralLogs(session.generalLogs || []);
    setActiveSessionId(session.id);
    
    setShowBios(false);
    if (quickBoot) {
      setShowBootSequence(false);
      logToSystem(`Restored core snapshot "${session.name}" instantaneously without decoherence loader.`);
    } else {
      setShowBootSequence(true);
      logToSystem(`Restored core snapshot "${session.name}". Warming up neural oscillators.`);
    }
  };

  // Create & Boot a Brand New Session
  const handleBootNewSession = (sessionName: string, tempVal: number, levelVal: number) => {
    const sId = `os_${Date.now()}`;
    const cleanName = sessionName.trim() || `Neural Core #${savedSessions.length + 1}`;
    
    const defaultLogs = [
      `Initializing environment for "${cleanName}"...`,
      `Establishing synaptic matrix with temperature calibration: ${tempVal.toFixed(2)}`,
      `Quantum distortion level accepted: ${levelVal}/5`
    ];

    const newSessionState = {
      id: sId,
      name: cleanName,
      createdAt: new Date().toLocaleString(),
      temperature: tempVal,
      hallucinationLevel: levelVal,
      wallpaperId: WALLPAPER_PRESETS[0].id,
      kernelMode: 'Lucid' as 'Chaos' | 'Lucid' | 'Cryptic',
      installedApps: [
        ...PREMADE_APPS,
        {
          appKey: "themeweaver",
          name: "Subconscious Theme Weaver",
          description: "Harness LLM parameters to rewrite color palettes, wallpapers, and fonts on the fly.",
          iconName: "Feather",
          rating: 4.9,
          category: "System Core",
          startingPrompt: "Subconscious Theme Weaver launcher"
        }
      ],
      windows: [],
      customTheme: null,
      generalLogs: defaultLogs
    };

    const nextList = [...savedSessions, newSessionState];
    saveSavedSessionsToStorage(nextList);
    
    setTemperature(tempVal);
    setHallucinationLevel(levelVal);
    setWallpaper(WALLPAPER_PRESETS[0]);
    setKernelMode('Lucid');
    setInstalledApps(newSessionState.installedApps);
    setWindows([]);
    setCustomTheme(null);
    setGeneralLogs(defaultLogs);
    setActiveSessionId(sId);
    
    setShowBios(false);
    setShowBootSequence(true);
  };

  // Perform a manual save/snapshot of the current OS state
  const handleSaveCurrentSnapshot = () => {
    const targetId = activeSessionId || `os_${Date.now()}`;
    const defaultName = `Subconscious Live #${savedSessions.filter(s => s.id.startsWith('os_')).length + 1}`;
    const chosenName = saveSessionName.trim() || defaultName;

    const sessionState = {
      id: targetId,
      name: chosenName,
      createdAt: new Date().toLocaleString(),
      temperature,
      hallucinationLevel,
      wallpaperId: wallpaper.id,
      kernelMode,
      installedApps,
      windows,
      customTheme,
      generalLogs
    };

    let nextSessions = [...savedSessions];
    const matchIdx = nextSessions.findIndex(s => s.id === targetId);
    if (matchIdx >= 0) {
      nextSessions[matchIdx] = sessionState;
      logToSystem(`Saved persistent snapshot updates for: "${chosenName}".`);
    } else {
      nextSessions.push(sessionState);
      logToSystem(`Created brand new persistent snapshot profile: "${chosenName}". font-mono`);
    }

    saveSavedSessionsToStorage(nextSessions);
    setActiveSessionId(targetId);
    setSaveSessionName('');
  };

  // Real-time automatic background state projection / auto-saver
  useEffect(() => {
    if (!activeSessionId) return;
    const autoSaveTimer = setTimeout(() => {
      setSavedSessions(prev => {
        const idx = prev.findIndex(s => s.id === activeSessionId);
        if (idx === -1) return prev;
        
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          temperature,
          hallucinationLevel,
          wallpaperId: wallpaper.id,
          kernelMode,
          installedApps,
          windows,
          customTheme,
          generalLogs
        };
        try {
          localStorage.setItem('halluos_saved_sessions', JSON.stringify(updated));
        } catch (e) {
          console.error("Auto-save storage failed", e);
        }
        return updated;
      });
    }, 2000);

    return () => clearTimeout(autoSaveTimer);
  }, [activeSessionId, temperature, hallucinationLevel, wallpaper, kernelMode, installedApps, windows, customTheme, generalLogs]);

  // Sync real clock and quantum fluctuation intervals
  useEffect(() => {
    const clockTimer = setInterval(() => setTime(new Date()), 1000);
    const quantumTimer = setInterval(() => {
      setQuantumShift(prev => {
        const offset = (Math.random() - 0.5) * 0.1;
        const nextVal = Number((prev + offset).toFixed(4));
        return Math.max(-5.0, Math.min(5.0, nextVal));
      });
    }, 3000);

    return () => {
      clearInterval(clockTimer);
      clearInterval(quantumTimer);
    };
  }, []);

  // System general logging utility
  const logToSystem = (text: string) => {
    setGeneralLogs(prev => [...prev.slice(-30), `[${new Date().toLocaleTimeString()}] ${text}`]);
  };

  const addDebugTransaction = (endpoint: string, requestPayload: any, responsePayload: any, latencyMs: number, success: boolean, statusText?: string) => {
    setDebugLogs(prev => [
      {
        id: `dbg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        timestamp: new Date().toLocaleTimeString(),
        endpoint,
        requestPayload,
        responsePayload,
        latencyMs,
        success,
        statusText: statusText || (success ? "OK" : "Error")
      },
      ...prev.slice(0, 49) // limit to last 50 transactions
    ]);
  };

  // Launch a new app instance window
  const launchApp = async (app: PremadeApp) => {
    // If the window/app is already open, prioritize/focus it rather than multiplying
    const existing = windows.find(w => w.appKey === app.appKey);
    if (existing) {
      focusWindow(existing.id);
      if (existing.isMinimized) {
        setWindows(prev => prev.map(w => w.id === existing.id ? { ...w, isMinimized: false } : w));
      }
      return;
    }

    const newInstanceId = `inst_${app.appKey}_${Date.now()}`;
    const windowSpacingX = 50 + (windows.length * 30) % 200;
    const windowSpacingY = 80 + (windows.length * 25) % 150;

    const initialTheme: Theme = {
      bgColor: 'bg-zinc-950',
      textColor: 'text-emerald-400',
      borderColor: 'border-zinc-850',
      accentColor: 'bg-emerald-500'
    };

    const initialLayout: Layout = {
      type: 'container',
      direction: 'flex-col',
      children: [
        {
          id: 'init_lbl',
          type: 'heading',
          value: `Booting ${app.name}...`
        },
        {
          id: 'init_sub',
          type: 'status_alert',
          label: 'System Notification',
          value: 'Synaptic gateway is reaching out to the digital matrix cores. Establishing hallucination parameters.',
          variant: 'info'
        }
      ]
    };

    const newInstance: AppInstance = {
      id: newInstanceId,
      appKey: app.appKey,
      appName: app.name,
      windowTitle: app.name,
      iconName: app.iconName,
      startingPrompt: app.startingPrompt,
      theme: initialTheme,
      layout: initialLayout,
      logs: ["Boot initialized schema", "Connecting to neural cloud core"],
      appState: "",
      history: [],
      isMinimized: false,
      isMaximized: false,
      zIndex: nextZIndex + 1,
      loading: true,
      error: null,
      x: windowSpacingX,
      y: windowSpacingY,
      width: (app.appKey === 'appstore' || app.appKey === 'themeweaver') ? 820 : 540,
      height: (app.appKey === 'appstore' || app.appKey === 'themeweaver') ? 520 : 420
    };

    setNextZIndex(prev => prev + 1);
    setWindows(prev => [...prev, newInstance]);
    setActiveWindowId(newInstanceId);
    logToSystem(`Launching ${app.name} interface session.`);

    // If it's the app store, it is completely local. No initial API latency needed!
    if (app.appKey === 'appstore') {
      setWindows(prev => prev.map(w => w.id === newInstanceId ? {
        ...w,
        loading: false,
        logs: ["App Store online and ready", "Synced trending repository indexes"]
      } : w));
      return;
    }

    // If it's the theme weaver, it is completely local as well
    if (app.appKey === 'themeweaver') {
      setWindows(prev => prev.map(w => w.id === newInstanceId ? {
        ...w,
        loading: false,
        logs: ["Weaver panel online", "Subconscious aesthetics ready to compile"]
      } : w));
      return;
    }

    // Call API for first turn
    const startTime = Date.now();
    try {
      const payload = {
        appName: app.name,
        customPrompt: app.startingPrompt,
        action: null,
        history: [],
        appState: "",
        temperature,
        hallucinationLevel
      };

      const res = await fetch('/api/hallucinate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const latencyMs = Date.now() - startTime;
      let data: any = {};
      if (res.ok) {
        data = await res.json();
      }

      addDebugTransaction('/api/hallucinate', payload, data, latencyMs, res.ok, res.statusText);

      if (!res.ok) {
        throw new Error(data.error || `Server responded with ${res.status}`);
      }
      
      setWindows(prev => prev.map(w => w.id === newInstanceId ? {
        ...w,
        windowTitle: data.windowTitle || w.windowTitle,
        theme: data.theme || w.theme,
        layout: data.layout || w.layout,
        logs: data.logs || w.logs,
        appState: data.appState || w.appState,
        loading: false
      } : w));

      logToSystem(`${app.name} fully structured and hallucinated successfully.`);
    } catch (err: any) {
      console.error(err);
      setWindows(prev => prev.map(w => w.id === newInstanceId ? {
        ...w,
        error: err?.message || "synaptic core unreachable",
        loading: false
      } : w));
      logToSystem(`FAIL: ${app.name} kernel panic during first projection.`);
    }
  };

  // Focus a specific window and bring to front
  const focusWindow = (id: string) => {
    setActiveWindowId(id);
    setWindows(prev => prev.map(w => {
      if (w.id === id) {
        return { ...w, zIndex: nextZIndex + 1 };
      }
      return w;
    }));
    setNextZIndex(prev => prev + 1);
  };

  // Close a running app instance
  const closeWindow = (id: string) => {
    const closingApp = windows.find(w => w.id === id);
    setWindows(prev => prev.filter(w => w.id !== id));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
    if (closingApp) {
      logToSystem(`Terminated instance of ${closingApp.appName}. Freed neural cache.`);
    }
  };

  // Minimize app to bottom bar
  const minimizeWindow = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  // Restore app from taskbar
  const restoreWindow = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: false } : w));
    focusWindow(id);
  };

  // Move or resize window position
  const updateWindowPosition = (id: string, updates: Partial<Pick<AppInstance, 'x' | 'y' | 'width' | 'height' | 'isMaximized'>>) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  // Trigger Action from custom app widgets (Clicks, inputs, select triggers)
  const triggerAppAction = async (windowId: string, elementId: string, actionType: 'click' | 'change' | 'submit', payload?: { value?: string }) => {
    const app = windows.find(w => w.id === windowId);
    if (!app) return;

    // Set application loading
    setWindows(prev => prev.map(w => w.id === windowId ? { ...w, loading: true } : w));

    // Formulate descriptive action token for LLM context
    const actionDetail = {
      elementId,
      actionType,
      value: payload?.value || "",
    };

    // Construct quick readable title for history list
    const actionHistTitle = actionType === 'submit' 
      ? `Input context "${payload?.value}" submitted` 
      : `Clicked parameter widget "${elementId}"`;

    const nextHistory = [...app.history.slice(-15), { action: JSON.stringify(actionDetail), title: actionHistTitle }];

    logToSystem(`Executing trigger ${actionType} on element ${elementId} in ${app.appName}.`);

    const startTime = Date.now();
    try {
      const payload = {
        appName: app.appName,
        customPrompt: app.startingPrompt,
        action: actionDetail,
        history: nextHistory,
        appState: app.appState,
        temperature,
        hallucinationLevel
      };

      const res = await fetch('/api/hallucinate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const latencyMs = Date.now() - startTime;
      let data: any = {};
      if (res.ok) {
        data = await res.json();
      }

      addDebugTransaction('/api/hallucinate', payload, data, latencyMs, res.ok, res.statusText);

      if (!res.ok) {
        throw new Error(data.error || "Subconscious core rejected event.");
      }

      setWindows(prev => prev.map(w => {
        if (w.id === windowId) {
          return {
            ...w,
            windowTitle: data.windowTitle || w.windowTitle,
            theme: data.theme || w.theme,
            layout: data.layout || w.layout,
            logs: data.logs || w.logs,
            appState: data.appState || w.appState,
            history: nextHistory,
            loading: false
          };
        }
        return w;
      }));
      logToSystem(`State updated for ${app.appName}. Model restructured UI.`);
    } catch (err: any) {
      console.error(err);
      setWindows(prev => prev.map(w => w.id === windowId ? {
        ...w,
        error: err?.message || "synaptic signal disruption",
        loading: false
      } : w));
    }
  };

  // Trigger custom custom app installations from Store
  const installAppFromStore = (app: PremadeApp) => {
    // Add to installed drawer list
    setInstalledApps(prev => {
      if (prev.some(a => a.name === app.name)) return prev;
      return [...prev, app];
    });
    logToSystem(`Registered newly hallucinated application "${app.name}" to memory sector.`);
  };

  // System level reboot
  const handleSystemReboot = () => {
    setWindows([]);
    setActiveWindowId(null);
    setShowSystemMenu(false);
    logToSystem("System restart requested. De-allocating components and returning to bios.");
    setShowBios(true);
  };

  if (showBios) {
    return (
      <BiosConfigScreen 
        temperature={temperature}
        setTemperature={setTemperature}
        hallucinationLevel={hallucinationLevel}
        setHallucinationLevel={setHallucinationLevel}
        savedSessions={savedSessions}
        onDeleteSession={handleDeleteSession}
        onResumeSession={handleResumeSession}
        onBootNewSession={handleBootNewSession}
      />
    );
  }

  if (showBootSequence) {
    return (
      <BootSequenceScreen
        temperature={temperature}
        hallucinationLevel={hallucinationLevel}
        addDebugTransaction={addDebugTransaction}
        onCompleteBoot={() => {
          setShowBootSequence(false);
          logToSystem(`Operating system loaded. Projecting desktop environment.`);
        }}
      />
    );
  }

  return (
    <div className={`w-screen h-screen relative overflow-hidden select-none font-sans text-slate-100 ${wallpaper.cssClass}`}>
      {/* Dynamic Mesh Background Layer */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[120px]"></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-pink-500 rounded-full blur-[100px]"></div>
      </div>

      {/* Absolute Header Menu Bar */}
      <div id="desktop-topbox" className="h-10 border-b border-white/10 bg-white/5 backdrop-blur-md absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {/* Logo Menu Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowSystemMenu(!showSystemMenu)}
              className="cursor-pointer flex items-center gap-1.5 hover:text-white transition font-heading font-bold text-sm tracking-wide bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1 rounded-md"
            >
              <Sparkles className="w-4 h-4 text-indigo-300 animate-spin-slow" />
              <span>HalluOS 1.0</span>
            </button>

            {showSystemMenu && (
              <div className="absolute top-8 left-0 w-56 backdrop-blur-3xl bg-white/10 border border-white/20 rounded-xl shadow-2xl p-2 z-50 text-xs text-slate-200 animate-fadeIn select-none ring-1 ring-black/20">
                <div className="px-3 py-2 border-b border-white/10 flex flex-col gap-0.5">
                  <span className="font-bold text-white font-heading">Subconscious Kernel</span>
                  <span className="text-[10px] text-white/50 font-mono">Neural State Router v1.0.4</span>
                </div>
                
                <div className="py-1.5 border-b border-white/10 flex flex-col gap-1">
                  <div className="px-3 py-1 text-[10px] font-mono text-indigo-300 flex justify-between">
                    <span>CPU Synaptic Level:</span>
                    <span>1,824 G-Flops</span>
                  </div>
                  <div className="px-3 py-1 text-[10px] font-mono text-pink-300 flex justify-between">
                    <span>Core Hallu Rate:</span>
                    <span>99.98%</span>
                  </div>
                </div>

                <div className="p-1.5 flex flex-col gap-1">
                  <span className="text-[10px] font-mono text-white/40 px-2 uppercase font-semibold">Kernel Theme Mode</span>
                  {(['Chaos', 'Lucid', 'Cryptic'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        setKernelMode(mode);
                        logToSystem(`Kernel output modifier shifted to "${mode}" mode.`);
                      }}
                      className={`cursor-pointer w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between ${
                        kernelMode === mode 
                          ? 'bg-white/15 font-semibold text-indigo-200 border border-white/10' 
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <span>{mode} Mode</span>
                      {kernelMode === mode && <Zap className="w-3.5 h-3.5 text-indigo-300 animate-pulse" />}
                    </button>
                  ))}
                </div>

                <div className="p-1 px-1.5 border-t border-white/10">
                  <button
                    onClick={handleSystemReboot}
                    className="cursor-pointer w-full text-left text-pink-300 hover:text-white hover:bg-pink-900/20 px-2 py-1.5 rounded-lg flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5 animate-spin-reverse" />
                    Reboot Neural Kernel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick core metrics */}
          <div className="hidden md:flex items-center gap-4 text-[10px] font-mono text-white/45">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-pink-300 animate-pulse" />
              Synapse Spike: <span className="text-indigo-200">{(0.45 + Math.random() * 0.1).toFixed(2)}ns</span>
            </span>
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-indigo-300" />
              Fluctuation Index: <span className="text-indigo-200">{(1.024 + quantumShift).toFixed(4)} q/s</span>
            </span>
          </div>
        </div>

        {/* Top-Right Settings & Clock details */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowNotificationSidebar(!showNotificationSidebar)}
            className="cursor-pointer flex items-center gap-1 text-[11px] font-mono text-pink-300 bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded-md transition"
          >
            <Brain className="w-3.5 h-3.5 animate-pulse text-pink-300" />
            <span>Memory Spikes ({generalLogs.length})</span>
          </button>

          <div className="flex items-center gap-1.5 text-slate-300 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-indigo-300" />
            <span>{time.toLocaleTimeString()}</span>
            <span className="text-[10px] uppercase bg-white/10 px-1.5 py-0.5 rounded text-indigo-200 border border-white/10">
              UTC+QUANTUM
            </span>
          </div>
        </div>
      </div>

      {/* Main Wallpaper/Desktop Surface Canvas */}
      <div 
        id="desktop-canvas-area" 
        className="absolute top-10 bottom-12 left-0 right-0 p-6 flex flex-col items-start gap-4 select-none content-start flex-wrap h-[calc(100vh-88px)] z-10"
        onClick={() => {
          setShowSystemMenu(false);
        }}
      >
        {/* Hallucination Text Overlays (Static Decorative Background Elements) */}
        <div className="absolute bottom-10 left-6 text-[10px] text-white/10 select-none z-0 pointer-events-none font-mono">
          LOG: PROMPT_ID_7782 REWRITING FILE_SYSTEM_STRUCTURE... SUCCESS
        </div>
        <div className="absolute top-10 right-6 text-[10px] text-white/10 select-none text-right z-0 pointer-events-none leading-relaxed font-mono">
          UI_ELEMENTS_ARE_SUGGESTIONS_ONLY<br />
          CLICK_TO_DREAM
        </div>

        {/* Desktop icon buttons */}
        {installedApps.map((app) => (
          <button
            key={app.appKey}
            id={`desktop_app_${app.appKey}`}
            onDoubleClick={() => launchApp(app)}
            onTouchEnd={() => launchApp(app)} // friendly for mobile touch targets
            className="cursor-pointer group flex flex-col items-center gap-1.5 w-20 p-2 rounded-2xl text-center active:scale-95 hover:bg-white/5 border border-transparent hover:border-white/10 hover:backdrop-blur-md transition-all duration-150 z-10"
          >
            <div className="p-3 bg-white/10 backdrop-blur-xl border border-white/20 group-hover:border-white/35 rounded-2xl shadow-xl flex items-center justify-center text-indigo-200 group-hover:text-pink-300 transition-all duration-150 h-12 w-12 shrink-0 group-hover:scale-105">
              {getIcon(app.iconName, "w-6 h-6 stroke-[1.5]")}
            </div>
            <span className="text-[10px] md:text-xs font-semibold font-heading tracking-tight truncate max-w-full drop-shadow-md text-slate-100 group-hover:text-white">
              {app.name}
            </span>
          </button>
        ))}
      </div>

      {/* Floating Application Windows Layer */}
      {windows.map((app) => (
        <WindowFrame
          key={app.id}
          app={app}
          activeWindowId={activeWindowId}
          onClose={closeWindow}
          onMinimize={minimizeWindow}
          onFocus={focusWindow}
          onUpdatePosition={updateWindowPosition}
        >
          {app.appKey === 'appstore' ? (
            <AppStore 
              onInstallApp={installAppFromStore} 
              installedApps={installedApps.map(a => a.name)} 
              temperature={temperature}
              hallucinationLevel={hallucinationLevel}
              addDebugTransaction={addDebugTransaction}
            />
          ) : app.appKey === 'themeweaver' ? (
            <ThemeWeaver
              onApplyTheme={(themeData) => {
                setCustomTheme(themeData);
                logToSystem(`Theme Weaver compiled & bound theme "${themeData.themeName}". OS styles rewritten.`);
              }}
              activeThemeName={customTheme ? customTheme.themeName : 'Default Lucid'}
              temperature={temperature}
              hallucinationLevel={hallucinationLevel}
              addDebugTransaction={addDebugTransaction}
            />
          ) : (
            <WidgetRenderer
              layout={app.layout}
              theme={app.theme}
              onActionTriggered={(elemId, actionType, payload) => triggerAppAction(app.id, elemId, actionType, payload)}
              isLoading={app.loading}
            />
          )}
        </WindowFrame>
      ))}

      {/* Floating System Synaptic Tuning Control Widget */}
      <div className="absolute right-6 top-16 w-80 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-xl text-xs z-10 font-sans">
        <div className="flex justify-between items-center mb-3">
          <div className="flex gap-1.5 items-center">
            <Activity className="w-4 h-4 text-pink-300 animate-pulse" />
            <span className="font-bold text-white tracking-wide">Synaptic Calibrator</span>
          </div>
          <span className="text-[9px] uppercase tracking-wider text-rose-300 bg-pink-500/10 border border-[#f43f5e]/15 px-1.5 py-0.5 rounded font-mono">
            System tuning
          </span>
        </div>

        {/* Temperature slider control */}
        <div className="mb-4">
          <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
            <span>Thermal Excitement Core:</span>
            <span className="text-pink-300 font-bold">{temperature.toFixed(2)} q/s</span>
          </div>
          <input 
            type="range"
            min="0.1"
            max="2.0"
            step="0.05"
            value={temperature}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setTemperature(val);
              logToSystem(`Calibrated synaptic temperature parameter to: ${val.toFixed(2)}`);
            }}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500"
          />
          <p className="text-[9px] text-[#94a3b8] mt-0.5 select-none leading-none">Controls creative entropy and layout bizarreness.</p>
        </div>

        {/* Hallucination Level Control */}
        <div className="mb-1">
          <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
            <span>Hallucination Level:</span>
            <span className="text-indigo-300 font-semibold">Level {hallucinationLevel} ({getLevelLabel(hallucinationLevel)})</span>
          </div>
          <input 
            type="range"
            min="1"
            max="5"
            step="1"
            value={hallucinationLevel}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setHallucinationLevel(val);
              logToSystem(`Cognitive distortion shifted to level: ${val} (${getLevelLabel(val)})`);
            }}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          {/* Diagnostic Tooltip panel */}
          <div className="bg-black/40 border border-white/5 rounded-lg p-2.5 mt-2 text-[10px] text-indigo-200 font-mono leading-normal min-h-[48px] select-none">
            {getLevelInstructions(hallucinationLevel)}
          </div>
        </div>

        {/* Persistent Session Snapshot Sector */}
        <div className="border-t border-white/10 pt-3 mt-3.5 select-none font-mono">
          <div className="flex justify-between items-center text-[10px] text-pink-300 font-bold tracking-widest uppercase mb-2">
            <span>💾 Session Snapshots</span>
            {activeSessionId && (
              <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1 py-0.5 rounded border border-emerald-500/15 animate-pulse flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                Live Sync Active
              </span>
            )}
          </div>

          <div className="space-y-2">
            {activeSessionId && (
              <div className="bg-indigo-950/20 border border-indigo-500/20 rounded p-1.5 text-[9px] text-slate-300 flex flex-col gap-0.5">
                <span className="text-[8px] uppercase tracking-wider text-white/50 font-semibold">Current Active OS Instance</span>
                <span className="text-indigo-200 font-bold truncate">
                  {savedSessions.find(s => s.id === activeSessionId)?.name || "Restored System Module"}
                </span>
              </div>
            )}

            <div className="flex gap-1.5">
              <input
                type="text"
                value={saveSessionName}
                onChange={(e) => setSaveSessionName(e.target.value)}
                placeholder="Name snapshot..."
                className="flex-1 bg-black/45 hover:bg-black/60 border border-white/10 rounded px-2 py-1 text-[11px] text-white focus:outline-none focus:border-pink-500 font-mono"
              />
              <button
                onClick={handleSaveCurrentSnapshot}
                className="cursor-pointer bg-pink-600/80 hover:bg-pink-500 border border-pink-500/30 hover:border-pink-500 text-white font-bold px-2.5 py-1 rounded text-[10px] transition active:scale-95 text-center shrink-0 uppercase"
                title="Capture & Save as persistent session snapshot"
              >
                [ Save ]
              </button>
            </div>

            <button
              onClick={() => {
                logToSystem("Returning to Bios Configuration screen.");
                setShowBios(true);
              }}
              className="cursor-pointer w-full bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 text-slate-300 text-[10px] py-1.5 rounded flex items-center justify-center gap-1.5 font-bold transition uppercase"
            >
              <RefreshCw className="w-3 h-3 animate-spin-reverse text-indigo-300 font-bold" />
              <span>Exit To BIOS Config</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Notification Center / Subconscious Logs Feed */}
      {showNotificationSidebar && (
        <div className="absolute top-10 bottom-12 right-0 w-80 backdrop-blur-3xl bg-white/10 border-l border-white/20 shadow-2xl z-50 flex flex-col animate-slideIn">
          <div className="px-4 py-3 border-b border-white/10 bg-white/5 flex items-center justify-between select-none shrink-0">
            <span className="font-bold text-xs uppercase tracking-wider text-pink-300 font-heading flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-pink-300 animate-pulse" />
              Memory Sector Diaries
            </span>
            <button
              onClick={() => setShowNotificationSidebar(false)}
              className="p-1 hover:bg-white/10 text-slate-300 hover:text-white rounded text-xs px-2 cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 min-h-0">
            {generalLogs.length === 0 ? (
              <span className="text-white/40 text-xs italic font-mono p-4 text-center">No neural thoughts stored in buffer.</span>
            ) : (
              generalLogs.map((log, idx) => (
                <div key={idx} className="p-2 border border-white/10 bg-white/5 rounded-md font-mono text-[10px] text-slate-300 leading-relaxed break-all">
                  {log}
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t border-white/10 bg-white/5 select-none shrink-0 flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-white/50 uppercase">Desktop Ambient Theme</span>
              <div className="grid grid-cols-1 gap-1">
                {WALLPAPER_PRESETS.map((wp) => (
                  <button
                    key={wp.id}
                    onClick={() => {
                      setWallpaper(wp);
                      logToSystem(`Swapped desktop ambient background: ${wp.name}`);
                    }}
                    className={`cursor-pointer text-[10px] text-left px-2 py-1.5 rounded border flex items-center justify-between ${
                      wallpaper.id === wp.id
                        ? 'bg-white/20 text-indigo-200 border-white/30'
                        : 'border-transparent text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    <span>{wp.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setGeneralLogs([])}
              className="cursor-pointer mt-2 bg-pink-500/10 border border-pink-500/20 text-pink-300 hover:bg-pink-500 hover:text-[#0c0c1e] font-bold py-1 px-3 rounded text-[10px] uppercase font-mono transition text-center"
            >
              Purge Cognitive Cache
            </button>
          </div>
        </div>
      )}

      {/* Bottom Taskbar Dock menu with active window lists */}
      <div id="desktop-dock" className="h-14 border-t border-white/10 bg-white/5 backdrop-blur-2xl absolute bottom-0 left-0 right-0 z-50 flex items-center justify-between px-4 select-none">
        <div className="flex items-center gap-1.5">
          {/* Quick-about trigger */}
          <div className="text-[10px] font-mono text-white/40 uppercase pointer-events-none select-none tracking-wider">
            Kernel Subroutine Control
          </div>
        </div>

        {/* Task lists - active applications */}
        <div className="flex-1 flex justify-center items-center gap-2 max-w-xl mx-auto overflow-x-auto px-4 h-full">
          {windows.map((app) => {
            const isWindowActive = activeWindowId === app.id;
            return (
              <button
                key={app.id}
                onClick={() => {
                  if (app.isMinimized) {
                    restoreWindow(app.id);
                  } else if (isWindowActive) {
                    minimizeWindow(app.id);
                  } else {
                    focusWindow(app.id);
                  }
                }}
                className={`cursor-pointer px-3 py-1 rounded-lg text-xs font-heading font-medium tracking-tight h-9 shrink-0 flex items-center gap-1.5 transition border ${
                  isWindowActive 
                    ? 'bg-white/20 text-white border-white/30 shadow-lg shadow-white/5' 
                    : app.isMinimized 
                      ? 'bg-transparent text-white/30 border-white/5 opacity-50' 
                      : 'bg-white/5 text-slate-200 border-white/10 hover:bg-white/10'
                }`}
              >
                {getIcon(app.iconName, `w-4 h-4 ${isWindowActive ? 'text-pink-300' : 'text-indigo-300'}`)}
                <span className="hidden sm:inline max-w-[120px] truncate">{app.appName}</span>
                {/* Active indicator dot */}
                <span className={`w-1.5 h-1.5 rounded-full ${isWindowActive ? 'bg-pink-400 animate-pulse' : 'bg-white/20'}`} />
              </button>
            );
          })}
        </div>

        {/* System parameters */}
        <div className="flex items-center gap-4 text-xs font-mono text-white/40">
          <span className="hidden sm:flex items-center gap-1 select-none">
            <Wifi className="w-3.5 h-3.5 text-indigo-300 animate-pulse" />
            <span>SYNCED</span>
          </span>
          <button
            onClick={() => {
              setShowDebugWindow(!showDebugWindow);
              logToSystem(`Opened raw kernel coherence diagnostics monitor.`);
            }}
            className="cursor-pointer text-[10px] uppercase font-bold text-indigo-200 bg-white/10 hover:bg-white/15 px-2.5 py-1.5 border border-indigo-500/20 rounded font-mono shadow-md active:scale-95 transition"
            title="Open non-hallucinated raw telemetry diagnostics window (Hidden Debug Tool)"
          >
            SYS OK
          </button>
        </div>
      </div>

      {/* Dynamic Style Injector for generated themes */}
      {customTheme && (
        <style dangerouslySetInnerHTML={{ __html: `
          #desktop-topbox {
            background-color: ${customTheme.bgColor || 'rgba(12, 12, 30, 0.4)'} !important;
            border-bottom-color: ${customTheme.borderColor || 'rgba(255,255,255,0.1)'} !important;
          }
          #desktop-dock {
            background-color: ${customTheme.bgColor || 'rgba(12, 12, 30, 0.4)'} !important;
            border-top-color: ${customTheme.borderColor || 'rgba(255,255,255,0.1)'} !important;
          }
          .window-frame-outer {
            border-color: ${customTheme.borderColor || 'rgba(255,255,255,0.1)'} !important;
          }
          .window-titlebar {
            background-color: ${customTheme.bgColor || 'rgba(12, 12, 30, 0.4)'} !important;
          }
          .custom-border {
            border-color: ${customTheme.borderColor || 'rgba(255,255,255,0.1)'} !important;
          }
          .custom-text-color {
            color: ${customTheme.textColor || '#ffffff'} !important;
          }
          .custom-accent-bg {
            background-color: ${customTheme.accentColor || '#ec4899'} !important;
          }
          * {
            ${customTheme.fontFamily ? `font-family: ${customTheme.fontFamily === 'font-mono' ? 'monospace' : customTheme.fontFamily === 'font-serif' ? 'serif' : 'sans-serif'} !important;` : ''}
          }
        ` }} />
      )}

      {/* Non-hallucinated Debug diagnostics monitor */}
      {showDebugWindow && (
        <div className="fixed inset-0 bg-slate-950/95 font-mono text-emerald-400 p-6 z-[999] overflow-y-auto flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-emerald-500/20 pb-4 mb-4">
              <div className="flex items-center gap-2 select-none">
                <Shield className="w-5 h-5 text-emerald-400 animate-pulse" />
                <span className="font-bold text-sm tracking-wider uppercase">Kernel Core Telemetry Diagnostics (COHERENT)</span>
              </div>
              <button
                onClick={() => setShowDebugWindow(false)}
                className="bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 font-bold px-3 py-1.5 rounded cursor-pointer text-xs"
              >
                [ EXIT MONITOR ]
              </button>
            </div>

            <p className="text-[11px] text-emerald-300/85 mb-4 max-w-2xl leading-relaxed select-none">
              This panel operates directly in client memory outside the operating system's hallucination model. Values and records reported below represent raw transaction packets sent to the Gemini AI sub-processor endpoint. Use this tool to verify API metrics and debug voluntary glitches.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-6 text-xs text-center font-mono">
              <div className="p-3 bg-slate-900 border border-emerald-500/20 rounded-xl">
                <span className="text-emerald-500 block mb-0.5 font-bold uppercase select-none">Excitement Coefficient</span>
                <span>{temperature.toFixed(2)} Temp</span>
              </div>
              <div className="p-3 bg-slate-900 border border-emerald-500/20 rounded-xl">
                <span className="text-emerald-500 block mb-0.5 font-bold uppercase select-none">Cognitive Drift rating</span>
                <span>Level {hallucinationLevel} / 5</span>
              </div>
              <div className="p-3 bg-slate-900 border border-emerald-500/20 rounded-xl">
                <span className="text-emerald-500 block mb-0.5 font-bold uppercase select-none">Buffered packets</span>
                <span>{debugLogs.length} Transactions</span>
              </div>
            </div>

            <h3 className="text-xs font-bold uppercase mb-2 border-b border-white/5 pb-1 text-emerald-300 flex justify-between items-center">
              <span>Synaptic Transaction Queue (Active Session Logs)</span>
              <button 
                onClick={() => setDebugLogs([])}
                className="text-[10px] text-amber-500 hover:underline cursor-pointer"
              >
                [ CLEAR BUFFER ]
              </button>
            </h3>

            {debugLogs.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-xs italic">
                Awaiting first synaptic transmission packet... Open an application to begin logging activity.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {debugLogs.map((log) => (
                  <div key={log.id} className="p-4 bg-slate-900 border border-emerald-500/20 rounded-xl text-xs">
                    <div className="flex justify-between items-center mb-2 border-b border-white/5 pb-1 flex-wrap gap-2">
                      <span className="font-bold text-white uppercase">{log.endpoint}</span>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400">
                        <span>TIME: {log.timestamp}</span>
                        <span>LATENCY: {log.latencyMs}ms</span>
                        <span className={log.success ? 'text-emerald-400' : 'text-rose-400'}>
                          STATUS: {log.success ? 'ACCEPTED (200 OK)' : 'KERNEL_PANIC'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] font-mono">
                      <div>
                        <span className="text-indigo-400 block mb-1 font-bold">--- SENT REQUEST PACKAGE ---</span>
                        <pre className="bg-black/40 p-2.5 rounded border border-white/5 overflow-x-auto max-h-48 text-slate-300 whitespace-pre-wrap select-all">
                          {JSON.stringify(log.requestPayload, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <span className="text-pink-400 block mb-1 font-bold">--- RETURNED LAYOUT SCHEMATICS ---</span>
                        <pre className="bg-black/40 p-2.5 rounded border border-white/5 overflow-x-auto max-h-48 text-slate-300 whitespace-pre-wrap select-all">
                          {JSON.stringify(log.responsePayload, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-center font-mono text-[10px] text-slate-500 mt-8 border-t border-emerald-500/20 pt-4 flex justify-between select-none">
            <span>CORE COHERENCE STATUS: OK</span>
            <span>SHIELD ENCRYPTION: ACTIVE</span>
          </div>
        </div>
      )}
    </div>
  );
}

function getLevelLabel(level: number) {
  switch (level) {
    case 1: return "Decoherent Solid";
    case 2: return "Subtle Drifting";
    case 3: return "Dream Standard";
    case 4: return "Psychic Fracture";
    case 5: return "Absolute Singularity";
    default: return "Core Coherent";
  }
}

function getLevelInstructions(level: number) {
  switch (level) {
    case 1: return "Keeps things logical, standard, helpful, and literal. No glitched characters.";
    case 2: return "Poetic subroutines and mild oddities begin appearing in memory logs.";
    case 3: return "Dream standard parameters. Some labels and widgets show creative, weird options.";
    case 4: return "Structural boundaries disintegrate. App results display glitched symbols (Ø, §).";
    case 5: return "MAXIMUM CORE DISSOLVE! Highly glitched layouts, deep AI stream-of-consciousness, and glitched symbols (µ, ¶, Ø_Ø).";
    default: return "";
  }
}

// BIOS configuration boot setup
function BiosConfigScreen({
  temperature,
  setTemperature,
  hallucinationLevel,
  setHallucinationLevel,
  savedSessions,
  onDeleteSession,
  onResumeSession,
  onBootNewSession
}: {
  temperature: number;
  setTemperature: React.Dispatch<React.SetStateAction<number>>;
  hallucinationLevel: number;
  setHallucinationLevel: React.Dispatch<React.SetStateAction<number>>;
  savedSessions: any[];
  onDeleteSession: (id: string) => void;
  onResumeSession: (session: any, quickBoot: boolean) => void;
  onBootNewSession: (sessionName: string, temp: number, level: number) => void;
}) {
  const [newSessionName, setNewSessionName] = useState('');
  const [deleteConfId, setDeleteConfId] = useState<string | null>(null);

  return (
    <div className="w-screen h-screen bg-[#020502] text-[#4af626] font-mono p-4 md:p-8 flex flex-col justify-between overflow-y-auto select-none relative">
      {/* green vector CRT grid and lines */}
      <div className="absolute inset-0 bg-[#4af626]/[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 4px, 6px 100%' }} />

      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col justify-center py-4 text-[#4af626]">
        <div className="border border-[#4af626]/30 bg-[#050e05]/70 p-4 md:p-6 rounded-xl shadow-[0_0_25px_rgba(74,246,38,0.15)] backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#4af626]/30 pb-3 mb-4 gap-2">
            <span className="font-bold text-sm tracking-widest uppercase">HALLUOS SYSTEM CONFIGURATION & BIOS v1.1.24</span>
            <span className="text-[10px] bg-[#4af626]/10 px-1.5 py-0.5 rounded text-[#4af626] font-bold border border-[#4af626]/20">COHERENT SECURED</span>
          </div>

          <div className="text-xs space-y-1 text-[#3beb1c] mb-5 font-mono leading-relaxed">
            <p>CORE CPU: COGNITIVE SUBCONSCIOUS MODEL (GEMINI MODEL ADAPTER)</p>
            <p>BIOS REVISION: SESSIONS_RECOVERY_2026.06.13</p>
            <p>STATUS: ONLINE - MULTIPLE COMPATIBLE OPERATING SYSTEMS LOADED</p>
          </div>

          {/* Two-Column Setup Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Sessions List */}
            <div className="lg:col-span-7 bg-black/25 border border-[#4af626]/20 p-4 rounded-lg flex flex-col h-full min-h-[380px]">
              <h3 className="text-xs font-bold uppercase mb-3 text-white flex items-center justify-between border-b border-[#4af626]/15 pb-1.5 select-none">
                <span>[+] RESUME OR CHOOSE STORED ENVIRONMENT</span>
                <span className="text-[9px] text-[#4af626]/60 font-medium">({savedSessions.length} CACHED)</span>
              </h3>

              {savedSessions.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-xs text-green-700 font-mono italic">
                  <p className="mb-2">--- NO COMPATIBLE OPERATING INSTANCES DEVIATED ---</p>
                  <p className="text-[10px] opacity-75 leading-relaxed">Configure the excitement parameters in the right hand dashboard panel to generate and initialize your first persistent OS sector.</p>
                </div>
              ) : (
                <div className="space-y-3 overflow-y-auto max-h-[340px] pr-1">
                  {savedSessions.map((session) => {
                    const isDeleting = deleteConfId === session.id;

                    return (
                      <div 
                        key={session.id} 
                        className="bg-[#051105] hover:bg-[#091a09] border border-[#4af626]/15 hover:border-[#4af626]/40 rounded-lg p-3 transition duration-150 flex flex-col justify-between gap-2.5"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                              <span className="text-[#3beb1c] font-black">{">"}</span>
                              {session.name}
                            </h4>
                            <p className="text-[10px] text-green-400/60 mt-0.5">
                              SERIAL: <span className="font-mono text-[9px] text-green-500/80">{session.id}</span> • CREATED: {session.createdAt}
                            </p>
                          </div>
                          <div className="flex flex-col items-end text-[9px] border border-[#4af626]/35 bg-[#4af626]/5 rounded px-2 py-0.5 shrink-0">
                            <span className="font-bold">TEMP: {session.temperature.toFixed(2)} q/s</span>
                            <span className="opacity-70">LEVEL: {session.hallucinationLevel}/5</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-between items-center text-[10px] pt-1.5 border-t border-[#4af626]/10">
                          <div className="text-[9px] text-slate-400">
                            APPS: <span className="text-white font-semibold">{(session.installedApps || []).length}</span> •
                            WINDOWS: <span className="text-white font-semibold">{(session.windows || []).length} active</span>
                          </div>

                          <div className="flex gap-2">
                            {isDeleting ? (
                              <div className="flex gap-1.5">
                                <span className="text-rose-400 font-bold shrink-0">PURGE FILE?</span>
                                <button
                                  onClick={() => onDeleteSession(session.id)}
                                  className="cursor-pointer text-xs font-black text-rose-500 hover:text-white bg-rose-950/35 hover:bg-rose-700 px-1.5 rounded transition uppercase border border-rose-500/30"
                                >
                                  [ YES ]
                                </button>
                                <button
                                  onClick={() => setDeleteConfId(null)}
                                  className="cursor-pointer text-xs font-bold text-slate-400 hover:text-[#4af626] px-1.5 rounded transition uppercase"
                                >
                                  [ NO ]
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-2 text-right">
                                <button
                                  onClick={() => onResumeSession(session, true)}
                                  className="cursor-pointer text-[#4af626] font-bold border border-[#4af626]/30 hover:border-[#4af626] hover:bg-[#4af626]/10 px-2 py-0.5 rounded transition text-[9px] uppercase tracking-wide"
                                  title="Skip loading sequence and boot instantaneously"
                                >
                                  [ Quick Boot ]
                                </button>
                                <button
                                  onClick={() => onResumeSession(session, false)}
                                  className="cursor-pointer bg-[#4af626] text-black font-black hover:bg-[#3beb1c] px-2 py-0.5 rounded transition text-[9px] uppercase"
                                  title="Recoil state variables and stream startup loader"
                                >
                                  [ Cold Boot ]
                                </button>
                                <button
                                  onClick={() => setDeleteConfId(session.id)}
                                  className="cursor-pointer text-rose-400/70 hover:text-rose-400 hover:bg-rose-900/10 px-1.5 py-0.5 rounded transition text-[9px] uppercase"
                                  title="Erase session permanently"
                                >
                                  [ PURGE ]
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Setup Panel */}
            <div className="lg:col-span-5 bg-black/30 border border-[#4af626]/25 p-4 rounded-lg flex flex-col justify-between">
              
              <div>
                <h3 className="text-xs font-bold uppercase mb-4 text-white flex items-center gap-1.5 border-b border-[#4af626]/15 pb-1.5">
                  <span>[+] CONFIGURE & LAUNCH NEW INSTANCE</span>
                </h3>

                <div className="space-y-4 text-xs font-mono">
                  {/* Name Registration */}
                  <div>
                    <label className="block text-slate-300 mb-1.5 uppercase tracking-wide text-[10px] font-bold">
                      NEW CORE REGISTERED NAME:
                    </label>
                    <input
                      type="text"
                      value={newSessionName}
                      onChange={(e) => setNewSessionName(e.target.value)}
                      placeholder="e.g. Dreamscape Alpha 1"
                      className="w-full bg-[#051505] border border-[#4af626]/40 hover:border-[#4af626]/80 text-[#4af626] rounded px-3 py-2 text-xs focus:ring-1 focus:ring-[#4af626] focus:outline-none placeholder:text-green-900/70 font-bold"
                    />
                  </div>

                  {/* Temp parameter */}
                  <div className="pt-2 border-t border-[#4af626]/10">
                    <div className="flex justify-between mb-1.5 text-slate-300 select-none">
                      <span>CORE TEMPERATURE (Excitement index):</span>
                      <span className="text-white font-bold">{temperature.toFixed(2)} q/s</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setTemperature(prev => Math.max(0.1, Number((prev - 0.1).toFixed(2))))}
                        className="cursor-pointer bg-[#051505] hover:bg-[#0c250c] border border-[#4af626]/40 text-[#4af626] font-bold px-2 py-1 rounded text-[10px] transition active:scale-95 shrink-0"
                      >
                        [-] Less
                      </button>
                      <input 
                        type="range"
                        min="0.1"
                        max="2.0"
                        step="0.05"
                        value={temperature}
                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                        className="flex-1 accent-[#4af626] h-1.5 rounded-lg appearance-none cursor-pointer bg-white/10"
                      />
                      <button 
                        onClick={() => setTemperature(prev => Math.min(2.0, Number((prev + 0.1).toFixed(2))))}
                        className="cursor-pointer bg-[#051505] hover:bg-[#0c250c] border border-[#4af626]/40 text-[#4af626] font-bold px-2 py-1 rounded text-[10px] transition active:scale-95 shrink-0"
                      >
                        [+] More
                      </button>
                    </div>
                  </div>

                  {/* Level parameters */}
                  <div className="pt-2.5 border-t border-[#4af626]/10">
                    <div className="flex justify-between mb-2 text-slate-300">
                      <span>DISSOCIABILITY LEVEL:</span>
                      <span className="text-white font-bold">Lvl {hallucinationLevel}</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1 shadow-sm">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setHallucinationLevel(lvl)}
                          className={`cursor-pointer text-[10px] py-1.5 rounded text-center border font-bold transition active:scale-95 ${
                            lvl === hallucinationLevel
                              ? 'bg-[#4af626] text-black border-[#4af626]'
                              : 'bg-[#051505] text-[#4af626] border-[#4af626]/30 hover:border-[#4af626]/70'
                          }`}
                        >
                          Lvl {lvl}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-green-300/60 mt-2 font-mono leading-relaxed select-none">
                      {getLevelInstructions(hallucinationLevel)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mt-6">
                <button
                  onClick={() => onBootNewSession(newSessionName, temperature, hallucinationLevel)}
                  className="cursor-pointer w-full text-center bg-[#4af626] hover:bg-[#3beb1c] text-black font-black text-xs py-3 rounded-lg transition duration-150 shadow-[0_0_15px_rgba(74,246,38,0.25)] hover:scale-[1.01] uppercase tracking-wide"
                >
                  [ GENERATE PERSISTENT OS SECTOR ]
                </button>

                <button
                  onClick={() => {
                    setTemperature(1.85);
                    setHallucinationLevel(5);
                    onBootNewSession(newSessionName || "Secret Hyper-Dream OS", 1.85, 5);
                  }}
                  className="cursor-pointer w-full text-center bg-red-950/20 hover:bg-red-900/30 border border-red-500/40 text-red-100 font-bold text-[9px] py-1.5 rounded transition uppercase tracking-wide"
                >
                  [ FORCE HYPER-DREAMS CONVOLUTION ]
                </button>
              </div>

            </div>

          </div>
        </div>
      </div>

      <div className="text-center text-[10px] text-[#4af626]/45 select-none font-mono">
        PRESS [ANY KEY TO DREAM] / BUILT BY THE SUBCONSCIOUS MODEL DIVISION • STABLE MULTI-OS LOADER
      </div>
    </div>
  );
}

// Dynamic LLM-Driven Boot Sequence Player
function BootSequenceScreen({
  temperature,
  hallucinationLevel,
  addDebugTransaction,
  onCompleteBoot
}: {
  temperature: number;
  hallucinationLevel: number;
  addDebugTransaction: any;
  onCompleteBoot: () => void;
}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [displayedSteps, setDisplayedSteps] = useState<any[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Play micro beeps
  const playBeep = (freq = 800, duration = 0.05, type: 'sine' | 'square' = 'sine') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (_) {}
  };

  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = ctx.currentTime;
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.frequency.setValueAtTime(261.63, now);
      osc1.frequency.exponentialRampToValueAtTime(523.25, now + 0.6);
      gain1.gain.setValueAtTime(0.05, now);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(now + 0.8);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.frequency.setValueAtTime(659.25, now + 0.15);
      osc2.frequency.setValueAtTime(783.99, now + 0.3);
      gain2.gain.setValueAtTime(0.03, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start();
      osc2.stop(now + 1.0);
    } catch (_) {}
  };

  // Fetch LLM-driven custom schema on mount
  useEffect(() => {
    let active = true;
    const startTime = Date.now();
    const payload = { temperature, hallucinationLevel };

    async function fetchSequence() {
      try {
        const res = await fetch('/api/boot-sequence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const latencyMs = Date.now() - startTime;
        let result: any = {};
        if (res.ok) {
          result = await res.json();
        }

        if (addDebugTransaction) {
          addDebugTransaction('/api/boot-sequence', payload, result, latencyMs, res.ok, res.statusText);
        }

        if (!res.ok) {
          throw new Error(result.error || "Subconscious core rejected boot query.");
        }

        if (active) {
          setData(result);
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Boot Sequence loading error:", err);
        if (active) {
          setError(err.message || "Failed to establish synchronization mapping.");
          setLoading(false);
        }
      }
    }

    fetchSequence();
    return () => {
      active = false;
    };
  }, [temperature, hallucinationLevel]);

  // Stepper processor
  useEffect(() => {
    if (loading || error || !data || !data.steps || data.steps.length === 0) return;

    let cancel = false;
    let index = 0;

    async function runSteps() {
      while (index < data.steps.length) {
        if (cancel) return;
        const step = data.steps[index];
        setCurrentStepIndex(index);
        setDisplayedSteps(prev => [...prev, step]);

        // sound response click
        if (step.isGlitchy) {
          playBeep(1100, 0.08, 'square');
        } else {
          playBeep(780, 0.05, 'sine');
        }

        setProgressPercent(Math.floor(((index + 1) / data.steps.length) * 100));
        await new Promise(resolve => setTimeout(resolve, step.duration || 300));
        index++;
      }

      if (cancel) return;
      setIsFinished(true);
      playChime();

      await new Promise(resolve => setTimeout(resolve, 2200));
      if (cancel) return;
      onCompleteBoot();
    }

    runSteps();
    return () => {
      cancel = true;
    };
  }, [loading, error, data]);

  const handleSkip = () => {
    playChime();
    onCompleteBoot();
  };

  if (loading) {
    return (
      <div className="w-screen h-screen bg-[#020502] text-[#4af626] font-mono flex flex-col items-center justify-center p-8 select-none relative">
        <div className="absolute inset-0 bg-[#4af626]/[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 4px, 6px 100%' }} />
        <div className="text-center space-y-4 max-w-md border border-[#4af626]/30 bg-[#050e05]/70 p-6 rounded-xl shadow-[0_0_20px_rgba(74,246,38,0.15)] relative overflow-hidden">
          <div className="w-12 h-12 border-2 border-t-[#4af626] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs uppercase tracking-widest font-black text-white">DECOHERING COGNITIVE MATRIX SCHEMA...</p>
          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
            <div className="h-full bg-[#4af626] animate-pulse" style={{ width: '60%' }}></div>
          </div>
          <p className="text-[10px] text-green-400/60 leading-normal">
            Querying server-side model core via /api/boot-sequence. Temperature calibrate: {temperature.toFixed(2)} q/s. Distortion level: {hallucinationLevel}/5.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-screen h-screen bg-[#0d0303] text-red-500 font-mono flex flex-col items-center justify-center p-8 select-none relative">
        <div className="max-w-md border border-red-500/30 bg-red-950/10 p-6 rounded-xl shadow-lg text-center space-y-4 relative">
          <p className="text-xs font-black uppercase tracking-wider text-white">KERNEL PANIC / DECOHERENCE RESISTANCE</p>
          <p className="text-[11px] text-red-400 bg-red-950/40 p-3 rounded-lg border border-red-500/20 text-left overflow-x-auto whitespace-pre-wrap max-h-40 font-mono">
            {error}
          </p>
          <button
            onClick={handleSkip}
            className="w-full py-2 bg-red-950 border border-red-500/40 hover:bg-red-900/50 text-white font-bold text-xs rounded-lg transition active:scale-95 cursor-pointer uppercase"
          >
            [ BYPASS COHERENCE PROTECTION & LOGIN ]
          </button>
        </div>
      </div>
    );
  }

  const { osTitle, osSubcaption, textColor, bgColor, borderColor, bannerArt, welcomeQuote } = data;
  const activeEffect = data.steps[currentStepIndex]?.visualEffect || "none";

  return (
    <div className={`w-screen h-screen ${bgColor || 'bg-[#020502]'} ${textColor || 'text-[#4af626]'} font-mono overflow-hidden select-none p-6 md:p-12 relative flex flex-col justify-between`}>
      {/* green vector CRT grid and lines scanlines layout */}
      <div className="absolute inset-0 bg-current opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 4px, 6px 100%' }} />

      {/* RENDER DYNAMIC CANVAS EFFECTS CHOSEN BY LLM */}
      {activeEffect === 'binary-rain' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
          <div className="grid grid-cols-12 gap-2 text-center text-[10px] select-none h-full font-mono animate-pulse">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex flex-col h-full leading-none text-current">
                {Array.from({ length: 30 }).map((_, j) => (
                  <span key={j} className="text-current block" style={{ opacity: Math.sin((j + i) * 0.5) * 0.5 + 0.5 }}>
                    {Math.random() > 0.5 ? '1' : '0'}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeEffect === 'matrix-grid' && (
        <div className="absolute inset-0 pointer-events-none opacity-5 flex items-center justify-center">
          <svg className="w-full h-full max-w-4xl animate-pulse" viewBox="0 0 100 100" preserveAspectRatio="none text-current">
            <path d="M 0,10 L 100,10 M 0,20 L 100,20 M 0,30 L 100,30 M 0,40 L 100,40 M 0,50 L 100,50 M 0,60 L 100,60 M 0,70 L 100,70 M 0,80 L 100,80 M 0,90 L 100,90" fill="none" stroke="currentColor" strokeWidth="0.1" />
            <path d="M 10,0 L 10,100 M 20,0 L 20,100 M 30,0 L 30,100 M 40,0 L 40,100 M 50,0 L 50,100 M 60,0 L 60,100 M 70,0 L 70,100 M 80,0 L 80,100 M 90,0 L 90,100" fill="none" stroke="currentColor" strokeWidth="0.1" />
          </svg>
        </div>
      )}

      {activeEffect === 'pulse-scan' && (
        <div className="absolute top-0 left-0 w-full h-1 bg-current opacity-30 shadow-[0_0_15px_currentColor] pointer-events-none animate-bounce" />
      )}

      {/* Screen interface structure */}
      <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col justify-between py-4 relative z-10">
        <div>
          <div className={`flex justify-between items-center border-b ${borderColor || 'border-current/20'} pb-3 mb-4`}>
            <div>
              <h1 className="font-extrabold tracking-widest text-sm uppercase">{osTitle || "SUBCONSCIOUS VIRAL CORE"}</h1>
              <p className="text-[10px] opacity-75 uppercase tracking-wider">{osSubcaption || "PROJECTING COGNITIVE LAYER"}</p>
            </div>
            <div className={`text-[10px] border ${borderColor || 'border-current/30'} px-2 py-0.5 rounded font-bold uppercase select-none flex items-center gap-1`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
              CALIBRATION: {temperature.toFixed(2)} | LVL {hallucinationLevel}
            </div>
          </div>

          {bannerArt && (
            <pre className="text-[9px] md:text-xs leading-none whitespace-pre overflow-x-auto select-none opacity-85 py-2 font-mono scrollbar-none mb-4">
              {bannerArt}
            </pre>
          )}

          <div className="space-y-1 text-xs select-none overflow-y-auto max-h-[48vh] pr-4 leading-normal font-mono scrollbar-none">
            {displayedSteps.map((step, i) => (
              <div 
                key={i} 
                className={`flex justify-between items-start ${step.isGlitchy ? 'animate-pulse text-red-400 font-bold' : ''}`}
              >
                <div className="flex gap-2 items-start">
                  <span className="opacity-40 select-none">&gt;</span>
                  <span>{step.label}</span>
                </div>
                <span className="opacity-50 text-[10px] tracking-wider select-none">
                  {step.isGlitchy ? '[ ▓ GLITCH ▓ ]' : '[ OK ]'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-current/25 pt-4 space-y-4">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold">COHERENCE STACK PROGRESS:</span>
            <div className="flex gap-3 items-center">
              <span className="font-mono text-[10px] cursor-pointer hover:underline border border-current/30 px-1.5 rounded bg-black/40" onClick={handleSkip}>
                [ SKIP TO DESKTOP ]
              </span>
              <span className="font-bold">{progressPercent}%</span>
            </div>
          </div>
          
          <div className={`w-full h-3 border ${borderColor || 'border-current/30'} p-0.5 rounded overflow-hidden bg-black/20`}>
            <div 
              className="h-full bg-current transition-all duration-150 rounded" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {isFinished && welcomeQuote && (
            <div className="bg-white/5 border border-current/20 p-4 rounded-xl text-center backdrop-blur-md animate-pulse">
              <span className="text-[9px] uppercase tracking-widest block opacity-60 font-black mb-1">=== SECURED LOGIN QUOTE ===</span>
              <p className="text-xs uppercase italic font-black text-white leading-relaxed">&ldquo;{welcomeQuote}&rdquo;</p>
            </div>
          )}

          <div className="flex justify-between items-center text-[9px] opacity-40 select-none">
            <span>READY STATE: AWAITING SEGMENT DECOHERENCE</span>
            <span>SYSTEM ENCRYPTION BROLLM-V8</span>
          </div>
        </div>
      </div>
    </div>
  );
}
