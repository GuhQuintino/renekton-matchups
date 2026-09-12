/**
 * Translation and Glossary Integrity Engine
 * Validates and transforms LoL text preserving English game terms
 */

const PRESERVED_TERMS = {
  champions: [
    'Aatrox', 'Ahri', 'Akali', 'Akshan', 'Alistar', 'Amumu', 'Anivia', 'Annie', 'Aphelios', 'Ashe',
    'Aurelion Sol', 'Aurora', 'Azir', 'Bard', 'Bel\'Veth', 'Blitzcrank', 'Brand', 'Braum', 'Briar',
    'Caitlyn', 'Camille', 'Cassiopeia', 'Cho\'Gath', 'Corki', 'Darius', 'Diana', 'Dr. Mundo', 'Draven',
    'Ekko', 'Elise', 'Evelynn', 'Ezreal', 'Fiddlesticks', 'Fiora', 'Fizz', 'Galio', 'Gangplank',
    'Garen', 'Gnar', 'Gragas', 'Graves', 'Gwen', 'Hecarim', 'Heimerdinger', 'Hwei', 'Illaoi', 'Irelia',
    'Ivern', 'Janna', 'Jarvan IV', 'Jax', 'Jayce', 'Jhin', 'Jinx', 'K\'Sante', 'Kai\'Sa', 'Kalista',
    'Karma', 'Karthus', 'Kassadin', 'Katarina', 'Kayle', 'Kayn', 'Kennen', 'Kha\'Zix', 'Kindred',
    'Kled', 'Kog\'Maw', 'LeBlanc', 'Lee Sin', 'Leona', 'Lillia', 'Lissandra', 'Lucian', 'Lulu',
    'Lux', 'Malphite', 'Malzahar', 'Maokai', 'Master Yi', 'Milio', 'Miss Fortune', 'Mordekaiser',
    'Morgana', 'Naafiri', 'Nami', 'Nasus', 'Nautilus', 'Neeko', 'Nidalee', 'Nilah', 'Nocturne',
    'Nunu & Willump', 'Olaf', 'Orianna', 'Ornn', 'Pantheon', 'Poppy', 'Pyke', 'Qiyana', 'Quinn',
    'Rakan', 'Rammus', 'Rek\'Sai', 'Rell', 'Renata Glasc', 'Renekton', 'Rengar', 'Riven', 'Rumble',
    'Ryze', 'Samira', 'Sejuani', 'Senna', 'Seraphine', 'Sett', 'Shaco', 'Shen', 'Shyvana', 'Singed',
    'Sion', 'Sivir', 'Skarner', 'Smolder', 'Sona', 'Soraka', 'Swain', 'Sylas', 'Syndra', 'Tahm Kench',
    'Taliyah', 'Talon', 'Taric', 'Teemo', 'Thresh', 'Tristana', 'Trundle', 'Tryndamere', 'Twisted Fate',
    'Twitch', 'Udyr', 'Urgot', 'Varus', 'Vayne', 'Veigar', 'Vel\'Koz', 'Vex', 'Vi', 'Viego',
    'Viktor', 'Vladimir', 'Volibear', 'Warwick', 'Wukong', 'Xayah', 'Xerath', 'Xin Zhao', 'Yasuo',
    'Yone', 'Yorick', 'Yuumi', 'Zac', 'Zed', 'Zeri', 'Ziggs', 'Zilean', 'Zoe', 'Zyra'
  ],
  renektonAbilities: [
    'Reign of Anger', 'Cull the Meek', 'Ruthless Predator', 'Slice and Dice', 'Dominus',
    'Q', 'W', 'E', 'R', 'Empowered Q', 'Empowered W', 'Empowered E', 'Slice', 'Dice'
  ],
  runes: [
    'PTA', 'Press the Attack', 'Conqueror', 'Conq', 'Fleet Footwork', 'Grasp of the Undying', 'Grasp',
    'Aftershock', 'Electrocute', 'Dark Harvest', 'Phase Rush', 'Resolve', 'Inspiration', 'Precision',
    'Domination', 'Sorcery', 'Demolish', 'Shield Bash', 'Second Wind', 'Bone Plating', 'Overgrowth',
    'Revitalize', 'Unflinching', 'Magical Footwear', 'Biscuit Delivery', 'Cosmic Insight', 'Triumph',
    'Legend: Alacrity', 'Legend: Bloodline', 'Legend: Haste', 'Coup de Grace', 'Cut Down', 'Last Stand'
  ],
  summoners: [
    'Flash', 'Ignite', 'Teleport', 'TP', 'Ghost', 'Exhaust', 'Cleanse', 'Barrier', 'Heal', 'Smite'
  ],
  items: [
    'Doran\'s Blade', 'D Blade', 'Doran\'s Shield', 'D Shield', 'Refillable Potion', 'Plated Steelcaps',
    'Steelcaps', 'Tabi', 'Mercury\'s Treads', 'Mercs', 'Merc Treads', 'Ionian Boots', 'Eclipse',
    'Black Cleaver', 'Cleaver', 'Blade of the Ruined King', 'BoTRK', 'Death\'s Dance', 'Sterak\'s Gage',
    'Sterak\'s', 'Spear of Shojin', 'Shojin', 'Sundered Sky', 'Ravenous Hydra', 'Titanic Hydra',
    'Profane Hydra', 'Stridebreaker', 'Bramble Vest', 'Thornmail', 'Maw of Malmortius', 'Hexdrinker',
    'Randuin\'s Omen', 'Executioner\'s Calling', 'Chempunk Chainsword', 'Serylda\'s Grudge', 'Guardian Angel'
  ],
  slang: [
    'Wave', 'Waveclear', 'Freeze', 'Freezing', 'Slow Push', 'Fast Push', 'Crash', 'Proxy',
    'Trade', 'Short Trade', 'Extended Trade', 'All-in', 'Poke', 'Burst', 'Sustain', 'True Damage',
    'Auto Attack', 'AA', 'Animation Cancel', 'Cooldown', 'CD', 'CC', 'Stun', 'Root', 'Silence',
    'Knockup', 'Slow', 'Tenacity', 'Laning Phase', 'Powerspike', 'Level Spike', 'Side Lane',
    'Roam', 'Gank', 'Dive', 'Tower Dive', 'Teamfight', 'TF', 'Skirmish', 'Engage', 'Disengage',
    'Snowball', 'Stat Check', 'Outscale', 'Win Condition', 'Practice Tool'
  ]
};

