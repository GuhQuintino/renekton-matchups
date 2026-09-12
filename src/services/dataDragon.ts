/**
 * Data Dragon CDN Service & Offline Fallback Generator
 * Resolves Riot Games assets (Champion portraits, Items, Summoner Spells, Runes)
 * with robust offline SVG fallback generation.
 */

export const CANONICAL_RIOT_KEYS: Record<string, string> = {
  'Wukong': 'MonkeyKing',
  'MonkeyKing': 'MonkeyKing',
  'Dr. Mundo': 'DrMundo',
  'DR.Mundo': 'DrMundo',
  'DrMundo': 'DrMundo',
  'Cho\'Gath': 'Chogath',
  'Chogath': 'Chogath',
  'Kai\'Sa': 'Kaisa',
  'Kaisa': 'Kaisa',
  'K\'Sante': 'KSante',
  'KSante': 'KSante',
  'Kha\'Zix': 'Khazix',
  'Khazix': 'Khazix',
  'LeBlanc': 'Leblanc',
  'Leblanc': 'Leblanc',
  'Nunu & Willump': 'Nunu',
  'Nunu': 'Nunu',
  'Renata Glasc': 'Renata',
  'Renata': 'Renata',
  'Rek\'Sai': 'RekSai',
  'RekSai': 'RekSai',
  'Vel\'Koz': 'Velkoz',
  'Velkoz': 'Velkoz',
  'Jarvan IV': 'JarvanIV',
  'JarvanIV': 'JarvanIV',
  'Lee Sin': 'LeeSin',
  'LeeSin': 'LeeSin',
  'Master Yi': 'MasterYi',
  'MasterYi': 'MasterYi',
  'Miss Fortune': 'MissFortune',
  'MissFortune': 'MissFortune',
  'Tahm Kench': 'TahmKench',
  'TahmKench': 'TahmKench',
  'Twisted Fate': 'TwistedFate',
  'TwistedFate': 'TwistedFate',
  'Xin Zhao': 'XinZhao',
  'XinZhao': 'XinZhao',
  'Aurelion Sol': 'AurelionSol',
  'AurelionSol': 'AurelionSol',
  'Bel\'Veth': 'Belveth',
  'Belveth': 'Belveth',
  'Bel\'veth': 'Belveth'
};

export const COMMON_SUMMONER_SPELLS: Record<string, string> = {
  'Flash': 'SummonerFlash',
  'Ignite': 'SummonerDot',
  'Teleport': 'SummonerTeleport',
  'Ghost': 'SummonerHaste',
  'Barrier': 'SummonerBarrier',
  'Exhaust': 'SummonerExhaust',
  'Cleanse': 'SummonerBoost',
  'Heal': 'SummonerHeal',
  'Smite': 'SummonerSmite'
};

export interface LocalizedName {
  pt: string;
  en: string;
}

