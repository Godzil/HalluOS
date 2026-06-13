import React, { useRef, useState, useEffect } from 'react';
import { 
  X, 
  Minus, 
  Maximize2, 
  Minimize2, 
  Terminal, 
  Activity, 
  ServerCrash
} from 'lucide-react';
import { AppInstance, Theme } from '../types';

interface WindowFrameProps {
  key?: string;
  app: AppInstance;
  activeWindowId: string | null;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onFocus: (id: string) => void;
  onUpdatePosition: (id: string, updates: Partial<Pick<AppInstance, 'x' | 'y' | 'width' | 'height' | 'isMaximized'>>) => void;
  children: React.ReactNode;
}

export default function WindowFrame({
  app,
  activeWindowId,
  onClose,
  onMinimize,
  onFocus,
  onUpdatePosition,
  children
}: WindowFrameProps) {
  const windowRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });

  const isActive = activeWindowId === app.id;
  const t = app.theme;

  // Render inline styles for custom themes returned by LLM
  const getThemeVars = () => {
    return {
      '--accent-color': t?.accentColor || '#10b981',
      '--text-color': t?.textColor || '#10b981',
      '--border-color': t?.borderColor || '#059669',
      '--bg-color': t?.bgColor || '#090d16'
    } as React.CSSProperties;
  };

  // Drag handlers
  const handleHeaderMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (app.isMaximized) return;
    onFocus(app.id);
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - app.x,
      y: e.clientY - app.y
    });
    e.preventDefault();
  };

  // Resize handlers
  const handleResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (app.isMaximized) return;
    onFocus(app.id);
    setIsResizing(true);
    setInitialSize({ width: app.width, height: app.height });
    setInitialMousePos({ x: e.clientX, y: e.clientY });
    e.preventDefault();
    e.stopPropagation();
  };

  // Global mouse listeners for drag & resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const nextX = Math.max(0, Math.min(window.innerWidth - 200, e.clientX - dragOffset.x));
        const nextY = Math.max(40, Math.min(window.innerHeight - 100, e.clientY - dragOffset.y));
        onUpdatePosition(app.id, { x: nextX, y: nextY });
      }

      if (isResizing) {
        const deltaX = e.clientX - initialMousePos.x;
        const deltaY = e.clientY - initialMousePos.y;
        const nextW = Math.max(320, initialSize.width + deltaX);
        const nextH = Math.max(280, initialSize.height + deltaY);
        onUpdatePosition(app.id, { width: nextW, height: nextH });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, initialSize, initialMousePos, app.id, app.x, app.y, app.width, app.height, app.isMaximized]);

  const toggleMaximize = () => {
    onFocus(app.id);
    onUpdatePosition(app.id, { isMaximized: !app.isMaximized });
  };

  if (app.isMinimized) return null;

  return (
    <div
      ref={windowRef}
      onClick={() => onFocus(app.id)}
      style={{
        ...getThemeVars(),
        position: 'absolute',
        top: app.isMaximized ? '40px' : `${app.y}px`,
        left: app.isMaximized ? '0px' : `${app.x}px`,
        width: app.isMaximized ? '100vw' : `${app.width}px`,
        height: app.isMaximized ? 'calc(100vh - 84px)' : `${app.height}px`,
        zIndex: app.zIndex
      }}
      className={`flex flex-col rounded-2xl overflow-hidden shadow-2xl transition-all duration-150 animate-fadeIn backdrop-blur-3xl border ring-1 ring-black/20 ${
        isActive 
          ? 'border-white/30 bg-white/12 shadow-indigo-500/10' 
          : 'border-white/10 bg-white/8'
      }`}
    >
      {/* Window Title Header */}
      <div
        onMouseDown={handleHeaderMouseDown}
        onDoubleClick={toggleMaximize}
        className={`flex items-center justify-between px-4 py-2.5 bg-white/5 border-b border-white/10 select-none cursor-move shrink-0 ${
          isActive ? 'text-white' : 'text-slate-300'
        }`}
      >
        <div className="flex items-center gap-2 text-xs font-medium font-heading">
          <span className="text-[10px] uppercase font-mono tracking-wider font-semibold opacity-80 px-1.5 py-0.5 rounded bg-white/10 border border-white/10 flex items-center gap-1">
            <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
            98.7% HALLU
          </span>
          <span className="truncate max-w-[200px]">{app.windowTitle}</span>
        </div>

        {/* Window action controls */}
        <div className="flex items-center gap-1.5" onMouseDown={(e) => e.stopPropagation()}>
          <button
            onClick={() => onMinimize(app.id)}
            className="p-1 hover:bg-white/10 text-zinc-300 hover:text-white rounded transition"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleMaximize}
            className="p-1 hover:bg-white/10 text-zinc-300 hover:text-white rounded transition"
            title={app.isMaximized ? 'Restore Down' : 'Maximize'}
          >
            {app.isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => onClose(app.id)}
            className="p-1 hover:bg-rose-500/30 text-zinc-300 hover:text-rose-400 rounded transition"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary Application Work Area */}
      <div className="flex-1 w-full overflow-y-auto min-h-0 relative select-text">
        {app.error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#0c0c1e]/95 text-rose-400 animate-fadeIn select-none">
            <ServerCrash className="w-12 h-12 text-rose-500 mb-3 animate-bounce" />
            <h3 className="font-heading font-bold text-lg mb-1 text-white">Kernel Panic: Sensor Error</h3>
            <p className="text-xs text-zinc-400 max-w-sm mb-4 leading-relaxed">
              {app.error}
            </p>
            <button
              onClick={() => onClose(app.id)}
              className="cursor-pointer bg-white/10 border border-white/20 text-zinc-200 hover:text-white px-3 py-1.5 rounded-lg text-xs"
            >
              Reboot App Terminal
            </button>
          </div>
        ) : (
          <div className="w-full h-full p-4 relative font-sans">
            {children}
            
            {/* Infinite loader overlay */}
            {app.loading && (
              <div className="absolute inset-0 bg-[#0c0c1e]/80 backdrop-blur-[2px] flex flex-col items-center justify-center select-none z-40">
                <div className="relative flex items-center justify-center mb-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-400"></div>
                  <Terminal className="w-4 h-4 text-indigo-400 absolute animate-pulse" />
                </div>
                <div className="text-xs text-zinc-300 font-mono tracking-widest uppercase animate-pulse">
                  Hallucinating State...
                </div>
                <div className="text-[10px] text-zinc-400 font-mono tracking-wider mt-1">
                  Connecting synaptic neurons with Gemini K-Core
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Subconscious Logs bottom bar */}
      {app.logs && app.logs.length > 0 && (
        <div className="bg-white/5 border-t border-white/10 px-4 py-1.5 flex flex-col md:flex-row md:items-center justify-between gap-2 shrink-0 select-none text-[10px] font-mono text-indigo-300 pointer-events-none">
          <div className="flex items-center gap-1.5 truncate">
            <Terminal className="w-3.5 h-3.5 text-indigo-400 animate-pulse shrink-0" />
            <span className="truncate">{app.logs[app.logs.length - 1]}</span>
          </div>
          {app.logs.length > 1 && (
            <div className="shrink-0 text-white/40 font-mono italic">
              +{app.logs.length - 1} subsystem dreams active
            </div>
          )}
        </div>
      )}

      {/* Window Resize drag corner */}
      {!app.isMaximized && (
        <div
          onMouseDown={handleResizeMouseDown}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-end justify-end p-0.5 z-50 group hover:opacity-100 opacity-60"
        >
          <svg width="8" height="8" viewBox="0 0 8 8" className="text-zinc-650 hover:text-cyan-400 fill-current">
            <path d="M6 0 L8 0 L8 8 L0 8 L0 6 L4 6 L4 4 L6 4 Z" />
          </svg>
        </div>
      )}
    </div>
  );
}
