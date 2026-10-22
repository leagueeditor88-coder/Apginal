import React, { useState } from 'react';
import { BookOpen, Sparkles, Music, Activity, Disc3, ShieldAlert } from 'lucide-react';

interface GenreEncyclopediaItem {
  id: string;
  name: string;
  category: string;
  bpm: string;
  rhythmPattern: string;
  origins: string;
  keyInstruments: string[];
  definingTraits: string;
  famousExamples: string[];
  color: string;
}

const GENRE_DATABASE: GenreEncyclopediaItem[] = [
  {
    id: 'bachata',
    name: 'Bachata (Sensual & Tradicional)',
    category: 'Música Dominicana / Caribeña',
    bpm: '120 - 140 BPM',
    rhythmPattern: 'Compás de 4/4 sincopado con bajo característico y toque de guitarra requinto',
    origins: 'República Dominicana (1960s), nacida en bares y zonas rurales como "música de amargue" derivada del bolero rítmico.',
    keyInstruments: ['Guitarra Requinto (punteo con chorus/delay)', 'Guitarra Segunda', 'Bongó dominicano', 'Güira metálica', 'Bajo eléctrico sincopado'],
    definingTraits: 'Melancólico, romántico, sensual y de baile íntimo en pareja. Frecuentemente mal clasificada como "Tropical" en catálogos genéricos.',
    famousExamples: ['Romeo Santos - Propuesta Indecente', 'Aventura - Obsesión', 'Prince Royce - Darte Un Beso', 'Juan Luis Guerra - Burbujas de Amor'],
    color: '#0ea5e9',
  },
  {
    id: 'salsa',
    name: 'Salsa Brava & Romántica',
    category: 'Música Afro-Caribeña',
    bpm: '160 - 220 BPM (compás binario rápido)',
    rhythmPattern: 'Patrón de Clave (2:3 o 3:2) con polirritmia de conga, campana y timbal',
    origins: 'Cuba y Puerto Rico fusionados en los barrios latinos de Nueva York en las décadas de 1960 y 1970 con la Fania All-Stars.',
    keyInstruments: ['Sección de metales (trompetas, trombones)', 'Piano con montunos sincopados', 'Congas (tumbadora)', 'Timbales con cáscara', 'Bajo con tumbao', 'Güiro y campana'],
    definingTraits: 'Potencia orquestal, virtuosismo rítmico bailable y letras de crónica urbana. Muy distinta a la bachata o el merengue.',
    famousExamples: ['Héctor Lavoe - El Cantante', 'Willie Colón & Rubén Blades - Pedro Navaja', 'Celia Cruz - La Vida Es Un Carnaval', 'Marc Anthony - Vivir Mi Vida'],
    color: '#eab308',
  },
  {
    id: 'cumbia',
    name: 'Cumbia (Sonidera / Villera / Tradicional)',
    category: 'Folclore Panlatino',
    bpm: '85 - 110 BPM',
    rhythmPattern: 'Compás de 2/4 o 4/4 con arrastre de güiro/güira constante (chiki-chiki-chá)',
    origins: 'Caribe colombiano con raíces triétnicas (indígena, africana y española), adaptada con gran identidad en México, Argentina y Perú.',
    keyInstruments: ['Güiro o güira metálica', 'Acordeón o sintetizador de melodía sonidera', 'Bajo con golpe a contratiempo', 'Congas y timbaletas', 'Efectos vocales con eco'],
    definingTraits: 'Ritmo popular y bailable por excelencia en toda América Latina. Cada región creó su propia corriente (Villera en Argentina, Sonidera en México).',
    famousExamples: ['Los Ángeles Azules - 17 Años', 'Damas Gratis - No Te Creas Tan Importante', 'Celso Piña - Los Caminos de la Vida', 'Ráfaga - Una Cerveza'],
    color: '#10b981',
  },
  {
    id: 'corridos',
    name: 'Corridos Tumbados & Regional Mexicano',
    category: 'Regional Mexicano',
    bpm: '125 - 160 BPM',
    rhythmPattern: 'Compás ternario de 3/4 o 6/8 con requinto punteado en tiempo rápido',
    origins: 'México y suroeste de EE.UU., evolucionando desde la tradición del corrido revolucionario fusionado con el trap y el sierreño urbano.',
    keyInstruments: ['Guitarra Docerola (12 cuerdas acústicas)', 'Tololoche o bajo quinto acústico', 'Charcheta (saxor)', 'Trombón de vara', 'Trompeta'],
    definingTraits: 'Sonido acústico crudo, guitarras virtuosas de alta velocidad y temática lírica contemporánea. Erróneamente etiquetado sólo como "Latino".',
    famousExamples: ['Peso Pluma - Ella Baila Sola', 'Natanael Cano - Amor Tumbado', 'Junior H - El Hijo Mayor', 'Fuerza Regida - Bebe Dame'],
    color: '#f97316',
  },
  {
    id: 'rock-espanol',
    name: 'Rock en Español / Rock Latino',
    category: 'Rock & Alternativo',
    bpm: '115 - 145 BPM',
    rhythmPattern: 'Compás de 4/4 con acentuación backbeat, solos de guitarra y líneas melódicas de bajo',
    origins: 'Argentina, México, España y Chile (décadas de 1970 y 1980 con el movimiento "Rock en tu Idioma").',
    keyInstruments: ['Guitarras eléctricas con overdrive y chorus', 'Bajo eléctrico protagonista', 'Batería acústica', 'Voz poética y contestataria'],
    definingTraits: 'Fusión de la energía del rock anglosajón con la riqueza poética y temática social en lengua española.',
    famousExamples: ['Soda Stereo - De Música Ligera', 'Enanitos Verdes - Lamento Boliviano', 'Maná - Rayando El Sol', 'Héroes del Silencio - Entre Dos Tierras'],
    color: '#ef4444',
  },
  {
    id: 'reggaeton',
    name: 'Reggaetón & Dembow',
    category: 'Música Urbana',
    bpm: '88 - 100 BPM (Reggaetón) / 115 - 128 BPM (Dembow Dominicano)',
    rhythmPattern: 'Patrón sincopado Dembow (tresillo 3:2: tun-pa-tun-pa)',
    origins: 'Puerto Rico y Panamá (década de 1990) con raíces en el dancehall jamaiquino y reggae en español.',
    keyInstruments: ['Caja de ritmos TR-808 (kick y snare característico)', 'Sub-bajo 808 continuo', 'Sintetizadores melódicos', 'Voz procesada rítmica con autotune'],
    definingTraits: 'Ritmo bailable contagioso para club y perreo, ganchos melódicos memorables.',
    famousExamples: ['J Balvin - Azul', 'Daddy Yankee - Gasolina', 'Bad Bunny - Tití Me Preguntó', 'Don Omar - Danza Kuduro'],
    color: '#ec4899',
  },
  {
    id: 'latin-trap',
    name: 'Latin Trap',
    category: 'Música Urbana',
    bpm: '130 - 150 BPM (Tiempo real a 65 - 75 BPM)',
    rhythmPattern: 'Hi-hats rápidos en tresillos continuos, silencios y drops de sub-bajo 808',
    origins: 'Atlanta (EE.UU.) adaptado en Puerto Rico, Argentina y Colombia a mediados de la década de 2010.',
    keyInstruments: ['Bajo 808 glissando (pitch slide)', 'Hi-hat rolls en 1/32 y 1/64', 'Pads oscuros en escala menor', 'Clap seco', 'Voz rapeada'],
    definingTraits: 'Atmósfera nocturna, cadencia vocal sincopada, barras líricas introspectivas o callejeras.',
    famousExamples: ['Bad Bunny - Dákiti', 'Anuel AA - Sola', 'Duki - Goteo', 'Eladio Carrión - Mbappé'],
    color: '#a855f7',
  },
];

