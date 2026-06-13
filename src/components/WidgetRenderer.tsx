import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { 
  Terminal, 
  Play, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  AlertOctagon, 
  CornerDownLeft,
  ChevronRight
} from 'lucide-react';
import { Widget, Theme, Layout } from '../types';

// Play micro beeps using Web Audio API
const playBeep = (freq = 800, duration = 0.05, type: 'sine' | 'square' | 'sawtooth' | 'triangle' = 'sine') => {
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

interface WidgetRendererProps {
  layout: Layout;
  theme: Theme;
  onActionTriggered: (elementId: string, actionType: 'click' | 'change' | 'submit', payload?: { value?: string }) => void;
  isLoading: boolean;
}

export default function WidgetRenderer({ layout, theme, onActionTriggered, isLoading }: WidgetRendererProps) {
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const handleInputChange = (id: string, val: string) => {
    setFormValues(prev => ({ ...prev, [id]: val }));
  };

  const handleInputSubmit = (id: string) => {
    onActionTriggered(id, 'submit', { value: formValues[id] || '' });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>, id: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleInputSubmit(id);
    }
  };

  const borderClass = theme.borderColor || 'border-neutral-800';
  const textClr = theme.textColor || 'text-white';
  const accentBg = theme.accentColor || 'bg-emerald-500';

  // Helper to resolve button styles
  const getButtonStyles = (variant?: string) => {
    switch (variant) {
      case 'primary':
        return 'bg-indigo-500/80 backdrop-blur-md hover:bg-indigo-500 text-white font-semibold border border-white/20 shadow-lg';
      case 'danger':
        return 'bg-pink-500/80 backdrop-blur-md hover:bg-pink-500 text-white font-semibold border border-white/20 shadow-lg';
      case 'success':
        return 'bg-emerald-500/80 backdrop-blur-md hover:bg-emerald-500 text-zinc-950 font-semibold border border-white/20 shadow-lg';
      case 'secondary':
      default:
        return 'bg-white/10 hover:bg-white/15 text-white border border-white/10 backdrop-blur-sm';
    }
  };

  // Helper to render alert styles
  const getAlertContainer = (variant?: string) => {
    switch (variant) {
      case 'alarm':
        return 'bg-pink-500/15 border border-pink-500/25 text-pink-300';
      case 'warning':
        return 'bg-amber-500/15 border border-amber-500/25 text-amber-300';
      case 'success':
        return 'bg-emerald-500/15 border border-emerald-500/25 text-emerald-300';
      case 'info':
      default:
        return 'bg-indigo-500/15 border border-indigo-500/25 text-indigo-300';
    }
  };

  const getAlertIcon = (variant?: string) => {
    switch (variant) {
      case 'alarm':
        return <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />;
    }
  };

  const renderWidget = (w: Widget) => {
    switch (w.type) {
      case 'heading':
        return (
          <h2 key={w.id} id={w.id} className="font-heading text-lg md:text-xl font-bold tracking-tight mb-1" style={{ color: 'inherit' }}>
            {w.value}
          </h2>
        );

      case 'text':
        return (
          <p key={w.id} id={w.id} className="text-sm leading-relaxed whitespace-pre-wrap opacity-90 font-sans">
            {w.value}
          </p>
        );

      case 'status_alert':
        return (
          <div key={w.id} id={w.id} className={`p-3 rounded-lg flex gap-3 ${getAlertContainer(w.variant)}`}>
            {getAlertIcon(w.variant)}
            <div className="flex-1">
              {w.label && <div className="font-semibold text-xs uppercase tracking-wider mb-0.5">{w.label}</div>}
              <div className="text-xs font-mono">{w.value}</div>
            </div>
          </div>
        );

      case 'button':
        return (
          <button
            key={w.id}
            id={w.id}
            disabled={isLoading}
            onClick={() => onActionTriggered(w.id, 'click')}
            className={`cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md text-xs transition duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${getButtonStyles(w.variant)}`}
          >
            {w.label || w.value || 'Execute'}
          </button>
        );

      case 'input':
        return (
          <div key={w.id} className="flex flex-col gap-1 w-full">
            {w.label && <label className="text-xs font-semibold text-slate-350">{w.label}</label>}
            <div className="relative flex items-center">
              <input
                id={w.id}
                type="text"
                placeholder={w.placeholder || 'Type something...'}
                value={formValues[w.id] !== undefined ? formValues[w.id] : (w.value || '')}
                onChange={(e) => handleInputChange(w.id, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, w.id)}
                disabled={isLoading}
                className="w-full bg-white/5 text-slate-100 placeholder-white/20 select-text text-xs px-3 py-2.5 pr-9 rounded-xl border border-white/10 focus:outline-none focus:border-white/20 transition font-mono"
              />
              <button
                disabled={isLoading}
                onClick={() => handleInputSubmit(w.id)}
                className="absolute right-1.5 p-1.5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg transition"
                title="Submit input"
              >
                <CornerDownLeft className="w-3.5 h-3.5 text-pink-300" />
              </button>
            </div>
          </div>
        );

      case 'textarea':
        return (
          <div key={w.id} className="flex flex-col gap-1 w-full">
            {w.label && <label className="text-xs font-semibold text-slate-350">{w.label}</label>}
            <textarea
              id={w.id}
              rows={4}
              placeholder={w.placeholder || 'Write here...'}
              value={formValues[w.id] !== undefined ? formValues[w.id] : (w.value || '')}
              onChange={(e) => handleInputChange(w.id, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, w.id)}
              disabled={isLoading}
              className="w-full bg-white/5 text-slate-100 placeholder-white/20 select-text text-xs px-3 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-white/20 transition font-sans resize-none"
            />
          </div>
        );

      case 'select':
        return (
          <div key={w.id} className="flex flex-col gap-1 w-full">
            {w.label && <label className="text-xs font-semibold text-slate-350">{w.label}</label>}
            <select
              id={w.id}
              value={formValues[w.id] !== undefined ? formValues[w.id] : (w.value || '')}
              disabled={isLoading}
              onChange={(e) => {
                const val = e.target.value;
                handleInputChange(w.id, val);
                onActionTriggered(w.id, 'change', { value: val });
              }}
              className="w-full bg-[#1e1435] text-slate-100 text-xs px-3 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-white/20 cursor-pointer font-sans"
            >
              {w.options?.map((opt, i) => (
                <option key={i} value={opt} className="bg-[#1e1435] text-slate-200">
                  {opt}
                </option>
              ))}
            </select>
          </div>
        );

      case 'radioGroup':
        return (
          <div key={w.id} className="flex flex-col gap-2 w-full">
            {w.label && <span className="text-xs font-semibold text-slate-300">{w.label}</span>}
            <div className="flex flex-wrap gap-2">
              {w.options?.map((opt, i) => {
                const isSelected = formValues[w.id] !== undefined 
                  ? formValues[w.id] === opt 
                  : (w.value === opt || i === 0);
                return (
                  <button
                    key={i}
                    id={`${w.id}_opt_${i}`}
                    disabled={isLoading}
                    onClick={() => {
                      handleInputChange(w.id, opt);
                      onActionTriggered(w.id, 'change', { value: opt });
                    }}
                    className={`cursor-pointer px-3 py-1 text-xs rounded-full border transition duration-150 ${
                      isSelected 
                        ? 'bg-white/25 text-white font-semibold border-white/35 shadow' 
                        : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/18'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <label key={w.id} className="flex items-center gap-2 text-xs select-none cursor-pointer">
            <input
              id={w.id}
              type="checkbox"
              disabled={isLoading}
              checked={formValues[w.id] !== undefined 
                ? formValues[w.id] === 'true' 
                : w.value === 'true'}
              onChange={(e) => {
                const checkedStr = e.target.checked ? 'true' : 'false';
                handleInputChange(w.id, checkedStr);
                onActionTriggered(w.id, 'change', { value: checkedStr });
              }}
              className="w-4 h-4 rounded text-pink-500 border-white/20 bg-white/5 focus:ring-0 cursor-pointer"
            />
            <span className="text-slate-300 font-medium">{w.label || w.value}</span>
          </label>
        );

      case 'table':
        return (
          <div key={w.id} id={w.id} className="w-full overflow-x-auto border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-white/10 font-semibold opacity-85 select-none text-slate-250">
                  {w.tableHeaders?.map((hdr, i) => (
                    <th key={i} className="px-3 py-2 font-mono">{hdr}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {w.tableRows && w.tableRows.length > 0 ? (
                  w.tableRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-white/5 transition duration-100">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3 py-2 max-w-xs truncate font-mono">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={w.tableHeaders?.length || 1} className="text-center py-4 text-slate-500 italic">
                      No Records Hallucinated
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );

      case 'chart':
        const chartData = w.chartData || [];
        const chartType = w.chartType || 'line';
        
        return (
          <div key={w.id} id={w.id} className="w-full h-44 border border-white/10 rounded-xl p-3 bg-white/5 backdrop-blur-xl flex flex-col gap-1 relative select-none">
            {w.label && <div className="text-[10px] uppercase font-semibold text-indigo-300 font-mono tracking-wider">{w.label}</div>}
            
            {chartData.length > 0 ? (
              <div className="flex-1 w-full mt-2">
                <ResponsiveContainer width="100%" height="90%">
                  {chartType === 'bar' ? (
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="#a1a1aa" fontSize={9} />
                      <YAxis stroke="#a1a1aa" fontSize={9} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#130f26', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: 10 }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="value" fill="#ec4899">
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#ec4899' : '#6366f1'} />
                        ))}
                      </Bar>
                    </BarChart>
                  ) : chartType === 'pie' ? (
                    <PieChart>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#130f26', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: 10 }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={25}
                        outerRadius={45}
                        paddingAngle={4}
                      >
                        {chartData.map((entry, index) => {
                          const colors = ['#8b5cf6', '#ec4899', '#6366f1', '#f43f5e', '#a855f7'];
                          return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                        })}
                      </Pie>
                    </PieChart>
                  ) : (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="#a1a1aa" fontSize={9} />
                      <YAxis stroke="#a1a1aa" fontSize={9} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#130f26', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: 10 }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs font-mono text-slate-400 italic">
                Awaiting Neural Sensor Synchronization...
              </div>
            )}
          </div>
        );

      case 'pixelGrid': {
        const size = w.gridSize || 12;
        const total = size * size;
        
        let colors: string[] = [];
        if (w.pixelColors && w.pixelColors.length > 0) {
          colors = w.pixelColors;
        } else if (w.options && w.options.length > 0) {
          colors = w.options;
        } else if (w.value) {
          colors = w.value.split(',').map(s => s.trim());
        }

        return (
          <div key={w.id} id={w.id} className="flex flex-col gap-2 w-full select-none">
            {w.label && (
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300 font-mono">
                {w.label}
              </span>
            )}
            <div 
              className="grid border border-white/10 p-2 rounded-xl bg-black/45 gap-1 w-full max-w-full overflow-auto aspect-square text-indigo-400"
              style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: total }).map((_, idx) => {
                const x = idx % size;
                const y = Math.floor(idx / size);
                const rawColor = colors[idx] || '';
                
                let style: React.CSSProperties = {};
                let className = "aspect-square rounded-sm border border-white/5 cursor-pointer hover:opacity-85 transition duration-100 flex items-center justify-center text-[8px]";
                
                if (rawColor.startsWith('#') || rawColor.startsWith('rgb') || rawColor.startsWith('hsl')) {
                  style = { backgroundColor: rawColor };
                } else if (rawColor.startsWith('bg-')) {
                  className += ` ${rawColor}`;
                } else {
                  className += " bg-zinc-900";
                }

                return (
                  <button
                    key={idx}
                    disabled={isLoading}
                    style={style}
                    className={className}
                    title={`Pixel X:${x} Y:${y}`}
                    onClick={() => {
                      onActionTriggered(w.id, 'click', { value: `${x},${y}` });
                    }}
                  />
                );
              })}
            </div>
            <div className="flex justify-between items-center text-[9px] opacity-50 font-mono">
              <span>MATRIX RESOLUTION: {size}x{size}</span>
              <span>CLICK TO DRAW / INPUT SIGNAL</span>
            </div>
          </div>
        );
      }

      case 'slider': {
        const minVal = w.min !== undefined ? w.min : 0;
        const maxVal = w.max !== undefined ? w.max : 100;
        const stepVal = w.step !== undefined ? w.step : 1;
        const currentVal = formValues[w.id] !== undefined 
          ? Number(formValues[w.id]) 
          : (w.value !== undefined ? Number(w.value) : minVal);

        return (
          <div key={w.id} className="flex flex-col gap-1.5 w-full font-mono">
            <div className="flex justify-between items-center text-xs">
              {w.label && <span className="font-semibold text-slate-300">{w.label}</span>}
              <span className="text-pink-400 font-bold bg-white/5 py-0.5 px-2 rounded-md border border-white/10">
                {currentVal}
              </span>
            </div>
            <input
              id={w.id}
              type="range"
              min={minVal}
              max={maxVal}
              step={stepVal}
              value={currentVal}
              disabled={isLoading}
              onChange={(e) => {
                handleInputChange(w.id, e.target.value);
              }}
              onMouseUp={(e) => {
                onActionTriggered(w.id, 'change', { value: (e.target as HTMLInputElement).value });
              }}
              onTouchEnd={(e) => {
                onActionTriggered(w.id, 'change', { value: (e.target as HTMLInputElement).value });
              }}
              className="w-full h-1.5 rounded-lg bg-white/10 appearance-none cursor-pointer accent-pink-500"
            />
          </div>
        );
      }

      case 'pianoKeys': {
        const defaultNotes = ["C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4", "C5"];
        const keys = w.pianoNotes || w.options || defaultNotes;
        
        const noteFreqs: Record<string, number> = {
          "C4": 261.63, "C#4": 277.18, "D4": 293.66, "D#4": 311.13, "E4": 329.63, "F4": 349.23,
          "F#4": 369.99, "G4": 392.00, "G#4": 415.30, "A4": 440.00, "A#4": 466.16, "B4": 493.88,
          "C5": 523.25, "C#5": 554.37, "D5": 587.33, "D#5": 622.25, "E5": 659.25, "F5": 698.46
        };

        const handlePlayNote = (note: string) => {
          const freq = noteFreqs[note] || 440.0;
          playBeep(freq, 0.25, 'sine');
          onActionTriggered(w.id, 'click', { value: note });
        };

        return (
          <div key={w.id} id={w.id} className="flex flex-col gap-2 w-full font-mono select-none">
            {w.label && (
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
                {w.label}
              </span>
            )}
            <div className="flex border border-white/10 p-1.5 rounded-xl bg-black/60 overflow-x-auto gap-0.5 min-h-[90px] h-24">
              {keys.map((note) => {
                const isSharp = note.includes('#') || note.includes('b');
                const isSelected = w.value === note;

                return (
                  <button
                    key={note}
                    disabled={isLoading}
                    onClick={() => handlePlayNote(note)}
                    className={`flex-1 min-w-[32px] md:min-w-[40px] rounded-b-lg border flex flex-col justify-end pb-2 text-[9px] font-bold uppercase transition duration-150 active:scale-95 cursor-pointer ${
                      isSharp 
                        ? isSelected 
                          ? 'bg-rose-500 text-white border-rose-600'
                          : 'bg-[#1b1c22] hover:bg-neutral-800 text-slate-300 border-black shadow-[inset_0_-4px_0_#111]'
                        : isSelected
                          ? 'bg-cyan-500 text-slate-950 border-cyan-600'
                          : 'bg-white hover:bg-slate-100 text-neutral-900 border-slate-300 shadow-[inset_0_-6px_0_#ddd]'
                    }`}
                  >
                    <span className="text-center w-full block truncate">{note}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'colorPalette': {
        const defaultPalette = ["#ff4a4a", "#ff9d1c", "#ffeb3b", "#4caf50", "#00bcd4", "#2196f3", "#9c27b0", "#e91e63", "#ffffff", "#121214"];
        const colors = w.paletteColors || w.options || defaultPalette;
        const selectedColor = formValues[w.id] !== undefined
          ? formValues[w.id]
          : (w.value || colors[0]);

        return (
          <div key={w.id} id={w.id} className="flex flex-col gap-2 w-full font-mono select-none">
            {w.label && (
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                {w.label}
              </span>
            )}
            <div className="flex flex-wrap gap-2.5 border border-white/10 p-3 rounded-xl bg-black/35">
              {colors.map((color) => {
                const isSelected = selectedColor.toLowerCase() === color.toLowerCase();
                return (
                  <button
                    key={color}
                    disabled={isLoading}
                    title={color}
                    onClick={() => {
                      handleInputChange(w.id, color);
                      onActionTriggered(w.id, 'change', { value: color });
                    }}
                    style={{ backgroundColor: color }}
                    className={`w-7 h-7 rounded-lg border cursor-pointer relative transition duration-150 active:scale-90 hover:opacity-90 ${
                      isSelected 
                        ? 'border-white scale-110 shadow-lg shadow-white/15' 
                        : 'border-white/10'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-bold">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  // Build root alignment classes based on child structure
  const getContainerClasses = () => {
    let classes = 'flex w-full h-full p-1';
    if (layout.direction === 'flex-row') {
      classes += ' flex-col sm:flex-row';
    } else if (layout.direction === 'grid-2') {
      classes += ' flex-col md:grid md:grid-cols-2';
    } else {
      classes += ' flex-col';
    }
    return classes;
  };

  const gapValue = layout.gap !== undefined ? `gap-${layout.gap}` : 'gap-4';

  return (
    <div className={`${getContainerClasses()} ${gapValue}`}>
      {layout.children?.map((child) => (
        <div key={child.id} className="flex shrink-0 w-full flex-col">
          {renderWidget(child)}
        </div>
      ))}
    </div>
  );
}
