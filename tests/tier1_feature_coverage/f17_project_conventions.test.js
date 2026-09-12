const fs = require('fs');
const path = require('path');
const { DataDragonService } = require('../harness/dataDragonService');
const { equal, ok, isTrue } = require('../harness/assert');

describe('F17: Project-Wide Conventions, Glossary & Riot Localization Compliance', () => {
  const ddragon = new DataDragonService({ version: '16.16.1' });

  test('17.1 - Data Dragon version defaults to 16.16.1 and generates valid canonical URLs', () => {
    equal(ddragon.version, '16.16.1');
    const renektonQ = ddragon.getRenektonSpellIconUrl('Q');
    equal(renektonQ, 'https://ddragon.leagueoflegends.com/cdn/16.16.1/img/spell/RenektonCleave.png');
    const renektonP = ddragon.getRenektonSpellIconUrl('P');
    equal(renektonP, 'https://ddragon.leagueoflegends.com/cdn/16.16.1/img/passive/Renekton_Passive.png');
  });

  test('17.2 - Renekton ability localization returns official Riot PT-BR and original EN names', () => {
    equal(ddragon.getRenektonSpellName('Q', 'pt-br'), 'Abater os Indefesos');
    equal(ddragon.getRenektonSpellName('Q', 'en'), 'Cull the Meek');
    equal(ddragon.getRenektonSpellName('W', 'pt-br'), 'Predador Impiedoso');
    equal(ddragon.getRenektonSpellName('W', 'en'), 'Ruthless Predator');
    equal(ddragon.getRenektonSpellName('E', 'pt-br'), 'Fatiar e Cortar');
    equal(ddragon.getRenektonSpellName('E', 'en'), 'Slice and Dice');
    equal(ddragon.getRenektonSpellName('R', 'pt-br'), 'Dominus');
    equal(ddragon.getRenektonSpellName('R', 'en'), 'Dominus');
    equal(ddragon.getRenektonSpellName('P', 'pt-br'), 'Reinado da Fúria');
    equal(ddragon.getRenektonSpellName('P', 'en'), 'Reign of Anger');
  });

  test('17.3 - Item and Rune localization returns official PT-BR translations and EN names', () => {
    equal(ddragon.getItemName(1055, 'pt-br'), 'Lâmina de Doran');
    equal(ddragon.getItemName(1055, 'en'), "Doran's Blade");
    equal(ddragon.getItemName(1054, 'pt-br'), 'Escudo de Doran');
    equal(ddragon.getItemName(1054, 'en'), "Doran's Shield");
    equal(ddragon.getItemName(6698, 'pt-br'), 'Hidra Profana');
    equal(ddragon.getItemName(6698, 'en'), 'Profane Hydra');

    equal(ddragon.getRuneName('pta', 'pt-br'), 'Pressione o Ataque');
    equal(ddragon.getRuneName('pta', 'en'), 'Press the Attack');
    equal(ddragon.getRuneName('grasp', 'pt-br'), 'Aperto dos Mortos-Vivos');
    equal(ddragon.getRuneName('grasp', 'en'), 'Grasp of the Undying');
  });

  test('17.4 - Summoner Spells localization returns official Riot names', () => {
    equal(ddragon.getSpellName('flash', 'pt-br'), 'Flash');
    equal(ddragon.getSpellName('ignite', 'pt-br'), 'Incendiar');
    equal(ddragon.getSpellName('ignite', 'en'), 'Ignite');
    equal(ddragon.getSpellName('teleport', 'pt-br'), 'Teleporte');
    equal(ddragon.getSpellName('teleport', 'en'), 'Teleport');
    equal(ddragon.getSpellName('ghost', 'pt-br'), 'Fantasma');
    equal(ddragon.getSpellName('ghost', 'en'), 'Ghost');
  });

  test('17.5 - Master documentation and modular convention files exist and are populated', () => {
    const projectRoot = path.resolve(__dirname, '../../');
    const conventionsMasterGauntlet = path.join(projectRoot, 'Docs/gauntlet/CONVENCOES.md');
    const conventionsCodebase = path.join(projectRoot, '.planning/codebase/CONVENTIONS.md');
    const mod1 = path.join(projectRoot, 'Docs/conventions/01_assets_datadogron.md');
    const mod2 = path.join(projectRoot, 'Docs/conventions/02_glossary_translation.md');
    const mod3 = path.join(projectRoot, 'Docs/conventions/03_design_system_tokens.md');
    const mod4 = path.join(projectRoot, 'Docs/conventions/04_code_architecture.md');
    const mod5 = path.join(projectRoot, 'Docs/conventions/05_testing_compliance.md');

    isTrue(fs.existsSync(conventionsMasterGauntlet), 'Docs/gauntlet/CONVENCOES.md must exist');
    isTrue(fs.existsSync(conventionsCodebase), '.planning/codebase/CONVENTIONS.md must exist');
    isTrue(fs.existsSync(mod1), '01_assets_datadogron.md must exist');
    isTrue(fs.existsSync(mod2), '02_glossary_translation.md must exist');
    isTrue(fs.existsSync(mod3), '03_design_system_tokens.md must exist');
    isTrue(fs.existsSync(mod4), '04_code_architecture.md must exist');
    isTrue(fs.existsSync(mod5), '05_testing_compliance.md must exist');

    const mod2Content = fs.readFileSync(mod2, 'utf-8');
    ok(mod2Content.includes('Wave'), 'Glossary must preserve Wave');
    ok(mod2Content.includes('Trade'), 'Glossary must preserve Trade');
    ok(mod2Content.includes('Engage'), 'Glossary must preserve Engage');
    ok(mod2Content.includes('Skirmish'), 'Glossary must preserve Skirmish');
  });
});
