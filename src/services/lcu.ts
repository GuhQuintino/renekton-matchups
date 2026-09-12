/**
 * Riot LCU (League Client Update) API Connector & Parser Service
 */

import type { GamePhase } from '../types/game';

export interface LockfileInfo {
  processName: string;
  pid: number;
  port: number;
  authToken: string;
  protocol: string;
}

export interface RevealedPick {
  cellId: number;
  championId: number;
  assignedPosition: string;
}

export interface ChampSelectDraftSummary {
  inChampSelect: boolean;
  myChampion: string | null;
  myPosition: string | null;
  enemyPicks: RevealedPick[];
  allyPicks: RevealedPick[];
  enemyCount: number;
  totalActions: number;
}

export class LcuService {
  /**
   * Parses a raw lockfile string: "LeagueClient:PID:PORT:AUTH_TOKEN:PROTOCOL"
   */
  static parseLockfile(content: string): LockfileInfo {
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      throw new Error('Invalid lockfile: content must be a non-empty string');
    }

    const parts = content.trim().split(':');
    if (parts.length < 5) {
      throw new Error(
        `Invalid lockfile format: expected 5 colon-separated fields, got ${parts.length}`
      );
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
      protocol: protocol || 'https',
    };
  }

  /**
   * Generates HTTP Basic Auth header value for LCU API
   */
  static generateBasicAuthHeader(authToken: string): string {
    if (!authToken) {
      throw new Error('Auth token is required to generate Basic Auth header');
    }
    const credentials = `riot:${authToken}`;
    // Cross-environment Base64 encoding (Node.js Buffer or browser btoa)
    let base64 = '';
    if (typeof Buffer !== 'undefined') {
      base64 = Buffer.from(credentials).toString('base64');
    } else if (typeof btoa === 'function') {
      base64 = btoa(credentials);
    } else {
      base64 = unescape(encodeURIComponent(credentials));
    }
    return `Basic ${base64}`;
  }

  /**
   * Parses process command line arguments (e.g. LeagueClientUx.exe --app-port=52341 --remoting-auth-token=AbC)
   */
  static parseCommandLine(commandLine: string | null | undefined): LockfileInfo | null {
    if (!commandLine || typeof commandLine !== 'string' || commandLine.trim().length === 0) {
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
        protocol: 'https',
      };
    }

    return null;
  }

  /**
   * Maps raw LCU gameflow phases to standard application state
   */
  static mapGameflowPhase(phase: string | null | undefined): GamePhase {
    const p = (phase || '').trim();
    switch (p) {
      case 'None':
      case 'Matchmaking':
      case 'ReadyCheck':
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
  static parseChampSelectSession(sessionData: any): ChampSelectDraftSummary {
    if (!sessionData || typeof sessionData !== 'object') {
      return {
        inChampSelect: false,
        myChampion: null,
        myPosition: null,
        enemyPicks: [],
        allyPicks: [],
        enemyCount: 0,
        totalActions: 0,
      };
    }

    const myTeam = Array.isArray(sessionData.myTeam) ? sessionData.myTeam : [];
    const theirTeam = Array.isArray(sessionData.theirTeam) ? sessionData.theirTeam : [];
    const actions = Array.isArray(sessionData.actions) ? sessionData.actions : [];

    let myChampion: string | null = null;
    let myPosition: string | null = 'top';

    for (const player of myTeam) {
      if (player && player.championId === 58) {
        // 58 is Renekton
        myChampion = 'Renekton';
        myPosition = player.assignedPosition || 'top';
        break;
      }
    }

    const enemyPicks: RevealedPick[] = theirTeam
      .filter((p: any) => p && p.championId > 0)
      .map((p: any) => ({
        cellId: p.cellId,
        championId: p.championId,
        assignedPosition: p.assignedPosition || 'UNKNOWN',
      }));

    const allyPicks: RevealedPick[] = myTeam
      .filter((p: any) => p && p.championId > 0)
      .map((p: any) => ({
        cellId: p.cellId,
        championId: p.championId,
        assignedPosition: p.assignedPosition || 'UNKNOWN',
      }));

    return {
      inChampSelect: myTeam.length > 0 || theirTeam.length > 0,
      myChampion,
      myPosition,
      enemyPicks,
      allyPicks,
      enemyCount: enemyPicks.length,
      totalActions: actions.length,
    };
  }

  /**
   * Fetches Gameflow Phase via HTTP
   */
  static async fetchGameflowPhase(lockfile: LockfileInfo): Promise<string | null> {
    try {
      const url = `https://127.0.0.1:${lockfile.port}/lol-gameflow/v1/gameflow-phase`;
      const authHeader = this.generateBasicAuthHeader(lockfile.authToken);
      const res = await fetch(url, {
        headers: {
          Authorization: authHeader,
          Accept: 'application/json',
        },
      });
      if (!res.ok) return null;
      const text = await res.text();
      return text.trim().replace(/^"|"$/g, '');
    } catch {
      return null;
    }
  }

  /**
   * Fetches Champ Select Session via HTTP
   */
  static async fetchChampSelectSession(lockfile: LockfileInfo): Promise<any | null> {
    try {
      const url = `https://127.0.0.1:${lockfile.port}/lol-champ-select/v1/session`;
      const authHeader = this.generateBasicAuthHeader(lockfile.authToken);
      const res = await fetch(url, {
        headers: {
          Authorization: authHeader,
          Accept: 'application/json',
        },
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }
}
