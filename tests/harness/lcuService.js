/**
 * Riot LCU (League Client Update) Connector and Parser
 */

class LcuService {
  /**
   * Parses a raw lockfile string: "LeagueClient:PID:PORT:AUTH_TOKEN:PROTOCOL"
   */
  static parseLockfile(content) {
    if (!content || typeof content !== 'string') {
      throw new Error('Invalid lockfile: content must be a non-empty string');
    }
    const parts = content.trim().split(':');
    if (parts.length < 5) {
      throw new Error(`Invalid lockfile format: expected 5 colon-separated fields, got ${parts.length}`);
    }

    const [processName, pidStr, portStr, authToken, protocol] = parts;
    const pid = parseInt(pidStr, 10);
    const port = parseInt(portStr, 10);

    if (isNaN(pid) || pid <= 0) {
      throw new Error(`Invalid PID in lockfile: "${pidStr}"`);
    }
    if (isNaN(port) || port <= 0 || port > 65535) {
      throw new Error(`Invalid Port in lockfile: "${portStr}"`);
    }
    if (!authToken || authToken.length === 0) {
      throw new Error('Empty AuthToken in lockfile');
    }

    return {
      processName,
      pid,
      port,
      authToken,
      protocol: protocol || 'https'
    };
  }

  /**
   * Generates HTTP Basic Auth header value for LCU API
   */
  static generateBasicAuthHeader(authToken) {
    if (!authToken) {
      throw new Error('Auth token is required to generate Basic Auth header');
    }
    const credentials = `riot:${authToken}`;
    const base64 = Buffer.from(credentials).toString('base64');
    return `Basic ${base64}`;
  }

  /**
   * Parses process command line arguments (e.g. LeagueClientUx.exe --app-port=52341 --remoting-auth-token=AbC)
   */
  static parseCommandLine(commandLine) {
    if (!commandLine || typeof commandLine !== 'string') {
      return null;
    }
    const portMatch = commandLine.match(/--app-port=(\d+)/);
    const tokenMatch = commandLine.match(/--remoting-auth-token=([^\s"']+)/);
    const pidMatch = commandLine.match(/--app-pid=(\d+)/);

    if (portMatch && tokenMatch) {
      return {
        processName: 'LeagueClientUx',
        pid: pidMatch ? parseInt(pidMatch[1], 10) : 0,
        port: parseInt(portMatch[1], 10),
        authToken: tokenMatch[1],
        protocol: 'https'
      };
    }
    return null;
  }

  /**
   * Maps raw LCU gameflow phases to standard application state
   */
  static mapGameflowPhase(phase) {
    const p = (phase || '').trim();
    switch (p) {
      case 'None':
      case 'Matchmaking':
      case 'ReadyCheck':
        return 'LOBBY';
      case 'Lobby':
        return 'LOBBY';
      case 'ChampSelect':
        return 'CHAMP_SELECT';
      case 'InProgress':
      case 'Reconnect':
        return 'IN_GAME';
      case 'WaitingForStats':
      case 'PreEndOfGame':
      case 'EndOfGame':
        return 'POST_GAME';
      default:
        return 'DISCONNECTED';
    }
  }

  /**
   * Parses Champ Select draft session payload
   */
  static parseChampSelectSession(sessionData) {
    if (!sessionData || typeof sessionData !== 'object') {
      return {
        inChampSelect: false,
        myChampion: null,
        myPosition: null,
        enemyPicks: [],
        allyPicks: [],
        enemyCount: 0,
        totalActions: 0
      };
    }

    const myTeam = Array.isArray(sessionData.myTeam) ? sessionData.myTeam : [];
    const theirTeam = Array.isArray(sessionData.theirTeam) ? sessionData.theirTeam : [];
    const actions = Array.isArray(sessionData.actions) ? sessionData.actions : [];

    // Find Renekton player or local player
    let myChampion = null;
    let myPosition = 'TOP';

    for (const player of myTeam) {
      if (player.championId === 58) { // 58 is Renekton
        myChampion = 'Renekton';
        myPosition = player.assignedPosition || 'TOP';
        break;
      }
    }

    // Map enemy team picks
    const enemyPicks = theirTeam
      .filter(p => p && p.championId > 0)
      .map(p => ({
        cellId: p.cellId,
        championId: p.championId,
        assignedPosition: p.assignedPosition || 'UNKNOWN'
      }));

    const allyPicks = myTeam
      .filter(p => p && p.championId > 0)
      .map(p => ({
        cellId: p.cellId,
        championId: p.championId,
        assignedPosition: p.assignedPosition || 'UNKNOWN'
      }));

    return {
      inChampSelect: myTeam.length > 0 || theirTeam.length > 0,
      myChampion,
      myPosition,
      enemyPicks,
      allyPicks,
      enemyCount: enemyPicks.length,
      totalActions: actions.length
    };
  }
}

module.exports = {
  LcuService
};
