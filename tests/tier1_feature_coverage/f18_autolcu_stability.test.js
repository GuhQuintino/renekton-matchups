const { equal, ok, isTrue, isFalse } = require('../harness/assert');

function isGameStateEqual(prev, next) {
  if (!prev || !next) return prev === next;
  if (prev.phase !== next.phase) return false;
  if (prev.connected !== next.connected) return false;
  if (prev.opponentChampion !== next.opponentChampion) return false;
  if (prev.opponentConfidence !== next.opponentConfidence) return false;
  if (prev.myChampion !== next.myChampion) return false;
  if (prev.matchId !== next.matchId) return false;
  if (prev.matchResult !== next.matchResult) return false;
  if (prev.isManualOverride !== next.isManualOverride) return false;
  if (prev.kda !== next.kda) return false;
  if (prev.itemsBuilt !== next.itemsBuilt) return false;
  if (prev.summonersUsed !== next.summonersUsed) return false;
  if (prev.runesUsed !== next.runesUsed) return false;
  if (prev.cs !== next.cs) return false;
  if (prev.gameTimeSeconds !== next.gameTimeSeconds) return false;

  const prevPots = prev.potentialOpponents || [];
  const nextPots = next.potentialOpponents || [];
  if (prevPots.length !== nextPots.length) return false;
  for (let i = 0; i < prevPots.length; i++) {
    if (prevPots[i] !== nextPots[i]) return false;
  }

  return true;
}

describe('F18: Auto LCU Stability, Polling Equality & Champ Select Manual Override', () => {
  test('18.1 - isGameStateEqual returns true for identical Lobby polling payloads', () => {
    const stateA = {
      phase: 'LOBBY',
      connected: true,
      gameTimeSeconds: 0,
      opponentConfidence: 0,
      potentialOpponents: [],
      isManualOverride: false,
    };

    const stateB = {
      phase: 'LOBBY',
      connected: true,
      gameTimeSeconds: 0,
      opponentConfidence: 0,
      potentialOpponents: [],
      isManualOverride: false,
    };

    isTrue(isGameStateEqual(stateA, stateB), 'Identical lobby states should evaluate as equal to prevent re-render');
  });

  test('18.2 - isGameStateEqual detects phase or opponent transitions', () => {
    const stateLobby = {
      phase: 'LOBBY',
      connected: true,
      gameTimeSeconds: 0,
      opponentConfidence: 0,
      potentialOpponents: [],
      isManualOverride: false,
    };

    const stateSelect = {
      phase: 'CHAMP_SELECT',
      connected: true,
      gameTimeSeconds: 0,
      opponentConfidence: 80,
      opponentChampion: 'Darius',
      potentialOpponents: ['Darius', 'Nautilus'],
      isManualOverride: false,
    };

    isFalse(isGameStateEqual(stateLobby, stateSelect), 'Transition from LOBBY to CHAMP_SELECT must trigger state update');
  });

  test('18.3 - isGameStateEqual detects additions in revealed enemy draft picks', () => {
    const state1 = {
      phase: 'CHAMP_SELECT',
      connected: true,
      gameTimeSeconds: 0,
      potentialOpponents: ['Nautilus'],
      isManualOverride: false,
    };

    const state2 = {
      phase: 'CHAMP_SELECT',
      connected: true,
      gameTimeSeconds: 0,
      potentialOpponents: ['Nautilus', 'Darius'],
      isManualOverride: false,
    };

    isFalse(isGameStateEqual(state1, state2), 'New revealed enemy pick must update potentialOpponents');
  });

  test('18.4 - isGameStateEqual detects manual override opponent change', () => {
    const stateAuto = {
      phase: 'CHAMP_SELECT',
      connected: true,
      opponentChampion: 'Nautilus',
      potentialOpponents: ['Nautilus', 'Darius'],
      isManualOverride: false,
    };

    const stateManual = {
      phase: 'CHAMP_SELECT',
      connected: true,
      opponentChampion: 'Darius',
      potentialOpponents: ['Nautilus', 'Darius'],
      isManualOverride: true,
    };

    isFalse(isGameStateEqual(stateAuto, stateManual), 'Manual override toggle must update state');
  });

  test('18.5 - Selection guard: selecting already active champion produces no state mutation', () => {
    let currentSelected = 'Aatrox';
    const selectChampion = (name) => {
      if (name.toLowerCase() === currentSelected.toLowerCase()) {
        return false; // No change
      }
      currentSelected = name;
      return true; // Changed
    };

    isFalse(selectChampion('Aatrox'), 'Re-selecting Aatrox should be no-op');
    isFalse(selectChampion('aatrox'), 'Re-selecting aatrox case-insensitive should be no-op');
    isTrue(selectChampion('Darius'), 'Selecting Darius should update selection');
    equal(currentSelected, 'Darius');
  });
});
