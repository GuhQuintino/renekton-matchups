/**
 * Champion entity definitions for Renekton Matchup Tool.
 */

export interface Champion {
  id: number;
  name: string;             // Canonical display name (e.g. "Dr. Mundo", "Kai'Sa", "Wukong")
  sheetName: string;        // Name in Godrekton spreadsheet (e.g. "DR.Mundo", "Kaisa")
  riotKey: string;          // Riot Data Dragon key (e.g. "DrMundo", "MonkeyKing", "Kaisa")
  riotId: number;           // Official numeric Riot ID (e.g. 36, 62, 145)
  titlePt: string;          // PT-BR Title (e.g. "o Louco de Zaun")
  titleEn: string;          // EN Title (e.g. "the Madman of Zaun")
  roles: string[];          // Primary and secondary roles (e.g. ["Top", "Tank"])
  iconUrl: string;          // Data Dragon or local icon path
}

export interface ChampionFilter {
  query?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard' | 'Very Hard' | 'All';
  role?: string;
  sortBy?: 'name' | 'difficulty_asc' | 'difficulty_desc';
}
