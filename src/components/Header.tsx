import React, { useState } from 'react';
import {
  Activity,
  BookOpen,
  Wifi,
  WifiOff,
  Cpu,
  Monitor,
  Shield,
  Swords,
  ChevronDown,
  RefreshCw,
  Layers,
  Languages,
} from 'lucide-react';
import type { GamePhase, SimulationScenario } from '../types';
import { useLanguage } from '../i18n';

export type AppMode = 'LCU_AUTO' | 'SIMULATOR' | 'MANUAL';

interface HeaderProps {
  phase: GamePhase;
  connected: boolean;
  activeMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  opponentChampion?: string;
  opponentConfidence?: number;
  potentialOpponents?: string[];
  onSelectScenario: (scenario: SimulationScenario) => void;
  onOpenGuidesModal: () => void;
  onOpenTierListsModal: () => void;
  isOfflineMode: boolean;
  onToggleOfflineMode: () => void;
}

interface PhaseStyle {
  color: string;
  bg: string;
  border: string;
  icon: React.ReactNode;
}

const PHASE_STYLES: Record<GamePhase, PhaseStyle> = {
  DISCONNECTED: {
    color: '#64748B',
    bg: '#12141A',
    border: '#262B3D',
    icon: <WifiOff className="w-3.5 h-3.5" />,
  },
  LOBBY: {
    color: '#38BDF8',
    bg: '#082130',
    border: '#0284C7',
    icon: <Activity className="w-3.5 h-3.5" />,
  },
  CHAMP_SELECT: {
    color: '#F59E0B',
    bg: '#2E1E05',
    border: '#D97706',
    icon: <Shield className="w-3.5 h-3.5" />,
  },
  IN_GAME: {
    color: '#10B981',
    bg: '#062E22',
    border: '#059669',
    icon: <Swords className="w-3.5 h-3.5" />,
  },
  POST_GAME: {
    color: '#A78BFA',
    bg: '#1F1338',
    border: '#7C3AED',
    icon: <RefreshCw className="w-3.5 h-3.5" />,
  },
};

