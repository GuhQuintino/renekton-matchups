import fs from 'fs';

const tsxContent = `import React from 'react';
import type { DeepLoLData } from '../types';
import { Bot, TrendingUp, BarChart3, Sparkles } from 'lucide-react';

interface DeepLoLSummaryProps {
  deepLol?: DeepLoLData;
  championName: string;
  usePortuguese?: boolean;
}

export const DeepLoLSummary: React.FC<DeepLoLSummaryProps> = ({
  deepLol,
  championName,
  usePortuguese = true,
}) => {
  if (!deepLol || !deepLol.hasData) {
    return (
      <div className="p-5 rounded-xl bg-[#12141C] border border-[#262B3D]/70 text-center select-none">
        <div className="flex items-center justify-center gap-2 text-[#64748B] mb-2">
          <Bot className="w-5 h-5 opacity-60" />
          <span className="text-xs font-semibold uppercase tracking-wider">DeepLoL AI Summary</span>
        </div>
        <p className="text-sm text-[#94A3B8]">
          Resumo tático de IA sobre o confronto contra <span className="text-[#F8FAFC] font-semibold">{championName}</span> ainda está em preparação no DeepLoL.
        </p>
        <span className="inline-block mt-2 px-2.5 py-0.5 rounded text-[11px] bg-[#1E232F] text-[#64748B] border border-[#2B3245]">
          LLM 요약 준비 중
        </span>
      </div>
    );
  }

  const { levelAdvantage, tips, stats } = deepLol;

  const levels: Array<{ key: 'lv1' | 'lv2' | 'lv3' | 'lv4' | 'lv5' | 'lv6'; label: string }> = [
    { key: 'lv1', label: 'Level 1' },
    { key: 'lv2', label: 'Level 2' },
    { key: 'lv3', label: 'Level 3' },
    { key: 'lv4', label: 'Level 4' },
    { key: 'lv5', label: 'Level 5' },
    { key: 'lv6', label: 'Level 6' },
  ];

  return (
    <div className="rounded-xl bg-[#0F1015] border border-[#262B3D] overflow-hidden select-none">
      {/* Header Bar */}
      <div className="px-5 py-3.5 border-b border-[#262B3D] bg-[#151821]/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#064E3B]/60 border border-[#059669]/40 flex items-center justify-center text-[#34D399]">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-[#F8FAFC] tracking-wide flex items-center gap-1.5">
                <span className="text-[#34D399]">LLM</span> Summary & Matchup Insights
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#064E3B]/80 text-[#34D399] border border-[#059669]/50 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                DeepLoL AI
              </span>
            </div>
            <p className="text-[11px] text-[#94A3B8]">
              Análise tática nível a nível e micro-estratégias contra {championName}
            </p>
          </div>
        </div>

        {/* Matchup Stats */}
        {stats && stats.sampleSize > 0 && (
          <div className="flex items-center gap-4 bg-[#0A0C10] px-3.5 py-1.5 rounded-lg border border-[#262B3D]">
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-[#64748B] uppercase font-semibold">Win Rate Renekton</span>
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
                Amostra
              </span>
              <span className="text-xs font-black text-[#38BDF8]">
                {stats.sampleSize.toLocaleString()}
              </span>
            </div>

            <div className="h-6 w-px bg-[#262B3D]" />

            <div className="flex flex-col text-left">
              <span className="text-[10px] text-[#64748B] uppercase font-semibold">Win Rate {championName}</span>
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
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#34D399] flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Level Advantage (Poder por Nível)
                </span>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-[11px] font-semibold">
                <div className="flex items-center gap-1.5 text-[#34D399]">
                  <div className="w-2.5 h-2.5 rounded-sm bg-[#34D399]" />
                  <span>Advantages (Vantagem)</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#94A3B8]">
                  <div className="w-2.5 h-2.5 rounded-sm bg-[#22283A] border border-[#374151]" />
                  <span>Disadvantages (Desvantagem)</span>
                </div>
              </div>
            </div>

            {/* 6-Level Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {levels.map(({ key, label }) => {
                const status = levelAdvantage[key];
                const isAdvantage = status === 'advantage';

                return (
                  <div
                    key={key}
                    className={`py-2.5 px-3 rounded-lg text-center font-extrabold text-xs transition-all duration-200 ${
                      isAdvantage
                        ? 'bg-[#34D399] text-[#064E3B] shadow-sm shadow-[#34D399]/20 font-black border border-[#34D399]'
                        : 'bg-[#22283A] text-[#94A3B8] border border-[#2B3245]'
                    }`}
                  >
                    <div className="text-[11px] tracking-wide">{label}</div>
                    <div className="text-[10px] uppercase font-bold mt-0.5 opacity-90">
                      {isAdvantage ? (usePortuguese ? 'Vantagem' : 'Advantage') : (usePortuguese ? 'Desvantagem' : 'Disadvantage')}
                    </div>
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
              const title = usePortuguese ? tip.titlePt : tip.titleEn;
              const content = usePortuguese ? tip.contentPt : tip.contentEn;

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
`;

fs.writeFileSync('src/components/DeepLoLSummary.tsx', tsxContent, 'utf8');
console.log('src/components/DeepLoLSummary.tsx written successfully!');