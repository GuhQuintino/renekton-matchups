/**
 * Historical Notes List for Champion Matchup screen.
 * Renders chronological timeline of post-game notes with analytics summary,
 * win/loss badges, star ratings, and structured tactical reflections.
 */

import React, { useState } from 'react';
import type { UserNote, NotesSummary, NewNotePayload, MatchResult } from '../../types/note';
import { NotesSummaryCard } from './NotesSummaryCard';
import { AddNoteModal } from './AddNoteModal';
import { useLanguage } from '../../i18n';

interface MatchNotesListProps {
  championName: string;
  championId?: number;
  notes: UserNote[];
  summary: NotesSummary | null;
  isLoading?: boolean;
  onAddNote: (payload: NewNotePayload) => Promise<UserNote>;
  onEditNote: (noteId: number, updates: Partial<NewNotePayload>) => Promise<UserNote>;
  onDeleteNote: (noteId: number) => Promise<boolean>;
}

export const MatchNotesList: React.FC<MatchNotesListProps> = ({
  championName,
  championId = 1,
  notes,
  summary,
  isLoading = false,
  onAddNote,
  onEditNote,
  onDeleteNote,
}) => {
  const { t, isPt } = useLanguage();
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingNote, setEditingNote] = useState<UserNote | null>(null);
  const [filterResult, setFilterResult] = useState<'ALL' | 'WIN' | 'LOSS' | 'REMAKE'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Format date helper (locale-aware)
  const formatDate = (isoString?: string) => {
    if (!isoString) return t.notes.recentDate;
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(isPt ? 'pt-BR' : 'en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    const res = (n.matchResult || '').toUpperCase();
    if (filterResult !== 'ALL' && res !== filterResult) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchWorked = (n.whatWorked || '').toLowerCase().includes(q);
      const matchFailed = (n.whatFailed || '').toLowerCase().includes(q);
      const matchFree = (n.freeNotes || '').toLowerCase().includes(q);
      const matchKda = (n.kda || '').toLowerCase().includes(q);
      return matchWorked || matchFailed || matchFree || matchKda;
    }
    return true;
  });

  const handleDelete = async (noteId: number) => {
    if (window.confirm(t.notes.deleteConfirm)) {
      setDeletingId(noteId);
      try {
        await onDeleteNote(noteId);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleSaveModal = async (payload: NewNotePayload, editingId?: number) => {
    if (editingId) {
      await onEditNote(editingId, payload);
    } else {
      await onAddNote(payload);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Aggregate Performance Summary Card */}
      <NotesSummaryCard
        summary={summary}
        onAddNoteClick={() => {
          setEditingNote(null);
          setIsAddModalOpen(true);
        }}
      />

      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#10121A] border border-slate-800/80 p-3 rounded-xl">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
            {t.notes.filterLabel}
          </span>
          {(['ALL', 'WIN', 'LOSS', 'REMAKE'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterResult(mode)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterResult === mode
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {mode === 'ALL'
                ? t.notes.filters.all
                : mode === 'WIN'
                ? t.notes.filters.win
                : mode === 'LOSS'
                ? t.notes.filters.loss
                : t.notes.filters.remake}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-56">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.notes.searchPlaceholder}
            className="w-full bg-[#151926] border border-slate-800 focus:border-amber-500/50 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1.5 text-slate-400 hover:text-slate-200 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Notes List / Timeline */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
          <span className="text-xs">{t.notes.loadingHistory}</span>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="bg-[#0E1017] border border-slate-800/60 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-800/50 text-slate-400 flex items-center justify-center text-xl mx-auto mb-3">
            📝
          </div>
          <h4 className="text-slate-200 font-semibold text-sm mb-1">
            {searchQuery || filterResult !== 'ALL'
              ? t.notes.noNotesFoundFiltered
              : t.notes.noNotesTitle.replace('{champion}', championName)}
          </h4>
          <p className="text-slate-400 text-xs max-w-md mx-auto mb-4">
            {t.notes.noNotesDesc.replace(/\{champion\}/g, championName)}
          </p>
          <button
            onClick={() => {
              setEditingNote(null);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md"
          >
            {t.notes.addNoteBtn}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotes.map((note) => {
            const res = (note.matchResult || '').toUpperCase();
            const isWin = res === 'WIN';
            const isLoss = res === 'LOSS';

            return (
              <div
                key={note.id}
                className="bg-[#11141E] border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-md transition-all space-y-4 group"
              >
                {/* Note Card Header */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-800/60 pb-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Win/Loss/Remake Badge */}
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider border ${
                        isWin
                          ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                          : isLoss
                          ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                          : 'bg-slate-800 border-slate-600 text-slate-300'
                      }`}
                    >
                      {isWin ? `🏆 ${t.notes.results.win}` : isLoss ? `💀 ${t.notes.results.loss}` : `🔄 ${t.notes.results.remake}`}
                    </span>

                    {/* Star Rating */}
                    <div className="flex items-center text-amber-400 text-sm bg-slate-900/80 px-2.5 py-0.5 rounded-lg border border-slate-800">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={
                            star <= Number(note.perceivedDifficulty)
                              ? 'text-amber-400'
                              : 'text-slate-700'
                          }
                        >
                          ★
                        </span>
                      ))}
                      <span className="text-xs text-amber-300 font-semibold ml-1.5">
                        {note.perceivedDifficulty}/5
                      </span>
                    </div>

                    {/* KDA if available */}
                    {note.kda && (
                      <span className="px-2.5 py-0.5 bg-slate-900/80 border border-slate-800 text-slate-300 text-xs font-mono rounded-lg">
                        {t.notes.kdaLabel}: {note.kda}
                      </span>
                    )}

                    <span className="text-xs text-slate-500 font-medium ml-1">
                      {formatDate(note.createdAt)}
                    </span>
                  </div>

                  {/* Edit/Delete Actions */}
                  <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingNote(note);
                        setIsAddModalOpen(true);
                      }}
                      className="p-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-slate-100 rounded-lg text-xs transition-colors"
                      title={t.notes.editNoteTitle}
                      aria-label={t.notes.editNoteTitle}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      disabled={deletingId === note.id}
                      className="p-1.5 bg-slate-800/80 hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 rounded-lg text-xs transition-colors disabled:opacity-50"
                      title={t.notes.deleteBtn}
                      aria-label={t.notes.deleteBtn}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Structured Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* What Worked */}
                  {note.whatWorked && (
                    <div className="bg-[#141926]/60 border border-emerald-500/20 rounded-xl p-3.5">
                      <h5 className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                        <span>✓</span> {t.notes.whatWorkedLabel}
                      </h5>
                      <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                        {note.whatWorked}
                      </p>
                    </div>
                  )}

                  {/* What Failed */}
                  {note.whatFailed && (
                    <div className="bg-[#1c141a]/60 border border-rose-500/20 rounded-xl p-3.5">
                      <h5 className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                        <span>✗</span> {t.notes.whatFailedLabel}
                      </h5>
                      <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                        {note.whatFailed}
                      </p>
                    </div>
                  )}
                </div>

                {/* Free Notes / Tactical Advice */}
                {note.freeNotes && (
                  <div className="bg-[#18161D]/60 border border-amber-500/20 rounded-xl p-3.5">
                    <h5 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                      <span>💡</span> {t.notes.freeNotesLabel}
                    </h5>
                    <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {note.freeNotes}
                    </p>
                  </div>
                )}

                {/* Optional Metadata Tags */}
                {(note.runesUsed || note.itemsBuilt || note.summonersUsed) && (
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
                    {note.runesUsed && (
                      <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        ⚡ {t.notes.runesLabel}: <strong className="text-slate-200">{note.runesUsed}</strong>
                      </span>
                    )}
                    {note.itemsBuilt && (
                      <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        🛡️ {t.notes.itemsLabel}: <strong className="text-slate-200">{note.itemsBuilt}</strong>
                      </span>
                    )}
                    {note.summonersUsed && (
                      <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        ✨ {t.notes.summonersLabel}: <strong className="text-slate-200">{note.summonersUsed}</strong>
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Note Modal */}
      <AddNoteModal
        isOpen={isAddModalOpen}
        championName={championName}
        championId={championId}
        initialNote={editingNote}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSaveModal}
      />
    </div>
  );
};

export default MatchNotesList;
