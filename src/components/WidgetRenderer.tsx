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
