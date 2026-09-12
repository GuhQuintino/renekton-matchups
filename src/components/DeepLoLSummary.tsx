import React, { useState } from 'react';
import type { DeepLoLData } from '../types';
import { Bot, TrendingUp, BarChart3, Sparkles, Info, Zap, ShieldAlert, Swords } from 'lucide-react';
import { useLanguage } from '../i18n';

interface DeepLoLSummaryProps {
  deepLol?: DeepLoLData;
  championName: string;
  usePortuguese?: boolean;
}

interface LevelDetail {
  key: 'lv1' | 'lv2' | 'lv3' | 'lv4' | 'lv5' | 'lv6';
  label: string;
  tipPtAdvantage: string;
  tipPtDisadvantage: string;
  tipEnAdvantage: string;
  tipEnDisadvantage: string;
}

const LEVEL_DETAILS: LevelDetail[] = [
  {
    key: 'lv1',
    label: 'Level 1',
    tipPtAdvantage: 'Vantagem inicial: Use seu Q para dar poke e empurrar a wave primeiro para garantir o Nível 2.',
    tipPtDisadvantage: 'Desvantagem: Evite trocas diretas. Foque em farmar com segurança até ter mais habilidades.',
    tipEnAdvantage: 'Early advantage: Use Q to poke and secure wave priority to reach Level 2 first.',
    tipEnDisadvantage: 'Disadvantage: Avoid direct trades. Farm safely until you unlock more abilities.',
  },
  {
    key: 'lv2',
    label: 'Level 2',
    tipPtAdvantage: 'Powerspike com 2 habilidades: Inicie trocas curtas com E+Q ou Q+W acumulando fúria.',
    tipPtDisadvantage: 'Desvantagem: O oponente possui combo forte no Nível 2. Mantenha distância e controle a onda.',
    tipEnAdvantage: '2-Spell powerspike: Initiate short trades with E+Q or Q+W while building fury.',
    tipEnDisadvantage: 'Disadvantage: Opponent has strong Level 2 kill threat. Keep distance and manage wave.',
  },
  {
    key: 'lv3',
    label: 'Level 3',
    tipPtAdvantage: 'Powerspike Máximo Básico: Kit completo (Q+W+E). Trocas com W Fortalecido vencem a maioria dos duelos.',
    tipPtDisadvantage: 'Cuidado tático: Espere o oponente gastar cooldowns chave antes de aplicar o combo E > W > Q > E2.',
    tipEnAdvantage: 'Major powerspike: Full kit unlocked (Q+W+E). Empowered W trades win almost every duel.',
    tipEnDisadvantage: 'Tactical caution: Wait for enemy key cooldowns before committing to E > W > Q > E2 combo.',
  },
  {
    key: 'lv4',
    label: 'Level 4',
    tipPtAdvantage: 'Sustentação aprimorada: Q no rank 2 aumenta o dano base e a cura em trocas estendidas.',
    tipPtDisadvantage: 'Mantenha trocas curtas: Não estenda trocas além do stun do W.',
    tipEnAdvantage: 'Enhanced sustain: Rank 2 Q increases base damage and healing in extended skirmishes.',
    tipEnDisadvantage: 'Keep trades short: Do not extend trades beyond the W stun duration.',
  },
  {
    key: 'lv5',
    label: 'Level 5',
    tipPtAdvantage: 'Pressão pré-ultimate: Force o adversário a gastar poções e prepare a wave para dive no Nível 6.',
    tipPtDisadvantage: 'Respeite a preparação de gank do adversário. Mantenha wards no rio/alcove.',
    tipEnAdvantage: 'Pre-6 pressure: Force enemy potions and set up wave bounce for a Level 6 all-in.',
    tipEnDisadvantage: 'Respect enemy gank setup. Keep river and alcove vision secured.',
  },
  {
    key: 'lv6',
    label: 'Level 6',
    tipPtAdvantage: 'Poder de Dominus (R): Ganho imediato de HP, geração contínua de Fúria e dano mágico em área para all-in e dive.',
    tipPtDisadvantage: 'Powerspike do oponente: O ultimate adversário muda a dinâmica da luta. Use seu R defensivamente ou kite.',
    tipEnAdvantage: 'Dominus (R) power: Instant HP boost, continuous fury generation and AoE magic damage for all-in/dive.',
    tipEnDisadvantage: 'Enemy ultimate spike: Enemy ultimate changes fight dynamics. Use R defensively or bait out their cooldowns.',
  },
];