export const Header: React.FC<HeaderProps> = ({
  phase,
  connected,
  activeMode,
  onModeChange,
  opponentChampion,
  opponentConfidence,
  potentialOpponents,
  onSelectScenario,
  onOpenGuidesModal,
  onOpenTierListsModal,
  isOfflineMode,
  onToggleOfflineMode,
}) => {
  const [showSimDropdown, setShowSimDropdown] = useState<boolean>(false);
  const { t, toggleLanguage, isPt } = useLanguage();

  const currentPhaseStyle = PHASE_STYLES[phase] || PHASE_STYLES.DISCONNECTED;
  const phaseLabelMap: Record<GamePhase, string> = {
    DISCONNECTED: t.header.phases.disconnected,
    LOBBY: t.header.phases.lobby,
    CHAMP_SELECT: t.header.phases.champSelect,
    IN_GAME: t.header.phases.inGame,
    POST_GAME: t.header.phases.postGame,
  };
  const currentPhaseLabel = phaseLabelMap[phase] || t.header.phases.disconnected;

  return (
    <header className="h-16 border-b border-[#262B3D] bg-[#0F1015] px-4 flex items-center justify-between z-20 select-none shadow-md">
      {/* Left: Brand / Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#151821] border border-[#D4A017] flex items-center justify-center shadow-gold-glow">
            <span className="text-[#D4A017] font-black text-lg tracking-tighter">RM</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-[#F8FAFC] tracking-tight">
                Renekton <span className="text-[#D4A017]">Matchups</span>
              </span>
            </div>
            <p className="text-[11px] text-[#94A3B8]">
              {t.header.brandSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Middle: Game State & Live Detection Pill */}
      <div className="flex items-center gap-2">
        <div
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border shadow-sm transition-all duration-300"
          style={{
            backgroundColor: currentPhaseStyle.bg,
            borderColor: currentPhaseStyle.border,
            color: currentPhaseStyle.color,
          }}
        >
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              connected && phase !== 'DISCONNECTED' ? 'animate-status-pulse' : ''
            }`}
            style={{ backgroundColor: currentPhaseStyle.color }}
          />
          <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            {currentPhaseStyle.icon}
            {currentPhaseLabel}
          </span>

          {/* Additional details based on phase */}
          {phase === 'IN_GAME' && opponentChampion && (
            <span className="text-xs font-semibold text-[#F8FAFC] border-l border-[#262B3D] pl-2 ml-1">
              vs <span className="text-[#D4A017]">{opponentChampion}</span>
              {opponentConfidence && opponentConfidence > 0 ? ` (${opponentConfidence}%)` : ''}
            </span>
          )}

          {phase === 'CHAMP_SELECT' && potentialOpponents && potentialOpponents.length > 0 && (
            <span className="text-xs font-medium text-[#94A3B8] border-l border-[#262B3D] pl-2 ml-1">
              {potentialOpponents.length} {t.header.opponentsDetected}
            </span>
          )}
        </div>
      </div>

      {/* Right: Mode Selector, Simulator, Guides & Actions */}
      <div className="flex items-center gap-2.5">
        {/* Mode Selector */}
        <div className="flex items-center bg-[#151821] border border-[#262B3D] rounded-lg p-0.5 text-xs font-medium text-[#94A3B8]">
          <button
            onClick={() => onModeChange('LCU_AUTO')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              activeMode === 'LCU_AUTO'
                ? 'bg-[#262B3D] text-[#F8FAFC] font-semibold'
                : 'hover:text-[#F8FAFC]'
            }`}
            title={t.header.modes.autoLcuTitle}
          >
            <span className="flex items-center gap-1">
              <Monitor className="w-3 h-3 text-[#38BDF8]" />
              {t.header.modes.autoLcu}
            </span>
          </button>
          <button
            onClick={() => onModeChange('SIMULATOR')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              activeMode === 'SIMULATOR'
                ? 'bg-[#262B3D] text-[#F8FAFC] font-semibold'
                : 'hover:text-[#F8FAFC]'
            }`}
            title={t.header.modes.simulatorTitle}
          >
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3 text-[#F59E0B]" />
              {t.header.modes.simulator}
            </span>
          </button>
          <button
            onClick={() => onModeChange('MANUAL')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              activeMode === 'MANUAL'
                ? 'bg-[#262B3D] text-[#F8FAFC] font-semibold'
                : 'hover:text-[#F8FAFC]'
            }`}
            title={t.header.modes.manualTitle}
          >
            {t.header.modes.manual}
          </button>
        </div>

        {/* Simulator Scenario Dropdown (if in SIMULATOR mode or accessible) */}
        {activeMode === 'SIMULATOR' && (
          <div className="relative">
            <button
              onClick={() => setShowSimDropdown(!showSimDropdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2E1E05] border border-[#D97706] text-[#F59E0B] text-xs font-semibold hover:bg-[#3d2707] transition-all"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>{t.header.simScenarios.title}</span>
              <ChevronDown className="w-3 h-3 ml-0.5" />
            </button>

            {showSimDropdown && (
              <div className="absolute right-0 mt-1.5 w-60 rounded-lg bg-[#151821] border border-[#262B3D] shadow-xl py-1 z-50 text-xs">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-[#64748B] tracking-wider border-b border-[#262B3D]">
                  {t.header.simScenarios.scenariosTitle}
                </div>
                <button
                  onClick={() => {
                    onSelectScenario('lobby');
                    setShowSimDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#1B1F2C] text-[#94A3B8] hover:text-[#F8FAFC] flex items-center justify-between"
                >
                  <span>{t.header.simScenarios.lobby}</span>
                  <span className="text-[10px] text-[#38BDF8]">LOBBY</span>
                </button>
                <button
                  onClick={() => {
                    onSelectScenario('champ_select_renekton_vs_aatrox');
                    setShowSimDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#1B1F2C] text-[#94A3B8] hover:text-[#F8FAFC] flex items-center justify-between"
                >
                  <span>{t.header.simScenarios.champSelectAatrox}</span>
                  <span className="text-[10px] text-[#F59E0B]">SELECT</span>
                </button>
                <button
                  onClick={() => {
                    onSelectScenario('in_game_vs_aatrox');
                    setShowSimDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#1B1F2C] text-[#94A3B8] hover:text-[#F8FAFC] flex items-center justify-between"
                >
                  <span>{t.header.simScenarios.inGameAatrox}</span>
                  <span className="text-[10px] text-[#10B981]">IN_GAME</span>
                </button>
                <button
                  onClick={() => {
                    onSelectScenario('in_game_vs_darius');
                    setShowSimDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#1B1F2C] text-[#94A3B8] hover:text-[#F8FAFC] flex items-center justify-between"
                >
                  <span>{t.header.simScenarios.inGameDarius}</span>
                  <span className="text-[10px] text-[#FB923C]">HARD</span>
                </button>
                <button
                  onClick={() => {
                    onSelectScenario('in_game_vs_varus');
                    setShowSimDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#1B1F2C] text-[#94A3B8] hover:text-[#F8FAFC] flex items-center justify-between"
                >
                  <span>{t.header.simScenarios.inGameVarus}</span>
                  <span className="text-[10px] text-[#EF4444]">EXTREME</span>
                </button>
                <button
                  onClick={() => {
                    onSelectScenario('post_game_victory');
                    setShowSimDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#1B1F2C] text-[#94A3B8] hover:text-[#F8FAFC] flex items-center justify-between border-t border-[#262B3D]"
                >
                  <span>{t.header.simScenarios.postGameVictory}</span>
                  <span className="text-[10px] text-[#A78BFA]">POST</span>
                </button>
                <button
                  onClick={() => {
                    onSelectScenario('disconnected');
                    setShowSimDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#1B1F2C] text-[#EF4444] flex items-center justify-between"
                >
                  <span>{t.header.simScenarios.disconnect}</span>
                  <span className="text-[10px] text-[#64748B]">OFF</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Offline Mode Toggle */}
        <button
          onClick={onToggleOfflineMode}
          className={`p-2 rounded-lg border transition-all text-xs flex items-center gap-1.5 ${
            isOfflineMode
              ? 'bg-[#2F0909] border-[#DC2626] text-[#EF4444]'
              : 'bg-[#151821] border-[#262B3D] text-[#94A3B8] hover:text-[#F8FAFC]'
          }`}
          title={isOfflineMode ? t.header.actions.offlineModeOn : t.header.actions.offlineModeOff}
        >
          {isOfflineMode ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4 text-[#10B981]" />}
        </button>

        {/* Universal Language Switcher Toggle */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#151821] hover:bg-[#262B3D] border border-[#262B3D] hover:border-[#D4A017]/40 text-xs font-bold text-[#F8FAFC] transition-all"
          title={t.header.actions.languageToggle}
        >
          <Languages className="w-3.5 h-3.5 text-[#D4A017]" />
          <span>{isPt ? '🇧🇷 PT-BR' : '🇺🇸 EN'}</span>
        </button>

        {/* Open Tier Lists Modal Button */}
        <button
          onClick={onOpenTierListsModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#151821] hover:bg-[#262B3D] border border-[#D4A017]/40 text-[#D4A017] hover:text-[#F3B72C] font-bold text-xs transition-all duration-200"
          title={t.header.actions.tierListsTitle}
        >
          <Layers className="w-4 h-4 text-[#D4A017]" />
          <span>{t.header.actions.tierLists}</span>
        </button>

        {/* Open 8 General Guides Button */}
        <button
          onClick={onOpenGuidesModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#D4A017] hover:bg-[#F3B72C] text-[#090A0C] font-bold text-xs shadow-gold-glow transition-all duration-200"
          title={t.header.actions.masterGuidesTitle}
        >
          <BookOpen className="w-4 h-4" />
          <span>{t.header.actions.masterGuides}</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
