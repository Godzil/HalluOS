import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Star, 
  Sparkles, 
  Download, 
  Check, 
  SearchCode, 
  Gamepad2, 
  Flame, 
  Compass, 
  Cpu, 
  Eye,
  Rocket,
  Brain,
  Coffee,
  Tv,
  Trash2,
  Heart,
  Award,
  Terminal,
  Folder,
  Music,
  Activity,
  Shield,
  Settings,
  HelpCircle,
  Volume2,
  Calendar
} from 'lucide-react';

function _getAppIcon(name: string) {
  const iconMap: Record<string, any> = {
    Gamepad2, Flame, Compass, Cpu, Eye, Rocket, Brain, Coffee, Tv, Trash2, Heart, Award, Terminal, Folder, Music, Activity, Shield, Settings, HelpCircle, Volume2, Calendar, ShoppingBag
  };
  const IconC = iconMap[name] || Rocket;
  return <IconC className="w-5 h-5 stroke-[1.5]" />;
}
import { PremadeApp } from '../types';
import { PREMADE_APPS } from '../data/premadeApps';

interface AppStoreProps {
  onInstallApp: (app: PremadeApp) => void;
  installedApps: string[]; // array of appKeys
  temperature: number;
  hallucinationLevel: number;
  addDebugTransaction: (endpoint: string, requestPayload: any, responsePayload: any, latencyMs: number, success: boolean, statusText?: string) => void;
}

