const fs = require('fs');
const path = require('path');

/**
 * RFC 4180 compliant CSV Parser
 */
function parseCSV(text) {
  const records = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(field.trim());
      field = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(field.trim());
      if (row.some(f => f.length > 0)) {
        records.push(row);
      }
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field.trim());
    if (row.some(f => f.length > 0)) {
      records.push(row);
    }
  }
  return records;
}

/**
 * Extracts numbered tips from Detailed Notes text e.g. "(1) Title - Description"
 */
function extractNumberedTips(detailedNotesText) {
  if (!detailedNotesText || typeof detailedNotesText !== 'string') {
    return [];
  }
  const regex = /\((\d+)\)\s*([^\n\r-]+?)(?:\s*-\s*|\s*:\s*|\n)([\s\S]*?)(?=\(\d+\)|$)/g;
  const tips = [];
  let match;
  while ((match = regex.exec(detailedNotesText)) !== null) {
    const tipNumber = parseInt(match[1], 10);
    const title = match[2].trim();
    const content = match[3].trim();
    tips.push({
      tipNumber,
      title,
      content
    });
  }
  return tips;
}

/**
 * Parses Match Up Sheet CSV into structured champion matchup records
 */
function parseMatchUpSheet(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const records = parseCSV(content);
  
  const headerIdx = records.findIndex(r => r[0] && r[0].toLowerCase() === 'champion');
  if (headerIdx === -1) {
    throw new Error('Could not find header row with "Champion" in Match Up Sheet');
  }
  
  const headers = records[headerIdx];
  const championRows = records.slice(headerIdx + 1);
  
  const matchups = championRows.map((row, idx) => {
    const champion = row[0] || '';
    const difficultyRaw = row[1] || '';
    const runes = row[2] || '';
    const startingItems = row[3] || '';
    const summoners = row[4] || '';
    const abilityMaxOrder = row[5] || '';
    const summary = row[6] || '';
    const detailedNotes = row[7] || '';
    const videoUrl = row[8] || '';
    
    // Parse difficulty level (e.g., "Medium - 5/10" -> tier "Medium", rating 5)
    let difficultyTier = 'Medium';
    let difficultyRating = 5;
    const diffMatch = difficultyRaw.match(/([a-zA-Z\s]+)\s*-\s*(\d+)\s*\/\s*10/);
    if (diffMatch) {
      difficultyTier = diffMatch[1].trim();
      difficultyRating = parseInt(diffMatch[2], 10);
    } else if (difficultyRaw.toLowerCase().includes('easy')) {
      difficultyTier = 'Easy';
      difficultyRating = 2;
    } else if (difficultyRaw.toLowerCase().includes('hard')) {
      difficultyTier = 'Hard';
      difficultyRating = 8;
    }
    
    const tips = extractNumberedTips(detailedNotes);
    
    return {
      index: idx + 1,
      champion,
      difficultyRaw,
      difficultyTier,
      difficultyRating,
      runes,
      startingItems,
      summoners,
      abilityMaxOrder,
      summary,
      detailedNotes,
      tips,
      videoUrl
    };
  }).filter(m => m.champion.length > 0);
  
  return {
    headers,
    matchups,
    totalChampions: matchups.length
  };
}

/**
 * Parses all 8 general guide CSV files in Docs/Guia de Renekton
 */
function parseAllGeneralGuides(baseDir) {
  const guideFiles = {
    abilityStarts: 'The Ultimate Renekton Guide Spreadsheet - Ability Starts + Maxing.csv',
    faq: 'The Ultimate Renekton Guide Spreadsheet - FAQ.csv',
    furyManagement: 'The Ultimate Renekton Guide Spreadsheet - Fury Management.csv',
    introduction: 'The Ultimate Renekton Guide Spreadsheet - Introduction.csv',
    itemsBuilds: 'The Ultimate Renekton Guide Spreadsheet - Items + Builds.csv',
    mechanicsCombos: 'The Ultimate Renekton Guide Spreadsheet - Mechanics + Combos.csv',
    runes: 'The Ultimate Renekton Guide Spreadsheet - Runes.csv',
    summoners: 'The Ultimate Renekton Guide Spreadsheet - Summoners.csv'
  };
  
  const guides = {};
  for (const [key, filename] of Object.entries(guideFiles)) {
    const fullPath = path.join(baseDir, filename);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const records = parseCSV(content);
      guides[key] = {
        key,
        filename,
        records,
        rawText: content
      };
    }
  }
  return guides;
}

module.exports = {
  parseCSV,
  extractNumberedTips,
  parseMatchUpSheet,
  parseAllGeneralGuides
};
