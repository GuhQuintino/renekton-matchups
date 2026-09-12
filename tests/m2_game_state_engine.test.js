const { LcuService } = require('./harness/lcuService');
const { LiveClientService } = require('./harness/liveClientService');
const { SimulatorEngine } = require('./harness/simulatorEngine');
const { equal, ok, isTrue, isFalse, deepEqual, greaterThan, lessThan, throws } = require('./harness/assert');

describe('M2: Game State Engine, LCU, Live Client Data & Simulator Engine Integration', () => {
  test('M2.1 - LCU Lockfile parsing and Basic Auth Generation', () => {
    const lockfileRaw = 'LeagueClient:9876:54321:SecretTokenRiot2026:https';
    const parsed = LcuService.parseLockfile(lockfileRaw);

    equal(parsed.processName, 'LeagueClient');
    equal(parsed.pid, 9876);
    equal(parsed.port, 54321);
    equal(parsed.authToken, 'SecretTokenRiot2026');
    equal(parsed.protocol, 'https');

    const authHeader = LcuService.generateBasicAuthHeader(parsed.authToken);
    const expectedBase64 = Buffer.from(`riot:${parsed.authToken}`).toString('base64');
    equal(authHeader, `Basic ${expectedBase64}`);
  });

  test('M2.2 - LCU Command Line extraction for Windows processes', () => {
    const cmdLine = '"C:\\Riot Games\\League of Legends\\LeagueClientUx.exe" "--app-port=55112" "--remoting-auth-token=UxToken12345" "--app-pid=12040"';
    const parsed = LcuService.parseCommandLine(cmdLine);

    ok(parsed, 'Command line should parse');
    equal(parsed.port, 55112);
    equal(parsed.authToken, 'UxToken12345');
    equal(parsed.pid, 12040);
  });

  test('M2.3 - LCU Champ Select draft session parsing and candidate extraction', () => {
    const session = {
      myTeam: [
        { cellId: 0, championId: 58, assignedPosition: 'top' }, // Renekton
        { cellId: 1, championId: 104, assignedPosition: 'jungle' }, // Graves
        { cellId: 2, championId: 238, assignedPosition: 'middle' }, // Zed
      ],
      theirTeam: [
        { cellId: 5, championId: 897, assignedPosition: 'top' }, // K'Sante
        { cellId: 6, championId: 64, assignedPosition: 'jungle' }, // Lee Sin
        { cellId: 7, championId: 0, assignedPosition: 'middle' }, // Hidden
      ],
      actions: [[{ id: 1, type: 'pick' }]]
    };

    const draft = LcuService.parseChampSelectSession(session);
    isTrue(draft.inChampSelect);
    equal(draft.myChampion, 'Renekton');
    equal(draft.myPosition, 'top');
    equal(draft.enemyCount, 2);
    equal(draft.enemyPicks[0].championId, 897);
  });

  test('M2.4 - Live Client Data deterministically scores Renekton lane opponent against full 5v5 game', () => {
    const game5v5 = {
      activePlayer: { summonerName: 'SoloKingRenekton' },
      allPlayers: [
        { summonerName: 'SoloKingRenekton', championName: 'Renekton', team: 'ORDER', position: 'TOP' },
        { summonerName: 'AllyJg', championName: 'Sejuani', team: 'ORDER', position: 'JUNGLE' },
        { summonerName: 'AllyMid', championName: 'Orianna', team: 'ORDER', position: 'MIDDLE' },
        { summonerName: 'AllyAdc', championName: 'Jinx', team: 'ORDER', position: 'BOTTOM' },
        { summonerName: 'AllySup', championName: 'Thresh', team: 'ORDER', position: 'UTILITY' },

        { summonerName: 'EnemyTop', championName: 'Aatrox', team: 'CHAOS', position: 'TOP', summonerSpellOne: { displayName: 'Flash' }, summonerSpellTwo: { displayName: 'Teleport' }, items: [{ displayName: "Doran's Blade" }] },
        { summonerName: 'EnemyJg', championName: 'Jarvan IV', team: 'CHAOS', position: 'JUNGLE', summonerSpellOne: { displayName: 'Smite' }, summonerSpellTwo: { displayName: 'Flash' }, items: [{ displayName: 'Scorchclaw Seedling' }] },
        { summonerName: 'EnemyMid', championName: 'Syndra', team: 'CHAOS', position: 'MIDDLE', summonerSpellOne: { displayName: 'Flash' }, summonerSpellTwo: { displayName: 'Ignite' }, items: [{ displayName: "Doran's Ring" }] },
        { summonerName: 'EnemyAdc', championName: 'Kai\'Sa', team: 'CHAOS', position: 'BOTTOM', summonerSpellOne: { displayName: 'Flash' }, summonerSpellTwo: { displayName: 'Heal' }, items: [{ displayName: "Doran's Blade" }] },
        { summonerName: 'EnemySup', championName: 'Leona', team: 'CHAOS', position: 'UTILITY', summonerSpellOne: { displayName: 'Flash' }, summonerSpellTwo: { displayName: 'Ignite' }, items: [{ displayName: 'World Atlas' }] }
      ]
    };

    const detection = LiveClientService.detectLaneOpponent(game5v5);
    isTrue(detection.detected);
    equal(detection.opponentChampion, 'Aatrox');
    greaterThan(detection.confidence, 80);
    equal(detection.candidates.length, 5);

    // Verify Jungler and Support were heavily penalized
    const jgCandidate = detection.candidates.find(c => c.championName === 'Jarvan IV');
    const supCandidate = detection.candidates.find(c => c.championName === 'Leona');
    lessThan(jgCandidate.score, -500);
    lessThan(supCandidate.score, -500);
  });

  test('M2.5 - Manual Lane Swap override changes opponent cleanly with 100% confidence', () => {
    const initial = {
      detected: true,
      opponentChampion: 'Yasuo',
      confidence: 75,
      topCandidateScore: 120,
      candidates: []
    };

    const swapped = LiveClientService.manualLaneSwap(initial, 'Yone');
    isTrue(swapped.detected);
    equal(swapped.opponentChampion, 'Yone');
    equal(swapped.confidence, 100);
    isTrue(swapped.isManualOverride);
  });

  test('M2.6 - Simulator Engine cycles through all 5 key scenarios cleanly', () => {
    const sim = new SimulatorEngine();

    // 1. Disconnected
    const s0 = sim.getState();
    equal(s0.phase, 'DISCONNECTED');
    isFalse(s0.connected);

    // 2. Draft (Champ Select)
    const s1 = sim.loadScenario('SCENARIO_A_DRAFT');
    equal(s1.phase, 'CHAMP_SELECT');
    isTrue(s1.connected);
    equal(s1.opponent_champion, 'Aatrox');

    // 3. In-Game Live vs Darius
    const s2 = sim.loadScenario('SCENARIO_B_IN_GAME');
    equal(s2.phase, 'IN_GAME');
    equal(s2.opponent_champion, 'Darius');
    equal(s2.game_time_seconds, 215);

    // 4. Lane Swap
    const s3 = sim.loadScenario('SCENARIO_C_LANE_SWAP');
    equal(s3.phase, 'IN_GAME');
    equal(s3.opponent_champion, 'Yasuo');
    ok(s3.potential_opponents.includes('Yone'));

    // 5. Post Game Win
    let postGameTriggered = false;
    sim.on('postGameTrigger', (p) => {
      postGameTriggered = true;
      equal(p.match_result, 'WIN');
    });

    const s4 = sim.loadScenario('SCENARIO_D_POST_GAME_WIN');
    equal(s4.phase, 'POST_GAME');
    isTrue(postGameTriggered);

    // 6. Return to Disconnected
    const s5 = sim.loadScenario('SCENARIO_E_DISCONNECTED');
    equal(s5.phase, 'DISCONNECTED');
    isFalse(s5.connected);
  });

  test('M2.7 - TypeScript source files for M2 exist and export expected symbols', () => {
    const fs = require('fs');
    const path = require('path');

    const lcuTsPath = path.join(__dirname, '..', 'src', 'services', 'lcu.ts');
    const simTsPath = path.join(__dirname, '..', 'src', 'services', 'simulator.ts');
    const liveTsPath = path.join(__dirname, '..', 'src', 'services', 'liveClient.ts');
    const hookTsPath = path.join(__dirname, '..', 'src', 'hooks', 'useGameState.ts');

    isTrue(fs.existsSync(lcuTsPath), 'src/services/lcu.ts must exist');
    isTrue(fs.existsSync(simTsPath), 'src/services/simulator.ts must exist');
    isTrue(fs.existsSync(liveTsPath), 'src/services/liveClient.ts must exist');
    isTrue(fs.existsSync(hookTsPath), 'src/hooks/useGameState.ts must exist');

    const hookContent = fs.readFileSync(hookTsPath, 'utf8');
    isTrue(hookContent.includes('export function useGameState'));
    isTrue(hookContent.includes('loadScenario'));
    isTrue(hookContent.includes('manualOverrideOpponent'));
    isTrue(hookContent.includes('simulatorEngine'));
  });

  test('M2.8 - Rust backend source files for M2 exist with proper structure', () => {
    const fs = require('fs');
    const path = require('path');

    const lcuMod = path.join(__dirname, '..', 'src-tauri', 'src', 'lcu', 'mod.rs');
    const lcuLockfile = path.join(__dirname, '..', 'src-tauri', 'src', 'lcu', 'lockfile.rs');
    const lcuClient = path.join(__dirname, '..', 'src-tauri', 'src', 'lcu', 'client.rs');
    const liveMod = path.join(__dirname, '..', 'src-tauri', 'src', 'live_client', 'mod.rs');
    const liveDetector = path.join(__dirname, '..', 'src-tauri', 'src', 'live_client', 'lane_detector.rs');
    const simMod = path.join(__dirname, '..', 'src-tauri', 'src', 'simulator', 'mod.rs');
    const simEngine = path.join(__dirname, '..', 'src-tauri', 'src', 'simulator', 'engine.rs');
    const cmdGameState = path.join(__dirname, '..', 'src-tauri', 'src', 'commands', 'game_state.rs');

    isTrue(fs.existsSync(lcuMod), 'src-tauri/src/lcu/mod.rs must exist');
    isTrue(fs.existsSync(lcuLockfile), 'src-tauri/src/lcu/lockfile.rs must exist');
    isTrue(fs.existsSync(lcuClient), 'src-tauri/src/lcu/client.rs must exist');
    isTrue(fs.existsSync(liveMod), 'src-tauri/src/live_client/mod.rs must exist');
    isTrue(fs.existsSync(liveDetector), 'src-tauri/src/live_client/lane_detector.rs must exist');
    isTrue(fs.existsSync(simMod), 'src-tauri/src/simulator/mod.rs must exist');
    isTrue(fs.existsSync(simEngine), 'src-tauri/src/simulator/engine.rs must exist');
    isTrue(fs.existsSync(cmdGameState), 'src-tauri/src/commands/game_state.rs must exist');
  });
});
