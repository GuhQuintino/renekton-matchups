/**
 * Personal Match Notes and History Analytics Service
 */

class NotesService {
  constructor(dbService) {
    this.db = dbService;
  }

  addNote(payload) {
    return this.db.createNote(payload);
  }

  getNotesForChampion(championId) {
    return this.db.getNotesByChampion(championId);
  }

  getNotesSummary(championId) {
    const notes = this.db.getNotesByChampion(championId);
    if (!notes || notes.length === 0) {
      return {
        totalMatches: 0,
        wins: 0,
        losses: 0,
        remakes: 0,
        winratePercent: 0,
        avgDifficulty: 0,
        recentNotes: []
      };
    }

    let wins = 0;
    let losses = 0;
    let remakes = 0;
    let sumDifficulty = 0;

    for (const n of notes) {
      if (n.match_result === 'WIN') wins++;
      else if (n.match_result === 'LOSS') losses++;
      else if (n.match_result === 'REMAKE') remakes++;
      sumDifficulty += n.perceived_difficulty;
    }

    const decisiveGames = wins + losses;
    const winratePercent = decisiveGames > 0 ? Math.round((wins / decisiveGames) * 1000) / 10 : 0;
    const avgDifficulty = Math.round((sumDifficulty / notes.length) * 10) / 10;

    return {
      totalMatches: notes.length,
      wins,
      losses,
      remakes,
      winratePercent,
      avgDifficulty,
      recentNotes: notes
    };
  }

  updateNote(noteId, updates) {
    return this.db.updateNote(noteId, updates);
  }

  deleteNote(noteId) {
    return this.db.deleteNote(noteId);
  }
}

module.exports = {
  NotesService
};
