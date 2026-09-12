import React, { useState, useMemo } from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  Sword,
  Zap,
  Shield,
  Flame,
  HelpCircle,
  Info,
  Search,
  Languages
} from 'lucide-react';
import type { GuideCategory, GuideContent } from '../types';
import { getGuideByCategory } from '../data/data-engine';
import { CombosVisualizer } from './CombosVisualizer';
import { useLanguage } from '../i18n';

interface GeneralGuidesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GUIDE_CATEGORY_ICONS: Record<GuideCategory, React.ReactNode> = {
  introduction: <Info className="w-4 h-4 text-[#38BDF8]" />,
  faq: <HelpCircle className="w-4 h-4 text-[#A78BFA]" />,
  runes: <Sparkles className="w-4 h-4 text-[#D4A017]" />,
  mechanics_combos: <Sword className="w-4 h-4 text-[#EF4444]" />,
  summoners: <Zap className="w-4 h-4 text-[#F59E0B]" />,
  items_builds: <Shield className="w-4 h-4 text-[#10B981]" />,
  ability_starts_maxing: <Sword className="w-4 h-4 text-[#38BDF8]" />,
  fury_management: <Flame className="w-4 h-4 text-[#EAB308]" />
};

const GUIDE_CATEGORIES: GuideCategory[] = [
  'introduction',
  'faq',
  'runes',
  'mechanics_combos',
  'summoners',
  'items_builds',
  'ability_starts_maxing',
  'fury_management'
];