/**
 * Checks if forbidden Brazilian Portuguese translations are mistakenly used for sacred LoL terms.
 */
function checkForbiddenTranslations(text) {
  const forbidden = [
    { bad: 'Pressione o Ataque', correct: 'PTA / Press the Attack' },
    { bad: 'Conquistador', correct: 'Conqueror' },
    { bad: 'Aperto dos Mortos-Vivos', correct: 'Grasp of the Undying' },
    { bad: 'Eletrocutar', correct: 'Electrocute' },
    { bad: 'Espada do Rei Destruído', correct: 'Blade of the Ruined King / BoTRK' },
    { bad: 'Cutelo Negro', correct: 'Black Cleaver' },
    { bad: 'Dança da Morte', correct: 'Death\'s Dance' },
    { bad: 'Quebrapassos', correct: 'Stridebreaker' },
    { bad: 'Lâmina de Doran', correct: 'Doran\'s Blade' },
    { bad: 'Escudo de Doran', correct: 'Doran\'s Shield' },
    { bad: 'Botas Galvanizadas de Aço', correct: 'Plated Steelcaps' },
    { bad: 'Passos de Mercúrio', correct: 'Mercury\'s Treads / Merc Treads' },
    { bad: 'Golpear', correct: 'Smite' },
    { bad: 'Incendiar', correct: 'Ignite' },
    { bad: 'Teleporte', correct: 'Teleport' },
    { bad: 'Fantasma', correct: 'Ghost' },
    { bad: 'Abater os Fracos', correct: 'Q / Cull the Meek' },
    { bad: 'Predador Desalmado', correct: 'W / Ruthless Predator' },
    { bad: 'Fatiar e Cortar', correct: 'E / Slice and Dice' },
    { bad: 'Dominus', correct: 'R / Dominus' } // Dominus is allowed, but not translated name
  ];

  const violations = [];
  for (const item of forbidden) {
    if (item.bad !== 'Dominus' && text.includes(item.bad)) {
      violations.push(`Found forbidden translated term "${item.bad}". Should be preserved as "${item.correct}".`);
    }
  }
  return violations;
}

/**
 * Validates that translated text preserves English LoL glossary and grammar
 */
function validateTranslation(textPtBr, originalEn) {
  if (!textPtBr || typeof textPtBr !== 'string') {
    return { valid: false, errors: ['Translated text is empty or not a string'] };
  }
  const violations = checkForbiddenTranslations(textPtBr);
  return {
    valid: violations.length === 0,
    errors: violations
  };
}

module.exports = {
  PRESERVED_TERMS,
  checkForbiddenTranslations,
  validateTranslation
};
