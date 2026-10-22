/**
 * Core musical query cleaning, normalization, and genre classification logic.
 * Decoupled from React UI for fast deterministic testing.
 * Enforces deep specificity for Latin / Spanish music, avoiding lazy umbrella labels ("Latino", "Tropical").
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

// Common conversational or instructional phrases that users might type
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
 * Strips user query prompt keywords and extracts artist / song title if separated by dash or 'de'.
 */
export function cleanMusicQuery(input: string): ParsedQuery {
  if (!input) {
    return { raw: '', cleaned: '' };
  }

  const raw = input.trim();
  let cleaned = raw;

  // Remove noise phrases
  for (const regex of NOISE_PHRASES) {
    cleaned = cleaned.replace(regex, ' ');
  }

  // Clean extra quotes, brackets, and consecutive whitespace
  cleaned = cleaned
    .replace(/["'«»“”()[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  let detectedArtist: string | undefined;
  let detectedTitle: string | undefined;

  // Check for common artist - title separators: " - ", " – ", " — ", " : "
  const dashMatch = cleaned.match(/^([^-–—:]+?)\s*[-–—:]\s*(.+)$/);
  if (dashMatch) {
    let art = dashMatch[1].trim();
    let tit = dashMatch[2].trim();
    // Strip leading "la / el / de / del " if left over from "la cancion ..."
    art = art.replace(/^(la|el|de|del)\s+/i, '').trim();
    tit = tit.replace(/^(la|el|de|del)\s+/i, '').trim();
    detectedArtist = art;
    detectedTitle = tit;
  } else {
    // Check for "song de artist" or "artist de song" pattern if present
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

/**
 * Standardizes raw external database genre labels into a rich, highly specific music profile.
 * Prevents lazy generic classification like "Latino" or "Tropical" for Spanish-language music.
 */
export function enrichGenreProfile(
  primaryGenreRaw: string,
  additionalTags: string[] = [],
  contextQuery?: string
): GenreProfile {
  const normalized = (primaryGenreRaw || '').toLowerCase();
  const tagsStr = additionalTags.join(' ').toLowerCase();
  const contextStr = (contextQuery || '').toLowerCase();
  const combined = `${normalized} ${tagsStr} ${contextStr}`;

  const isGenericLabelInDB =
    normalized === 'latino' ||
    normalized === 'latin' ||
    normalized === 'tropical' ||
    normalized === 'latin urban' ||
    normalized === 'musica latina';

  // 1. BACHATA (Not lazy "Tropical")
  if (
    combined.includes('bachata') ||
    combined.includes('romeo santos') ||
    combined.includes('aventura') ||
    combined.includes('prince royce') ||
    combined.includes('antony santos') ||
    combined.includes('frank reyes') ||
    (combined.includes('juan luis guerra') && (combined.includes('burbujas') || combined.includes('bachata')))
  ) {
    return {
      primaryGenre: 'Bachata Sensual & Tradicional',
      subgenres: ['Bachata Sensual', 'Bachata Urbana', 'Bachata Tradicional', 'Música de Amargue'],
      category: 'Género Caribeño / Dominicano',
      color: '#0ea5e9', // sky-500
      badgeBg: 'bg-sky-500/20',
      badgeText: 'text-sky-400 border-sky-500/40',
      vibe: 'Romántico, melancólico, sensual, íntimo y bailable en pareja',
      typicalRhythm: 'Compás de 4/4 sincopado con bajo característico y toque de guitarra requinto',
      tempoRange: '120 - 140 BPM',
      instruments: ['Guitarra Requinto (punteo con chorus/delay)', 'Guitarra Segunda', 'Bongó dominicano', 'Güira metálica', 'Bajo eléctrico sincopado'],
      danceability: 'Muy alta en pareja (92%)',
      isLazyLabelRefined: isGenericLabelInDB,
      lazyLabelNote: 'Refinado: Las BDs externas suelen catalogarla vagamente como "Tropical" o "Latino". Nuestro motor identifica con precisión que es Bachata.',
      culturalLineage: 'República Dominicana ➔ Música de Amargue y Bolero Campesino ➔ Bachata Moderna',
    };
  }

  // 2. SALSA (Not lazy "Tropical")
  if (
    combined.includes('salsa') ||
    combined.includes('hector lavoe') ||
    combined.includes('héctor lavoe') ||
    combined.includes('marc anthony') ||
    combined.includes('willie colon') ||
    combined.includes('willie colón') ||
    combined.includes('ruben blades') ||
    combined.includes('rubén blades') ||
    combined.includes('celia cruz') ||
    combined.includes('grupo niche') ||
    combined.includes('joe arroyo') ||
    combined.includes('gilberto santa rosa') ||
    combined.includes('fania') ||
    combined.includes('timba')
  ) {
    return {
      primaryGenre: 'Salsa (Brava / Romántica)',
      subgenres: ['Salsa Brava', 'Salsa Romántica', 'Salsa Dura', 'Timba Cubana', 'Guaguancó Moderno'],
      category: 'Música Afro-Caribeña',
      color: '#eab308', // yellow-500
      badgeBg: 'bg-yellow-500/20',
      badgeText: 'text-yellow-400 border-yellow-500/40',
      vibe: 'Festivo, explosivo, rítmico, apasionado y de alta maestría instrumental',
      typicalRhythm: 'Patrón rítmico de Clave (2:3 o 3:2) con polirritmia de conga, campana y timbal',
      tempoRange: '160 - 220 BPM (compás binario rápido)',
      instruments: ['Sección de metales (trompetas, trombones)', 'Piano con montunos sincopados', 'Congas (tumbadora)', 'Timbales con cáscara', 'Bajo con tumbao', 'Güiro y campana'],
      danceability: 'Máxima para baile (98%)',
      isLazyLabelRefined: isGenericLabelInDB,
      lazyLabelNote: 'Refinado: Desglosado de la etiqueta genérica "Tropical / Latino" a la disciplina exacta de Salsa.',
      culturalLineage: 'Cuba & Puerto Rico ➔ Barrio Latino de Nueva York (Fania All-Stars) ➔ Salsa Global',
    };
  }

  // 3. CUMBIA (Not lazy "Tropical")
  if (
    combined.includes('cumbia') ||
    combined.includes('angeles azules') ||
    combined.includes('ángeles azules') ||
    combined.includes('damas gratis') ||
    combined.includes('celso piña') ||
    combined.includes('rafaga') ||
    combined.includes('ráfaga') ||
    combined.includes('sonidera') ||
    combined.includes('villera')
  ) {
    return {
      primaryGenre: 'Cumbia (Sonidera / Villera / Tradicional)',
      subgenres: ['Cumbia Sonidera', 'Cumbia Villera', 'Cumbia Colombiana', 'Cumbia Pop / Cheta', 'Cumbia Norteña'],
      category: 'Folclore & Tradición Panlatina',
      color: '#10b981', // emerald-500
      badgeBg: 'bg-emerald-500/20',
      badgeText: 'text-emerald-400 border-emerald-500/40',
      vibe: 'Festivo, popular, callejero, contagioso y bailable',
      typicalRhythm: 'Compás de 2/4 o 4/4 con arrastre de güiro/güira constante (chiki-chiki-chá)',
      tempoRange: '85 - 110 BPM (cadencioso)',
      instruments: ['Güiro o güira', 'Acordeón o sintetizadores sonideros', 'Bajo con golpe a contratiempo', 'Congas y timbaletas', 'Efectos de voz con eco'],
      danceability: 'Muy alta (95%)',
      isLazyLabelRefined: isGenericLabelInDB,
      lazyLabelNote: 'Refinado: Separado del saco genérico "Tropical" a la vertiente específica de Cumbia.',
      culturalLineage: 'Caribe Colombiano (raíces indígenas y africanas) ➔ México, Argentina y toda América Latina',
    };
  }

  // 4. CORRIDOS TUMBADOS & REGIONAL MEXICANO (Not lazy "Latino")
  if (
    combined.includes('corrido') ||
    combined.includes('regional mexicano') ||
    combined.includes('peso pluma') ||
    combined.includes('natanael cano') ||
    combined.includes('junior h') ||
    combined.includes('fuerza regida') ||
    combined.includes('banda') ||
    combined.includes('norteño') ||
    combined.includes('mariachi') ||
    combined.includes('christian nodal') ||
    combined.includes('carin leon') ||
    combined.includes('carín león') ||
    combined.includes('sierreño') ||
    combined.includes('trombón')
  ) {
    return {
      primaryGenre: 'Corridos Tumbados / Regional Mexicano',
      subgenres: ['Corridos Tumbados', 'Corridos Bélicos', 'Sierreño Urbano', 'Banda Sinaloense', 'Norteño Contemporáneo'],
      category: 'Regional Mexicano',
      color: '#f97316', // orange-500
      badgeBg: 'bg-orange-500/20',
      badgeText: 'text-orange-400 border-orange-500/40',
      vibe: 'Acústico crudo, callejero, orgullo, desafiante y narrativo',
      typicalRhythm: 'Compás ternario de 3/4 o 6/8 con requinto punteado en tiempo rápido',
      tempoRange: '125 - 160 BPM',
      instruments: ['Guitarra Docerola (12 cuerdas acústicas)', 'Tololoche o bajo quinto acústico', 'Charcheta (saxor)', 'Trombón de vara', 'Trompeta'],
      danceability: 'Moderada / Baile zapateado (75%)',
      isLazyLabelRefined: isGenericLabelInDB,
      lazyLabelNote: 'Refinado: En tiendas como Apple Music se etiqueta simplistamente como "Latino". Corresponde al subgénero exacto de Corridos Tumbados.',
      culturalLineage: 'Tradición de Corridos de la Revolución Mexicana ➔ Fusión con trap y guitarras del Sierreño Moderno',
    };
  }

  // 5. VALLENATO (Not lazy "Tropical")
  if (
    combined.includes('vallenato') ||
    combined.includes('diomedes') ||
    combined.includes('silvestre dangond') ||
    combined.includes('binomio de oro') ||
    combined.includes('carlos vives') ||
    combined.includes('jorge celedon') ||
    combined.includes('jorge celedón')
  ) {
    return {
      primaryGenre: 'Vallenato (Tradicional & Nueva Ola)',
      subgenres: ['Vallenato Paseo', 'Vallenato Romántico', 'Merengue Vallenato', 'Nueva Ola Vallenata'],
      category: 'Folclore Colombiano',
      color: '#84cc16', // lime-500
      badgeBg: 'bg-lime-500/20',
      badgeText: 'text-lime-400 border-lime-500/40',
      vibe: 'Sentimental, parrandero, poético y alegre',
      typicalRhythm: 'Los cuatro aires vallenatos: Paseo, Merengue, Son y Puya',
      tempoRange: '90 - 130 BPM',
      instruments: ['Acordeón diatónico de botones', 'Caja vallenata (tambor pequeño)', 'Guacharaca de caña', 'Bajo eléctrico', 'Guitarra acústica'],
      danceability: 'Alta (88%)',
      isLazyLabelRefined: isGenericLabelInDB,
      lazyLabelNote: 'Refinado: Diferenciado de "Tropical" al patrimonio autóctono de Vallenato.',
      culturalLineage: 'Valle de Upar (Caribe Colombiano) ➔ Juglares Vallenatos ➔ Fusión Vallenata Pop',
    };
  }

  // 6. MERENGUE (Not lazy "Tropical")
  if (
    combined.includes('merengue') ||
    combined.includes('elvis crespo') ||
    combined.includes('olga tañon') ||
    combined.includes('olga tañón') ||
    combined.includes('hermanos rosario') ||
    combined.includes('mambo de calle')
  ) {
    return {
      primaryGenre: 'Merengue (Clásico / Mambo de Calle)',
      subgenres: ['Merengue Típico', 'Merengue de Orquesta', 'Mambo de Calle / Merengue Urbano', 'Tecno-Merengue'],
      category: 'Música Dominicana',
      color: '#f43f5e', // rose-500
      badgeBg: 'bg-rose-500/20',
      badgeText: 'text-rose-400 border-rose-500/40',
      vibe: 'Ultra acelerado, eufórico, fiesta instantánea y desinhibido',
      typicalRhythm: 'Compás de 2/4 vertiginoso con repique de tambora (quinto y golpe de aro)',
      tempoRange: '130 - 170 BPM',
      instruments: ['Tambora dominicana con baqueta', 'Güira metálica rascada a doble pulso', 'Saxofones rápidos en coro', 'Acordeón o sintetizador de vientos', 'Bajo activo'],
      danceability: 'Máxima (98%)',
      isLazyLabelRefined: isGenericLabelInDB,
      lazyLabelNote: 'Refinado: Separado de la etiqueta paraguas "Tropical" a Merengue Dominicano.',
      culturalLineage: 'República Dominicana (siglo XIX) ➔ Orquestas de los 80s ➔ Merengue Urbano Global',
    };
  }

  // 7. LATIN TRAP (Distinct from Reggaeton)
  if (
    (combined.includes('trap') && (combined.includes('latino') || combined.includes('latin') || combined.includes('bad bunny') || combined.includes('anuel') || combined.includes('duki') || combined.includes('eladio'))) ||
    combined.includes('latin trap')
  ) {
    return {
      primaryGenre: 'Latin Trap',
      subgenres: ['Trap Latino', 'Drill en Español', 'Trap Melódico', 'Trap Sad'],
      category: 'Música Urbana',
      color: '#a855f7', // purple-500
      badgeBg: 'bg-purple-500/20',
      badgeText: 'text-purple-400 border-purple-500/40',
      vibe: 'Oscuro, introspectivo, pesado, con actitud y barras líricas callejeras',
      typicalRhythm: 'Compás de 4/4 a medio tiempo con redobles rápidos de hi-hats en tresillos (1/32) y silencios dramáticos',
      tempoRange: '130 - 150 BPM (tiempo real medido a 65 - 75 BPM)',
      instruments: ['Bombos y sub-bajos 808 distorsionados con pitch slide', 'Hi-hat rolls hiperveloces', 'Sintetizadores oscuros en escala menor', 'Clap seco', 'Voz rapeada'],
      danceability: 'Moderna urbana / Head-nodding (80%)',
      isLazyLabelRefined: isGenericLabelInDB,
      lazyLabelNote: 'Refinado: Distinguido del reggaetón y de "Latino"; ritmo específico de Trap con 808.',
      culturalLineage: 'Atlanta Trap (EE.UU.) ➔ Puerto Rico, Argentina y Medellín ➔ Latin Trap Wave',
    };
  }

  // 8. REGGAETÓN & DEMBOW (Distinct from generic "Latin")
  if (
    combined.includes('reggaeton') ||
    combined.includes('reggaetón') ||
    combined.includes('dembow') ||
    combined.includes('balvin') ||
    combined.includes('daddy yankee') ||
    combined.includes('don omar') ||
    combined.includes('rauw') ||
    combined.includes('feid') ||
    combined.includes('karol g') ||
    combined.includes('maluma') ||
    combined.includes('ozuna') ||
    combined.includes('wisin') ||
    combined.includes('yandel') ||
    combined.includes('el alfa')
  ) {
    const isDembowDominicano = combined.includes('el alfa') || combined.includes('dembow dominicano') || combined.includes('chiki bom bom');
    return {
      primaryGenre: isDembowDominicano ? 'Dembow Dominicano' : 'Reggaetón',
      subgenres: isDembowDominicano
        ? ['Dembow Dominicano', 'Teteo Urbano', 'Perreo Acelerado']
        : ['Reggaetón Clásico', 'Perreo', 'Pop Urbano', 'Afro-Reggaetón', 'Reggaetón Romántico'],
      category: 'Música Urbana',
      color: '#ec4899', // pink-500
      badgeBg: 'bg-pink-500/20',
      badgeText: 'text-pink-400 border-pink-500/40',
      vibe: 'Bailable, enérgico, sensual, nocturno y de fiesta en club',
      typicalRhythm: isDembowDominicano
        ? 'Patrón sincopado acelerado a más de 115 BPM con percusión estridente'
        : 'Patrón Dembow rítmico sincopado (3:2 / tresillo característico: tun-pa-tun-pa)',
      tempoRange: isDembowDominicano ? '112 - 128 BPM' : '88 - 100 BPM',
      instruments: ['Caja de ritmos TR-808 (kick y snare con tresillo)', 'Sub-bajo 808 contundente', 'Sintetizadores melódicos', 'Voz procesada rítmica con hooks pegadizos'],
      danceability: 'Máxima de club (96%)',
      isLazyLabelRefined: isGenericLabelInDB,
      lazyLabelNote: 'Refinado: iTunes y otras BDs suelen agruparlo simplemente como "Latino". Se clasifica en su ritmo específico de Reggaetón / Dembow.',
      culturalLineage: 'Jamaica (Dancehall) ➔ Panamá (Reggae en Español) ➔ Puerto Rico (Underground / Perreo) ➔ Global',
    };
  }

  // 9. ROCK EN ESPAÑOL & LATIN ROCK (Not lazy "Latino")
  if (
    (combined.includes('rock') && (combined.includes('español') || combined.includes('latino') || combined.includes('soda stereo') || combined.includes('cerati') || combined.includes('enanitos verdes') || combined.includes('mana') || combined.includes('maná') || combined.includes('heroes del silencio') || combined.includes('héroes del silencio') || combined.includes('cafe tacvba') || combined.includes('café tacvba') || combined.includes('fabulosos cadillacs') || combined.includes('molotov') || combined.includes('zoe') || combined.includes('zoé'))) ||
    combined.includes('soda stereo') ||
    combined.includes('cerati') ||
    combined.includes('enanitos verdes')
  ) {
    return {
      primaryGenre: 'Rock en Español / Rock Latino',
      subgenres: ['Rock en Español', 'Post-Punk Latino', 'Pop-Rock en Español', 'Ska Latino', 'Rock Alternativo'],
      category: 'Rock & Alternativo',
      color: '#ef4444', // red-500
      badgeBg: 'bg-red-500/20',
      badgeText: 'text-red-400 border-red-500/40',
      vibe: 'Poético, rebelde, enérgico, reflexivo con gran dinamismo instrumental',
      typicalRhythm: 'Compás de 4/4 con backbeat acentuado y riffs de guitarra característicos',
      tempoRange: '115 - 145 BPM',
      instruments: ['Guitarras eléctricas con overdrive y chorus', 'Bajo eléctrico con presencia melódica', 'Batería acústica', 'Voz líder apasionada'],
      danceability: 'Moderada / Pogo / Concierto (68%)',
      isLazyLabelRefined: isGenericLabelInDB,
      lazyLabelNote: 'Refinado: Las tiendas anglosajonas lo suelen rotular como "Latino". Corresponde al movimiento histórico de Rock en Español.',
      culturalLineage: 'Movimiento "Rock en tu Idioma" de los años 80 en Argentina, México, España y Colombia',
    };
  }

  // 10. BOLERO & BALADA ROMÁNTICA EN ESPAÑOL (Not lazy "Latino")
  if (
    combined.includes('bolero') ||
    combined.includes('balada') ||
    combined.includes('luis miguel') ||
    combined.includes('armando manzanero') ||
    combined.includes('los panchos') ||
    combined.includes('mon laferte')
  ) {
    return {
      primaryGenre: 'Bolero & Balada Romántica',
      subgenres: ['Bolero Clásico', 'Bolero-Son', 'Balada Romántica en Español', 'Canción de Autor'],
      category: 'Música Romántica Tradicional',
      color: '#d946ef', // fuchsia-500
      badgeBg: 'bg-fuchsia-500/20',
      badgeText: 'text-fuchsia-400 border-fuchsia-500/40',
      vibe: 'Nostálgico, poético, elegante, bohemio y apasionado',
      typicalRhythm: 'Compás binario cadencioso y pausado con acento de maracas y requinto',
      tempoRange: '60 - 90 BPM (tiempo lento)',
      instruments: ['Trío de guitarras acústicas y requinto', 'Maracas suaves', 'Piano de cola', 'Bajo acústico', 'Arreglos de cuerdas'],
      danceability: 'Baile lento y abrazado (70%)',
      isLazyLabelRefined: isGenericLabelInDB,
      lazyLabelNote: 'Refinado: Clasificado específicamente como Bolero en lugar del término amplio "Latino".',
      culturalLineage: 'Cuba (siglo XIX) ➔ Época de Oro en México ➔ Tradición hispanoamericana universal',
    };
  }

  // 11. POP LATINO & BALADA POP (Specific)
  if (
    (combined.includes('pop') && (combined.includes('latino') || combined.includes('shakira') || combined.includes('chayanne') || combined.includes('ricky martin') || combined.includes('enrique iglesias') || combined.includes('camilo') || combined.includes('sebastian yatra'))) ||
    combined.includes('pop latino')
  ) {
    return {
      primaryGenre: 'Pop Latino',
      subgenres: ['Pop Latino Contemporáneo', 'Balada Pop', 'Dance-Pop Latino', 'Electropop en Español'],
      category: 'Pop',
      color: '#8b5cf6', // violet-500
      badgeBg: 'bg-violet-500/20',
      badgeText: 'text-violet-400 border-violet-500/40',
      vibe: 'Pegadizo, luminoso, melódico, romántico y comercial',
      typicalRhythm: 'Compás de 4/4 con fuerte gancho melódico y coros radiofónicos',
      tempoRange: '105 - 128 BPM',
      instruments: ['Guitarras acústicas y eléctricas', 'Sintetizadores brillantes', 'Baterías acústicas procesadas', 'Coros multicapa'],
      danceability: 'Alta (82%)',
      isLazyLabelRefined: isGenericLabelInDB,
      lazyLabelNote: 'Refinado: Especificado como Pop Latino con gancho melódico comercial.',
      culturalLineage: 'Fusión del pop internacional con sensibilidades melódicas hispanas',
    };
  }

  // 12. Standard Global Rock / Classic Rock / Metal
  if (
    combined.includes('rock') ||
    combined.includes('metal') ||
    combined.includes('grunge') ||
    combined.includes('punk')
  ) {
    const isClassic = combined.includes('classic') || combined.includes('queen') || combined.includes('beatles') || combined.includes('led zeppelin') || combined.includes('pink floyd');
    const isHardOrMetal = combined.includes('metal') || combined.includes('hard rock');
    
    return {
      primaryGenre: isClassic ? 'Rock Clásico & Progresivo' : isHardOrMetal ? 'Hard Rock & Heavy Metal' : 'Rock / Rock Alternativo',
      subgenres: isClassic ? ['Classic Rock', 'Hard Rock', 'Glam Rock', 'Rock Progresivo'] : ['Alternative Rock', 'Indie Rock', 'Grunge', 'Garage Rock'],
      category: 'Rock & Alternativo',
      color: '#ef4444',
      badgeBg: 'bg-red-500/20',
      badgeText: 'text-red-400 border-red-500/40',
      vibe: 'Intenso, épico, rebelde, orgánico con alta dinámica instrumental',
      typicalRhythm: 'Compás de 4/4 con acentuación fuerte en tiempos 2 y 4 (backbeat)',
      tempoRange: '110 - 145 BPM',
      instruments: ['Guitarras eléctricas con distorsión', 'Bajo eléctrico', 'Batería acústica', 'Voz potente'],
      danceability: 'Moderada (60%)',
      culturalLineage: 'Evolución del blues y rock and roll anglosajón',
    };
  }

  // 13. Electronic / Dance / House / Techno
  if (
    combined.includes('electronic') ||
    combined.includes('electrónica') ||
    combined.includes('dance') ||
    combined.includes('house') ||
    combined.includes('techno') ||
    combined.includes('edm') ||
    combined.includes('daft punk')
  ) {
    return {
      primaryGenre: 'Electrónica & Dance (EDM)',
      subgenres: ['House', 'Techno', 'Nu-Disco', 'Future Bass', 'Synthwave', 'Deep House'],
      category: 'Electrónica',
      color: '#06b6d4',
      badgeBg: 'bg-cyan-500/20',
      badgeText: 'text-cyan-400 border-cyan-500/40',
      vibe: 'Club, eufórico, hipnótico, bailable y envolvente',
      typicalRhythm: 'Four-on-the-floor (bombo en cada uno de los 4 tiempos del compás)',
      tempoRange: '120 - 132 BPM',
      instruments: ['Sintetizadores analógicos y VSTs', 'Caja de ritmos TR-909', 'Efectos de audio', 'Filtros modulados'],
      danceability: 'Muy alta (92%)',
      culturalLineage: 'Chicago House, Detroit Techno y cultura club europea',
    };
  }

  // 14. Standard Pop
  if (combined.includes('pop') && !combined.includes('hip')) {
    return {
      primaryGenre: 'Pop Internacional',
      subgenres: ['Dance-Pop', 'Electropop', 'Synthpop', 'Indie Pop'],
      category: 'Pop',
      color: '#8b5cf6',
      badgeBg: 'bg-purple-500/20',
      badgeText: 'text-purple-400 border-purple-500/40',
      vibe: 'Pegadizo, melódico, comercial, luminoso y emotivo',
      typicalRhythm: '4/4 accesible con coros de fuerte gancho melódico',
      tempoRange: '100 - 128 BPM',
      instruments: ['Sintetizadores polifónicos', 'Baterías procesadas', 'Guitarras rítmicas', 'Coros multicapa'],
      danceability: 'Alta (80%)',
      culturalLineage: 'Pop contemporáneo global',
    };
  }

  // Default fallback for unspecified
  return {
    primaryGenre: primaryGenreRaw ? primaryGenreRaw : 'Música Contemporánea',
    subgenres: additionalTags.length ? additionalTags.slice(0, 4) : ['Música Contemporánea', 'Global'],
    category: primaryGenreRaw || 'General',
    color: '#3b82f6',
    badgeBg: 'bg-blue-500/20',
    badgeText: 'text-blue-400 border-blue-500/40',
    vibe: 'Expresivo, armónico y estilístico',
    typicalRhythm: 'Estructura armónica y rítmica convencional',
    tempoRange: '90 - 120 BPM',
    instruments: ['Instrumentación acústica y digital contemporánea'],
    danceability: 'Moderada (70%)',
    culturalLineage: 'Tradición musical contemporánea',
  };
}

/**
 * Calculates confidence percentage based on database sources corroboration.
 */
export function calculateConfidence(hasItunes: boolean, hasMusicBrainz: boolean, hasAI: boolean, exactMatch: boolean): number {
  let score = 55;
  if (hasItunes) score += 20;
  if (hasMusicBrainz) score += 15;
  if (hasAI) score += 10;
  if (exactMatch) score += 10;
  return Math.min(score, 99);
}
