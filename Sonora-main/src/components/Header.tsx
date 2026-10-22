import React from 'react';
import { Disc3, Database, Sparkles, Layers, BookOpen, Music } from 'lucide-react';

interface HeaderProps {
  activeTab: 'detect' | 'batch' | 'encyclopedia';
  onTabChange: (tab: 'detect' | 'batch' | 'encyclopedia') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  return (
    <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-pink-600 via-purple-600 to-cyan-500 shadow-lg shadow-purple-900/30">
            <Disc3 className="w-6 h-6 text-white animate-spin [animation-duration:8s]" />
            <div className="absolute w-2.5 h-2.5 rounded-full bg-slate-950 border-2 border-white/80" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white font-mono">
                Sonora<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400">Genre</span>
              </span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">
                Auto-ID
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Detector de Géneros Musicales en Bases de Datos Externas
            </p>
          </div>
        </div>

        {/* Database Badges */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-900 border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <Database className="w-3.5 h-3.5 text-slate-400" />
            iTunes & MusicBrainz
          </span>
          <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-purple-950/50 border border-purple-500/20 text-purple-300">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Gemini AI Musicology
          </span>
        </div>

        {/* Navigation tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-white/10" aria-label="Navegación principal">
          <button
            onClick={() => onTabChange('detect')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'detect'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            Detector Individual
          </button>
          <button
            onClick={() => onTabChange('batch')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'batch'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Por Lotes
          </button>
          <button
            onClick={() => onTabChange('encyclopedia')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'encyclopedia'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Géneros & Taxonomía
          </button>
        </nav>
      </div>
    </header>
  );
};
