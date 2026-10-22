import React, { useState } from 'react';
import { Search, Sparkles, X, ArrowRight, Wand2 } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  initialQuery?: string;
}

const SAMPLE_QUERIES = [
  { label: 'J Balvin - Azul', query: 'j Balvin - azul determinar genero', genre: 'Reggaetón' },
  { label: 'Romeo Santos - Propuesta Indecente', query: 'Romeo Santos - Propuesta Indecente', genre: 'Bachata (No "Tropical")' },
  { label: 'Héctor Lavoe - El Cantante', query: 'Héctor Lavoe - El Cantante', genre: 'Salsa Brava' },
  { label: 'Peso Pluma - Ella Baila Sola', query: 'Peso Pluma - Ella Baila Sola', genre: 'Corridos Tumbados' },
  { label: 'Los Ángeles Azules - 17 Años', query: 'Los Ángeles Azules - 17 Años', genre: 'Cumbia Sonidera' },
  { label: 'Soda Stereo - De Música Ligera', query: 'Soda Stereo - De Música Ligera', genre: 'Rock en Español' },
  { label: 'Bad Bunny - Dákiti', query: 'Bad Bunny - Dakiti qué género es', genre: 'Latin Trap' },
];

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading, initialQuery = '' }) => {
  const [inputVal, setInputVal] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim() && !isLoading) {
      onSearch(inputVal);
    }
  };

  const handleSampleClick = (sampleQuery: string) => {
    setInputVal(sampleQuery);
    onSearch(sampleQuery);
  };

  const handleClear = () => {
    setInputVal('');
  };

  return (
    <div className="w-full">
      {/* Search Input Box */}
      <form onSubmit={handleSubmit} className="relative group">
        <div className="relative flex items-center bg-slate-900/90 border border-white/15 focus-within:border-pink-500/80 focus-within:ring-2 focus-within:ring-pink-500/20 rounded-2xl p-2 transition-all shadow-xl shadow-black/40">
          <div className="pl-3 pr-2 text-slate-400">
            <Search className="w-5 h-5 text-pink-400 group-focus-within:text-pink-300 transition-colors" />
          </div>

          <label htmlFor="song-search-input" className="sr-only">
            Escribe el título de la canción o artista
          </label>
          <input
            id="song-search-input"
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder='Ej: "j Balvin - azul determinar genero" o "Queen - Bohemian Rhapsody"...'
            disabled={isLoading}
            className="w-full bg-transparent text-white text-base sm:text-lg placeholder:text-slate-500 focus:outline-none px-2 py-1 font-sans"
          />

          {inputVal && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Borrar texto"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading || !inputVal.trim()}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 text-white font-medium text-sm sm:text-base hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-pink-600/20 shrink-0"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Consultando BDs...</span>
              </>
            ) : (
              <>
                <span>Determinar Género</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Helper text & Examples */}
      <div className="mt-3.5 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
            Prueba rápida con ejemplos musicales:
          </span>
          <span className="hidden sm:inline text-slate-500">
            Filtra ruido como &quot;determinar género&quot; automáticamente
          </span>
        </div>

        {/* Quick Click Badges */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {SAMPLE_QUERIES.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSampleClick(item.query)}
              disabled={isLoading}
              className="group flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-white/10 hover:border-pink-500/50 hover:bg-slate-800/80 text-slate-300 hover:text-white transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3 h-3 text-pink-400 group-hover:scale-110 transition-transform" />
              <span>{item.label}</span>
              <span className="text-[10px] text-slate-500 group-hover:text-pink-300">({item.genre})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