export const COMMON_ITEMS_LOC: Record<string | number, LocalizedName> = {
  1055: { pt: 'Lâmina de Doran', en: "Doran's Blade" },
  'Dorans Blade': { pt: 'Lâmina de Doran', en: "Doran's Blade" },
  "Doran's Blade": { pt: 'Lâmina de Doran', en: "Doran's Blade" },
  1054: { pt: 'Escudo de Doran', en: "Doran's Shield" },
  'Dorans Shield': { pt: 'Escudo de Doran', en: "Doran's Shield" },
  "Doran's Shield": { pt: 'Escudo de Doran', en: "Doran's Shield" },
  1036: { pt: 'Espada Longa', en: 'Long Sword' },
  'Long Sword': { pt: 'Espada Longa', en: 'Long Sword' },
  2003: { pt: 'Poção de Vida', en: 'Health Potion' },
  2031: { pt: 'Poção Refilável', en: 'Refillable Potion' },
  3077: { pt: 'Tiamat', en: 'Tiamat' },
  'Tiamat': { pt: 'Tiamat', en: 'Tiamat' },
  6698: { pt: 'Hidra Profana', en: 'Profane Hydra' },
  'Profane Hydra': { pt: 'Hidra Profana', en: 'Profane Hydra' },
  'Profane': { pt: 'Hidra Profana', en: 'Profane Hydra' },
  3074: { pt: 'Hidra Raivosa', en: 'Ravenous Hydra' },
  'Ravenous Hydra': { pt: 'Hidra Raivosa', en: 'Ravenous Hydra' },
  'Ravenous': { pt: 'Hidra Raivosa', en: 'Ravenous Hydra' },
  3748: { pt: 'Hidra Titânica', en: 'Titanic Hydra' },
  'Titanic Hydra': { pt: 'Hidra Titânica', en: 'Titanic Hydra' },
  'Titanic': { pt: 'Hidra Titânica', en: 'Titanic Hydra' },
  6631: { pt: 'Quebrapassos', en: 'Stridebreaker' },
  'Stridebreaker': { pt: 'Quebrapassos', en: 'Stridebreaker' },
  6692: { pt: 'Eclipse', en: 'Eclipse' },
  'Eclipse': { pt: 'Eclipse', en: 'Eclipse' },
  3071: { pt: 'Cutelo Negro', en: 'Black Cleaver' },
  'Black Cleaver': { pt: 'Cutelo Negro', en: 'Black Cleaver' },
  3053: { pt: 'Sinal de Sterak', en: "Sterak's Gage" },
  "Sterak's Gage": { pt: 'Sinal de Sterak', en: "Sterak's Gage" },
  'Steraks': { pt: 'Sinal de Sterak', en: "Sterak's Gage" },
  3161: { pt: 'Lança de Shojin', en: 'Spear of Shojin' },
  'Spear of Shojin': { pt: 'Lança de Shojin', en: 'Spear of Shojin' },
  'Shojin': { pt: 'Lança de Shojin', en: 'Spear of Shojin' },
  6333: { pt: 'Dança da Morte', en: "Death's Dance" },
  "Death's Dance": { pt: 'Dança da Morte', en: "Death's Dance" },
  3156: { pt: 'Mandíbula de Malmortius', en: 'Maw of Malmortius' },
  'Maw of Malmortius': { pt: 'Mandíbula de Malmortius', en: 'Maw of Malmortius' },
  'Maw': { pt: 'Mandíbula de Malmortius', en: 'Maw of Malmortius' },
  3047: { pt: 'Botas Galvanizadas de Aço', en: 'Plated Steelcaps' },
  'Plated Steelcaps': { pt: 'Botas Galvanizadas de Aço', en: 'Plated Steelcaps' },
  'Steelcaps': { pt: 'Botas Galvanizadas de Aço', en: 'Plated Steelcaps' },
  3111: { pt: 'Passos de Mercúrio', en: "Mercury's Treads" },
  "Mercury's Treads": { pt: 'Passos de Mercúrio', en: "Mercury's Treads" },
  'Mercs': { pt: 'Passos de Mercúrio', en: "Mercury's Treads" },
  3123: { pt: 'Chamado do Carrasco', en: "Executioner's Calling" },
  3076: { pt: 'Colete Espinhoso', en: 'Bramble Vest' },
  3075: { pt: 'Armadura de Espinhos', en: 'Thornmail' },
  3026: { pt: 'Anjo Guardião', en: 'Guardian Angel' }
};

export const COMMON_RUNES_LOC: Record<string, LocalizedName> = {
  'pta': { pt: 'Pressione o Ataque', en: 'Press the Attack' },
  'press the attack': { pt: 'Pressione o Ataque', en: 'Press the Attack' },
  'conq': { pt: 'Conquistador', en: 'Conqueror' },
  'conqueror': { pt: 'Conquistador', en: 'Conqueror' },
  'grasp': { pt: 'Aperto dos Mortos-Vivos', en: 'Grasp of the Undying' },
  'grasp of the undying': { pt: 'Aperto dos Mortos-Vivos', en: 'Grasp of the Undying' },
  'fleet': { pt: 'Agilidade nos Pés', en: 'Fleet Footwork' },
  'fleet footwork': { pt: 'Agilidade nos Pés', en: 'Fleet Footwork' },
  'triumph': { pt: 'Triunfo', en: 'Triumph' },
  'legend: alacrity': { pt: 'Lenda: Espontaneidade', en: 'Legend: Alacrity' },
  'legend: haste': { pt: 'Lenda: Aceleração', en: 'Legend: Haste' },
  'last stand': { pt: 'Até a Morte', en: 'Last Stand' },
  'cut down': { pt: 'Dilacerar', en: 'Cut Down' },
  'bone plating': { pt: 'Osso Revestido', en: 'Bone Plating' },
  'second wind': { pt: 'Ventos Revigorantes', en: 'Second Wind' },
  'demolish': { pt: 'Demolir', en: 'Demolir' },
  'overgrowth': { pt: 'Crescimento Excessivo', en: 'Overgrowth' },
  'unflinching': { pt: 'Inabalável', en: 'Unflinching' },
  'sudden impact': { pt: 'Impacto Repentino', en: 'Sudden Impact' },
  'ultimate hunter': { pt: 'Caça Suprema', en: 'Ultimate Hunter' }
};

