const fs = require('fs');
const path = require('path');

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

const docsDir = path.join(__dirname, '..', 'Docs', 'Guia de Renekton');
const files = fs.readdirSync(docsDir);

console.log('--- CSV Parsing Verification ---');
files.forEach(file => {
  const fullPath = path.join(docsDir, file);
  const content = fs.readFileSync(fullPath, 'utf8');
  const records = parseCSV(content);
  console.log(`File: ${file} -> Records: ${records.length}`);
  if (file.includes('Match Up Sheet')) {
    const headerIdx = records.findIndex(r => r[0] === 'Champion');
    console.log(`  Header row at index ${headerIdx}:`, records[headerIdx]);
    const champs = records.slice(headerIdx + 1);
    console.log(`  Total champion records: ${champs.length}`);
    console.log(`  First champion: ${champs[0][0]} (${champs[0][1]})`);
    console.log(`  Last champion: ${champs[champs.length - 1][0]} (${champs[champs.length - 1][1]})`);
  }
});
