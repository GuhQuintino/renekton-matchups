/**
 * Summary Card displaying aggregate performance stats against a specific champion.
 */

import React from 'react';
import type { NotesSummary } from '../../types/note';
import { useLanguage } from '../../i18n';

interface NotesSummaryCardProps {
  summary: NotesSummary | null;
  onAddNoteClick?: () => void;
}

export const NotesSummaryCard: React.FC<NotesSummaryCardProps> = ({
  summary,
  onAddNoteClick,
}) => {
  const { t, isPt } = useLanguage();

  if (!summary || summary.totalMatches === 0) {
    return (
      <div className="bg-[#12151E] border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-lg font-bold">
            ⚔️
          </div>
          <div>
            <h4 className="text-slate-200 font-semibold text-sm">
              {t.notes.noMatchesSummaryTitle.replace('{champion}', summary?.championName || (isPt ? 'este campeão' : 'this champion'))}
            </h4>
            <p className="text-slate-400 text-xs mt-0.5">
              {t.notes.noMatchesSummaryDesc}
            </p>
          </div>
        </div>
        {onAddNoteClick && (
          <button
            onClick={onAddNoteClick}
            className="px-3.5 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 hover:text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0"
          >
            <span>+</span> {t.notes.registerMatchBtn}
          </button>
        )}
      </div>
    );
  }

  const { totalMatches, wins, losses, remakes, winratePercent, avgDifficulty } = summary;
  const isWinning = winratePercent >= 50;

  return (
    <div className="bg-[#12151E] border border-slate-800/80 rounded-xl p-4 shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Win Rate & Matches */}
        <div className="flex items-center gap-4">
          {/* Winrate Circle/Badge */}
          <div
            className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center border shadow-inner ${
              isWinning
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-950/40 border-rose-500/30 text-rose-400'
            }`}
          >
            <span className="text-lg font-bold leading-tight">{winratePercent}%</span>
            <span className="text-[10px] tracking-wider uppercase opacity-80">{t.notes.winRateLabel}</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-slate-200 font-bold text-base">
                {wins}V - {losses}D{remakes > 0 ? ` - ${remakes}R` : ''}
              </span>
              <span className="text-xs text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/50">
                {totalMatches} {totalMatches === 1 ? t.notes.matchSingular : t.notes.matchPlural}
              </span>
            </div>

            {/* Difficulty Rating Stars */}
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs text-slate-400">{t.notes.averageRatingLabel}</span>
              <div className="flex items-center text-amber-400 text-xs">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={
                      star <= Math.round(avgDifficulty)
                        ? 'text-amber-400'
                        : 'text-slate-700'
                    }
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-xs text-amber-300 font-semibold ml-0.5">
                ({avgDifficulty}/5)
              </span>
            </div>
          </div>
        </div>

        {/* Right: Progress bar & Action */}
        <div className="flex items-center gap-4">
          <div className="w-36 hidden sm:block">
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span className="text-emerald-400 font-medium">{wins}V</span>
              <span className="text-rose-400 font-medium">{losses}D</span>
            </div>
            <div className="w-full bg-rose-950/60 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(0, Math.min(100, winratePercent))}%` }}
              />
            </div>
          </div>

          {onAddNoteClick && (
            <button
              onClick={onAddNoteClick}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-md shadow-amber-500/10 flex items-center gap-1.5 shrink-0"
            >
              <span>+</span> {t.notes.newNoteBtn}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesSummaryCard;
