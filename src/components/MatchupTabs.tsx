import React, { useState } from 'react';
import type { MatchupDetail } from '../types';
import {
  FileText,
  ListOrdered,
  Flame,
  Video,
  Languages,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Sword,
  Bot,
} from 'lucide-react';
import { MatchNotesList } from './notes/MatchNotesList';
import { CombosVisualizer } from './CombosVisualizer';
import { DeepLoLSummary } from './DeepLoLSummary';
import { useNotes } from '../hooks/useNotes';
import { useLanguage } from '../i18n';

interface MatchupTabsProps {
  matchup: MatchupDetail;
  initialTab?: ActiveTab;
}

export type ActiveTab = 'summary' | 'deeplol' | 'tips' | 'fury' | 'notes' | 'video';

export const MatchupTabs: React.FC<MatchupTabsProps> = ({ matchup, initialTab = 'summary' }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);
  const { t, isPt, isEn, toggleLanguage } = useLanguage();
  const usePortuguese = isPt;

  // Load notes for current matchup champion
  const { notes, summary, loading: notesLoading, addNote, editNote, removeNote } = useNotes(
    matchup.championId || matchup.championName
  );

  const tipsList = matchup.tips || [];
  const furyTipsList = matchup.furyTips || [];

  return (
    <div className="lol-card border border-[#262B3D] overflow-hidden flex flex-col flex-1 select-none">
      {/* Tab Navigation Header */}
      <div className="flex items-center justify-between border-b border-[#262B3D] bg-[#0F1015] px-4 pt-1">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'summary'
                ? 'border-[#D4A017] text-[#D4A017] bg-[#151821]/80'
                : 'border-transparent text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151821]/40'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{t.matchupTabs.summary}</span>
          </button>

          <button
            onClick={() => setActiveTab('deeplol')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'deeplol'
                ? 'border-[#34D399] text-[#34D399] bg-[#151821]/80'
                : 'border-transparent text-[#94A3B8] hover:text-[#34D399] hover:bg-[#151821]/40'
            }`}
          >
            <Bot className="w-4 h-4 text-[#34D399]" />
            <span className="flex items-center gap-1.5">
              {t.matchupTabs.deepLol}
              {matchup.deepLol?.hasData && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-[#064E3B] text-[#34D399] border border-[#059669]/60">
                  AI
                </span>
              )}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('tips')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'tips'
                ? 'border-[#D4A017] text-[#D4A017] bg-[#151821]/80'
                : 'border-transparent text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151821]/40'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>
              {t.matchupTabs.detailedNotes} ({tipsList.length})
            </span>
          </button>

          <button
            onClick={() => setActiveTab('fury')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'fury'
                ? 'border-[#D4A017] text-[#D4A017] bg-[#151821]/80'
                : 'border-transparent text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151821]/40'
            }`}
          >
            <Flame className="w-4 h-4 text-[#EAB308]" />
            <span>{t.matchupTabs.combos}</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'notes'
                ? 'border-[#D4A017] text-[#D4A017] bg-[#151821]/80'
                : 'border-transparent text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151821]/40'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#38BDF8]" />
            <span>
              {t.matchupTabs.myNotes} ({notes.length})
            </span>
          </button>

          {matchup.hasVideo && (
            <button
              onClick={() => setActiveTab('video')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'video'
                  ? 'border-[#D4A017] text-[#D4A017] bg-[#151821]/80'
                  : 'border-transparent text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151821]/40'
              }`}
            >
              <Video className="w-4 h-4 text-[#EF4444]" />
              <span>
                {matchup.videoSource === 'godrekton_sheet'
                  ? t.matchupTabs.videoSourceGodrekton
                  : t.matchupTabs.videoSourceReplay}
              </span>
            </button>
          )}
        </div>

        {/* Language Toggle in Tab Header */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#151821] border border-[#262B3D] text-[11px] font-semibold text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
          title={t.header.actions.languageToggle}
        >
          <Languages className="w-3.5 h-3.5 text-[#D4A017]" />
          <span>{isPt ? '🇧🇷 PT-BR' : '🇺🇸 EN'}</span>
        </button>
      </div>

      {/* Tab Body Content */}
      <div className="p-5 overflow-y-auto flex-1 bg-[#151821] select-text">
        {/* TAB 1: SUMMARY */}
        {activeTab === 'summary' && (
          <div className="space-y-4 max-w-4xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#262B3D]">
              <h3 className="text-sm font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#D4A017]" />
                {t.matchupTabs.summaryHeader} {matchup.championName}
              </h3>
              <span className="text-xs font-mono text-[#64748B]">
                {t.matchupTabs.difficultyRatingLabel}: {matchup.difficultyRaw}
              </span>
            </div>

            <div className="text-sm text-[#F8FAFC]/90 leading-relaxed space-y-3 bg-[#0F1015]/60 p-4 rounded-xl border border-[#262B3D]/70">
              <p className="whitespace-pre-line">
                {usePortuguese ? matchup.summaryPt || matchup.summaryEn : matchup.summaryEn || matchup.summaryPt}
              </p>
            </div>

            {/* Quick Strategy Advice Box (Dynamic & Specific for Champion) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              <div className="p-3.5 rounded-lg bg-[#062E22]/50 border border-[#059669]/60">
                <div className="flex items-center gap-2 text-xs font-bold text-[#10B981] mb-1.5">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>
                    {isEn
                      ? `Lane Win Condition vs ${matchup.championName}`
                      : `Condição de Vitória na Lane vs ${matchup.championName}`}
                  </span>
                </div>
                <p className="text-xs text-[#F8FAFC]/90 leading-relaxed">
                  {usePortuguese
                    ? matchup.winConditionPt || matchup.winConditionEn
                    : matchup.winConditionEn || matchup.winConditionPt}
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#381308]/50 border border-[#EA580C]/60">
                <div className="flex items-center gap-2 text-xs font-bold text-[#FB923C] mb-1.5">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{isEn ? 'Key Threat & Tactical Caution' : 'Ponto de Atenção & Cuidados'}</span>
                </div>
                <p className="text-xs text-[#F8FAFC]/90 leading-relaxed">
                  {usePortuguese
                    ? matchup.cautionPt || matchup.cautionEn
                    : matchup.cautionEn || matchup.cautionPt}
                </p>
              </div>
            </div>

            {/* Level 1 Start Strategic Note */}
            {(matchup.level1ExplanationPt || matchup.level1ExplanationEn) && (
              <div className="p-3.5 rounded-lg bg-[#0F1015] border border-[#D4A017]/30 flex items-start gap-3 mt-2">
                <div className="w-7 h-7 rounded bg-[#262B3D] text-[#D4A017] flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 border border-[#D4A017]/40">
                  {matchup.level1Start === 'SITUATIONAL' ? '?' : matchup.level1Start || 'Q'}
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-[#D4A017] uppercase tracking-wider">
                    {isEn
                      ? `Level 1 Strategy (${matchup.level1Start === 'E_ALCOVE' ? 'E Alcove' : matchup.level1Start})`
                      : `Estratégia de Início no Nível 1 (${matchup.level1Start === 'E_ALCOVE' ? 'E Alcove' : matchup.level1Start})`}
                  </h4>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    {usePortuguese
                      ? matchup.level1ExplanationPt || matchup.level1ExplanationEn
                      : matchup.level1ExplanationEn || matchup.level1ExplanationPt}
                  </p>
                </div>
              </div>
            )}

            {/* DeepLoL AI Insights & Level Advantage (Embedded) */}
            {matchup.deepLol?.hasData && (
              <div className="mt-4">
                <DeepLoLSummary
                  deepLol={matchup.deepLol}
                  championName={matchup.championName}
                  usePortuguese={usePortuguese}
                />
              </div>
            )}
          </div>
        )}

        {/* TAB: DEEPLOL AI SUMMARY (DEDICATED FULL VIEW) */}
        {activeTab === 'deeplol' && (
          <div className="space-y-4 max-w-4xl">
            <DeepLoLSummary
              deepLol={matchup.deepLol}
              championName={matchup.championName}
              usePortuguese={usePortuguese}
            />
          </div>
        )}

        {/* TAB 2: DETAILED STEP-BY-STEP TIPS */}
        {activeTab === 'tips' && (
          <div className="space-y-3 max-w-4xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#262B3D]">
              <h3 className="text-sm font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-[#D4A017]" />
                {isEn
                  ? `Godrekton's Structured Notes (${tipsList.length} Tips)`
                  : `Notas Estruturadas do Godrekton (${tipsList.length} Dicas)`}
              </h3>
              <span className="text-xs text-[#94A3B8]">
                {isEn
                  ? 'Ordered by game phase and tactical priority'
                  : 'Ordenadas por fase de jogo e prioridade tática'}
              </span>
            </div>

            {tipsList.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#64748B]">
                <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-[#64748B]/50" />
                <p>{t.matchupTabs.noTipsAvailable}</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {tipsList.map((tip, index) => {
                  const title = usePortuguese
                    ? tip.titlePt || tip.titleEn
                    : tip.titleEn || tip.titlePt;
                  const content = usePortuguese
                    ? tip.contentPt || tip.contentEn
                    : tip.contentEn || tip.contentPt;

                  return (
                    <div
                      key={tip.id || index}
                      className="p-3.5 rounded-lg bg-[#0F1015] border border-[#262B3D] hover:border-[#3A4259] transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded bg-[#262B3D] text-[#D4A017] font-mono font-bold text-xs flex-shrink-0 flex items-center justify-center border border-[#D4A017]/30">
                            {tip.tipNumber || index + 1}
                          </span>
                          <h4 className="text-xs font-bold text-[#F8FAFC]">{title}</h4>
                        </div>
                        {tip.category && (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#151821] border border-[#262B3D] text-[#94A3B8]">
                            {tip.category}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#94A3B8] leading-relaxed pl-8">{content}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: FURY MANAGEMENT & COMBOS */}
        {activeTab === 'fury' && (
          <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#262B3D]">
              <h3 className="text-sm font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#EAB308]" />
                {isEn
                  ? `Optimized Fury Usage vs ${matchup.championName}`
                  : `Uso Otimizado da Fúria contra ${matchup.championName}`}
              </h3>
              <span className="text-xs font-mono text-[#D4A017]">
                50 / 100 Fury Optimization
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Empowered W */}
              <div className="p-3.5 rounded-lg bg-[#0F1015] border border-[#262B3D]">
                <div className="flex items-center gap-2 font-bold text-xs text-[#EF4444] mb-2">
                  <span className="w-6 h-6 rounded bg-[#2F0909] text-[#EF4444] border border-[#DC2626] flex items-center justify-center font-mono">
                    W
                  </span>
                  <span>{isEn ? 'Empowered W (50+ Fury)' : 'W Fortalecido (50+ Fúria)'}</span>
                </div>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  {isEn
                    ? 'Strikes 3 times, completely destroys shields before dealing damage (crucial vs Riven, Tahm Kench, Sett) and stuns for 1.5s. Maximum burst and all-in lethal.'
                    : 'Desfere 3 golpes, quebra escudos completamente antes do dano (ótimo contra Riven, Tahm Kench, Sett) e atordoa por 1.5s. Máximo dano de all-in e burst imediato.'}
                </p>
              </div>

              {/* Empowered Q */}
              <div className="p-3.5 rounded-lg bg-[#0F1015] border border-[#262B3D]">
                <div className="flex items-center gap-2 font-bold text-xs text-[#10B981] mb-2">
                  <span className="w-6 h-6 rounded bg-[#062E22] text-[#10B981] border border-[#059669] flex items-center justify-center font-mono">
                    Q
                  </span>
                  <span>{isEn ? 'Empowered Q (50+ Fury)' : 'Q Fortalecido (50+ Fúria)'}</span>
                </div>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  {isEn
                    ? 'Tripled damage and tripled healing per champion hit (up to 400% vs minions). Prioritize in extended trades and when below 50% HP for dramatic clutch turnarounds.'
                    : 'Dano triplicado e cura triplicada por campeão atingido (até 400% vs minions). Priorize em trocas sustentadas e quando estiver com menos de 50% de HP para virar lutas.'}
                </p>
              </div>

              {/* Empowered E */}
              <div className="p-3.5 rounded-lg bg-[#0F1015] border border-[#262B3D]">
                <div className="flex items-center gap-2 font-bold text-xs text-[#38BDF8] mb-2">
                  <span className="w-6 h-6 rounded bg-[#082130] text-[#38BDF8] border border-[#0284C7] flex items-center justify-center font-mono">
                    E
                  </span>
                  <span>{isEn ? 'Empowered E2 Dice' : 'E2 Dice Fortalecido'}</span>
                </div>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  {isEn
                    ? 'Shreds target armor by up to 35% for 4 seconds. Crucial in all-ins against heavy armor tanks (Malphite, Ornn, Sion) before dropping your W+Q combo.'
                    : 'Reduz a armadura do alvo em até 35% por 4 segundos. Crucial em all-ins contra tanques pesados (Malphite, Ornn, Sion) antes de soltar o combo de W+Q.'}
                </p>
              </div>
            </div>

            {/* Custom Fury Tips for the Champion */}
            {furyTipsList.length > 0 && (
              <div className="p-4 rounded-xl bg-[#0F1015] border border-[#D4A017]/40 space-y-2">
                <h4 className="text-xs font-bold text-[#D4A017] uppercase tracking-wider">
                  {isEn
                    ? `Specific Fury Tips vs ${matchup.championName}`
                    : `Dica de Fúria Específica vs ${matchup.championName}`}
                </h4>
                {furyTipsList.map((tip, idx) => (
                  <p key={idx} className="text-xs text-[#F8FAFC] leading-relaxed">
                    • {tip}
                  </p>
                ))}
              </div>
            )}

            {/* Visual Combos Section */}
            <div className="pt-2 border-t border-[#262B3D]">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2">
                  <Sword className="w-4 h-4 text-[#D4A017]" />
                  {isEn ? 'Recommended Sequences & Combos by Fury' : 'Sequências e Combos Recomendados por Fúria'}
                </h4>
                <span className="text-xs text-[#94A3B8]">
                  {isEn ? 'Master Guide Matrix' : 'Tabela do Guia Mestre'}
                </span>
              </div>
              <CombosVisualizer initialCategory="all" showCategoryFilter={true} />
            </div>
          </div>
        )}

        {/* TAB 4: MY NOTES & POST-GAME */}
        {activeTab === 'notes' && (
          <div className="max-w-4xl">
            <MatchNotesList
              championName={matchup.championName}
              championId={matchup.championId || 1}
              notes={notes}
              summary={summary}
              isLoading={notesLoading}
              onAddNote={addNote}
              onEditNote={editNote}
              onDeleteNote={removeNote}
            />
          </div>
        )}

        {/* TAB 5: VIDEO */}
        {activeTab === 'video' && matchup.videoUrl && (() => {
          let embedUrl: string | null = null;
          if (matchup.videoId && matchup.videoId.length === 11) {
            const timeMatch = matchup.videoUrl.match(/[?&]t=(\d+)s?/);
            const startParam = timeMatch ? `?start=${timeMatch[1]}` : '';
            embedUrl = `https://www.youtube-nocookie.com/embed/${matchup.videoId}${startParam}`;
          } else {
            const match = matchup.videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
            if (match && match[1]) {
              const timeMatch = matchup.videoUrl.match(/[?&]t=(\d+)s?/);
              const startParam = timeMatch ? `?start=${timeMatch[1]}` : '';
              embedUrl = `https://www.youtube-nocookie.com/embed/${match[1]}${startParam}`;
            }
          }

          const isOfficialGuide = matchup.videoSource === 'godrekton_sheet';

          return (
            <div className="space-y-4 max-w-4xl">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#262B3D]">
                <div className="flex items-center gap-2.5">
                  <Video className="w-4 h-4 text-[#EF4444]" />
                  <h3 className="text-sm font-bold text-[#F8FAFC] uppercase tracking-wider">
                    {isOfficialGuide
                      ? isEn
                        ? `Official Video Lesson: Renekton vs ${matchup.championName}`
                        : `Vídeo Aula Oficial: Renekton vs ${matchup.championName}`
                      : isEn
                      ? `High-Elo Replay: Renekton vs ${matchup.championName}`
                      : `Gameplay Demonstrativa: Renekton vs ${matchup.championName}`}
                  </h3>
                  {isOfficialGuide ? (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#D4A017]/10 text-[#D4A017] border border-[#D4A017]/40">
                      {isEn ? 'Official Godrekton Guide' : 'Guia Oficial Godrekton'}
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/40">
                      KR Challenger / High Elo
                    </span>
                  )}
                </div>

                <a
                  href={matchup.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-[#D4A017] hover:text-[#F3B72C] font-semibold transition-colors"
                >
                  <span>{t.matchupTabs.watchOnYoutube}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Embedded Player */}
              {embedUrl ? (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[#262B3D] shadow-card-glow bg-black">
                  <iframe
                    src={embedUrl}
                    title={matchup.videoTitle || `Renekton vs ${matchup.championName}`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="p-8 rounded-xl bg-[#0F1015] border border-[#262B3D] text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/40 flex items-center justify-center mx-auto text-[#EF4444]">
                    <Video className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#F8FAFC]">
                      Renekton vs {matchup.championName}
                    </h4>
                    <p className="text-xs text-[#94A3B8] max-w-md mx-auto mt-1">
                      {isEn
                        ? `Watch high elo Challenger & Grandmaster matchups against ${matchup.championName}.`
                        : `Pesquise e assista partidas de elo Desafiante e Grão-Mestre coreano contra ${matchup.championName}.`}
                    </p>
                  </div>
                </div>
              )}

              {/* Video Info Footer */}
              <div className="p-4 rounded-xl bg-[#0F1015] border border-[#262B3D] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[#F8FAFC]">
                    {matchup.videoTitle || `Renekton vs ${matchup.championName}`}
                  </h4>
                  <p className="text-[11px] text-[#94A3B8]">
                    {isEn ? 'Channel: ' : 'Canal: '}
                    <span className="text-[#F8FAFC] font-semibold">
                      {matchup.videoChannel || (isOfficialGuide ? 'Godrekton' : 'KR Challenger Replays')}
                    </span>
                    {' • '}
                    {isOfficialGuide
                      ? isEn
                        ? "Deep strategic video guide created by Godrekton, Renekton's ultimate guide author."
                        : 'Guia com análise profunda do criador do guia mestre de Renekton.'
                      : isEn
                      ? `KR Challenger server replay showing lane trading, wave management, and lethal execution vs ${matchup.championName}.`
                      : `Gameplay em servidor KR/Challenger demonstrando trocas, controle de wave e execução contra ${matchup.championName}.`}
                  </p>
                </div>

                <a
                  href={matchup.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold text-xs shadow-md transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{t.matchupTabs.watchOnYoutube}</span>
                </a>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default MatchupTabs;
