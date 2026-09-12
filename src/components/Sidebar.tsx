import React, { useRef, useEffect } from 'react';
import {
  Search,
  X,
  Star,
  ArrowUpDown,
  ShieldAlert
} from 'lucide-react';
import type { MatchupSummary } from '../types';
import { DifficultyBadge } from './DifficultyBadge';
import { dataDragon } from '../services/dataDragon';
import type { SortOption, DifficultyFilterOption } from '../hooks/useSearch';
import { useLanguage } from '../i18n';

interface SidebarProps {
  champions: MatchupSummary[];
  selectedChampionName: string;
  onSelectChampion: (name: string) => void;
  query: string;
  onQueryChange: (query: string) => void;
  difficultyFilter: DifficultyFilterOption;
  onDifficultyFilterChange: (diff: DifficultyFilterOption) => void;
  favoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
  favorites: Set<number>;
  onToggleFavorite: (id: number) => void;
  sortBy: SortOption;
  onSortByChange: (sort: SortOption) => void;
  totalCount: number;
  filteredCount: number;
  executionTimeMs: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  champions,
  selectedChampionName,
  onSelectChampion,
  query,
  onQueryChange,
  difficultyFilter,
  onDifficultyFilterChange,
  favoritesOnly,
  onToggleFavoritesOnly,
  favorites,
  onToggleFavorite,
  sortBy,
  onSortByChange,
  totalCount,
  filteredCount,
  executionTimeMs
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { t, isEn } = useLanguage();

  // Global Ctrl+K shortcut to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <aside className="w-80 h-full border-r border-[#262B3D] bg-[#0F1015] flex flex-col flex-shrink-0 select-none">
      {/* Search Input Box */}
      <div className="p-3 border-b border-[#262B3D] bg-[#12141A]">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={t.sidebar.searchPlaceholder}
            className="w-full bg-[#151821] border border-[#262B3D] focus:border-[#D4A017] text-xs text-[#F8FAFC] placeholder-[#64748B] rounded-lg pl-9 pr-14 py-2 outline-none transition-all duration-150"
          />
          {query.length > 0 ? (
            <button
              onClick={() => onQueryChange('')}
              className="absolute right-2 p-1 text-[#94A3B8] hover:text-[#F8FAFC] rounded"
              title={t.sidebar.clearSearch}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="absolute right-2.5 text-[10px] font-mono text-[#64748B] bg-[#090A0C] border border-[#262B3D] px-1.5 py-0.5 rounded pointer-events-none">
              Ctrl K
            </kbd>
          )}
        </div>

        {/* Latency & Count Meta */}
        <div className="flex items-center justify-between text-[11px] text-[#64748B] mt-2 px-1">
          <span>
            {isEn
              ? `${filteredCount} of ${totalCount} ${t.sidebar.countLabel}`
              : `${filteredCount} de ${totalCount} ${t.sidebar.countLabel}`}
          </span>
          <span className="font-mono text-[10px]">
            {executionTimeMs < 1 ? '<1ms' : `${executionTimeMs.toFixed(1)}ms`}
          </span>
        </div>
      </div>