export const DeepLoLSummary: React.FC<DeepLoLSummaryProps> = ({
  deepLol,
  championName,
  usePortuguese: explicitPortuguese,
}) => {
  const { t, isPt } = useLanguage();
  const usePortuguese = explicitPortuguese !== undefined ? explicitPortuguese : isPt;
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  if (!deepLol || !deepLol.hasData) {
    return (
      <div className="p-5 rounded-xl bg-[#12141C] border border-[#262B3D]/70 text-center select-none">
        <div className="flex items-center justify-center gap-2 text-[#64748B] mb-2">
          <Bot className="w-5 h-5 opacity-60" />
          <span className="text-xs font-semibold uppercase tracking-wider">{t.deeplol.title}</span>
        </div>
        <p className="text-sm text-[#94A3B8]">
          {usePortuguese ? (
            <>
              Resumo tático de IA sobre o confronto contra{' '}
              <span className="text-[#F8FAFC] font-semibold">{championName}</span> ainda está em preparação no DeepLoL.
            </>
          ) : (
            <>
              AI tactical summary for the matchup against{' '}
              <span className="text-[#F8FAFC] font-semibold">{championName}</span> is currently being prepared in DeepLoL.
            </>
          )}
        </p>
        <span className="inline-block mt-2 px-2.5 py-0.5 rounded text-[11px] bg-[#1E232F] text-[#64748B] border border-[#2B3245]">
          LLM 요약 준비 중
        </span>
      </div>
    );
  }

  const { levelAdvantage, tips, stats } = deepLol;

  // Compute powerspike summary
  let advantageLevels: number[] = [];
  let disadvantageLevels: number[] = [];
  if (levelAdvantage) {
    LEVEL_DETAILS.forEach((lvl, idx) => {
      if (levelAdvantage[lvl.key] === 'advantage') advantageLevels.push(idx + 1);
      else disadvantageLevels.push(idx + 1);
    });
  }

  return (
    <div className="rounded-xl bg-[#0F1015] border border-[#262B3D] overflow-hidden select-none shadow-card-glow">
      {/* Header Bar */}
      <div className="px-5 py-3.5 border-b border-[#262B3D] bg-[#151821]/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#064E3B]/60 border border-[#059669]/50 flex items-center justify-center text-[#34D399] shadow-sm shadow-[#10B981]/20">
            <Bot className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-[#F8FAFC] tracking-wide flex items-center gap-1.5">
                <span className="text-[#34D399]">LLM</span> Summary & Matchup Insights
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#064E3B]/80 text-[#34D399] border border-[#059669]/50 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                {t.deeplol.aiBadge}
              </span>
            </div>
            <p className="text-[11px] text-[#94A3B8]">
              {usePortuguese
                ? `Análise tática nível a nível e micro-estratégias contra ${championName}`
                : `Level-by-level tactical analysis and micro-strategies against ${championName}`}
            </p>
          </div>
        </div>

        {/* Matchup Stats */}
        {stats && stats.sampleSize > 0 && (
          <div className="flex items-center gap-4 bg-[#0A0C10] px-3.5 py-1.5 rounded-lg border border-[#262B3D]">
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-[#64748B] uppercase font-semibold">
                {t.deeplol.renektonWinRateLabel}
              </span>
              <span
                className={`text-xs font-black ${
                  stats.renektonWinRate >= 50 ? 'text-[#10B981]' : 'text-[#EF4444]'
                }`}
              >
                {stats.renektonWinRate.toFixed(2)}%
              </span>
            </div>

            <div className="h-6 w-px bg-[#262B3D]" />

            <div className="flex flex-col text-center">
              <span className="text-[10px] text-[#64748B] uppercase font-semibold flex items-center gap-1 justify-center">
                <BarChart3 className="w-3 h-3 text-[#38BDF8]" />
                {t.deeplol.sampleSizeLabel}
              </span>
              <span className="text-xs font-black text-[#38BDF8]">
                {stats.sampleSize.toLocaleString()}
              </span>
            </div>

            <div className="h-6 w-px bg-[#262B3D]" />

            <div className="flex flex-col text-left">
              <span className="text-[10px] text-[#64748B] uppercase font-semibold">
                {t.deeplol.enemyWinRateLabel}
              </span>
              <span
                className={`text-xs font-black ${
                  stats.enemyWinRate >= 50 ? 'text-[#38BDF8]' : 'text-[#94A3B8]'
                }`}
              >
                {stats.enemyWinRate.toFixed(2)}%
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="p-5 space-y-5">
        {/* Level Advantage Section */}
        {levelAdvantage && (
          <div className="bg-[#151821] rounded-xl p-4 border border-[#262B3D]/80">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#34D399] flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {t.deeplol.levelAdvantageTitle}
                </span>
                <span className="text-[10px] text-[#64748B] flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  {usePortuguese ? '(Passe o mouse sobre os níveis para dicas)' : '(Hover levels for tactical tips)'}
                </span>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-[11px] font-semibold">
                <div className="flex items-center gap-1.5 text-[#34D399]">
                  <div className="w-2.5 h-2.5 rounded-sm bg-[#34D399]" />
                  <span>{t.deeplol.renektonAdvantage}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#94A3B8]">
                  <div className="w-2.5 h-2.5 rounded-sm bg-[#22283A] border border-[#374151]" />
                  <span>{t.deeplol.enemyAdvantage}</span>
                </div>
              </div>
            </div>

            {/* Powerspike Highlight Pill */}
            {advantageLevels.length > 0 && (
              <div className="mb-3 px-3 py-1.5 rounded-lg bg-[#062E22]/60 border border-[#059669]/40 flex items-center gap-2 text-xs text-[#34D399]">
                <Zap className="w-3.5 h-3.5 flex-shrink-0 text-[#34D399]" />
                <span>
                  <strong className="text-[#F8FAFC]">
                    {usePortuguese ? 'Janela de Dominância:' : 'Dominance Window:'}
                  </strong>{' '}
                  {usePortuguese
                    ? `Renekton possui vantagem nos Níveis ${advantageLevels.join(', ')}.`
                    : `Renekton holds clear lane advantage at Levels ${advantageLevels.join(', ')}.`}
                </span>
              </div>
            )}

            {/* 6-Level Interactive Grid with Tooltips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {LEVEL_DETAILS.map((lvl) => {
                const status = levelAdvantage[lvl.key];
                const isAdvantage = status === 'advantage';
                const tooltipText = usePortuguese
                  ? isAdvantage
                    ? lvl.tipPtAdvantage
                    : lvl.tipPtDisadvantage
                  : isAdvantage
                  ? lvl.tipEnAdvantage
                  : lvl.tipEnDisadvantage;

                const isHovered = activeTooltip === lvl.key;

                return (
                  <div
                    key={lvl.key}
                    onMouseEnter={() => setActiveTooltip(lvl.key)}
                    onMouseLeave={() => setActiveTooltip(null)}
                    className={`relative py-2.5 px-3 rounded-lg text-center font-extrabold text-xs transition-all duration-200 cursor-pointer group ${
                      isAdvantage
                        ? 'bg-[#34D399] text-[#064E3B] shadow-sm shadow-[#34D399]/20 font-black border border-[#34D399] hover:bg-[#10B981] hover:scale-[1.03]'
                        : 'bg-[#22283A] text-[#94A3B8] border border-[#2B3245] hover:border-[#38425C] hover:scale-[1.03]'
                    }`}
                  >
                    <div className="text-[11px] tracking-wide flex items-center justify-center gap-1">
                      {lvl.label}
                    </div>
                    <div className="text-[10px] uppercase font-bold mt-0.5 opacity-90">
                      {isAdvantage
                        ? usePortuguese
                          ? 'Vantagem'
                          : 'Advantage'
                        : usePortuguese
                        ? 'Desvantagem'
                        : 'Disadvantage'}
                    </div>

                    {/* Tooltip Overlay */}
                    {isHovered && (
                      <div className="absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 rounded-lg bg-[#0A0C10] border border-[#34D399]/60 shadow-xl text-left pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-1 text-[#34D399]">
                          {isAdvantage ? (
                            <>
                              <Swords className="w-3 h-3 text-[#34D399]" />
                              <span>{lvl.label} • {usePortuguese ? 'Vantagem Renekton' : 'Renekton Spike'}</span>
                            </>
                          ) : (
                            <>
                              <ShieldAlert className="w-3 h-3 text-[#EF4444]" />
                              <span>{lvl.label} • {usePortuguese ? 'Cuidado Redobrado' : 'Caution Window'}</span>
                            </>
                          )}
                        </div>
                        <p className="text-[11px] font-normal leading-relaxed text-[#F8FAFC]">
                          {tooltipText}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tactical Tips Cards */}
        {tips && tips.length > 0 && (
          <div className="space-y-3">
            {tips.map((tip, idx) => {
              const title = usePortuguese ? tip.titlePt || tip.titleEn : tip.titleEn || tip.titlePt;
              const content = usePortuguese ? tip.contentPt || tip.contentEn : tip.contentEn || tip.contentPt;

              return (
                <div
                  key={idx}
                  className="bg-[#151821] rounded-xl p-4 border border-[#262B3D] hover:border-[#38425C] transition-all duration-200"
                >
                  {/* Badge Header */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#0D3331] border border-[#0F766E]/40 text-[#2DD4BF] text-xs font-bold mb-2.5">
                    <span>{title}</span>
                  </div>

                  {/* Content Paragraph */}
                  <p className="text-xs md:text-sm text-[#E2E8F0] leading-relaxed">
                    {content}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeepLoLSummary;