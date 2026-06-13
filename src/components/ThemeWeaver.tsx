import React, { useState } from 'react';
import { Sparkles, Palette, Type, ShieldAlert, Cpu, Check, Feather } from 'lucide-react';

interface ThemeWeaverProps {
  onApplyTheme: (theme: any) => void;
  activeThemeName: string;
  temperature: number;
  hallucinationLevel: number;
  addDebugTransaction: (endpoint: string, requestPayload: any, responsePayload: any, latencyMs: number, success: boolean, statusText?: string) => void;
}

export default function ThemeWeaver({
  onApplyTheme,
  activeThemeName,
  temperature,
  hallucinationLevel,
  addDebugTransaction
}: ThemeWeaverProps) {
  const [concept, setConcept] = useState('Cyberpunk Dreamscape');
  const [loading, setLoading] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleWeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim()) return;

    setLoading(true);
    setError(null);
    const startTime = Date.now();

    try {
      const payload = {
        concept: concept.trim(),
        temperature,
        hallucinationLevel
      };

      const res = await fetch('/api/generate-theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Neural generator returned empty response. Please check your secrets.');
      }

      const data = await res.json();
      const latency = Date.now() - startTime;

      if (addDebugTransaction) {
        addDebugTransaction('/api/generate-theme', payload, data, latency, res.ok, res.statusText);
      }

      if (data && data.themeName) {
        setPreviewTheme(data);
      } else {
        throw new Error('Theme format invalid or missing parameters.');
      }
    } catch (err: any) {
      console.error('Weaving failed:', err);
      setError(err?.message || 'Synaptic disconnect occurred while weaving theme.');
    } finally {
      setLoading(false);
    }
  };

  const applyWeavedTheme = () => {
    if (!previewTheme) return;
    onApplyTheme(previewTheme);
  };

  return (
    <div className="p-5 overflow-y-auto h-full max-h-[550px] font-sans scrollbar-thin text-white">
      <div className="mb-6 flex gap-3 items-center">
        <div className="p-3 bg-pink-500/10 border border-pink-500/25 rounded-2xl text-pink-300">
          <Palette className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white leading-tight">Subconscious Theme Weaver</h1>
          <p className="text-xs text-slate-300">Reshape the desktop matrix by feeding custom dreams into the LLM kernel.</p>
        </div>
      </div>

      <form onSubmit={handleWeave} className="flex gap-2.5 mb-6 w-full max-w-lg">
        <div className="relative flex-1">
          <input
            type="text"
            required
            disabled={loading}
            placeholder="e.g. 'Abyssal Space Worm', 'Cyberpunk Dreamscape'..."
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            className="w-full bg-white/5 border border-white/10 focus:border-white/20 rounded-xl px-4 py-2 text-xs focus:outline-none placeholder-white/25 text-white"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer bg-gradient-to-r from-pink-500 to-indigo-500 hover:from-pink-600 hover:to-indigo-600 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all active:scale-95 flex items-center gap-1.5 shadow"
        >
          <Sparkles className="w-4 h-4 text-white" />
          {loading ? 'Synthesizing...' : 'Weave Theme'}
        </button>
      </form>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl p-3 text-xs mb-6 flex gap-2 items-start font-mono">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Preset indicator */}
      <div className="mb-6 flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 text-xs">
        <span className="text-slate-400">Current Theme State:</span>
        <span className="font-mono bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full font-bold">
          {activeThemeName}
        </span>
      </div>

      {previewTheme && (
        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-2xl animate-fadeIn shadow-xl relative overflow-hidden">
          <div className="absolute right-3 top-3 opacity-10">
            <Palette className="w-24 h-24 text-white" />
          </div>

          <span className="text-[9px] bg-pink-500/15 text-pink-300 px-2 py-0.5 rounded uppercase font-mono tracking-wider font-semibold border border-pink-500/10">
            Synaptic Weaver Proposal
          </span>

          <h2 className="text-base font-bold text-white mt-1.5 mb-1">{previewTheme.themeName}</h2>
          <p className="text-xs text-slate-300 mb-4 italic">"{previewTheme.iconStyleIdeas}"</p>

          <div className="grid grid-cols-2 gap-3 mb-5 font-mono text-[10px]">
            <div className="p-2 bg-black/20 rounded">
              <span className="text-slate-400 block mb-0.5">App Palette Hex:</span>
              <div className="flex gap-1.5 items-center">
                <span className="w-3.5 h-3.5 rounded border border-white/10" style={{ backgroundColor: '#0f172a' }} />
                <span className="text-slate-200">Custom dynamic</span>
              </div>
            </div>

            <div className="p-2 bg-black/20 rounded">
              <span className="text-slate-400 block mb-0.5">Applied Font:</span>
              <div className="flex gap-1 items-center text-slate-200">
                <Type className="w-3.5 h-3.5" />
                <span>{previewTheme.fontFamily}</span>
              </div>
            </div>
          </div>

          {/* Glitch sub logs */}
          <div className="p-2 bg-black/40 rounded border border-white/5 mb-5 font-mono text-[10px]">
            <span className="text-rose-400 block mb-1 font-semibold flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5" />
              Subconscious Glitch Snippet:
            </span>
            <p className="text-slate-300 break-all select-all">{previewTheme.glitchSnippet}</p>
          </div>

          {/* PALETTE DOTS */}
          <div className="mb-5">
            <span className="text-xs text-slate-400 block mb-2 font-medium">Synaptic Colors generated by LLM:</span>
            <div className="flex gap-4 p-3 bg-black/30 rounded-xl border border-white/5">
              <div className="text-center">
                <span className="w-6 h-6 rounded-full block mx-auto mb-1 border border-white/10 bg-slate-800" title="bgColor" />
                <span className="text-[8px] text-slate-400 font-mono">App BG</span>
              </div>
              <div className="text-center">
                <span className="w-6 h-6 rounded-full block mx-auto mb-1 border border-white/10 bg-emerald-400" title="textColor" />
                <span className="text-[8px] text-slate-400 font-mono">Text</span>
              </div>
              <div className="text-center">
                <span className="w-6 h-6 rounded-full block mx-auto mb-1 border border-white/10 bg-slate-600" title="borderColor" />
                <span className="text-[8px] text-slate-400 font-mono">Border</span>
              </div>
              <div className="text-center">
                <span className="w-6 h-6 rounded-full block mx-auto mb-1 border border-white/10 bg-pink-500" title="accentColor" />
                <span className="text-[8px] text-slate-400 font-mono">Accent</span>
              </div>
            </div>
          </div>

          <button
            onClick={applyWeavedTheme}
            className="cursor-pointer w-full text-center bg-white hover:bg-slate-100 text-black font-bold text-xs py-2.5 rounded-xl transition duration-150 flex items-center justify-center gap-1.5 shadow-lg active:scale-95"
          >
            <Check className="w-4 h-4 text-emerald-500" />
            Decohere and Apply Proposed Theme
          </button>
        </div>
      )}
    </div>
  );
}