export const GeneralGuidesModal: React.FC<GeneralGuidesModalProps> = ({
  isOpen,
  onClose
}) => {
  const { t, isPt, toggleLanguage } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<GuideCategory>('runes');
  const [guideSearchQuery, setGuideSearchQuery] = useState<string>('');

  const currentGuide = useMemo<GuideContent | undefined>(() => {
    return getGuideByCategory(activeCategory);
  }, [activeCategory]);

  const filteredSections = useMemo(() => {
    if (!currentGuide) return [];
    if (!guideSearchQuery.trim()) return currentGuide.sections;

    const q = guideSearchQuery.trim().toLowerCase();
    return currentGuide.sections.filter((sec) => {
      const title = (isPt ? sec.titlePt || sec.titleEn : sec.titleEn).toLowerCase();
      const content = (isPt ? sec.contentPt || sec.contentEn : sec.contentEn).toLowerCase();
      return title.includes(q) || content.includes(q);
    });
  }, [currentGuide, guideSearchQuery, isPt]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 lg:p-8 select-none">
      <div className="relative w-full max-w-5xl h-[85vh] bg-[#0F1015] border border-[#262B3D] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="h-16 px-6 border-b border-[#262B3D] bg-[#12141A] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#151821] border border-[#D4A017] flex items-center justify-center shadow-gold-glow">
              <BookOpen className="w-5 h-5 text-[#D4A017]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#F8FAFC]">
                {t.guidesModal.title}
              </h2>
              <p className="text-xs text-[#94A3B8]">
                {t.guidesModal.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switch */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#151821] border border-[#262B3D] text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
            >
              <Languages className="w-3.5 h-3.5 text-[#D4A017]" />
              <span>{isPt ? '🇧🇷 PT-BR' : '🇺🇸 EN'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-[#151821] hover:bg-[#262B3D] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
              title={t.guidesModal.closeTooltip}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Navigation: 8 Guide Categories */}
          <div className="w-64 border-r border-[#262B3D] bg-[#090A0C] p-3 flex flex-col gap-1.5 overflow-y-auto flex-shrink-0">
            <div className="px-2 py-1 text-[10px] uppercase font-bold text-[#64748B] tracking-wider">
              {t.guidesModal.theoryModules}
            </div>
            {GUIDE_CATEGORIES.map((cat) => {
              const isSelected = activeCategory === cat;
              const label = t.guidesModal.categories[cat] || cat;
              const description = t.guidesModal.categoryDescriptions[cat] || '';
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setGuideSearchQuery('');
                  }}
                  className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-[#151821] border border-[#D4A017] shadow-sm'
                      : 'hover:bg-[#151821]/60 text-[#94A3B8] border border-transparent'
                  }`}
                >
                  <div className="mt-0.5">{GUIDE_CATEGORY_ICONS[cat]}</div>
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-bold truncate ${
                        isSelected ? 'text-[#D4A017]' : 'text-[#F8FAFC]'
                      }`}
                    >
                      {label}
                    </p>
                    <p className="text-[10px] text-[#64748B] line-clamp-1">
                      {description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#151821]">
            {/* Guide Title & Filter Search */}
            <div className="p-4 border-b border-[#262B3D] bg-[#0F1015] flex items-center justify-between gap-4 flex-shrink-0">
              <div>
                <h3 className="text-sm font-extrabold text-[#F8FAFC] flex items-center gap-2">
                  {isPt
                    ? currentGuide?.titlePt || currentGuide?.titleEn
                    : currentGuide?.titleEn}
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  {isPt
                    ? currentGuide?.descriptionPt || currentGuide?.descriptionEn
                    : currentGuide?.descriptionEn}
                </p>
              </div>

              {/* Guide section search */}
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={guideSearchQuery}
                  onChange={(e) => setGuideSearchQuery(e.target.value)}
                  placeholder={t.guidesModal.searchPlaceholder}
                  className="w-full bg-[#151821] border border-[#262B3D] focus:border-[#D4A017] text-xs text-[#F8FAFC] placeholder-[#64748B] rounded-lg pl-8 pr-3 py-1.5 outline-none"
                />
              </div>
            </div>

            {/* Guide Sections Scrollable Area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 select-text">
              {/* Interactive Combos Visualizer for Mechanics & Combos */}
              {activeCategory === 'mechanics_combos' && !guideSearchQuery && (
                <div className="mb-6 p-4 rounded-xl bg-[#090A0C] border border-[#D4A017]/40 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#262B3D]">
                    <h4 className="text-sm font-extrabold text-[#D4A017] uppercase tracking-wider flex items-center gap-2">
                      <Sword className="w-4 h-4 text-[#D4A017]" />
                      {t.guidesModal.combosSequencerTitle}
                    </h4>
                    <span className="text-[10px] font-mono text-[#94A3B8] bg-[#151821] px-2 py-0.5 rounded border border-[#262B3D]">
                      {t.guidesModal.combosSequencerBadge}
                    </span>
                  </div>
                  <p className="text-xs text-[#94A3B8]">
                    {t.guidesModal.combosSequencerDesc}
                  </p>
                  <CombosVisualizer initialCategory="all" showCategoryFilter={true} />
                </div>
              )}

              {filteredSections.length === 0 ? (
                <div className="py-16 text-center text-xs text-[#64748B]">
                  <HelpCircle className="w-8 h-8 mx-auto mb-2 text-[#64748B]/50" />
                  <p>{t.guidesModal.noResultsFound}</p>
                </div>
              ) : (
                filteredSections.map((sec, index) => {
                  const title = isPt ? sec.titlePt || sec.titleEn : sec.titleEn;
                  const subtitle = isPt ? sec.subtitlePt || sec.subtitleEn : sec.subtitleEn;
                  const content = isPt ? sec.contentPt || sec.contentEn : sec.contentEn;

                  return (
                    <div
                      key={sec.id || index}
                      className="p-4 rounded-xl bg-[#0F1015] border border-[#262B3D] space-y-2 hover:border-[#3A4259] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-[#D4A017] flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-[#262B3D] text-[#D4A017] font-mono text-xs flex items-center justify-center border border-[#D4A017]/30">
                            {sec.displayOrder || index + 1}
                          </span>
                          {title}
                        </h4>
                        {subtitle && (
                          <span className="text-xs font-medium text-[#94A3B8]">
                            {subtitle}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-[#F8FAFC]/90 leading-relaxed whitespace-pre-line pl-7">
                        {content}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralGuidesModal;
