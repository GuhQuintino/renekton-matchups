import React, { useMemo } from 'react';
import {
  Shield,
  Zap,
  Sword,
  Sparkles,
  Flame,
  BookOpen,
  ChevronRight,
  Target,
  Crosshair,
  TrendingUp,
} from 'lucide-react';
import type { MatchupDetail } from '../types';
import { DifficultyBadge } from './DifficultyBadge';
import { sortChampionsByToplaneProbability } from '../services/toplaneProbabilities';
import { getRuneRecommendationForMatchup } from '../services/runeRecommendations';
import { dataDragon } from '../services/dataDragon';
import { useLanguage } from '../i18n';

interface ChampSelectViewProps {
  potentialOpponents: string[];
  selectedOpponent?: string;
  onSelectOpponent: (championName: string) => void;
  matchupData?: MatchupDetail | null;
  onOpenFullGuide: () => void;
}

export const ChampSelectView: React.FC<ChampSelectViewProps> = ({
  potentialOpponents,
  selectedOpponent,
  onSelectOpponent,
  matchupData,
  onOpenFullGuide,
}) => {
  const { t, isEn, isPt } = useLanguage();

  // Rank enemy champions by toplane probability
  const rankedOpponents = useMemo(() => {
    return sortChampionsByToplaneProbability(potentialOpponents);
  }, [potentialOpponents]);

  // Determine active champion focused
  const activeChampionName = useMemo(() => {
    if (selectedOpponent && selectedOpponent !== 'UNKNOWN') {
      return selectedOpponent;
    }
    if (rankedOpponents.length > 0) {
      return rankedOpponents[0].championName;
    }
    return 'Aatrox';
  }, [selectedOpponent, rankedOpponents]);

  // Get tactical runes setup
  const runesSetup = useMemo(() => {
    return getRuneRecommendationForMatchup(
      activeChampionName,
      matchupData?.runesRecommendation,
      matchupData?.summonerSpells,
      matchupData?.startingItems
    );
  }, [activeChampionName, matchupData]);

  // DeepLoL advantage stats if present
  const deepLol = matchupData?.deepLol;

  return (
    <div className="flex-1 h-full flex flex-col bg-[#090A0C] text-[#F8FAFC] overflow-y-auto custom-scrollbar p-6 space-y-6">
      {/* Top Banner: Status & Enemy Picks Draft Selector */}
      <div className="rounded-2xl bg-gradient-to-r from-[#151821] via-[#1A1D28] to-[#151821] border border-[#D4A017]/30 p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4A017]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#2E1E05] border border-[#D97706] flex items-center justify-center shadow-gold-glow">
              <Shield className="w-6 h-6 text-[#F59E0B]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#D4A017]/20 border border-[#D4A017]/50 text-[#D4A017] text-[10px] font-black uppercase tracking-wider">
                  {t.champSelect.phaseBadge}
                </span>
                <span className="text-xs text-[#10B981] font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                  {isEn ? 'Renekton Locked' : 'Renekton Lockado'}
                </span>
              </div>
              <h1 className="text-2xl font-black text-[#F8FAFC] tracking-tight mt-0.5">
                {t.champSelect.title}
              </h1>
            </div>
          </div>

          {/* Quick Action Button */}
          <button
            onClick={onOpenFullGuide}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4A017] hover:bg-[#F3B72C] text-[#090A0C] font-black text-xs transition-all duration-200 shadow-gold-glow self-start md:self-auto"
          >
            <BookOpen className="w-4 h-4" />
            <span>{t.champSelect.viewFullGuide}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Revealed Enemy Picks Bar */}
        <div className="mt-5 pt-4 border-t border-[#262B3D]/80">
          <div className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-[#D4A017]" />
              {t.champSelect.candidatesTitle} ({rankedOpponents.length})
            </span>
            <span className="text-[11px] text-[#64748B] normal-case">
              {isEn
                ? 'Ranked by probability of going Toplane vs Renekton'
                : 'Ordenados por probabilidade de irem Top contra Renekton'}
            </span>
          </div>

          {rankedOpponents.length === 0 ? (
            <div className="p-4 rounded-xl bg-[#12141A] border border-[#262B3D] text-center text-xs text-[#94A3B8]">
              {isEn
                ? 'Awaiting enemy team draft picks...'
                : 'Aguardando picks do time adversário...'}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {rankedOpponents.map((opp) => {
                const isSelected = opp.championName.toLowerCase() === activeChampionName.toLowerCase();
                const iconUrl = dataDragon.getChampionIconUrl(opp.championName);

                return (
                  <button
                    key={opp.championName}
                    onClick={() => onSelectOpponent(opp.championName)}
                    className={`relative p-2.5 rounded-xl border flex items-center gap-3 transition-all duration-200 text-left ${
                      isSelected
                        ? 'bg-[#2E1E05] border-[#D4A017] shadow-gold-glow scale-[1.02]'
                        : 'bg-[#12141A] border-[#262B3D] hover:bg-[#1B1F2C] hover:border-[#3B4254]'
                    }`}
                  >
                    <img
                      src={iconUrl}
                      alt={opp.championName}
                      className={`w-11 h-11 rounded-lg object-cover border ${
                        isSelected ? 'border-[#D4A017]' : 'border-[#262B3D]'
                      }`}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-[#F8FAFC] truncate">
                        {opp.championName}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                            opp.isLikelyToplaner
                              ? 'bg-[#10B981]/20 text-[#10B981]'
                              : opp.probability > 30
                              ? 'bg-[#F59E0B]/20 text-[#F59E0B]'
                              : 'bg-[#64748B]/20 text-[#94A3B8]'
                          }`}
                        >
                          {opp.probability}% Top
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-[#D4A017] animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Focus: Matchup Preparation Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col (5 cols): Champion Profile & Early Strategy */}
        <div className="lg:col-span-5 space-y-6">
          {/* Opponent Card Header */}
          <div className="p-5 rounded-2xl bg-[#151821] border border-[#262B3D] relative overflow-hidden">
            <div className="flex items-start gap-4">
              <img
                src={dataDragon.getChampionIconUrl(activeChampionName)}
                alt={activeChampionName}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-[#D4A017] shadow-md"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl font-black text-[#F8FAFC]">
                    vs {activeChampionName}
                  </h2>
                  {matchupData && (
                    <DifficultyBadge
                      tier={matchupData.difficultyTier}
                      rating={matchupData.difficultyRating}
                      size="sm"
                    />
                  )}
                </div>
                <p className="text-xs text-[#94A3B8] mt-1">
                  {matchupData?.roles ? matchupData.roles.join(', ') : (isEn ? 'Top Laner' : 'Oponente Toplane')}
                </p>

                {/* DeepLoL Quick Stats */}
                {deepLol && deepLol.hasData && deepLol.stats && (
                  <div className="mt-3 flex items-center gap-3 text-xs bg-[#0F1015] p-2 rounded-lg border border-[#262B3D]">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-[#10B981]" />
                      <span className="text-[#94A3B8]">Win Rate:</span>
                      <span className="font-bold text-[#10B981]">
                        {deepLol.stats.renektonWinRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-[#64748B]">•</div>
                    <div className="text-[11px] text-[#94A3B8]">
                      {deepLol.stats.sampleSize} {isEn ? 'matches (KR Challenger/Master)' : 'jogos (KR Challenger/Master)'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Level Advantage 1 to 6 Matrix */}
            {deepLol && deepLol.hasData && deepLol.levelAdvantage && (
              <div className="mt-4 pt-4 border-t border-[#262B3D]">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-2 flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-[#D4A017]" />
                  {t.deeplol.levelAdvantageTitle}
                </div>
                <div className="grid grid-cols-6 gap-1.5">
                  {(['lv1', 'lv2', 'lv3', 'lv4', 'lv5', 'lv6'] as const).map((lv, idx) => {
                    const matrix = deepLol.levelAdvantage;
                    const status = matrix ? matrix[lv] : 'neutral';
                    const isAdv = status === 'advantage';
                    return (
                      <div
                        key={lv}
                        className={`p-2 rounded-lg text-center border transition-all ${
                          isAdv
                            ? 'bg-[#062E22] border-[#059669] text-[#10B981]'
                            : 'bg-[#2F0909] border-[#DC2626] text-[#EF4444]'
                        }`}
                      >
                        <div className="text-[10px] font-bold text-[#94A3B8]">
                          {isEn ? `Lv ${idx + 1}` : `Nv ${idx + 1}`}
                        </div>
                        <div className="text-[11px] font-black mt-0.5">
                          {isAdv
                            ? (isEn ? 'Advantage' : 'Vantagem')
                            : (isEn ? 'Caution' : 'Cuidado')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Early Game Plan & Spells Card */}
          <div className="p-5 rounded-2xl bg-[#151821] border border-[#262B3D] space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#F8FAFC]">
              <Flame className="w-4 h-4 text-[#F59E0B]" />
              <span>{isEn ? 'Recommended Spells & Starting Items' : 'Feitiços & Itens Iniciais Recomendados'}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#0F1015] border border-[#262B3D]">
                <div className="text-[10px] uppercase font-bold text-[#94A3B8]">
                  {t.champSelect.summonerSpellsTitle}
                </div>
                <div className="text-xs font-bold text-[#F59E0B] mt-1 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
                  {runesSetup.summonerSpells.join(' + ')}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0F1015] border border-[#262B3D]">
                <div className="text-[10px] uppercase font-bold text-[#94A3B8]">
                  {t.champSelect.startingItemsTitle}
                </div>
                <div className="text-xs font-bold text-[#38BDF8] mt-1 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-[#38BDF8]" />
                  {runesSetup.startingItems}
                </div>
              </div>
            </div>

            {/* Level 1 Start */}
            <div className="p-3.5 rounded-xl bg-[#1A1D28] border border-[#3B4254]">
              <div className="flex items-center gap-2 text-xs font-bold text-[#D4A017]">
                <Sparkles className="w-3.5 h-3.5 text-[#D4A017]" />
                <span>
                  {isEn
                    ? `Level 1 Start: Skill ${matchupData?.level1Start || 'Q'}`
                    : `Início Nível 1: Habilidade ${matchupData?.level1Start || 'Q'}`}
                </span>
              </div>
              <p className="text-xs text-[#CBD5E1] mt-1 leading-relaxed">
                {isPt
                  ? matchupData?.level1ExplanationPt || runesSetup.earlyGamePlanPt
                  : matchupData?.level1ExplanationEn || runesSetup.earlyGamePlanEn || matchupData?.level1ExplanationPt}
              </p>
            </div>
          </div>
        </div>

        {/* Right Col (7 cols): Full Recommended Runes & Tactical Reasoning */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-5 rounded-2xl bg-[#151821] border border-[#D4A017]/40 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#262B3D] pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#D4A017]" />
                <h3 className="text-lg font-black text-[#F8FAFC]">
                  {t.champSelect.recommendedRunesTitle} {activeChampionName}
                </h3>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#2E1E05] border border-[#D97706] text-[#F59E0B]">
                {runesSetup.keystone}
              </span>
            </div>

            {/* Primary & Secondary Tree Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Primary Tree */}
              <div className="p-4 rounded-xl bg-[#0F1015] border border-[#262B3D] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-[#D4A017]">
                    {isEn ? `Primary Tree: ${runesSetup.keystoneTree}` : `Árvore Primária: ${runesSetup.keystoneTree}`}
                  </span>
                </div>

                {/* Keystone High-Visibility Pill */}
                <div className="p-2.5 rounded-lg bg-[#2E1E05] border border-[#D97706] flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#D4A017] text-[#090A0C] font-black text-xs flex items-center justify-center shadow-gold-glow">
                    ★
                  </div>
                  <div>
                    <div className="text-xs font-black text-[#F8FAFC]">
                      {runesSetup.keystone}
                    </div>
                    <div className="text-[10px] text-[#F59E0B]">
                      {isEn ? 'Keystone Rune' : 'Runa Essencial'}
                    </div>
                  </div>
                </div>

                {/* Minor Runes */}
                <div className="space-y-1.5">
                  {runesSetup.primaryRunes.map((rune) => (
                    <div
                      key={rune}
                      className="px-3 py-1.5 rounded-lg bg-[#151821] text-xs font-medium text-[#CBD5E1] flex items-center gap-2 border border-[#262B3D]"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4A017]" />
                      {rune}
                    </div>
                  ))}
                </div>
              </div>

              {/* Secondary Tree & Shards */}
              <div className="p-4 rounded-xl bg-[#0F1015] border border-[#262B3D] space-y-3">
                <span className="text-xs font-black uppercase text-[#38BDF8]">
                  {isEn ? `Secondary Tree: ${runesSetup.secondaryTree}` : `Árvore Secundária: ${runesSetup.secondaryTree}`}
                </span>

                <div className="space-y-1.5">
                  {runesSetup.secondaryRunes.map((rune) => (
                    <div
                      key={rune}
                      className="px-3 py-1.5 rounded-lg bg-[#151821] text-xs font-medium text-[#CBD5E1] flex items-center gap-2 border border-[#262B3D]"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
                      {rune}
                    </div>
                  ))}
                </div>

                {/* Stat Shards */}
                <div className="pt-2 border-t border-[#262B3D]">
                  <div className="text-[10px] uppercase font-bold text-[#94A3B8] mb-1.5">
                    {t.champSelect.statShards}
                  </div>
                  <div className="space-y-1">
                    {runesSetup.statShards.map((shard, i) => (
                      <div
                        key={i}
                        className="text-[11px] text-[#94A3B8] flex items-center gap-1.5"
                      >
                        <span className="w-1 h-1 rounded-full bg-[#94A3B8]" />
                        {shard}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tactical Reasoning Box */}
            <div className="p-4 rounded-xl bg-[#1A1D28] border border-[#D4A017]/30 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#D4A017]">
                <Sparkles className="w-3.5 h-3.5 text-[#D4A017]" />
                <span>
                  {isEn
                    ? `Why this setup vs ${activeChampionName}?`
                    : `Por que usar essa configuração contra ${activeChampionName}?`}
                </span>
              </div>
              <p className="text-xs text-[#E2E8F0] leading-relaxed">
                {isPt ? runesSetup.tacticalReasoningPt : runesSetup.tacticalReasoningEn || runesSetup.tacticalReasoningPt}
              </p>
            </div>

            {/* Win Condition Highlight */}
            {matchupData && (matchupData.winConditionPt || matchupData.winConditionEn) && (
              <div className="p-4 rounded-xl bg-[#062E22] border border-[#059669] space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#10B981]">
                  <Sword className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>{isEn ? 'Lane Win Condition' : 'Condição de Vitória na Rota'}</span>
                </div>
                <p className="text-xs text-[#D1FAE5] leading-relaxed">
                  {isPt
                    ? matchupData.winConditionPt || matchupData.winConditionEn
                    : matchupData.winConditionEn || matchupData.winConditionPt}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChampSelectView;
