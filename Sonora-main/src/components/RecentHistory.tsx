import React from 'react';
import { History, Trash2, ArrowUpRight } from 'lucide-react';
import type { GenreDetectionResult } from '../server/genreService';

interface RecentHistoryProps {
  history: GenreDetectionResult[];
  onSelect: (item: GenreDetectionResult) => void;
  onClear: () => void;
}

export const RecentHistory: React.FC<RecentHistoryProps> = ({ history, onSelect, onClear }) => {
  if (history.length === 0) return null;

  return (
    <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 shadow-lg">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
          <History className="w-3.5 h-3.5 text-pink-400" />
          <span>Consultas Recientes ({history.length})</span>
        </div>
        <button
          onClick={onClear}
          className="text-[11px] text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          <span>Limpiar</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
        {history.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(item)}
            className="text-left p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-white/5 hover:border-pink-500/30 flex items-center gap-3 transition-all group"
          >
            <img
              src={item.track.artworkUrl}
              alt=""
              className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold text-white block truncate group-hover:text-pink-300 transition-colors">
                {item.track.title}
              </span>
              <span className="text-[11px] text-slate-400 block truncate">
                {item.track.artist}
              </span>
              <span className="text-[10px] text-pink-400 font-medium block truncate mt-0.5">
                {item.primaryGenre}
              </span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-pink-400 shrink-0 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
};
