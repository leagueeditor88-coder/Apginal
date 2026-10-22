import React, { useState } from 'react';
import type { GenreDetectionResult } from '../server/genreService';
import { batchDetectGenres } from '../services/genreClient';
import { Layers, Play, Pause, Download, FileText, Check, AlertCircle } from 'lucide-react';

const DEFAULT_BATCH_TEXT = `Romeo Santos - Propuesta Indecente
Héctor Lavoe - Periódico de Ayer
Peso Pluma - Ella Baila Sola
J Balvin - Azul determinar genero
Los Ángeles Azules - 17 Años
Soda Stereo - De Música Ligera`;

interface BatchAnalyzerProps {
  onSelectTrack: (result: GenreDetectionResult) => void;
}

export const BatchAnalyzer: React.FC<BatchAnalyzerProps> = ({ onSelectTrack }) => {
  const [inputText, setInputText] = useState(DEFAULT_BATCH_TEXT);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<GenreDetectionResult[]>([]);
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [copiedCsv, setCopiedCsv] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const handleRunBatch = async () => {
    const lines = inputText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) return;

    setIsLoading(true);
    try {
      const batchResults = await batchDetectGenres(lines);
      setResults(batchResults);
    } catch (e) {
      console.error('Batch detection failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAudioToggle = (trackId: string, previewUrl?: string) => {
    if (!previewUrl) return;

    if (activePlayingId === trackId) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setActivePlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(previewUrl);
      audioRef.current = audio;
      audio.play().then(() => {
        setActivePlayingId(trackId);
      });
      audio.onended = () => {
        setActivePlayingId(null);
      };
    }
  };

  const handleDownloadCsv = () => {
    if (results.length === 0) return;

    const headers = ['Cancion', 'Artista', 'Genero_Principal', 'Categoria', 'Subgeneros', 'Confianza'];
    const rows = results.map((r) => [
      `"${r.track.title.replace(/"/g, '""')}"`,
      `"${r.track.artist.replace(/"/g, '""')}"`,
      `"${r.primaryGenre}"`,
      `"${r.category}"`,
      `"${r.subgenres.join('; ')}"`,
      `"${r.confidence}%"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'generos_musicales_detectados.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setCopiedCsv(true);
    setTimeout(() => setCopiedCsv(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Input container */}
      <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-pink-400" />
              Detector de Género Musical por Lotes
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ingresa una lista de canciones (una por línea) para clasificarlas en bases de datos externas de una sola vez.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setInputText(DEFAULT_BATCH_TEXT)}
            className="text-xs text-pink-400 hover:text-pink-300 underline font-medium"
          >
            Cargar lista de demostración
          </button>
        </div>

        <textarea
          rows={5}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Escribe o pega títulos de canciones aquí (uno por línea)..."
          className="w-full bg-slate-950/90 border border-white/15 focus:border-pink-500 rounded-xl p-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-pink-500 font-mono resize-y"
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
          <span className="text-xs text-slate-500">
            {inputText.split('\n').filter((l) => l.trim()).length} canciones detectadas para análisis.
          </span>

          <button
            onClick={handleRunBatch}
            disabled={isLoading || !inputText.trim()}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-pink-600/20"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analizando lote en BDs...</span>
              </>
            ) : (
              <>
                <Layers className="w-4 h-4" />
                <span>Analizar Todas las Canciones</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results table */}
      {results.length > 0 && (
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 shadow-xl overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-base font-bold text-white">
                Resultados del Análisis ({results.length} temas clasificados)
              </h3>
              <p className="text-xs text-slate-400">
                Haz clic en cualquier fila para ver el desglose acústico completo.
              </p>
            </div>

            <button
              onClick={handleDownloadCsv}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-2 border border-white/10 transition-colors"
            >
              {copiedCsv ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4" />}
              <span>Exportar a CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-white/10">
                <tr>
                  <th className="py-3 px-3">Canción / Artista</th>
                  <th className="py-3 px-3">Género Detectado</th>
                  <th className="py-3 px-3">Categoría</th>
                  <th className="py-3 px-3">Subgéneros</th>
                  <th className="py-3 px-3 text-center">Confianza</th>
                  <th className="py-3 px-3 text-center">Audio</th>
                  <th className="py-3 px-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {results.map((r, i) => {
                  const id = r.track.externalId || `${r.track.title}-${i}`;
                  const isThisPlaying = activePlayingId === id;

                  return (
                    <tr
                      key={i}
                      className="hover:bg-white/5 transition-colors group cursor-pointer"
                      onClick={() => onSelectTrack(r)}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={r.track.artworkUrl}
                            alt=""
                            className="w-9 h-9 rounded-lg object-cover shrink-0 border border-white/10"
                          />
                          <div className="min-w-0">
                            <span className="font-semibold text-white block truncate max-w-[180px]">
                              {r.track.title}
                            </span>
                            <span className="text-slate-400 text-[11px] block truncate max-w-[180px]">
                              {r.track.artist}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-semibold text-pink-400 block">
                          {r.primaryGenre}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {r.sources[0]?.name || 'BD Externa'}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[11px]">
                          {r.category}
                        </span>
                      </td>

                      <td className="py-3 px-3 max-w-[180px]">
                        <span className="text-slate-400 truncate block">
                          {r.subgenres.slice(0, 2).join(', ')}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="font-mono text-emerald-400 font-medium">
                          {r.confidence}%
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        {r.track.previewUrl ? (
                          <button
                            type="button"
                            onClick={() => handleAudioToggle(id, r.track.previewUrl)}
                            aria-label={isThisPlaying ? 'Pausar audio' : 'Reproducir audio'}
                            className="p-1.5 rounded-lg bg-pink-600/30 hover:bg-pink-600 text-pink-300 hover:text-white transition-colors"
                          >
                            {isThisPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                          </button>
                        ) : (
                          <span className="text-slate-600 text-[10px]">—</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <span className="text-pink-400 hover:text-pink-300 font-medium text-[11px]">
                          Ver Ficha →
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
