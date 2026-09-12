const { LcuService } = require('../harness/lcuService');
const { equal, ok, throws, doesNotThrow, isTrue } = require('../harness/assert');

describe('Tier 2 - B2: Malformed Lockfiles & LCU Connection Edge Cases', () => {
  test('B2.1 - Empty lockfile (0 bytes) throws descriptive error', () => {
    throws(() => {
      LcuService.parseLockfile('');
    }, 'Invalid lockfile');
  });

  test('B2.2 - Truncated lockfile with fewer than 5 colon-separated parts throws error', () => {
    throws(() => {
      LcuService.parseLockfile('LeagueClient:1234:5000:token');
    }, 'expected 5 colon-separated fields');
  });

  test('B2.3 - Non-numeric PID in lockfile throws error', () => {
    throws(() => {
      LcuService.parseLockfile('LeagueClient:INVALID_PID:5000:token:https');
    }, 'Invalid PID in lockfile');
  });

  test('B2.4 - Non-numeric or invalid Port (0 or >65535) in lockfile throws error', () => {
    throws(() => {
      LcuService.parseLockfile('LeagueClient:1234:999999:token:https');
    }, 'Invalid Port in lockfile');

    throws(() => {
      LcuService.parseLockfile('LeagueClient:1234:0:token:https');
    }, 'Invalid Port in lockfile');
  });

  test('B2.5 - Empty AuthToken in lockfile throws error', () => {
    throws(() => {
      LcuService.parseLockfile('LeagueClient:1234:5000::https');
    }, 'Empty AuthToken in lockfile');
  });

  test('B2.6 - Special characters in AuthToken (URL-safe base64 / punctuation) parsed correctly', () => {
    const specialToken = 'AbCd-EfGh_12345+6789/==';
    const raw = `LeagueClient:14208:52341:${specialToken}:https`;
    const parsed = LcuService.parseLockfile(raw);
    equal(parsed.authToken, specialToken);

    const header = LcuService.generateBasicAuthHeader(specialToken);
    ok(header.startsWith('Basic '));
  });

  test('B2.7 - Malformed CommandLine arguments string returns null safely without throwing', () => {
    const resNull = LcuService.parseCommandLine(null);
    equal(resNull, null);

    const resEmpty = LcuService.parseCommandLine('');
    equal(resEmpty, null);

    const resNoArgs = LcuService.parseCommandLine('notepad.exe C:\\file.txt');
    equal(resNoArgs, null);
  });

  test('B2.8 - Unrecognized / custom future gameflow phases map safely to DISCONNECTED', () => {
    equal(LcuService.mapGameflowPhase('CustomTournamentObserver'), 'DISCONNECTED');
    equal(LcuService.mapGameflowPhase('SpectatingGame'), 'DISCONNECTED');
    equal(LcuService.mapGameflowPhase(''), 'DISCONNECTED');
    equal(LcuService.mapGameflowPhase(null), 'DISCONNECTED');
  });

  test('B2.9 - Null or empty Champ Select session payload returns empty draft state safely', () => {
    const draftNull = LcuService.parseChampSelectSession(null);
    equal(draftNull.inChampSelect, false);
    equal(draftNull.enemyCount, 0);

    const draftEmpty = LcuService.parseChampSelectSession({});
    equal(draftEmpty.inChampSelect, false);
    equal(draftEmpty.enemyCount, 0);
  });

  test('B2.10 - Champ Select session with unrevealed enemy picks (championId = 0) excludes them from enemyPicks', () => {
    const sessionWithHiddens = {
      myTeam: [{ cellId: 0, championId: 58 }],
      theirTeam: [
        { cellId: 5, championId: 0 },
        { cellId: 6, championId: 0 },
        { cellId: 7, championId: 266 } // Aatrox revealed
      ]
    };

    const draft = LcuService.parseChampSelectSession(sessionWithHiddens);
    equal(draft.enemyCount, 1);
    equal(draft.enemyPicks[0].championId, 266);
  });
});
