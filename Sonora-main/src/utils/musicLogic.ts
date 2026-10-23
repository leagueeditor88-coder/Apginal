/**
 * Core musical query cleaning, normalization, and genre classification logic.
 * Enforces deep specificity for Latin / Spanish music, avoiding lazy umbrella labels ("Latino", "Tropical").
 * 100% autonomous: cleans filenames, track numbers, and release years automatically.
 */

export interface ParsedQuery {
  raw: string;
  cleaned: string;
  detectedArtist?: string;
  detectedTitle?: string;
}

export interface GenreProfile {
  primaryGenre: string;
  subgenres: string[];
  category: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  vibe: string;
  typicalRhythm: string;
  tempoRange: string;
  instruments: string[];
  danceability: string;
  isLazyLabelRefined?: boolean;
  lazyLabelNote?: string;
  culturalLineage?: string;
}

const NOISE_PHRASES: RegExp[] = [
  /determinar\s+g[eé]nero(\s+musical)?/gi,
  /qu[eé]\s+g[eé]nero(\s+musical)?\s+(es|tiene)/gi,
  /cu[aá]l\s+es\s+el\s+g[eé]nero(\s+musical)?(\s+de)?/gi,
  /saber\s+(el\s+)?g[eé]nero(\s+musical)?/gi,
  /buscar\s+(el\s+)?g[eé]nero(\s+musical)?/gi,
  /identificar\s+(el\s+)?g[eé]nero(\s+musical)?/gi,
  /g[eé]nero\s+musical/gi,
  /g[eé]nero/gi,
  /(de\s+)?(la|el|este|esta)\s+canci[oó]n/gi,
  /canci[oó]n/gi,
  /tema(\s+musical)?/gi,
  /musica/gi,
  /m[uú]sica/gi,
  /track/gi,
  /what\s+genre(\s+is)?/gi,
  /find\s+genre/gi,
  /song\s+genre/gi,
];

/**
 * Limpia y normaliza el título de la canción:
 * - Elimina extensiones de audio (.mp3, .wav, .flac, .m4a, etc.)
 * - Elimina prefijos de pista (01. , Track 02 - , etc.)
 * - Elimina años en paréntesis o texto (1998, 2022, del año 2015, etc.) sin pedirlo al usuario.
 * - Elimina etiquetas de video/audio ((Official Video), (En Vivo), [Remastered], etc.)
 * - Extrae el artista y el título limpios.
 */