      {/* Filter Tabs & Quick Toggles */}
      <div className="px-3 py-2 border-b border-[#262B3D] bg-[#0F1015] flex flex-col gap-2">
        {/* Difficulty Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-bold scrollbar-none">
          <button
            onClick={() => onDifficultyFilterChange('ALL')}
            className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap ${
              difficultyFilter === 'ALL'
                ? 'bg-[#262B3D] text-[#F8FAFC]'
                : 'text-[#94A3B8] hover:bg-[#151821] hover:text-[#F8FAFC]'
            }`}
          >
            {t.sidebar.filters.all}
          </button>
          <button
            onClick={() => onDifficultyFilterChange('EASY')}
            className={`px-2 py-1 rounded-md transition-all whitespace-nowrap ${
              difficultyFilter === 'EASY'
                ? 'bg-[#062E22] text-[#10B981] border border-[#059669]'
                : 'text-[#10B981]/70 hover:bg-[#062E22]/50'
            }`}
          >
            {t.sidebar.filters.easy}
          </button>
          <button
            onClick={() => onDifficultyFilterChange('MEDIUM')}
            className={`px-2 py-1 rounded-md transition-all whitespace-nowrap ${
              difficultyFilter === 'MEDIUM'
                ? 'bg-[#2E1E05] text-[#F59E0B] border border-[#D97706]'
                : 'text-[#F59E0B]/70 hover:bg-[#2E1E05]/50'
            }`}
          >
            {t.sidebar.filters.medium}
          </button>
          <button
            onClick={() => onDifficultyFilterChange('HARD')}
            className={`px-2 py-1 rounded-md transition-all whitespace-nowrap ${
              difficultyFilter === 'HARD'
                ? 'bg-[#381308] text-[#FB923C] border border-[#EA580C]'
                : 'text-[#FB923C]/70 hover:bg-[#381308]/50'
            }`}
          >
            {t.sidebar.filters.hard}
          </button>
          <button
            onClick={() => onDifficultyFilterChange('EXTREME')}
            className={`px-2 py-1 rounded-md transition-all whitespace-nowrap ${
              difficultyFilter === 'EXTREME'
                ? 'bg-[#2F0909] text-[#EF4444] border border-[#DC2626]'
                : 'text-[#EF4444]/70 hover:bg-[#2F0909]/50'
            }`}
          >
            {t.sidebar.filters.extreme}
          </button>
        </div>

        {/* Favorites & Sort Row */}
        <div className="flex items-center justify-between pt-1 border-t border-[#262B3D]/60 text-xs">
          <button
            onClick={onToggleFavoritesOnly}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-semibold transition-all ${
              favoritesOnly
                ? 'bg-[#D4A017]/15 border-[#D4A017] text-[#F3B72C]'
                : 'bg-[#151821] border-[#262B3D] text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-[#F3B72C] text-[#F3B72C]' : ''}`} />
            <span>{t.sidebar.filters.favorites} ({favorites.size})</span>
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-1 text-[#94A3B8]">
            <ArrowUpDown className="w-3 h-3 text-[#64748B]" />
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as SortOption)}
              className="bg-[#151821] border border-[#262B3D] text-[11px] text-[#F8FAFC] rounded px-1.5 py-0.5 outline-none cursor-pointer"
            >
              <option value="ALPHABETICAL_ASC">{t.sidebar.sort.alphabeticalAsc}</option>
              <option value="ALPHABETICAL_DESC">{t.sidebar.sort.alphabeticalDesc}</option>
              <option value="DIFFICULTY_ASC">{t.sidebar.sort.difficultyAsc}</option>
              <option value="DIFFICULTY_DESC">{t.sidebar.sort.difficultyDesc}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Champion List Virtualized/Optimized */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#262B3D]/50 px-2 py-1.5 space-y-1">
        {champions.length === 0 ? (
          <div className="py-12 px-4 text-center text-xs text-[#64748B]">
            <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-[#64748B]/50" />
            <p className="font-semibold text-[#94A3B8]">{t.sidebar.noResultsTitle}</p>
            <p className="mt-1">{t.sidebar.noResultsDesc}</p>
          </div>
        ) : (
          champions.map((champ) => {
            const isSelected =
              champ.championName.toLowerCase() === selectedChampionName.toLowerCase() ||
              champ.riotKey.toLowerCase() === selectedChampionName.toLowerCase();
            const isFav = favorites.has(champ.championId);

            return (
              <div
                key={champ.championId}
                onClick={() => onSelectChampion(champ.championName)}
                className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? 'bg-[#1B1F2C] border border-[#D4A017] shadow-sm'
                    : 'hover:bg-[#151821] border border-transparent'
                }`}
              >
                {/* Left: Portrait + Name */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative w-9 h-9 rounded-md overflow-hidden bg-[#090A0C] border border-[#262B3D] flex-shrink-0 group-hover:border-[#D4A017]/60 transition-colors">
                    <img
                      src={dataDragon.getChampionIconUrl(champ.championName)}
                      alt={champ.championName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = dataDragon.getOfflineSvgFallback(champ.championName);
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-bold truncate leading-snug ${
                        isSelected ? 'text-[#D4A017]' : 'text-[#F8FAFC] group-hover:text-[#F3B72C]'
                      }`}
                    >
                      {champ.championName}
                    </p>
                    <p className="text-[10px] text-[#64748B] truncate">
                      {champ.roles && champ.roles.length > 0 ? champ.roles.join(', ') : 'Top'}
                    </p>
                  </div>
                </div>

                {/* Right: Badge & Favorite Button */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <DifficultyBadge
                    tier={champ.difficultyTier}
                    rating={champ.difficultyRating}
                    size="sm"
                    showScore={true}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(champ.championId);
                    }}
                    className={`p-1 rounded hover:bg-[#262B3D] transition-colors ${
                      isFav ? 'text-[#F3B72C]' : 'text-[#64748B] hover:text-[#F8FAFC]'
                    }`}
                    title={isFav ? t.sidebar.favoriteTooltipRemove : t.sidebar.favoriteTooltipAdd}
                  >
                    <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-[#F3B72C]' : ''}`} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
