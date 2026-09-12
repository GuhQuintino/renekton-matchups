/**
 * Automatic Post-Game Drawer / Prompt.
 * Slides in when a match completes (IN_GAME -> POST_GAME), pre-populating
 * the opponent champion and match outcome for rapid reflection.
 */

import React, { useState } from 'react';
import type { NewNotePayload, MatchResult } from '../../types/note';
import { dataDragon } from '../../services/dataDragon';
import { useLanguage } from '../../i18n';

interface PostGameDrawerProps {
  isOpen: boolean;
  opponentChampion: string;
  suggestedOutcome?: MatchResult;
  gameTimeSeconds?: number;
  onClose: () => void;
  onSaveNote: (payload: NewNotePayload) => Promise<void>;
}

export const PostGameDrawer: React.FC<PostGameDrawerProps> = ({
  isOpen,
  opponentChampion,
  suggestedOutcome = 'WIN',
  gameTimeSeconds,
  onClose,
  onSaveNote,
}) => {
  const { t } = useLanguage();
  const [matchResult, setMatchResult] = useState<MatchResult>(suggestedOutcome);
  const [perceivedDifficulty, setPerceivedDifficulty] = useState<number>(3);
  const [whatWorked, setWhatWorked] = useState<string>('');
  const [whatFailed, setWhatFailed] = useState<string>('');
  const [freeNotes, setFreeNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  if (!isOpen) return null;

  // Format game duration (mm:ss)
  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSaveNote({
        championId: 1, // Auto-resolved by name
        championName: opponentChampion,
        matchResult,
        perceivedDifficulty,
        whatWorked: whatWorked.trim(),
        whatFailed: whatFailed.trim(),
        freeNotes: freeNotes.trim(),
      });
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('[PostGameDrawer] Error saving quick note:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const champIcon = dataDragon.getChampionIconUrl(opponentChampion);
  const duration = formatDuration(gameTimeSeconds);

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-slideUp">
      <div className="bg-[#0C0E16] border-2 border-amber-500/50 rounded-2xl shadow-2xl overflow-hidden p-5 backdrop-blur-md">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3.5 mb-4">
          <div className="flex items-center gap-3">
            <img
              src={champIcon}
              alt={opponentChampion}
              className="w-10 h-10 rounded-lg border border-amber-500/40 object-cover shadow"
              onError={(e) => {
                (e.target as HTMLImageElement).src = dataDragon.getOfflineSvgFallback(opponentChampion);
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  {t.postGame.badge}
                </span>
                {duration && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    ⏱️ {duration}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-slate-100 mt-0.5">
                Renekton vs <strong className="text-amber-300">{opponentChampion}</strong>
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-bold transition-all"
            title="✕"
            aria-label="✕"
          >
            ✕
          </button>
        </div>

        {isSaved ? (
          <div className="py-6 text-center text-emerald-400 space-y-2">
            <span className="text-3xl">✓</span>
            <p className="text-xs font-bold">{t.postGame.saveSuccess}</p>
          </div>
        ) : (
          <form onSubmit={handleQuickSubmit} className="space-y-3.5">
            {/* Outcome Toggle */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMatchResult('WIN')}
                className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                  matchResult === 'WIN'
                    ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 shadow'
                    : 'bg-[#141824] border-slate-800 text-slate-400'
                }`}
              >
                🏆 {t.notes.results.win}
              </button>
              <button
                type="button"
                onClick={() => setMatchResult('LOSS')}
                className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                  matchResult === 'LOSS'
                    ? 'bg-rose-950/70 border-rose-500 text-rose-300 shadow'
                    : 'bg-[#141824] border-slate-800 text-slate-400'
                }`}
              >
                💀 {t.notes.results.loss}
              </button>
            </div>

            {/* Quick Difficulty Stars */}
            <div className="flex items-center justify-between bg-[#141824] border border-slate-800/80 px-3 py-1.5 rounded-lg">
              <span className="text-[11px] text-slate-400 font-medium">{t.postGame.quickDifficulty}</span>
              <div className="flex items-center gap-1 text-base">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setPerceivedDifficulty(star)}
                    className={
                      star <= perceivedDifficulty ? 'text-amber-400' : 'text-slate-700'
                    }
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Textarea */}
            <div>
              <textarea
                value={whatWorked}
                onChange={(e) => setWhatWorked(e.target.value)}
                placeholder={t.postGame.whatWorkedPlaceholder}
                rows={2}
                className="w-full bg-[#141824] border border-slate-800 focus:border-emerald-500/60 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div>
              <textarea
                value={whatFailed}
                onChange={(e) => setWhatFailed(e.target.value)}
                placeholder={t.postGame.whatFailedPlaceholder}
                rows={2}
                className="w-full bg-[#141824] border border-slate-800 focus:border-rose-500/60 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="text-[11px] text-slate-400 hover:text-slate-200 underline"
              >
                {t.postGame.skipBtn}
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
              >
                {isSubmitting ? t.postGame.savingBtn : t.postGame.saveBtn}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PostGameDrawer;