export function cleanMusicQuery(input: string): ParsedQuery {
  if (!input) {
    return { raw: '', cleaned: '' };
  }

  const raw = input.trim();
  let cleaned = raw;

  // 1. Quitar extensiones de archivo de audio
  cleaned = cleaned.replace(/\.(mp3|wav|flac|m4a|aac|ogg|opus|wma)$/i, '');

  // 2. Quitar prefijos numéricos de pista (01. , 01 - , Track 01 )
  cleaned = cleaned.replace(/^(track\s*)?\d+[\s._-]+/i, '');

  // 3. Quitar expresiones de año para que no interfieran en la búsqueda
  cleaned = cleaned.replace(/\(?\b(del\s+año|año|year)\s+\d{4}\b\)?/gi, '');
  cleaned = cleaned.replace(/[\[(]\s*(19\d\d|20\d\d)\s*[\])]/g, '');

  // 4. Quitar etiquetas de video / audio / remasterización
  cleaned = cleaned.replace(
    /[\[(]\s*(official\s*(music\s*)?video|video\s*oficial|audio\s*oficial|official\s*audio|letra|lyric(s)?(\s*video)?|en\s*vivo|live|remaster(ed)?(\s*\d{4})?|hd|hq|4k|visualizer|extended|clean|explicit|bonus\s*track|version\s*acustica|acustico)\s*[\])]/gi,
    ''
  );

  // 5. Quitar frases conversacionales de ruido
  for (const regex of NOISE_PHRASES) {
    cleaned = cleaned.replace(regex, ' ');
  }

  // 6. Normalizar comillas y espacios consecutivos
  cleaned = cleaned
    .replace(/["'«»“”()[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  let detectedArtist: string | undefined;
  let detectedTitle: string | undefined;

  // Separadores comunes: " - ", " – ", " — ", " : "
  const dashMatch = cleaned.match(/^([^-–—:]+?)\s*[-–—:]\s*(.+)$/);
  if (dashMatch) {
    let art = dashMatch[1].trim();
    let tit = dashMatch[2].trim();
    art = art.replace(/^(la|el|de|del)\s+/i, '').trim();
    tit = tit.replace(/^(la|el|de|del)\s+/i, '').trim();
    detectedArtist = art;
    detectedTitle = tit;
  } else {
    const deMatch = cleaned.match(/^(.+?)\s+de\s+(.+)$/i);
    if (deMatch) {
      let tit = deMatch[1].trim().replace(/^(la|el)\s+/i, '');
      let art = deMatch[2].trim().replace(/^(la|el)\s+/i, '');
      detectedTitle = tit;
      detectedArtist = art;
    }
  }

  return {
    raw,
    cleaned: cleaned || raw,
    detectedArtist,
    detectedTitle,
  };
}

export function enrichGenreProfile(
  rawGenre: string,
  extraTags: string[] = [],
  context: string = ''
): GenreProfile {
  const normalizedGenre = (rawGenre || '').trim().toLowerCase();
  const lowerContext = context.toLowerCase();
  const allText = `${normalizedGenre} ${extraTags.join(' ').toLowerCase()} ${lowerContext}`;

  // BACHATA
  if (
    allText.includes('bachata') ||
    lowerContext.includes('romeo santos') ||
    lowerContext.includes('aventura') ||
    lowerContext.includes('prince royce') ||
    lowerContext.includes('antony santos') ||
    lowerContext.includes('frank reyes')
  ) {
    return {
      primaryGenre: 'Bachata Sensual & Tradicional',
      subgenres: ['Bachata Tradicional', 'Bachata Urbana', 'Música de Amargue', 'Bachata Sensual'],
      category: 'Música Dominicana / Caribeña',
      color: 'from-pink-500 to-rose-600',
      badgeBg: 'rgba(244, 63, 94, 0.15)',
      badgeText: '#fb7185',
      vibe: 'Romántico, melancólico, sensual y bailable en pareja',
      typicalRhythm: 'Compás sincopado de 4/4 con requinto (lead guitar) y toque de bongo/güira',
      tempoRange: '120 - 138 BPM',
      instruments: ['Requinto (guitarra solista)', 'Segunda guitarra', 'Bajo eléctrico', 'Bongó', 'Güira'],
      danceability: 'Muy alta (paso básico de 4 tiempos con acento en cadera)',
      isLazyLabelRefined: true,
      lazyLabelNote: 'Se reclasificó de la etiqueta genérica "Latino" a Bachata Dominicana específica.',
      culturalLineage: 'República Dominicana ➔ Bolero Campesino ➔ Música de Amargue ➔ Bachata',
    };
  }

  // SALSA
  if (
    allText.includes('salsa') ||
    lowerContext.includes('hector lavoe') ||
    lowerContext.includes('marc anthony') ||
    lowerContext.includes('willie colon') ||
    lowerContext.includes('ruben blades') ||
    lowerContext.includes('celia cruz') ||
    lowerContext.includes('grupo niche') ||
    lowerContext.includes('gilberto santa rosa')
  ) {
    return {
      primaryGenre: 'Salsa (Brava / Romántica)',
      subgenres: ['Salsa Brava', 'Salsa Romántica', 'Timba Cubana', 'Salsa Dura'],
      category: 'Música Afrocaribeña & Antillana',
      color: 'from-red-500 to-amber-600',
      badgeBg: 'rgba(239, 68, 68, 0.15)',
      badgeText: '#f87171',
      vibe: 'Enérgico, polirrítmico, pasional y festivo',
      typicalRhythm: 'Patrón de clave 2:3 o 3:2 con montuno de piano y tumbao de conga',
      tempoRange: '160 - 220 BPM (80-110 a medio tiempo)',
      instruments: ['Congas', 'Timbales', 'Bongó y Campana', 'Piano (montuno)', 'Bajo (tumbao)', 'Trombones', 'Trompetas'],
      danceability: 'Máxima (baile en tiempo 1 o 2 en compás de 8 tiempos)',
      isLazyLabelRefined: true,
      lazyLabelNote: 'Se reclasificó de "Tropical" o "Latino" a Salsa clásica y estructurada.',
      culturalLineage: 'Cuba (Son Cubano & Mambo) + Puerto Rico ➔ Barrio Latino de Nueva York (Fania) ➔ Salsa Mundial',
    };
  }

  // CUMBIA
  if (
    allText.includes('cumbia') ||
    lowerContext.includes('angeles azules') ||
    lowerContext.includes('damas gratis') ||
    lowerContext.includes('celso piña') ||
    lowerContext.includes('sonidera') ||
    lowerContext.includes('villera')
  ) {
    return {
      primaryGenre: 'Cumbia (Sonidera / Villera / Tradicional)',
      subgenres: ['Cumbia Sonidera', 'Cumbia Villera', 'Cumbia Colombiana', 'Electro Cumbia'],
      category: 'Folclore Urbano Panlatino',
      color: 'from-emerald-500 to-teal-600',
      badgeBg: 'rgba(16, 185, 129, 0.15)',
      badgeText: '#34d399',
      vibe: 'Festivo, popular, hipnótico y rítmico',
      typicalRhythm: 'Compás de 2/4 o 4/4 con patrón característico de güiro (chiki-chiki) y contratiempo',
      tempoRange: '88 - 105 BPM',
      instruments: ['Güiro / Guache', 'Acordeón', 'Teclados con efectos', 'Timbales', 'Bajo melódico'],
      danceability: 'Muy alta (balanceo cadencioso accesible para cualquier oyente)',
      isLazyLabelRefined: true,
      lazyLabelNote: 'Desglosado del término "Tropical" a la vertiente específica de Cumbia.',
      culturalLineage: 'Caribe colombiano (indígena + africano) ➔ México (Sonidera) / Argentina (Villera)',
    };
  }

  // CORRIDOS TUMBADOS / REGIONAL MEXICANO
  if (
    allText.includes('corrido') ||
    allText.includes('banda') ||
    allText.includes('norteño') ||
    lowerContext.includes('peso pluma') ||
    lowerContext.includes('natanael cano') ||
    lowerContext.includes('fuerza regida') ||
    lowerContext.includes('junior h') ||
    lowerContext.includes('christian nodal')
  ) {
    return {
      primaryGenre: 'Regional Mexicano (Corridos Tumbados / Banda)',
      subgenres: ['Corridos Tumbados', 'Banda Sinaloense', 'Norteño Clásico', 'Sierreño Urbano'],
      category: 'Música Mexicana & Tradicional',
      color: 'from-amber-500 to-orange-600',
      badgeBg: 'rgba(245, 158, 11, 0.15)',
      badgeText: '#fbbf24',
      vibe: 'Crudo, acústico de alta velocidad, narrativo y moderno',
      typicalRhythm: 'Compás ternario de 3/4 o 6/8 con requinto de 12 cuerdas y bajo acústico',
      tempoRange: '125 - 145 BPM',
      instruments: ['Docerola (guitarra de 12 cuerdas)', 'Tololoche / Bajo acústico', 'Charcheta', 'Trompetas y Trombón'],
      danceability: 'Moderada a alta (estilo zapateado o balanceo)',
      isLazyLabelRefined: true,
      lazyLabelNote: 'Se reclasificó de la etiqueta genérica "Latino" a Corridos Tumbados / Regional Mexicano.',
      culturalLineage: 'Tradición del Corrido de la Revolución Mexicana ➔ Fusión Sierreña ➔ Corridos Tumbados Siglo XXI',
    };
  }

  // REGGAETÓN & URBANO
  if (
    allText.includes('reggaeton') ||
    allText.includes('reguetón') ||
    allText.includes('dembow') ||
    allText.includes('urbano') ||
    lowerContext.includes('bad bunny') ||
    lowerContext.includes('karol g') ||
    lowerContext.includes('rauw alejandro') ||
    lowerContext.includes('daddy yankee') ||
    lowerContext.includes('feid')
  ) {
    return {
      primaryGenre: 'Reggaetón & Urbano Latino',
      subgenres: ['Perreo Clásico', 'Reggaetón Moderno / Melódico', 'Dembow Dominicano', 'Trap Latino'],
      category: 'Música Urbana Contemporánea',
      color: 'from-purple-500 to-indigo-600',
      badgeBg: 'rgba(168, 85, 247, 0.15)',
      badgeText: '#c084fc',
      vibe: 'Enérgico, nocturno, bailable y contagioso',
      typicalRhythm: 'Patrón sincopado clásico Dembow (boom-ch-boom-chick) en 4/4',
      tempoRange: '90 - 105 BPM',
      instruments: ['Caja de ritmos (kick y snare dembow)', 'Sintetizadores', 'Sub-bajo 808', 'Vocal chops'],
      danceability: 'Máxima (baile perreo y discoteca)',
      isLazyLabelRefined: true,
      lazyLabelNote: 'Identificado como Reggaetón específico en vez de "Música Latina".',
      culturalLineage: 'Reggae en español de Panamá + Dancehall jamaiquino ➔ Puerto Rico Underground ➔ Reggaetón Global',
    };
  }

  // Default / Variado
  return {
    primaryGenre: rawGenre || 'Música Latina & Variada',
    subgenres: ['Música Popular', 'Ritmo Melódico', 'Contemporáneo'],
    category: 'Música General',
    color: 'from-cyan-500 to-blue-600',
    badgeBg: 'rgba(6, 182, 212, 0.15)',
    badgeText: '#22d3ee',
    vibe: 'Melódico y envolvente',
    typicalRhythm: 'Compás de 4/4 estándar',
    tempoRange: '95 - 128 BPM',
    instruments: ['Batería', 'Bajo', 'Guitarras', 'Teclados'],
    danceability: 'Media',
    isLazyLabelRefined: false,
    culturalLineage: 'Tradición y evolución de la música popular contemporánea',
  };
}

export function calculateConfidence(
  hasItunes: boolean,
  hasMusicBrainz: boolean,
  hasAi: boolean,
  titleExactMatch: boolean
): number {
  let score = 75;
  if (hasItunes) score += 12;
  if (hasMusicBrainz) score += 8;
  if (hasAi) score += 5;
  if (titleExactMatch) score += 5;
  return Math.min(score, 99);
}
