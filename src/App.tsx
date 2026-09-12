import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { GamePhase, SimulationScenario } from './types';
import { Header, type AppMode } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MatchupView } from './components/MatchupView';
import { ChampSelectView } from './components/ChampSelectView';
import { InGameHUDView } from './components/InGameHUDView';
import { GeneralGuidesModal } from './components/GeneralGuidesModal';
import { Level1TierListModal } from './components/Level1TierListModal';
import { AddNoteModal } from './components/notes/AddNoteModal';
import { useGameState, type PostGamePayload } from './hooks/useGameState';
import { useSearch } from './hooks/useSearch';
import { useMatchup } from './hooks/useMatchup';
import { useNotes } from './hooks/useNotes';
import { dataDragon } from './services/dataDragon';
import { sortChampionsByToplaneProbability } from './services/toplaneProbabilities';
import { LanguageProvider, useLanguage } from './i18n';

const AppContent: React.FC = () => {
  const { t, isEn } = useLanguage();

  // Search & Matchup hooks
  const search = useSearch();
  const { matchup, isLoading, selectChampion, selectedChampionName } = useMatchup('Aatrox');
  const { addNote } = useNotes(matchup?.championId || selectedChampionName);

  // General guides & Tier lists modals state
  const [isGuidesModalOpen, setIsGuidesModalOpen] = useState<boolean>(false);
  const [isTierListsModalOpen, setIsTierListsModalOpen] = useState<boolean>(false);

  // Post-Game auto modal state
  const [isPostGameModalOpen, setIsPostGameModalOpen] = useState<boolean>(false);
  const [postGameData, setPostGameData] = useState<{
    championName: string;
    result: 'WIN' | 'LOSS';
    kda?: string;
    itemsBuilt?: string;
    summonersUsed?: string;
    runesUsed?: string;
  }>({
    championName: 'Aatrox',
    result: 'WIN',
  });

  // Offline mode state
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

  // Override to force standard study workspace even when in ChampSelect/InGame if desired
  const [forceStudyWorkspace, setForceStudyWorkspace] = useState<boolean>(false);

  // Auto-sync latest Data Dragon version on app startup
  useEffect(() => {
    dataDragon.init().catch(() => {});
  }, []);

  // Synchronized Game State Hook
  const {
    gameState,
    mode,
    setMode,
    loadScenario,
    manualOverrideOpponent,
    dismissPostGameModal,
    isConnected,
    phase,
    opponentChampion,
    opponentConfidence,
    potentialOpponents,
    gameTimeSeconds,
    matchResult,
  } = useGameState({
    initialMode: 'LCU_AUTO',
    pollingIntervalMs: 2500,
    onPostGameTrigger: useCallback((payload: PostGamePayload) => {
      setPostGameData({
        championName: payload.championName || selectedChampionName,
        result: payload.matchResult === 'LOSS' ? 'LOSS' : 'WIN',
        kda: payload.kda,
        itemsBuilt: payload.itemsBuilt,
        summonersUsed: payload.summonersUsed,
        runesUsed: payload.runesUsed,
      });
      setIsPostGameModalOpen(true);
    }, [selectedChampionName]),
  });

  const prevPhaseRef = useRef<GamePhase>(phase);
  const prevOpponentRef = useRef<string | undefined>(opponentChampion);

  // Automatically update selected champion on meaningful phase/opponent transitions
  useEffect(() => {
    const isNewPhase = prevPhaseRef.current !== phase;
    const isNewOpponent = prevOpponentRef.current !== opponentChampion;
    prevPhaseRef.current = phase;
    prevOpponentRef.current = opponentChampion;

    if (phase === 'IN_GAME') {
      if (opponentChampion && (isNewPhase || isNewOpponent)) {
        selectChampion(opponentChampion);
        setForceStudyWorkspace(false);
      }
    } else if (phase === 'CHAMP_SELECT') {
      if (isNewPhase) {
        setForceStudyWorkspace(false);
      }
      if (opponentChampion) {
        if (isNewPhase || isNewOpponent) {
          selectChampion(opponentChampion);
        }
      } else if (potentialOpponents.length > 0 && isNewPhase) {
        const sorted = sortChampionsByToplaneProbability(potentialOpponents);
        if (sorted.length > 0) {
          selectChampion(sorted[0].championName);
        }
      }
    } else if (phase === 'POST_GAME') {
      if (opponentChampion && (isNewPhase || isNewOpponent)) {
        selectChampion(opponentChampion);
      }
    }
  }, [phase, opponentChampion, potentialOpponents, selectChampion]);

  // Handle offline mode toggle
  const handleToggleOfflineMode = useCallback(() => {
    setIsOfflineMode((prev) => {
      const next = !prev;
      dataDragon.setOffline(next);
      return next;
    });
  }, []);

  // Handle simulation scenario changes
  const handleSelectScenario = useCallback(
    (scenario: SimulationScenario) => {
      setForceStudyWorkspace(false);
      loadScenario(scenario);
    },
    [loadScenario]
  );

  // Global key listener for ESC (close modal)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isGuidesModalOpen) setIsGuidesModalOpen(false);
        if (isTierListsModalOpen) setIsTierListsModalOpen(false);
        if (isPostGameModalOpen) {
          setIsPostGameModalOpen(false);
          dismissPostGameModal();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGuidesModalOpen, isTierListsModalOpen, isPostGameModalOpen, dismissPostGameModal]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#090A0C] text-[#F8FAFC] overflow-hidden">
      {/* Top Status & Brand Header */}
      <Header
        phase={phase}
        connected={isConnected}
        activeMode={mode}
        onModeChange={setMode}
        opponentChampion={opponentChampion}
        opponentConfidence={opponentConfidence}
        potentialOpponents={potentialOpponents}
        onSelectScenario={handleSelectScenario}
        onOpenGuidesModal={() => setIsGuidesModalOpen(true)}
        onOpenTierListsModal={() => setIsTierListsModalOpen(true)}
        isOfflineMode={isOfflineMode}
        onToggleOfflineMode={handleToggleOfflineMode}
      />

      {/* Main Workspace Router based on Game Phase */}
      <div className="flex-1 flex overflow-hidden">
        {/* Phase 2: Champ Select Screen */}
        {phase === 'CHAMP_SELECT' && !forceStudyWorkspace ? (
          <ChampSelectView
            potentialOpponents={potentialOpponents}
            selectedOpponent={opponentChampion || selectedChampionName}
            onSelectOpponent={(cName) => {
              selectChampion(cName);
              manualOverrideOpponent(cName);
            }}
            matchupData={matchup}
            onOpenFullGuide={() => setForceStudyWorkspace(true)}
          />
        ) : /* Phase 3: In-Game Live HUD Screen */
        phase === 'IN_GAME' && !forceStudyWorkspace ? (
          <InGameHUDView
            opponentChampion={opponentChampion || selectedChampionName || 'Aatrox'}
            opponentConfidence={opponentConfidence}
            gameTimeSeconds={gameTimeSeconds}
            matchupData={matchup}
            isLoading={isLoading}
            onLaneSwap={(cName) => {
              selectChampion(cName);
              manualOverrideOpponent(cName);
            }}
          />
        ) : (
          /* Phase 1 & Fallback: Complete Free Study & Search Workspace */
          <div className="flex-1 flex overflow-hidden">
            {/* Left: 170 Champion Instant Search & Filter Sidebar */}
            <Sidebar
              champions={search.filteredChampions}
              selectedChampionName={selectedChampionName}
              onSelectChampion={(cName) => {
                selectChampion(cName);
              }}
              query={search.query}
              onQueryChange={search.setQuery}
              difficultyFilter={search.difficultyFilter}
              onDifficultyFilterChange={search.setDifficultyFilter}
              favoritesOnly={search.favoritesOnly}
              onToggleFavoritesOnly={() => search.setFavoritesOnly(!search.favoritesOnly)}
              favorites={search.favorites}
              onToggleFavorite={search.toggleFavorite}
              sortBy={search.sortBy}
              onSortByChange={search.setSortBy}
              totalCount={search.totalCount}
              filteredCount={search.filteredCount}
              executionTimeMs={search.executionTimeMs}
            />

            {/* Right: Main Matchup Workspace */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {forceStudyWorkspace && (phase === 'CHAMP_SELECT' || phase === 'IN_GAME') && (
                <div className="bg-[#151821] border-b border-[#D4A017]/40 px-4 py-2 flex items-center justify-between text-xs">
                  <span className="text-[#D4A017] font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#D4A017] animate-pulse" />
                    {isEn
                      ? `Study Workspace Override Active (Match ongoing: ${t.header.phases[phase === 'IN_GAME' ? 'inGame' : 'champSelect']})`
                      : `Visualização Livre de Estudo Ativa (Partida em andamento: ${t.header.phases[phase === 'IN_GAME' ? 'inGame' : 'champSelect']})`}
                  </span>
                  <button
                    onClick={() => setForceStudyWorkspace(false)}
                    className="px-3 py-1 rounded-lg bg-[#D4A017] text-[#090A0C] font-black hover:bg-[#F3B72C] transition-all"
                  >
                    {isEn ? 'Return to Live Match' : 'Voltar para a Tela da Fase'}
                  </button>
                </div>
              )}

              <MatchupView
                matchup={matchup}
                isLoading={isLoading}
                isLiveLocked={phase === 'IN_GAME'}
              />
            </div>
          </div>
        )}
      </div>

      {/* 8 General Guides Modal */}
      <GeneralGuidesModal
        isOpen={isGuidesModalOpen}
        onClose={() => setIsGuidesModalOpen(false)}
      />

      {/* Preparation Tier Lists Modal (Ability Starts & Starting Items) */}
      <Level1TierListModal
        isOpen={isTierListsModalOpen}
        onClose={() => setIsTierListsModalOpen(false)}
        onSelectChampion={selectChampion}
      />

      {/* Post Game Structured Note Modal (Auto-pops at end of game) */}
      <AddNoteModal
        isOpen={isPostGameModalOpen}
        championName={postGameData.championName}
        championId={matchup?.championId || 1}
        suggestedResult={postGameData.result}
        initialKda={postGameData.kda}
        initialRunes={postGameData.runesUsed}
        initialItems={postGameData.itemsBuilt}
        initialSummoners={postGameData.summonersUsed}
        onClose={() => {
          setIsPostGameModalOpen(false);
          dismissPostGameModal();
        }}
        onSave={async (payload) => {
          await addNote(payload);
          setIsPostGameModalOpen(false);
          dismissPostGameModal();
        }}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;
