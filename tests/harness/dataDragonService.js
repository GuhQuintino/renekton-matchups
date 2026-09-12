/**
 * Riot Data Dragon CDN Resolver & Offline Fallback Generator
 */

const CANONICAL_RIOT_KEYS = {
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

const COMMON_ITEMS_LOC = {
  1055: { pt: 'Lâmina de Doran', en: "Doran's Blade" },
  1054: { pt: 'Escudo de Doran', en: "Doran's Shield" },
  1036: { pt: 'Espada Longa', en: 'Long Sword' },
  3077: { pt: 'Tiamat', en: 'Tiamat' },
  6698: { pt: 'Hidra Profana', en: 'Profane Hydra' },
  6631: { pt: 'Quebrapassos', en: 'Stridebreaker' },
  6692: { pt: 'Eclipse', en: 'Eclipse' },
  3071: { pt: 'Cutelo Negro', en: 'Black Cleaver' },
  3053: { pt: 'Sinal de Sterak', en: "Sterak's Gage" }
};

const COMMON_RUNES_LOC = {
  'pta': { pt: 'Pressione o Ataque', en: 'Press the Attack' },
  'conq': { pt: 'Conquistador', en: 'Conqueror' },
  'grasp': { pt: 'Aperto dos Mortos-Vivos', en: 'Grasp of the Undying' },
  'fleet': { pt: 'Agilidade nos Pés', en: 'Fleet Footwork' }
};

const COMMON_SUMMONER_SPELLS_LOC = {
  'flash': { pt: 'Flash', en: 'Flash' },
  'ignite': { pt: 'Incendiar', en: 'Ignite' },
  'teleport': { pt: 'Teleporte', en: 'Teleport' },
  'ghost': { pt: 'Fantasma', en: 'Ghost' }
};

class DataDragonService {
  constructor(options = {}) {
    this.version = options.version || '16.16.1';
    this.cdnHost = options.cdnHost || 'https://ddragon.leagueoflegends.com';
    this.isOffline = !!options.isOffline;
  }

  getChampionRiotKey(championName) {
    if (!championName) return 'Renekton';
    const trimmed = championName.trim();
    if (CANONICAL_RIOT_KEYS[trimmed]) {
      return CANONICAL_RIOT_KEYS[trimmed];
    }
    return trimmed.replace(/[^a-zA-Z0-9]/g, '');
  }

  getChampionIconUrl(championName) {
    if (this.isOffline) {
      return this.getOfflineSvgFallback(championName);
    }
    const riotKey = this.getChampionRiotKey(championName);
    return `${this.cdnHost}/cdn/${this.version}/img/champion/${riotKey}.png`;
  }

  getItemIconUrl(itemId) {
    if (this.isOffline) {
      return this.getOfflineSvgFallback(`Item ${itemId}`);
    }
    return `${this.cdnHost}/cdn/${this.version}/img/item/${itemId}.png`;
  }

  getSpellIconUrl(spellKey) {
    if (this.isOffline) {
      return this.getOfflineSvgFallback(`Spell ${spellKey}`);
    }
    return `${this.cdnHost}/cdn/${this.version}/img/spell/${spellKey}.png`;
  }

  getRuneIconUrl(perkPath) {
    if (this.isOffline) {
      return this.getOfflineSvgFallback(`Rune`);
    }
    return `${this.cdnHost}/cdn/img/${perkPath}`;
  }

  getRenektonSpellIconUrl(spell) {
    if (this.isOffline) {
      return this.getOfflineSvgFallback(spell);
    }
    const spellFiles = {
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

  getRenektonSpellName(spell, lang = 'pt-br') {
    const names = {
      'Q': { pt: 'Abater os Indefesos', en: 'Cull the Meek' },
      'W': { pt: 'Predador Impiedoso', en: 'Ruthless Predator' },
      'E': { pt: 'Fatiar e Cortar', en: 'Slice and Dice' },
      'R': { pt: 'Dominus', en: 'Dominus' },
      'P': { pt: 'Reinado da Fúria', en: 'Reign of Anger' }
    }[spell] || { pt: 'Habilidade', en: 'Ability' };
    return lang === 'pt-br' ? names.pt : names.en;
  }

  getItemName(itemIdOrName, lang = 'pt-br') {
    const key = itemIdOrName;
    if (COMMON_ITEMS_LOC[key]) {
      return lang === 'pt-br' ? COMMON_ITEMS_LOC[key].pt : COMMON_ITEMS_LOC[key].en;
    }
    return String(itemIdOrName);
  }

  getRuneName(runePathOrName, lang = 'pt-br') {
    if (!runePathOrName) return 'Rune';
    const lower = runePathOrName.toLowerCase();
    for (const [k, val] of Object.entries(COMMON_RUNES_LOC)) {
      if (lower.includes(k)) {
        return lang === 'pt-br' ? val.pt : val.en;
      }
    }
    return runePathOrName;
  }

  getSpellName(spellKeyOrName, lang = 'pt-br') {
    if (!spellKeyOrName) return 'Spell';
    const lower = spellKeyOrName.toLowerCase().replace('summoner', '');
    for (const [k, val] of Object.entries(COMMON_SUMMONER_SPELLS_LOC)) {
      if (lower.includes(k)) {
        return lang === 'pt-br' ? val.pt : val.en;
      }
    }
    return spellKeyOrName;
  }

  getOfflineSvgFallback(label = 'LoL') {
    const safeLabel = label.replace(/[<>&"]/g, '');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="8" fill="#151821" stroke="#D4A017" stroke-width="2"/><text x="32" y="36" fill="#F8FAFC" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">${safeLabel.substring(0, 8)}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }
}

module.exports = {
  DataDragonService,
  CANONICAL_RIOT_KEYS,
  COMMON_ITEMS_LOC,
  COMMON_RUNES_LOC,
  COMMON_SUMMONER_SPELLS_LOC
};