interface GenreExplorerProps {
  onSearchGenreSample: (query: string) => void;
}

export const GenreExplorer: React.FC<GenreExplorerProps> = ({ onSearchGenreSample }) => {
  const [selectedId, setSelectedId] = useState(GENRE_DATABASE[0].id);

  const activeGenre = GENRE_DATABASE.find((g) => g.id === selectedId) || GENRE_DATABASE[0];

  return (
    <div className="space-y-6">
      {/* Anti-lazy label educational callout */}
      <div className="p-5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-3.5 text-xs text-cyan-200">
        <ShieldAlert className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-white text-sm block">
            ¿Por qué no usamos etiquetas paraguas como &ldquo;Latino&rdquo; o &ldquo;Tropical&rdquo;?
          </span>
          <p className="text-cyan-200/90 leading-relaxed">
            Las bases de datos comerciales anglosajonas (como iTunes o Spotify) suelen encasillar por pereza casi cualquier canción en español bajo la etiqueta genérica <strong>&ldquo;Latino&rdquo;</strong> o <strong>&ldquo;Tropical&rdquo;</strong>. Esto ignora por completo que una <strong>Bachata</strong> (con requinto de amargue) no tiene nada que ver rítmicamente con una <strong>Salsa Brava</strong> (clave 3:2 y metales), una <strong>Cumbia</strong> (güiro y acordeón), o un <strong>Corrido Tumbado</strong> (docerola y tololoche). SonoraGenre desglosa y respeta la identidad acústica real de cada género.
          </p>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white">
            Enciclopedia & Taxonomía Específica de Géneros Musicales
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Explora las estructuras rítmicas auténticas, compases e instrumentación que diferencian cada género específico sin caer en etiquetas genéricas.
        </p>

        {/* Category selector chips */}
        <div className="flex flex-wrap gap-2 mt-4">
          {GENRE_DATABASE.map((genre) => (
            <button
              key={genre.id}
              onClick={() => setSelectedId(genre.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedId === genre.id
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>

      {/* Detail Showcase */}
      <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-80 h-80 blur-3xl opacity-15 rounded-full pointer-events-none"
          style={{ backgroundColor: activeGenre.color }}
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-semibold text-purple-400 tracking-wider">
                {activeGenre.category}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-mono text-pink-400">{activeGenre.bpm}</span>
            </div>
            <h3 className="text-2xl font-black text-white">{activeGenre.name}</h3>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-300 font-mono">
            Rango: {activeGenre.bpm}
          </div>
        </div>

        {/* Grid info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-1 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-pink-400" /> Patrón Rítmico y Compás
              </span>
              <p className="text-xs text-slate-200 bg-slate-950/60 p-3 rounded-xl border border-white/5 leading-relaxed">
                {activeGenre.rhythmPattern}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-1 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-cyan-400" /> Instrumentación Fundamental
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeGenre.keyInstruments.map((inst, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300"
                  >
                    {inst}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-1">
                Rasgos Estilísticos & Definición
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeGenre.definingTraits}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-1">
                Orígenes Históricos & Evolución
              </span>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-white/5">
                {activeGenre.origins}
              </p>
            </div>

            {/* Test samples */}
            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Canciones emblemáticas (Pruébalas en el detector):
              </span>
              <div className="space-y-2">
                {activeGenre.famousExamples.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => onSearchGenreSample(ex)}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-950/80 hover:bg-pink-950/30 border border-white/10 hover:border-pink-500/40 text-xs text-slate-200 flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <Disc3 className="w-3.5 h-3.5 text-pink-400 group-hover:rotate-90 transition-transform" />
                      <span className="font-medium group-hover:text-pink-300 transition-colors">
                        {ex}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 group-hover:text-slate-300">
                      Detectar género →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