export const COMMON_SUMMONER_SPELLS_LOC: Record<string, LocalizedName> = {
  'flash': { pt: 'Flash', en: 'Flash' },
  'ignite': { pt: 'Incendiar', en: 'Ignite' },
  'teleport': { pt: 'Teleporte', en: 'Teleport' },
  'tp': { pt: 'Teleporte', en: 'Teleport' },
  'ghost': { pt: 'Fantasma', en: 'Ghost' },
  'barrier': { pt: 'Barreira', en: 'Barrier' },
  'exhaust': { pt: 'Exaustão', en: 'Exhaust' },
  'cleanse': { pt: 'Purificar', en: 'Cleanse' },
  'heal': { pt: 'Curar', en: 'Heal' },
  'smite': { pt: 'Golpear', en: 'Smite' }
};

export interface DataDragonOptions {
  version?: string;
  cdnHost?: string;
  isOffline?: boolean;
}

export class DataDragonService {
  public version: string;
  public cdnHost: string;
  public isOffline: boolean;
  private imageCache: Map<string, string>;

  constructor(options: DataDragonOptions = {}) {
    this.version = options.version || '16.16.1';
    this.cdnHost = options.cdnHost || 'https://ddragon.leagueoflegends.com';
    this.isOffline = !!options.isOffline;
    this.imageCache = new Map();
  }

  public setOffline(offline: boolean) {
    this.isOffline = offline;
  }

  public setVersion(version: string) {
    if (version && version.trim().length > 0) {
      this.version = version.trim();
    }
  }

  /**
   * Initializes Data Dragon by fetching the latest patch version from Riot CDN,
   * caching in localStorage for 24h, or falling back gracefully to the bundled version.
   */
  public async init(): Promise<string> {
    if (this.isOffline) {
      return this.version;
    }
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const cached = localStorage.getItem('ddragon_version');
        const cachedTime = localStorage.getItem('ddragon_version_time');
        const now = Date.now();
        if (cached && cachedTime && now - parseInt(cachedTime, 10) < 24 * 60 * 60 * 1000) {
          this.setVersion(cached);
          return this.version;
        }
      }

