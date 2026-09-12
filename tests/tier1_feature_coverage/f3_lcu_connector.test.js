const { LcuService } = require('../harness/lcuService');
const { equal, ok, deepEqual, throws, isTrue } = require('../harness/assert');

describe('F3: LCU API Connector & Lockfile Discovery', () => {
  test('3.1 - Lockfile parser extracts PID, Port, AuthToken, and Protocol accurately', () => {
    const raw = 'LeagueClient:14208:52341:AbCdEfGh123456:https';
    const parsed = LcuService.parseLockfile(raw);

    equal(parsed.processName, 'LeagueClient');
    equal(parsed.pid, 14208);
    equal(parsed.port, 52341);
    equal(parsed.authToken, 'AbCdEfGh123456');
    equal(parsed.protocol, 'https');
  });

  test('3.2 - Command line parser extracts connection args when lockfile is locked', () => {
    const cmdLine = '"C:\\Riot Games\\League of Legends\\LeagueClientUx.exe" "--app-port=51234" "--remoting-auth-token=SecretToken987" "--app-pid=8820"';
    const parsed = LcuService.parseCommandLine(cmdLine);

    ok(parsed, 'Command line should be parsed successfully');
    equal(parsed.port, 51234);
    equal(parsed.authToken, 'SecretToken987');
    equal(parsed.pid, 8820);
  });

  test('3.3 - Basic Auth generator creates valid Base64 header for riot:<token>', () => {
    const token = 'MySecretAuthToken123';
    const header = LcuService.generateBasicAuthHeader(token);

    const expectedCredentials = `riot:${token}`;
    const expectedBase64 = Buffer.from(expectedCredentials).toString('base64');
    equal(header, `Basic ${expectedBase64}`);
  });

  test('3.4 - Gameflow phase mapper correctly categorizes all LCU game states', () => {
    equal(LcuService.mapGameflowPhase('None'), 'LOBBY');
    equal(LcuService.mapGameflowPhase('Lobby'), 'LOBBY');
    equal(LcuService.mapGameflowPhase('Matchmaking'), 'LOBBY');
    equal(LcuService.mapGameflowPhase('ReadyCheck'), 'LOBBY');
    equal(LcuService.mapGameflowPhase('ChampSelect'), 'CHAMP_SELECT');
    equal(LcuService.mapGameflowPhase('InProgress'), 'IN_GAME');
    equal(LcuService.mapGameflowPhase('WaitingForStats'), 'POST_GAME');
    equal(LcuService.mapGameflowPhase('EndOfGame'), 'POST_GAME');
    equal(LcuService.mapGameflowPhase('UnknownState'), 'DISCONNECTED');
  });

  test('3.5 - Champ Select draft parser extracts ally team, enemy picks, and identifies Renekton seat', () => {
    const sampleSession = {
      myTeam: [
        { cellId: 0, championId: 58, assignedPosition: 'top' }, // Renekton
        { cellId: 1, championId: 64, assignedPosition: 'jungle' }, // Lee Sin
        { cellId: 2, championId: 103, assignedPosition: 'middle' } // Ahri
      ],
      theirTeam: [
        { cellId: 5, championId: 266, assignedPosition: 'top' }, // Aatrox
        { cellId: 6, championId: 0, assignedPosition: 'jungle' }, // Hidden
        { cellId: 7, championId: 145, assignedPosition: 'bottom' } // Kai'Sa
      ],
      actions: [[{ id: 1, type: 'pick' }]]
    };

    const draft = LcuService.parseChampSelectSession(sampleSession);
    isTrue(draft.inChampSelect);
    equal(draft.myChampion, 'Renekton');
    equal(draft.myPosition, 'top');
    equal(draft.enemyCount, 2, 'Should detect 2 revealed enemy picks');
    equal(draft.enemyPicks[0].championId, 266);
    equal(draft.enemyPicks[1].championId, 145);
  });
});