export default function AppStore({ onInstallApp, installedApps, temperature, hallucinationLevel, addDebugTransaction }: AppStoreProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | 'Trending' | 'System' | 'Entertainment'>('All');
  const [loading, setLoading] = useState(false);
  const [featuredApps, setFeaturedApps] = useState<PremadeApp[]>([]);
  const [newArrivals, setNewArrivals] = useState<PremadeApp[]>([]);
  const [searchResults, setSearchResults] = useState<PremadeApp[]>([]);
  const [showNotification, setShowNotification] = useState<string | null>(null);

  // Load initial AI suggested trending apps
  useEffect(() => {
    fetchRecommendations();
  }, [temperature, hallucinationLevel]);

  const fetchRecommendations = async (query?: string) => {
    setLoading(true);
    const startTime = Date.now();
    try {
      const payload = { 
        searchQuery: query || '',
        temperature,
        hallucinationLevel
      };
      const res = await fetch('/api/store-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      const latency = Date.now() - startTime;
      
      if (addDebugTransaction) {
        addDebugTransaction('/api/store-recommend', payload, data, latency, res.ok, res.statusText);
      }

      const formatApps = (items: any[]) => {
        if (!items || !Array.isArray(items)) return [];
        return items.map((a: any, index: number) => ({
          appKey: `ai_app_${a.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now() + index}`,
          name: a.name,
          description: a.description,
          iconName: a.iconName || 'Rocket',
          startingPrompt: a.startingPrompt,
          rating: Number(a.rating || 4.9),
          category: a.category || 'Quantum Discovery'
        }));
      };

      if (data.featuredApps) {
        setFeaturedApps(formatApps(data.featuredApps));
      }
      if (data.newArrivals) {
        setNewArrivals(formatApps(data.newArrivals));
      }
      if (data.searchResults) {
        setSearchResults(formatApps(data.searchResults));
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Store loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecommendations(searchTerm);
  };

  const triggerInstall = (app: PremadeApp) => {
    onInstallApp(app);
    setShowNotification(`Installed ${app.name}! Added to desktop.`);
    setTimeout(() => {
      setShowNotification(null);
    }, 3000);
  };

  // Get matching apps from premade apps
  const getPreinstalledList = () => {
    return PREMADE_APPS.filter(app => {
      // Exclude App Store itself
      if (app.appKey === 'appstore') return false;
      
      const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            app.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (activeCategory === 'All') return matchesSearch;
      if (activeCategory === 'System' && app.category.toLowerCase().includes('system')) return matchesSearch;
      if (activeCategory === 'Entertainment' && app.category.toLowerCase().includes('paint')) return matchesSearch;
      return matchesSearch;
    });
  };

  const preinstalled = getPreinstalledList();

  return (
    <div className="w-full h-full flex flex-col bg-transparent text-slate-100 font-sans p-4 overflow-y-auto">
      {/* Visual notification bubble */}
      {showNotification && (
        <div className="fixed bottom-16 right-6 bg-pink-500 text-white font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs z-50 animate-bounce border border-white/20">
          <Check className="w-4 h-4 stroke-[3]" />
          {showNotification}
        </div>
      )}

      {/* Header Promo Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 p-5 rounded-2xl mb-6 shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <ShoppingBag className="w-40 h-40 text-white" />
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-pink-300 mb-1">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          Quantum AI Distro Center
        </div>
        <h1 className="text-xl md:text-2xl font-light tracking-tight mb-2 text-white font-heading">
          Explore the Infinite <span className="italic font-serif">Subconscious</span> App Store
        </h1>
        <p className="text-xs text-slate-300 max-w-lg leading-relaxed font-sans">
          Type anything. Search for any dream concept. If you ask for it, the operating system's dreaming kernel will immediately structure, catalog, and hallucinate it into existence.
        </p>
      </div>

      {/* Search Input bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-6 w-full max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search or prompt a new app, e.g. 'Synthesizer', 'Depression Chatbot'..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 focus:border-white/20 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none placeholder-white/30 text-white font-sans"
          />
        </div>
        <button
          type="submit"
          className="cursor-pointer bg-white text-black hover:bg-slate-100 text-xs font-bold px-4 py-2 rounded-xl transition active:scale-95 flex items-center gap-1.5 shadow"
        >
          <SearchCode className="w-4 h-4" />
          Search / Manifest
        </button>
      </form>

      {/* Categories Toggle */}
      <div className="flex gap-2 border-b border-white/10 pb-3 mb-6">
        {(['All', 'Trending', 'System', 'Entertainment'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium transition duration-150 ${
              activeCategory === cat 
                ? 'bg-white/15 text-indigo-200 border border-white/15 shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Recommendation Results (Always LLM generated) */}
      <div className="mb-8 font-sans">
        <h2 className="text-sm font-semibold uppercase text-pink-300 tracking-wider mb-4 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-pink-300 animate-pulse" />
          Manifested AI Subconscious Recommendations
        </h2>

        {/* Reusable App Card Render logic */}
        {(() => {
          const renderAppCard = (app: PremadeApp) => {
            const installed = installedApps.includes(app.name);
            return (
              <div 
                key={app.appKey} 
                className="backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 p-4 rounded-2xl flex gap-3 transition-all group"
              >
                <div className="p-3 bg-white/10 border border-white/10 rounded-xl h-11 w-11 shrink-0 flex items-center justify-center text-pink-300 shadow-md">
                  {_getAppIcon(app.iconName)}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between font-sans">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <h3 className="font-semibold text-sm text-white truncate">{app.name}</h3>
                      <div className="flex items-center gap-0.5 shrink-0 text-[10px] text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{app.rating}</span>
                      </div>
                    </div>
                    <span className="text-[9px] bg-white/10 text-indigo-200 border border-white/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                      {app.category}
                    </span>
                    <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                      {app.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-pink-300 font-semibold uppercase bg-pink-500/10 border border-pink-500/10 px-2 py-0.5 rounded">
                      LLM Powered
                    </span>
                    <button
                      onClick={() => triggerInstall(app)}
                      disabled={installed}
                      className={`cursor-pointer text-[10px] font-bold px-3 py-1.5 rounded-full transition-all active:scale-95 flex items-center gap-1 ${
                        installed 
                          ? 'bg-white/10 text-white/40 cursor-not-allowed border border-white/5' 
                          : 'bg-white text-black hover:opacity-100 opacity-90'
                      }`}
                    >
                      {installed ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Installed
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          MANIFEST
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          };

          return (
            <>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
                  {[1, 2, 3, 4].map(idx => (
                    <div key={idx} className="h-28 bg-white/5 rounded-2xl border border-white/10 p-4" />
                  ))}
                </div>
              ) : (
                <>
                  {/* SEARCH RESULTS DISPLAY */}
                  {searchTerm && (
                    <div className="mb-8 font-sans">
                      <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                        <h2 className="text-sm font-semibold uppercase text-purple-300 tracking-wider flex items-center gap-1.5 animate-pulse">
                          <SearchCode className="w-4 h-4 text-purple-300" />
                          Quantum Manifestations for "{searchTerm}"
                        </h2>
                        <button 
                          onClick={() => { setSearchTerm(''); setSearchResults([]); }}
                          className="bg-white/10 hover:bg-white/15 text-slate-300 text-[10px] px-2.5 py-1 rounded cursor-pointer"
                        >
                          Reset Search
                        </button>
                      </div>

                      {searchResults.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {searchResults.map((app) => renderAppCard(app))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-slate-400 text-xs border border-dashed border-white/10 rounded-2xl bg-white/5 font-mono">
                          Awaiting neural mapping for search query... Try search again.
                        </div>
                      )}
                    </div>
                  )}

                  {/* FEATURED APPS SECTION */}
                  {(!searchTerm || activeCategory === 'Trending' || activeCategory === 'All') && (
                    <div className="mb-8 font-sans">
                      <h2 className="text-sm font-semibold uppercase text-pink-300 tracking-wider mb-4 flex items-center gap-1.5 border-b border-white/10 pb-2">
                        <Sparkles className="w-4 h-4 text-pink-300 animate-pulse" />
                        Featured Apps (Curated Hallucinations)
                      </h2>
                      {featuredApps.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {featuredApps.map((app) => renderAppCard(app))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-slate-500 text-xs italic font-mono">Loading sub-core suggestions...</div>
                      )}
                    </div>
                  )}

                  {/* NEW ARRIVALS SECTION */}
                  {(!searchTerm || activeCategory === 'Trending' || activeCategory === 'All') && (
                    <div className="mb-8 font-sans">
                      <h2 className="text-sm font-semibold uppercase text-cyan-300 tracking-wider mb-4 flex items-center gap-1.5 border-b border-white/10 pb-2">
                        <Download className="w-4 h-4 text-cyan-300 animate-pulse" />
                        New Arrivals (Recently Generated)
                      </h2>
                      {newArrivals.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {newArrivals.map((app) => renderAppCard(app))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-slate-500 text-xs italic font-mono">Syncing deep sleep cache...</div>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          );
        })()}
      </div>

      {/* Pre-installed / standard catalog */}
      <div>
        <h2 className="text-sm font-semibold uppercase text-indigo-300 tracking-wider mb-4 flex items-center gap-1.5">
          <Cpu className="w-4 h-4 text-indigo-300" />
          Default Kernel Subroutine Modules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {preinstalled.map((app) => {
            const installed = installedApps.includes(app.name);
            return (
              <div 
                key={app.appKey} 
                className="backdrop-blur-xl bg-white/5 border border-white/10 p-4 rounded-2xl flex gap-3 hover:bg-white/10 transition-all"
              >
                <div className="p-3 bg-white/10 border border-white/10 rounded-xl h-11 w-11 shrink-0 flex items-center justify-center text-indigo-200 shadow-sm">
                  <Cpu className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h3 className="font-semibold text-sm text-white">{app.name}</h3>
                      <div className="flex items-center gap-0.5 text-[10px] text-amber-400 shrink-0">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{app.rating}</span>
                      </div>
                    </div>
                    <span className="text-[9px] bg-white/10 text-slate-300 border border-white/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                      {app.category}
                    </span>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      {app.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[10px] text-white/40 font-mono">
                      System Native
                    </span>
                    <button
                      onClick={() => triggerInstall(app)}
                      disabled={true}
                      className="bg-white/10 text-white/60 cursor-not-allowed border border-white/10 text-[10px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      BUILT-IN
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