      const latest = await this.fetchLatestVersion();
      if (latest) {
        this.setVersion(latest);
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('ddragon_version', latest);
          localStorage.setItem('ddragon_version_time', Date.now().toString());
        }
      }
    } catch {
      // Graceful fallback to default version
    }
    return this.version;
  }

  /**
   * Fetches the latest patch version directly from Riot Data Dragon API.
   */
  public async fetchLatestVersion(): Promise<string | null> {
    try {
      const response = await fetch(`${this.cdnHost}/api/versions.json`);
      if (!response.ok) return null;
      const versions: string[] = await response.json();
      if (Array.isArray(versions) && versions.length > 0 && typeof versions[0] === 'string') {
        return versions[0];
      }
    } catch {
      // Network error or offline
    }
    return null;
  }

  /**
   * Resolves the canonical Riot Data Dragon identifier for a champion name.
   */
  public getChampionRiotKey(championName: string): string {
    if (!championName) return 'Renekton';
    const trimmed = championName.trim();
    if (CANONICAL_RIOT_KEYS[trimmed]) {
      return CANONICAL_RIOT_KEYS[trimmed];
    }
    // Remove special characters, apostrophes, spaces, dots
    return trimmed.replace(/[^a-zA-Z0-9]/g, '');
  }

  /**
   * Returns high-res square champion portrait icon URL.
   */
  public getChampionIconUrl(championName: string): string {
    if (this.isOffline) {
      return this.getOfflineSvgFallback(championName, '#D4A017');
    }
    const riotKey = this.getChampionRiotKey(championName);
    return `${this.cdnHost}/cdn/${this.version}/img/champion/${riotKey}.png`;
  }

  /**
   * Returns full champion splash art URL.
   */
  public getChampionSplashUrl(championName: string, skinIndex = 0): string {
    const riotKey = this.getChampionRiotKey(championName);
    return `${this.cdnHost}/cdn/img/champion/splash/${riotKey}_${skinIndex}.jpg`;
  }

  /**
   * Returns vertical loading screen splash slice URL.
   */
  public getChampionLoadingUrl(championName: string, skinIndex = 0): string {
    const riotKey = this.getChampionRiotKey(championName);
    return `${this.cdnHost}/cdn/img/champion/loading/${riotKey}_${skinIndex}.jpg`;
  }

  /**
   * Returns item icon URL by numeric or string ID.
   */
  public getItemIconUrl(itemId: number | string): string {
    if (this.isOffline) {
      return this.getOfflineSvgFallback(`Item ${itemId}`, '#F3B72C');
    }
    return `${this.cdnHost}/cdn/${this.version}/img/item/${itemId}.png`;
  }

  /**
   * Returns summoner spell icon URL.
   */
  public getSpellIconUrl(spellKeyOrName: string): string {
    if (this.isOffline) {
      return this.getOfflineSvgFallback(spellKeyOrName, '#38BDF8');
    }
    let spellKey = spellKeyOrName;
    if (COMMON_SUMMONER_SPELLS[spellKeyOrName]) {
      spellKey = COMMON_SUMMONER_SPELLS[spellKeyOrName];
    }
    if (!spellKey.startsWith('Summoner') && !spellKey.endsWith('.png')) {
      spellKey = `Summoner${spellKey}`;
    }
    return `${this.cdnHost}/cdn/${this.version}/img/spell/${spellKey}.png`;
  }

  /**
   * Returns rune perk icon URL.
   */
  public getRuneIconUrl(perkPathOrName: string): string {
    if (this.isOffline) {
      return this.getOfflineSvgFallback(perkPathOrName || 'Rune', '#10B981');
    }
    if (perkPathOrName.startsWith('http')) {
      return perkPathOrName;
    }
    if (perkPathOrName.startsWith('perk-images/') || perkPathOrName.startsWith('/perk-images/')) {
      const cleanPath = perkPathOrName.startsWith('/') ? perkPathOrName.substring(1) : perkPathOrName;
      return `${this.cdnHost}/cdn/img/${cleanPath}`;
    }
    // Known keystones shorthand resolution
    const normalized = perkPathOrName.toLowerCase();
    if (normalized.includes('pta') || normalized.includes('press the attack')) {
      return `${this.cdnHost}/cdn/img/perk-images/Styles/Precision/PressTheAttack/PressTheAttack.png`;
    }
    if (normalized.includes('conq') || normalized.includes('conqueror')) {
      return `${this.cdnHost}/cdn/img/perk-images/Styles/Precision/Conqueror/Conqueror.png`;
    }
    if (normalized.includes('grasp')) {
      return `${this.cdnHost}/cdn/img/perk-images/Styles/Resolve/GraspOfTheUndying/GraspOfTheUndying.png`;
    }
    if (normalized.includes('fleet')) {
      return `${this.cdnHost}/cdn/img/perk-images/Styles/Precision/FleetFootwork/FleetFootwork.png`;
    }
    return `${this.cdnHost}/cdn/img/perk-images/Styles/Precision/PressTheAttack/PressTheAttack.png`;
  }

  /**
   * Returns Renekton ability icon URL (Q, W, E, R, P).
   */
  public getRenektonSpellIconUrl(spell: 'Q' | 'W' | 'E' | 'R' | 'P'): string {
    if (this.isOffline) {
      return this.getOfflineSvgFallback(spell, spell === 'W' ? '#EF4444' : spell === 'E' ? '#38BDF8' : spell === 'R' ? '#A855F7' : '#D4A017');
    }
    const spellFiles: Record<string, string> = {
      'Q': 'RenektonCleave.png',
      'W': 'RenektonPreExecute.png',
      'E': 'RenektonSliceAndDice.png',
      'R': 'RenektonReignOfTheTyrant.png',
      'P': 'Renekton_Passive.png'
    };
    const file = spellFiles[spell] || 'RenektonCleave.png';
    if (spell === 'P') {
      return `${this.cdnHost}/cdn/${this.version}/img/passive/${file}`;
    }
    return `${this.cdnHost}/cdn/${this.version}/img/spell/${file}`;
  }

  /**
   * Returns Renekton ability canonical names.
   */
  public getRenektonSpellName(spell: 'Q' | 'W' | 'E' | 'R' | 'P', lang: 'pt-br' | 'en' = 'pt-br'): { namePt: string; nameEn: string } | string {
    const names = (() => {
      switch (spell) {
        case 'Q':
          return { namePt: 'Abater os Indefesos', nameEn: 'Cull the Meek' };
        case 'W':
          return { namePt: 'Predador Impiedoso', nameEn: 'Ruthless Predator' };
        case 'E':
          return { namePt: 'Fatiar e Cortar', nameEn: 'Slice and Dice' };
        case 'R':
          return { namePt: 'Dominus', nameEn: 'Dominus' };
        case 'P':
          return { namePt: 'Reinado da Fúria', nameEn: 'Reign of Anger' };
        default:
          return { namePt: 'Habilidade', nameEn: 'Ability' };
      }
    })();
    return lang === 'pt-br' ? names.namePt : names.nameEn;
  }

  /**
   * Returns localized item name in PT-BR or EN.
   */
  public getItemName(itemIdOrName: number | string, lang: 'pt-br' | 'en' = 'pt-br'): string {
    const key = typeof itemIdOrName === 'string' ? itemIdOrName.trim() : itemIdOrName;
    if (COMMON_ITEMS_LOC[key]) {
      return lang === 'pt-br' ? COMMON_ITEMS_LOC[key].pt : COMMON_ITEMS_LOC[key].en;
    }
    const lower = String(key).toLowerCase();
    for (const [k, val] of Object.entries(COMMON_ITEMS_LOC)) {
      if (String(k).toLowerCase() === lower) {
        return lang === 'pt-br' ? val.pt : val.en;
      }
    }
    return String(itemIdOrName);
  }

  /**
   * Returns localized rune name in PT-BR or EN.
   */
  public getRuneName(runePathOrName: string, lang: 'pt-br' | 'en' = 'pt-br'): string {
    if (!runePathOrName) return 'Rune';
    const lower = runePathOrName.toLowerCase();
    for (const [k, val] of Object.entries(COMMON_RUNES_LOC)) {
      if (lower.includes(k)) {
        return lang === 'pt-br' ? val.pt : val.en;
      }
    }
    return runePathOrName;
  }

  /**
   * Returns localized summoner spell name in PT-BR or EN.
   */
  public getSpellName(spellKeyOrName: string, lang: 'pt-br' | 'en' = 'pt-br'): string {
    if (!spellKeyOrName) return 'Spell';
    const lower = spellKeyOrName.toLowerCase().replace('summoner', '');
    for (const [k, val] of Object.entries(COMMON_SUMMONER_SPELLS_LOC)) {
      if (lower.includes(k)) {
        return lang === 'pt-br' ? val.pt : val.en;
      }
    }
    return spellKeyOrName;
  }

  /**
   * Generates a safe, sanitized inline SVG data URI for zero-network/offline rendering.
   */
  public getOfflineSvgFallback(label = 'LoL', accentColor = '#D4A017'): string {
    // Sanitize label strictly to prevent SVG injection or script tags
    const safeLabel = label
      .replace(/[<>&"']/g, '')
      .trim()
      .substring(0, 10);

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="8" fill="#151821" stroke="${accentColor}" stroke-width="2"/><text x="32" y="36" fill="#F8FAFC" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">${safeLabel || 'LoL'}</text></svg>`;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }
}

// Singleton default instance
export const dataDragon = new DataDragonService();
export default dataDragon;
