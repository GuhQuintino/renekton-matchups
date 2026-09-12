import React, { useState } from 'react';
import {
  Swords,
  Clock,
  Zap,
  Shield,
  Flame,
  BookOpen,
  Video,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import type { MatchupDetail } from '../types';
import { DifficultyBadge } from './DifficultyBadge';
import { MatchupView } from './MatchupView';
import { dataDragon } from '../services/dataDragon';
import { useLanguage } from '../i18n';

interface InGameHUDViewProps {
  opponentChampion: string;
  opponentConfidence?: number;
  gameTimeSeconds?: number;
  matchupData?: MatchupDetail | null;
  isLoading?: boolean;
  onLaneSwap: (newChampion: string) => void;
  availableChampions?: string[];
}

export type HUDTab = 'FAST_HUD' | 'FULL_GUIDE' | 'VIDEOS';

export const InGameHUDView: React.FC<InGameHUDViewProps> = ({
  opponentChampion,
  opponentConfidence = 95,
  gameTimeSeconds = 0,
  matchupData,
  isLoading = false,
  onLaneSwap,
  availableChampions = [],
}) => {
  const [activeTab, setActiveTab] = useState<HUDTab>('FAST_HUD');
  const [showLaneSwapDropdown, setShowLaneSwapDropdown] = useState<boolean>(false);
  const { t, isEn, isPt } = useLanguage();

  // Format game time mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainderSecs.toString().padStart(2, '0')}`;
  };

  const deepLol = matchupData?.deepLol;
  const iconUrl = dataDragon.getChampionIconUrl(opponentChampion);

  return (
    <div className="flex-1 h-full flex flex-col bg-[#090A0C] text-[#F8FAFC] overflow-hidden">
      {/* Top Live HUD Header Bar */}
      <div className="h-16 px-6 bg-[#0F1015] border-b border-[#262B3D] flex items-center justify-between z-10 select-none shadow-md">
        {/* Left: Opponent Pill & Game Status */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={iconUrl}
              alt={opponentChampion}
              className="w-10 h-10 rounded-xl object-cover border-2 border-[#10B981] shadow-emerald-glow"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#10B981] border-2 border-[#090A0C] flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F8FAFC] animate-pulse" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-[#F8FAFC]">
                vs {opponentChampion}
              </span>
              {matchupData && (
                <DifficultyBadge
                  tier={matchupData.difficultyTier}
                  rating={matchupData.difficultyRating}
                  size="sm"
                />
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#94A3B8]">
              <span className="text-[#10B981] font-semibold flex items-center gap-1">
                <Swords className="w-3 h-3" />
                {isEn ? 'Live Match Tracking' : 'Em Partida Ao Vivo'}
              </span>
              <span>•</span>
              <span>{isEn ? 'Confidence' : 'Confiança'}: {opponentConfidence}%</span>
            </div>
          </div>

          {/* Lane Swap Manual Selector */}
          <div className="relative ml-2">
            <button
              onClick={() => setShowLaneSwapDropdown(!showLaneSwapDropdown)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#151821] hover:bg-[#262B3D] border border-[#262B3D] text-[11px] text-[#94A3B8] hover:text-[#F8FAFC] transition-all"
              title={isEn ? 'Swap opponent in case of lane swap' : 'Trocar oponente caso tenha havido Lane Swap'}
            >
              <RefreshCw className="w-3 h-3 text-[#D4A017]" />
              <span>{t.inGameHUD.laneSwap.button}</span>
            </button>

            {showLaneSwapDropdown && (
              <div className="absolute left-0 mt-1.5 w-48 rounded-xl bg-[#151821] border border-[#262B3D] shadow-2xl py-1 z-50 text-xs">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-[#64748B] border-b border-[#262B3D]">
                  {t.inGameHUD.laneSwap.title}
                </div>
                {['Darius', 'Aatrox', 'Fiora', 'Camille', 'Jax', 'Garen', 'Sett', 'Malphite'].map(
                  (champ) => (
                    <button
                      key={champ}
                      onClick={() => {
                        onLaneSwap(champ);
                        setShowLaneSwapDropdown(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-[#1B1F2C] text-[#CBD5E1] hover:text-[#F8FAFC] flex items-center justify-between"
                    >
                      <span>{champ}</span>
                      {champ.toLowerCase() === opponentChampion.toLowerCase() && (
                        <span className="text-[10px] text-[#10B981] font-bold">
                          {isEn ? 'ACTIVE' : 'ATUAL'}
                        </span>
                      )}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* Center: Live Timer */}
        <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#151821] border border-[#262B3D] text-xs font-bold text-[#CBD5E1]">
          <Clock className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>{t.inGameHUD.liveTimer}:</span>
          <span className="font-mono text-[#F8FAFC] text-sm font-black">
            {formatTime(gameTimeSeconds)}
          </span>
        </div>

        {/* Right: Tab Mode Selector */}
        <div className="flex items-center bg-[#151821] border border-[#262B3D] rounded-xl p-0.5 text-xs font-semibold text-[#94A3B8]">
          <button
            onClick={() => setActiveTab('FAST_HUD')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'FAST_HUD'
                ? 'bg-[#D4A017] text-[#090A0C] font-black shadow-gold-glow'
                : 'hover:text-[#F8FAFC]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{t.inGameHUD.tabs.fastHud}</span>
          </button>
          <button
            onClick={() => setActiveTab('FULL_GUIDE')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'FULL_GUIDE'
                ? 'bg-[#262B3D] text-[#F8FAFC] font-bold'
                : 'hover:text-[#F8FAFC]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>{t.inGameHUD.tabs.fullGuide}</span>
          </button>
          <button
            onClick={() => setActiveTab('VIDEOS')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'VIDEOS'
                ? 'bg-[#262B3D] text-[#F8FAFC] font-bold'
                : 'hover:text-[#F8FAFC]'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>{t.inGameHUD.tabs.videos}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'FAST_HUD' && (
          <div className="p-6 space-y-6 max-w-6xl mx-auto">
            {/* Critical Win Condition & Caution Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Win Condition */}
              <div className="p-4 rounded-2xl bg-[#062E22] border border-[#059669] space-y-1.5 shadow-lg">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#10B981]">
                  <Zap className="w-4 h-4 text-[#10B981]" />
                  <span>{isEn ? 'Lane Win Condition' : 'Condição de Vitória na Rota'}</span>
                </div>
                <p className="text-xs text-[#D1FAE5] leading-relaxed">
                  {(isPt ? matchupData?.winConditionPt : matchupData?.winConditionEn || matchupData?.winConditionPt) ||
                    (isEn
                      ? 'Trade short with E > AA > Empowered W > Q > E out to whittle HP; force all-in with Ult and 50+ Fury.'
                      : 'Faça trocas curtas com E > Auto > W Fortalecido > Q > E out para baixar o HP do adversário; force all-in com Ult e Fúria 50+.')}
                </p>
              </div>

              {/* Caution / Threat */}
              <div className="p-4 rounded-2xl bg-[#2F0909] border border-[#DC2626] space-y-1.5 shadow-lg">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#EF4444]">
                  <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
                  <span>{isEn ? 'Caution & Danger Windows' : 'Atenção & Janelas de Perigo'}</span>
                </div>
                <p className="text-xs text-[#FCA5A5] leading-relaxed">
                  {(isPt ? matchupData?.cautionPt : matchupData?.cautionEn || matchupData?.cautionPt) ||
                    (isEn
                      ? 'Avoid extended trades without fury; respect enemy poke and crowd control in early levels.'
                      : 'Cuidado com trocas estendidas sem fúria e respeite o poke e controle de grupo inimigo nos níveis iniciais.')}
                </p>
              </div>
            </div>

            {/* Tactical Preparation Row: Starting Items + Ability Level Order + Compact Level Curve */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* 1. Recommended Starting Item Card (4 cols) */}
              <div className="lg:col-span-4 p-4 rounded-2xl bg-[#151821] border border-[#262B3D] flex flex-col justify-between shadow-md">
                <div>
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#D4A017] mb-2.5">
                    <Shield className="w-4 h-4 text-[#D4A017]" />
                    <span>{isEn ? 'Recommended Starting Item' : 'Item Inicial Recomendado'}</span>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#0F1015] border border-[#262B3D]">
                    {/* Item Icons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {(() => {
                        const raw = (matchupData?.startingItems || '').toLowerCase();
                        const isShield = raw.includes('shield') || raw.includes('escudo');
                        const isSword = raw.includes('long sword') || raw.includes('espada longa');
                        const isRefillable = raw.includes('refillable') || raw.includes('refilável');

                        const mainItemId = isShield ? 1054 : isSword ? 1036 : 1055;
                        const potItemId = isRefillable ? 2031 : 2003;

                        return (
                          <>
                            <img
                              src={dataDragon.getItemIconUrl(mainItemId)}
                              alt="Main Item"
                              className="w-9 h-9 rounded-lg border border-[#D4A017] shadow-sm object-cover"
                            />
                            <span className="text-[#64748B] text-xs font-bold">+</span>
                            <img
                              src={dataDragon.getItemIconUrl(potItemId)}
                              alt="Potion"
                              className="w-9 h-9 rounded-lg border border-[#262B3D] shadow-sm object-cover"
                            />
                          </>
                        );
                      })()}
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs font-black text-[#F8FAFC] truncate">
                        {matchupData?.startingItems || "Doran's Shield + Health Potion"}
                      </div>
                      <div className="text-[11px] text-[#94A3B8] leading-tight mt-0.5">
                        {(() => {
                          const raw = (matchupData?.startingItems || '').toLowerCase();
                          if (raw.includes('shield') || raw.includes('escudo')) {
                            return isEn
                              ? 'Health regen against poke and sustained damage mitigation.'
                              : 'Regeneração contra poke e mitigação de dano contínuo.';
                          } else if (raw.includes('blade') || raw.includes('espada de doran')) {
                            return isEn
                              ? 'Maximum AD, health, and omnivamp for heavy early trades.'
                              : 'Dano máximo, vida e vampirismo para trocas fortes.';
                          }
                          return isEn
                            ? 'Safe standard start for sustain and balanced damage curve.'
                            : 'Início padrão seguro para sustento e curva de dano.';
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-[#64748B] mt-2 flex items-center justify-between border-t border-[#262B3D]/50 pt-2">
                  <span>
                    {isEn ? 'Spells: ' : 'Feitiços: '}
                    <strong className="text-[#CBD5E1]">{matchupData?.summonerSpells || 'Flash + Ignite'}</strong>
                  </span>
                  <span>
                    Max: <strong className="text-[#D4A017]">{matchupData?.abilityMaxOrder || 'Q > E > W'}</strong>
                  </span>
                </div>
              </div>

              {/* 2. Ability Level Order Icons (Níveis 1 a 6) (5 cols) */}
              <div className="lg:col-span-5 p-4 rounded-2xl bg-[#151821] border border-[#262B3D] flex flex-col justify-between shadow-md">
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#38BDF8]">
                      <Zap className="w-4 h-4 text-[#38BDF8]" />
                      <span>{isEn ? 'Skills (Levels 1 to 6)' : 'Habilidades (Níveis 1 a 6)'}</span>
                    </div>
                    <span className="text-[11px] font-bold text-[#D4A017] bg-[#1E1B13] border border-[#713F12] px-2 py-0.5 rounded-md">
                      {isEn ? 'Order: ' : 'Ordem: '}{matchupData?.abilityMaxOrder || 'Q > E > W'}
                    </span>
                  </div>

                  {/* 6 Skill Slots Grid */}
                  <div className="grid grid-cols-6 gap-2">
                    {(() => {
                      const startRaw = matchupData?.level1Start || 'Q';
                      const lv1: 'Q' | 'W' | 'E' = startRaw.startsWith('E') ? 'E' : startRaw === 'W' ? 'W' : 'Q';
                      const lv2: 'Q' | 'W' | 'E' = lv1 === 'Q' ? 'E' : lv1 === 'W' ? 'E' : 'Q';
                      const lv3: 'Q' | 'W' | 'E' = lv1 === 'W' ? 'Q' : 'W';
                      const lv4: 'Q' | 'W' | 'E' = 'Q';
                      const lv5: 'Q' | 'W' | 'E' = 'Q';
                      const lv6: 'R' = 'R';

                      const skills = [
                        { level: 1, key: lv1 },
                        { level: 2, key: lv2 },
                        { level: 3, key: lv3 },
                        { level: 4, key: lv4 },
                        { level: 5, key: lv5 },
                        { level: 6, key: lv6 },
                      ];

                      return skills.map((s) => (
                        <div
                          key={s.level}
                          className={`flex flex-col items-center p-1.5 rounded-xl border transition-all ${
                            s.key === 'R'
                              ? 'bg-[#2A173B] border-[#A855F7] shadow-purple-glow'
                              : s.level === 1
                              ? 'bg-[#1E1B13] border-[#D4A017]'
                              : 'bg-[#0F1015] border-[#262B3D]'
                          }`}
                        >
                          <span className="text-[10px] font-black text-[#94A3B8] mb-1">
                            Lv {s.level}
                          </span>
                          <img
                            src={dataDragon.getRenektonSpellIconUrl(s.key as any)}
                            alt={`Skill ${s.key}`}
                            className="w-7 h-7 rounded-lg object-cover border border-[#262B3D]"
                          />
                          <span
                            className={`text-xs font-black mt-1 ${
                              s.key === 'R'
                                ? 'text-[#C084FC]'
                                : s.key === 'Q'
                                ? 'text-[#10B981]'
                                : s.key === 'W'
                                ? 'text-[#EF4444]'
                                : 'text-[#38BDF8]'
                            }`}
                          >
                            {s.key}
                          </span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                <div className="text-[11px] text-[#94A3B8] mt-2 border-t border-[#262B3D]/50 pt-2 truncate">
                  {isEn ? 'Level 1 Start: ' : 'Start Nível 1: '}
                  <strong className="text-[#F8FAFC]">{matchupData?.level1Start || 'Q'}</strong>
                  {' — '}
                  {isPt
                    ? matchupData?.level1ExplanationPt || 'Seguir estratégia de início'
                    : matchupData?.level1ExplanationEn || 'Secure first 3 minions safely'}
                </div>
              </div>

              {/* 3. Compact Level Advantage Curve (3 cols) */}
              <div className="lg:col-span-3 p-4 rounded-2xl bg-[#151821] border border-[#262B3D] flex flex-col justify-between shadow-md">
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#10B981]">
                      <TrendingUp className="w-4 h-4 text-[#10B981]" />
                      <span>{isEn ? 'Advantage (1-6)' : 'Vantagem (1-6)'}</span>
                    </div>
                    {deepLol?.stats && (
                      <span className="text-[10px] text-[#10B981] font-bold">
                        {deepLol.stats.renektonWinRate.toFixed(1)}% WR
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {(['lv1', 'lv2', 'lv3', 'lv4', 'lv5', 'lv6'] as const).map((lv, idx) => {
                      const matrix = deepLol?.levelAdvantage;
                      const status = matrix ? matrix[lv] : idx < 2 ? 'disadvantage' : 'advantage';
                      const isAdv = status === 'advantage';
                      return (
                        <div
                          key={lv}
                          className={`p-1.5 rounded-lg text-center border ${
                            isAdv
                              ? 'bg-[#062E22] border-[#059669] text-[#10B981]'
                              : 'bg-[#2F0909] border-[#DC2626] text-[#EF4444]'
                          }`}
                        >
                          <div className="text-[9px] font-bold text-[#CBD5E1]">
                            {isEn ? `Lv ${idx + 1}` : `Nv ${idx + 1}`}
                          </div>
                          <div className="text-[10px] font-black uppercase">
                            {isAdv
                              ? isEn
                                ? 'Advantage'
                                : 'Vantagem'
                              : isEn
                              ? 'Caution'
                              : 'Cuidado'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="text-[10px] text-[#64748B] text-center mt-2 border-t border-[#262B3D]/50 pt-1.5">
                  {isEn ? 'Dominant power spike from Lv 3/6' : 'Power spike dominante a partir do Nv 3/6'}
                </div>
              </div>
            </div>

            {/* Strategic Summary by Level (Níveis 1, 2-3, 6) */}
            <div className="p-5 rounded-2xl bg-[#151821] border border-[#262B3D] space-y-3 shadow-md">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#F8FAFC]">
                <BookOpen className="w-4 h-4 text-[#D4A017]" />
                <span>
                  {isEn
                    ? `Strategy & Decision Windows by Level vs ${opponentChampion}`
                    : `Estratégia & Janelas de Decisão por Nível vs ${opponentChampion}`}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Level 1 Strategy */}
                <div className="p-3.5 rounded-xl bg-[#0F1015] border border-[#262B3D] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-black text-[#D4A017]">
                    <span className="w-2 h-2 rounded-full bg-[#D4A017]" />
                    <span>{isEn ? 'Level 1 (Early & Wave)' : 'Nível 1 (Início & Wave)'}</span>
                  </div>
                  <p className="text-xs text-[#CBD5E1] leading-relaxed">
                    {(isPt ? matchupData?.level1ExplanationPt : matchupData?.level1ExplanationEn || matchupData?.level1ExplanationPt) ||
                      (isEn
                        ? 'Collect first 3 melee minions safely with Q or auto without taking free damage. Do not bleed HP early.'
                        : 'Colete os primeiros 3 minions com Q ou auto seguro sem levar dano gratuito. Não gaste fúria na wave desnecessariamente.')}
                  </p>
                </div>

                {/* Level 2-3 Strategy */}
                <div className="p-3.5 rounded-xl bg-[#0F1015] border border-[#262B3D] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-black text-[#38BDF8]">
                    <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                    <span>{isEn ? 'Levels 2 & 3 (Short Trade & Fury)' : 'Níveis 2 e 3 (Troca Curta & Fúria)'}</span>
                  </div>
                  <p className="text-xs text-[#CBD5E1] leading-relaxed">
                    {isEn
                      ? 'With full kit and 50+ Fury, execute E1 onto minion > Auto > Empowered W (1.5s stun) > Q > E2 out.'
                      : 'Com kit completo e Fúria 50+, use E1 no minion > Auto > W Fortalecido (1.5s stun) > Q > E2 para sair sem retaliação.'}
                  </p>
                </div>

                {/* Level 6 Strategy */}
                <div className="p-3.5 rounded-xl bg-[#0F1015] border border-[#262B3D] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-black text-[#C084FC]">
                    <span className="w-2 h-2 rounded-full bg-[#C084FC]" />
                    <span>{isEn ? 'Level 6 (All-in with Dominus)' : 'Nível 6 (All-in com Dominus)'}</span>
                  </div>
                  <p className="text-xs text-[#CBD5E1] leading-relaxed">
                    {isEn
                      ? 'Pre-cast Dominus (R) before engaging to build continuous fury. When enemy is below 65% HP, execute all-in.'
                      : 'Ative Dominus (R) antes de entrar para acumular fúria contínua. Com o adversário abaixo de 65% de HP, execute all-in com Flash + Ignite.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Challenger Tactical Tips & Compact Combos */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* DeepLoL Challenger Tips (8 cols) */}
              <div className="md:col-span-8 p-5 rounded-2xl bg-[#151821] border border-[#262B3D] space-y-3 shadow-md">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#D4A017]">
                  <Sparkles className="w-4 h-4 text-[#D4A017]" />
                  <span>{isEn ? 'Challenger Tactical Tips (DeepLoL AI)' : 'Dicas Táticas Challenger (DeepLoL AI)'}</span>
                </div>

                {deepLol && deepLol.hasData && deepLol.tips && deepLol.tips.length > 0 ? (
                  <div className="space-y-2.5">
                    {deepLol.tips.map((tip, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#0F1015] border border-[#262B3D] space-y-1"
                      >
                        <div className="text-xs font-bold text-[#D4A017]">
                          {isPt ? tip.titlePt || tip.titleEn : tip.titleEn || tip.titlePt}
                        </div>
                        <p className="text-xs text-[#CBD5E1] leading-relaxed">
                          {isPt ? tip.contentPt || tip.contentEn : tip.contentEn || tip.contentPt}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-[#0F1015] border border-[#262B3D] text-xs text-[#CBD5E1]">
                    {(isPt ? matchupData?.summaryPt : matchupData?.summaryEn || matchupData?.summaryPt) ||
                      (isEn
                        ? 'Keep fury above 50 before trading and respect enemy cooldowns in lane.'
                        : 'Mantenha Fúria acima de 50 antes de iniciar trocas e respeite os cooldowns inimigos na rota.')}
                  </div>
                )}
              </div>

              {/* Compact Trading Combos (4 cols) */}
              <div className="md:col-span-4 p-5 rounded-2xl bg-[#151821] border border-[#262B3D] space-y-3 shadow-md">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#F59E0B]">
                  <Flame className="w-4 h-4 text-[#F59E0B]" />
                  <span>{isEn ? 'Trading Combos' : 'Combos de Troca'}</span>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-[#0F1015] border border-[#262B3D]">
                    <div className="text-[11px] font-black text-[#D4A017] mb-0.5">
                      {isEn ? 'Standard Trade (50+ Fury):' : 'Troca Padrão (Fúria 50+):'}
                    </div>
                    <div className="font-mono text-xs font-bold text-[#F8FAFC]">
                      E1 ➔ Auto ➔ W (50F) ➔ Q ➔ E2
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0F1015] border border-[#262B3D]">
                    <div className="text-[11px] font-black text-[#EF4444] mb-0.5">
                      {isEn ? 'Level 6+ All-in:' : 'All-in Nível 6+:'}
                    </div>
                    <div className="font-mono text-xs font-bold text-[#F8FAFC]">
                      R ➔ E1 ➔ Flash + W (50F) ➔ Auto ➔ Q ➔ Ignite ➔ E2
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'FULL_GUIDE' && (
          <div className="h-full">
            <MatchupView matchup={matchupData || undefined} isLoading={isLoading} />
          </div>
        )}

        {activeTab === 'VIDEOS' && (
          <div className="p-6 space-y-6 max-w-4xl mx-auto">
            <div className="p-5 rounded-2xl bg-[#151821] border border-[#262B3D] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-base font-black text-[#F8FAFC]">
                  <Video className="w-5 h-5 text-[#F59E0B]" />
                  <span>
                    {isEn
                      ? `Matchup Video: Renekton vs ${opponentChampion}`
                      : `Vídeo da Matchup: Renekton vs ${opponentChampion}`}
                  </span>
                </div>
                {matchupData?.videoUrl && (
                  <a
                    href={matchupData.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-[#D4A017] hover:text-[#F3B72C] font-bold"
                  >
                    <span>{t.matchupTabs.watchOnYoutube}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {matchupData?.hasVideo && matchupData.videoId ? (
                <div className="aspect-video w-full rounded-xl overflow-hidden border border-[#262B3D] shadow-xl bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${matchupData.videoId}?autoplay=0&rel=0`}
                    title={matchupData.videoTitle || `Renekton vs ${opponentChampion}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <div className="p-8 rounded-xl bg-[#0F1015] border border-[#262B3D] text-center space-y-2">
                  <Video className="w-8 h-8 text-[#64748B] mx-auto" />
                  <div className="text-sm font-bold text-[#F8FAFC]">
                    {isEn ? 'Dedicated video in preparation' : 'Vídeo dedicado em preparação'}
                  </div>
                  <p className="text-xs text-[#94A3B8]">
                    {isEn
                      ? 'Refer to Quick Tips and Full Guide tabs for detailed tactical execution.'
                      : 'Consulte as abas Guia Resumido e Guia Completo para todas as instruções detalhadas.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InGameHUDView;
