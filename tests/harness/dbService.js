const path = require('path');
const { parseMatchUpSheet, parseAllGeneralGuides } = require('./csvParser');

/**
 * In-Memory SQLite-compatible Relational Database Engine for Champion Matchup
 */
class InMemoryDbService {
  constructor() {
    this.reset();
  }

  reset() {
    this.champions = new Map(); // id -> championRecord
    this.matchups = new Map(); // id -> matchupRecord
    this.matchupTips = new Map(); // id -> tipRecord
    this.guideSections = new Map(); // id -> sectionRecord
    this.userNotes = new Map(); // id -> noteRecord
    this.appSettings = new Map(); // key -> value
    
    this.autoIncrement = {
      champions: 1,
      matchups: 1,
      matchupTips: 1,
      guideSections: 1,
      userNotes: 1
    };
  }

  /**
   * Normalizes champion name to Riot Data Dragon ID / Key
   */
  static normalizeRiotKey(championName) {
    const raw = championName.trim();
    const map = {
      'Wukong': 'MonkeyKing',
      'Dr. Mundo': 'DrMundo',
      'DR.Mundo': 'DrMundo',
      'Cho\'Gath': 'Chogath',
      'Kai\'Sa': 'Kaisa',
      'Kaisa': 'Kaisa',
      'K\'Sante': 'KSante',
      'K\'sante': 'KSante',
      'Kha\'Zix': 'Khazix',
      'Kha\'zix': 'Khazix',
      'LeBlanc': 'Leblanc',
      'Nunu & Willump': 'Nunu',
      'Nunu': 'Nunu',
      'Renata Glasc': 'Renata',
      'Renata': 'Renata',
      'Rek\'Sai': 'RekSai',
      'Vel\'Koz': 'Velkoz',
      'Lillah': 'Lillia',
      'Millio': 'Milio',
      'Nillah': 'Nilah',
      'Jarvan IV': 'JarvanIV',
      'Lee Sin': 'LeeSin',
      'Master Yi': 'MasterYi',
      'Miss Fortune': 'MissFortune',
      'Tahm Kench': 'TahmKench',
      'Twisted Fate': 'TwistedFate',
      'Xin Zhao': 'XinZhao',
      'Aurelion Sol': 'AurelionSol'
    };

    if (map[raw]) {
      return map[raw];
    }
    return raw.replace(/[^a-zA-Z0-9]/g, '');
  }

  /**
   * Normalizes canonical display name
   */
  static normalizeDisplayName(rawName) {
    const raw = rawName.trim();
    const map = {
      'DR.Mundo': 'Dr. Mundo',
      'K\'sante': 'K\'Sante',
      'Kaisa': 'Kai\'Sa',
      'Kha\'zix': 'Kha\'Zix',
      'Lillah': 'Lillia',
      'Millio': 'Milio',
      'Nillah': 'Nilah',
      'Renata': 'Renata Glasc',
      'Nunu': 'Nunu & Willump'
    };
    return map[raw] || raw;
  }

