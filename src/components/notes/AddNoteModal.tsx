/**
 * Modal form for creating and editing structured post-game matchup notes.
 */

import React, { useState, useEffect } from 'react';
import type { UserNote, NewNotePayload, MatchResult } from '../../types/note';
import { dataDragon } from '../../services/dataDragon';
import { useLanguage } from '../../i18n';

interface AddNoteModalProps {
  isOpen: boolean;
  championName: string;
  championId?: number;
  initialNote?: UserNote | null;
  suggestedResult?: MatchResult;
  initialKda?: string;
  initialRunes?: string;
  initialItems?: string;
  initialSummoners?: string;
  onClose: () => void;
  onSave: (payload: NewNotePayload, editingId?: number) => Promise<void>;
}

export const AddNoteModal: React.FC<AddNoteModalProps> = ({
  isOpen,
  championName,
  championId = 1,
  initialNote,
  suggestedResult,
  initialKda,
  initialRunes,
  initialItems,
  initialSummoners,
  onClose,
  onSave,
}) => {
  const { t } = useLanguage();
  const [matchResult, setMatchResult] = useState<MatchResult>('WIN');
  const [perceivedDifficulty, setPerceivedDifficulty] = useState<number>(3);
  const [whatWorked, setWhatWorked] = useState<string>('');
  const [whatFailed, setWhatFailed] = useState<string>('');
  const [freeNotes, setFreeNotes] = useState<string>('');
  const [kda, setKda] = useState<string>('');
  const [runesUsed, setRunesUsed] = useState<string>('');
  const [itemsBuilt, setItemsBuilt] = useState<string>('');
  const [summonersUsed, setSummonersUsed] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize or reset form state
  useEffect(() => {
    if (initialNote) {
      setMatchResult((initialNote.matchResult || 'WIN').toUpperCase() as MatchResult);
      setPerceivedDifficulty(Number(initialNote.perceivedDifficulty) || 3);
      setWhatWorked(initialNote.whatWorked || '');
      setWhatFailed(initialNote.whatFailed || '');
      setFreeNotes(initialNote.freeNotes || '');
      setKda(initialNote.kda || '');
      setRunesUsed(initialNote.runesUsed || '');
      setItemsBuilt(initialNote.itemsBuilt || '');
      setSummonersUsed(initialNote.summonersUsed || '');
      setShowAdvanced(Boolean(initialNote.kda || initialNote.runesUsed || initialNote.itemsBuilt || initialNote.summonersUsed));
    } else {
      setMatchResult((suggestedResult || 'WIN').toUpperCase() as MatchResult);
      setPerceivedDifficulty(3);
      setWhatWorked('');
      setWhatFailed('');
      setFreeNotes('');
      setKda(initialKda || '');
      setRunesUsed(initialRunes || '');
      setItemsBuilt(initialItems || '');
      setSummonersUsed(initialSummoners || '');
      setShowAdvanced(Boolean(initialKda || initialRunes || initialItems || initialSummoners));
    }
    setErrorMessage(null);
  }, [initialNote, suggestedResult, initialKda, initialRunes, initialItems, initialSummoners, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!perceivedDifficulty || perceivedDifficulty < 1 || perceivedDifficulty > 5) {
      setErrorMessage(t.notes.validationDifficulty);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: NewNotePayload = {
        championId: championId || initialNote?.championId || 1,
        championName,
        matchResult,
        perceivedDifficulty,
        whatWorked: whatWorked.trim(),
        whatFailed: whatFailed.trim(),
        freeNotes: freeNotes.trim(),
        kda: kda.trim() || undefined,
        runesUsed: runesUsed.trim() || undefined,
        itemsBuilt: itemsBuilt.trim() || undefined,
        summonersUsed: summonersUsed.trim() || undefined,
      };

      await onSave(payload, initialNote?.id);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar anotação.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const champIcon = dataDragon.getChampionIconUrl(championName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-2xl bg-[#0D0F16] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#121520]">
          <div className="flex items-center gap-3">
            <img
              src={champIcon}
              alt={championName}
              className="w-11 h-11 rounded-lg border border-amber-500/40 object-cover shadow-md"
              onError={(e) => {
                (e.target as HTMLImageElement).src = dataDragon.getOfflineSvgFallback(championName);
              }}
            />
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>{initialNote ? t.notes.editNoteTitle : t.notes.addNoteTitle}</span>
                <span className="text-amber-400 font-extrabold">vs {championName}</span>
              </h3>
              <p className="text-xs text-slate-400">
                {t.notes.modalSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center text-sm font-bold transition-all"
            aria-label={t.notes.cancelBtn}
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
          {errorMessage && (
            <div className="p-3 bg-rose-950/50 border border-rose-500/50 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Match Result Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              {t.notes.resultLabel}
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setMatchResult('WIN')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  matchResult === 'WIN'
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950/50'
                    : 'bg-[#151926] border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>🏆</span> {t.notes.results.win}
              </button>

              <button
                type="button"
                onClick={() => setMatchResult('LOSS')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  matchResult === 'LOSS'
                    ? 'bg-rose-950/60 border-rose-500 text-rose-300 shadow-md shadow-rose-950/50'
                    : 'bg-[#151926] border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>💀</span> {t.notes.results.loss}
              </button>

              <button
                type="button"
                onClick={() => setMatchResult('REMAKE')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  matchResult === 'REMAKE'
                    ? 'bg-slate-800/80 border-slate-400 text-slate-200 shadow-md'
                    : 'bg-[#151926] border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>🔄</span> {t.notes.results.remake}
              </button>
            </div>
          </div>

          {/* Perceived Difficulty Star Rating */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {t.notes.feltDifficultyLabel}
              </label>
              <span className="text-xs text-amber-400 font-semibold">
                {t.notes.difficultyDescriptions[perceivedDifficulty]}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-[#151926] border border-slate-800/80 p-3 rounded-xl">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setPerceivedDifficulty(star)}
                  className={`text-2xl transition-transform hover:scale-125 focus:outline-none ${
                    star <= perceivedDifficulty ? 'text-amber-400' : 'text-slate-700'
                  }`}
                  title={`${star} ${t.notes.difficultyStars}`}
                >
                  ★
                </button>
              ))}
              <span className="ml-auto text-xs text-slate-400">
                {t.notes.starsOutOfFive.replace('{count}', String(perceivedDifficulty))}
              </span>
            </div>
          </div>

          {/* What Worked */}
          <div>
            <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <span>✓</span> {t.notes.whatWorkedLabel}
            </label>
            <textarea
              value={whatWorked}
              onChange={(e) => setWhatWorked(e.target.value)}
              placeholder={t.notes.whatWorkedPlaceholder}
              rows={2}
              className="w-full bg-[#151926] border border-slate-800 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-all"
            />
          </div>

          {/* What Failed */}
          <div>
            <label className="block text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <span>✗</span> {t.notes.whatFailedLabel}
            </label>
            <textarea
              value={whatFailed}
              onChange={(e) => setWhatFailed(e.target.value)}
              placeholder={t.notes.whatFailedPlaceholder}
              rows={2}
              className="w-full bg-[#151926] border border-slate-800 focus:border-rose-500/60 focus:ring-1 focus:ring-rose-500/40 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-all"
            />
          </div>

          {/* Free Notes / Tactical Advice */}
          <div>
            <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <span>💡</span> {t.notes.freeNotesLabel}
            </label>
            <textarea
              value={freeNotes}
              onChange={(e) => setFreeNotes(e.target.value)}
              placeholder={t.notes.freeNotesPlaceholder}
              rows={3}
              className="w-full bg-[#151926] border border-slate-800 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-all"
            />
          </div>

          {/* Advanced / Optional Metadata Collapsible */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1.5 font-medium transition-colors"
            >
              <span>{showAdvanced ? '▼' : '►'}</span>
              <span>{t.notes.metadataToggle}</span>
            </button>

            {showAdvanced && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 p-3 bg-[#11141E] border border-slate-800/80 rounded-xl animate-fadeIn">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">{t.notes.kdaLabel}</label>
                  <input
                    type="text"
                    value={kda}
                    onChange={(e) => setKda(e.target.value)}
                    placeholder={t.notes.kdaPlaceholder}
                    className="w-full bg-[#151926] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">{t.notes.runesLabel}</label>
                  <input
                    type="text"
                    value={runesUsed}
                    onChange={(e) => setRunesUsed(e.target.value)}
                    placeholder={t.notes.runesPlaceholder}
                    className="w-full bg-[#151926] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">{t.notes.itemsLabel}</label>
                  <input
                    type="text"
                    value={itemsBuilt}
                    onChange={(e) => setItemsBuilt(e.target.value)}
                    placeholder={t.notes.itemsPlaceholder}
                    className="w-full bg-[#151926] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">{t.notes.summonersLabel}</label>
                  <input
                    type="text"
                    value={summonersUsed}
                    onChange={(e) => setSummonersUsed(e.target.value)}
                    placeholder={t.notes.summonersPlaceholder}
                    className="w-full bg-[#151926] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 font-semibold rounded-xl text-xs transition-colors"
            >
              {t.notes.cancelBtn}
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <span>{t.notes.savingBtn}</span>
              ) : (
                <>
                  <span>💾</span>
                  <span>{initialNote ? t.notes.updateBtn : t.notes.saveBtn}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNoteModal;