  /**
   * Seeds database from the 9 CSV files
   */
  seedFromCsvDirectory(docsDir) {
    this.reset();
    const matchupFile = path.join(docsDir, 'The Ultimate Renekton Guide Spreadsheet - Match Up Sheet.csv');
    const parsed = parseMatchUpSheet(matchupFile);

    for (const m of parsed.matchups) {
      const canonicalName = InMemoryDbService.normalizeDisplayName(m.champion);
      const riotKey = InMemoryDbService.normalizeRiotKey(m.champion);
      
      const champId = this.autoIncrement.champions++;
      const championRecord = {
        id: champId,
        name: canonicalName,
        sheet_name: m.champion,
        riot_key: riotKey,
        riot_id: champId + 100,
        icon_url: `https://ddragon.leagueoflegends.com/cdn/16.16.1/img/champion/${riotKey}.png`,
        created_at: new Date().toISOString()
      };
      this.champions.set(champId, championRecord);

      const matchupId = this.autoIncrement.matchups++;
      const matchupRecord = {
        id: matchupId,
        champion_id: champId,
        difficulty_tier: m.difficultyTier,
        difficulty_rating: m.difficultyRating,
        difficulty_raw: m.difficultyRaw,
        runes_recommendation: m.runes,
        starting_items: m.startingItems,
        summoner_spells: m.summoners,
        ability_max_order: m.abilityMaxOrder,
        summary_en: m.summary,
        summary_pt: m.summary || `Guia estratégico contra ${canonicalName}.`,
        detailed_notes_raw_en: m.detailedNotes,
        detailed_notes_raw_pt: m.detailedNotes,
        video_url: m.videoUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this.matchups.set(matchupId, matchupRecord);

      for (const tip of m.tips) {
        const tipId = this.autoIncrement.matchupTips++;
        this.matchupTips.set(tipId, {
          id: tipId,
          matchup_id: matchupId,
          tip_number: tip.tipNumber,
          title_en: tip.title,
          title_pt: tip.title,
          content_en: tip.content,
          content_pt: tip.content,
          display_order: tip.tipNumber
        });
      }
    }

    // Seed general guides
    const guides = parseAllGeneralGuides(docsDir);
    for (const [category, guideData] of Object.entries(guides)) {
      const secId = this.autoIncrement.guideSections++;
      this.guideSections.set(secId, {
        id: secId,
        category,
        section_key: `${category}_main`,
        title_en: guideData.filename,
        title_pt: guideData.filename,
        content_en: guideData.rawText,
        content_pt: guideData.rawText,
        display_order: secId
      });
    }

    return {
      championsCount: this.champions.size,
      matchupsCount: this.matchups.size,
      tipsCount: this.matchupTips.size,
      guidesCount: this.guideSections.size
    };
  }

  // --- Queries ---

  getChampionByName(nameOrKey) {
    if (!nameOrKey) return null;
    const query = nameOrKey.toLowerCase().trim();
    for (const champ of this.champions.values()) {
      if (champ.name.toLowerCase() === query ||
          champ.sheet_name.toLowerCase() === query ||
          champ.riot_key.toLowerCase() === query) {
        return champ;
      }
    }
    return null;
  }

  getMatchupByChampion(nameOrKey) {
    const champ = this.getChampionByName(nameOrKey);
    if (!champ) return null;

    let matchup = null;
    for (const m of this.matchups.values()) {
      if (m.champion_id === champ.id) {
        matchup = m;
        break;
      }
    }
    if (!matchup) return null;

    const tips = [];
    for (const tip of this.matchupTips.values()) {
      if (tip.matchup_id === matchup.id) {
        tips.push(tip);
      }
    }
    tips.sort((a, b) => a.display_order - b.display_order);

    return {
      champion: champ,
      matchup,
      tips
    };
  }

  getAllMatchupsSummary() {
    const list = [];
    for (const champ of this.champions.values()) {
      let matchup = null;
      for (const m of this.matchups.values()) {
        if (m.champion_id === champ.id) {
          matchup = m;
          break;
        }
      }
      if (matchup) {
        list.push({
          championId: champ.id,
          championName: champ.name,
          riotKey: champ.riot_key,
          difficultyTier: matchup.difficulty_tier,
          difficultyRating: matchup.difficulty_rating,
          difficultyRaw: matchup.difficulty_raw,
          iconUrl: champ.icon_url
        });
      }
    }
    return list;
  }

  getGeneralGuide(category) {
    for (const sec of this.guideSections.values()) {
      if (sec.category.toLowerCase() === category.toLowerCase()) {
        return sec;
      }
    }
    return null;
  }

  // --- User Notes CRUD ---

  createNote(payload) {
    if (!payload.champion_id) {
      throw new Error('champion_id is required');
    }
    if (!this.champions.has(payload.champion_id)) {
      throw new Error(`Champion with id ${payload.champion_id} not found`);
    }

    const result = (payload.match_result || '').toUpperCase();
    if (!['WIN', 'LOSS', 'REMAKE'].includes(result)) {
      throw new Error(`Invalid match_result: "${payload.match_result}". Must be WIN, LOSS, or REMAKE.`);
    }

    const difficulty = parseInt(payload.perceived_difficulty, 10);
    if (isNaN(difficulty) || difficulty < 1 || difficulty > 5) {
      throw new Error(`Invalid perceived_difficulty: "${payload.perceived_difficulty}". Must be an integer between 1 and 5.`);
    }

    const id = this.autoIncrement.userNotes++;
    const now = payload.created_at || new Date().toISOString();
    const noteRecord = {
      id,
      champion_id: payload.champion_id,
      game_id: payload.game_id || null,
      match_result: result,
      perceived_difficulty: difficulty,
      what_worked: payload.what_worked || '',
      what_failed: payload.what_failed || '',
      free_notes: payload.free_notes || '',
      runes_used: payload.runes_used || null,
      items_built: payload.items_built || null,
      summoners_used: payload.summoners_used || null,
      kda: payload.kda || null,
      created_at: now,
      updated_at: now
    };

    this.userNotes.set(id, noteRecord);
    return noteRecord;
  }

  getNotesByChampion(championId) {
    const notes = [];
    for (const note of this.userNotes.values()) {
      if (note.champion_id === championId) {
        notes.push(note);
      }
    }
    // Sort descending by created_at
    notes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return notes;
  }

  updateNote(noteId, updates) {
    const note = this.userNotes.get(noteId);
    if (!note) {
      throw new Error(`Note with id ${noteId} not found`);
    }
    if (updates.match_result) {
      const res = updates.match_result.toUpperCase();
      if (!['WIN', 'LOSS', 'REMAKE'].includes(res)) {
        throw new Error(`Invalid match_result: "${updates.match_result}"`);
      }
      note.match_result = res;
    }
    if (updates.perceived_difficulty !== undefined) {
      const diff = parseInt(updates.perceived_difficulty, 10);
      if (isNaN(diff) || diff < 1 || diff > 5) {
        throw new Error(`Invalid perceived_difficulty: "${updates.perceived_difficulty}"`);
      }
      note.perceived_difficulty = diff;
    }
    if (updates.what_worked !== undefined) note.what_worked = updates.what_worked;
    if (updates.what_failed !== undefined) note.what_failed = updates.what_failed;
    if (updates.free_notes !== undefined) note.free_notes = updates.free_notes;
    note.updated_at = new Date().toISOString();

    return note;
  }

  deleteNote(noteId) {
    if (!this.userNotes.has(noteId)) {
      throw new Error(`Note with id ${noteId} not found`);
    }
    this.userNotes.delete(noteId);
    return true;
  }

  // --- Foreign Key Cascade Emulation ---
  deleteChampion(championId) {
    if (!this.champions.has(championId)) {
      return false;
    }
    // Cascade delete matchups
    for (const [mId, m] of this.matchups.entries()) {
      if (m.champion_id === championId) {
        // Cascade delete tips
        for (const [tId, t] of this.matchupTips.entries()) {
          if (t.matchup_id === mId) {
            this.matchupTips.delete(tId);
          }
        }
        this.matchups.delete(mId);
      }
    }
    // Cascade delete user notes
    for (const [nId, n] of this.userNotes.entries()) {
      if (n.champion_id === championId) {
        this.userNotes.delete(nId);
      }
    }
    this.champions.delete(championId);
    return true;
  }
}

module.exports = {
  InMemoryDbService
};
