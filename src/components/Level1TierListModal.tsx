import React, { useState, useMemo } from 'react';
import {
  X,
  Layers,
  Search,
  Sword,
  ShoppingBag,
} from 'lucide-react';
import type { MatchupSummary, Level1StartType } from '../types';
import { getAllMatchupsSummary } from '../data/data-engine';
import { dataDragon } from '../services/dataDragon';
import { useLanguage } from '../i18n';

interface Level1TierListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChampion: (championName: string) => void;
}

type ModalViewTab = 'ability_starts' | 'item_starts';

interface TierStyleConfig {
  id: Level1StartType;
  bgColor: string;
  borderColor: string;
  textColor: string;
  accentColor: string;
  icon: string;
}

interface ItemTierStyleConfig {
  id: 'shield_only' | 'blade_or_shield' | 'long_sword_rush';
  itemId: number;
  bgColor: string;
  borderColor: string;
  textColor: string;
  accentColor: string;
}

const ABILITY_STYLES: TierStyleConfig[] = [
  {
    id: 'Q',
    bgColor: 'bg-[#D4A017]/10',
    borderColor: 'border-[#D4A017]/40',
    textColor: 'text-[#D4A017]',
    accentColor: '#D4A017',
    icon: 'Q',
  },
  {
    id: 'W',
    bgColor: 'bg-[#EF4444]/10',
    borderColor: 'border-[#EF4444]/40',
    textColor: 'text-[#EF4444]',
    accentColor: '#EF4444',
    icon: 'W',
  },
  {
    id: 'E',
    bgColor: 'bg-[#10B981]/10',
    borderColor: 'border-[#10B981]/40',
    textColor: 'text-[#10B981]',
    accentColor: '#10B981',
    icon: 'E',
  },
  {
    id: 'E_ALCOVE',
    bgColor: 'bg-[#0284C7]/10',
    borderColor: 'border-[#0284C7]/40',
    textColor: 'text-[#38BDF8]',
    accentColor: '#38BDF8',
    icon: 'E',
  },
  {
    id: 'SITUATIONAL',
    bgColor: 'bg-[#8B5CF6]/10',
    borderColor: 'border-[#8B5CF6]/40',
    textColor: 'text-[#A78BFA]',
    accentColor: '#A78BFA',
    icon: '?',
  }
];

const ITEM_STYLES: ItemTierStyleConfig[] = [
  {
    id: 'shield_only',
    itemId: 1054,
    bgColor: 'bg-[#10B981]/10',
    borderColor: 'border-[#10B981]/40',
    textColor: 'text-[#10B981]',
    accentColor: '#10B981',
  },
  {
    id: 'blade_or_shield',
    itemId: 1055,
    bgColor: 'bg-[#D4A017]/10',
    borderColor: 'border-[#D4A017]/40',
    textColor: 'text-[#D4A017]',
    accentColor: '#D4A017',
  },
  {
    id: 'long_sword_rush',
    itemId: 1036,
    bgColor: 'bg-[#EF4444]/10',
    borderColor: 'border-[#EF4444]/40',
    textColor: 'text-[#EF4444]',
    accentColor: '#EF4444',
  }
];

export const Level1TierListModal: React.FC<Level1TierListModalProps> = ({
  isOpen,
  onClose,
  onSelectChampion
}) => {
  const { t } = useLanguage();
  const [activeViewTab, setActiveViewTab] = useState<ModalViewTab>('ability_starts');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAbilityTier, setSelectedAbilityTier] = useState<string>('all');
  const [selectedItemTier, setSelectedItemTier] = useState<string>('all');

  const abilityTierConfigs = useMemo(() => {
    return ABILITY_STYLES.map((style) => {
      const texts = t.tierListModal.abilityTiers[style.id];
      return {
        ...style,
        title: texts?.title || style.id,
        badge: texts?.badge || style.id,
        description: texts?.description || '',
      };
    });
  }, [t]);

  const itemTierConfigs = useMemo(() => {
    return ITEM_STYLES.map((style) => {
      const texts = t.tierListModal.itemTiers[style.id];
      return {
        ...style,
        title: texts?.title || style.id,
        badge: texts?.badge || style.id,
        itemName: texts?.itemName || style.id,
        description: texts?.description || '',
      };
    });
  }, [t]);

  const allChampions = useMemo<MatchupSummary[]>(() => {
    return getAllMatchupsSummary();
  }, []);

  // Filter for Ability Starts
  const filteredChampionsForAbility = useMemo(() => {
    return allChampions.filter((champ) => {
      if (selectedAbilityTier !== 'all' && champ.level1Start !== selectedAbilityTier) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        return champ.championName.toLowerCase().includes(q);
      }
      return true;
    });
  }, [allChampions, selectedAbilityTier, searchQuery]);

  // Group by Ability Tier
  const championsByAbilityTier = useMemo(() => {
    const groups: Record<Level1StartType, MatchupSummary[]> = {
      'Q': [],
      'W': [],
      'E': [],
      'E_ALCOVE': [],
      'SITUATIONAL': []
    };

    filteredChampionsForAbility.forEach((champ) => {
      const tier = champ.level1Start || 'Q';
      if (groups[tier]) {
        groups[tier].push(champ);
      } else {
        groups['Q'].push(champ);
      }
    });

    return groups;
  }, [filteredChampionsForAbility]);

  // Filter for Item Starts
  const filteredChampionsForItem = useMemo(() => {
    return allChampions.filter((champ) => {
      const items = (champ.startingItems || '').toLowerCase();
      let itemCategory = 'blade_or_shield';

      if (items.includes('shield') && !items.includes('blade')) {
        itemCategory = 'shield_only';
      } else if (items.includes('long sword') && !items.includes('shield')) {
        itemCategory = 'long_sword_rush';
      } else {
        itemCategory = 'blade_or_shield';
      }

      if (selectedItemTier !== 'all' && itemCategory !== selectedItemTier) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        return champ.championName.toLowerCase().includes(q);
      }
      return true;
    });
  }, [allChampions, selectedItemTier, searchQuery]);

  // Group by Item Tier
  const championsByItemTier = useMemo(() => {
    const groups: Record<string, MatchupSummary[]> = {
      'shield_only': [],
      'blade_or_shield': [],
      'long_sword_rush': []
    };

    allChampions.forEach((champ) => {
      const items = (champ.startingItems || '').toLowerCase();
      let itemCategory = 'blade_or_shield';

      if (items.includes('shield') && !items.includes('blade')) {
        itemCategory = 'shield_only';
      } else if (items.includes('long sword') && !items.includes('shield')) {
        itemCategory = 'long_sword_rush';
      } else {
        itemCategory = 'blade_or_shield';
      }

      if (groups[itemCategory]) {
        if (!searchQuery.trim() || champ.championName.toLowerCase().includes(searchQuery.trim().toLowerCase())) {
          groups[itemCategory].push(champ);
        }
      }
    });

    return groups;
  }, [allChampions, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 lg:p-6 select-none">
      <div className="relative w-full max-w-6xl h-[88vh] bg-[#0F1015] border border-[#262B3D] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-16 px-6 border-b border-[#262B3D] bg-[#12141A] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#151821] border border-[#D4A017] flex items-center justify-center shadow-gold-glow">
              <Layers className="w-5 h-5 text-[#D4A017]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-[#F8FAFC]">
                  {t.tierListModal.title}
                </h2>
                <span className="text-[10px] font-mono font-bold text-[#D4A017] bg-[#D4A017]/10 px-2 py-0.5 rounded border border-[#D4A017]/30">
                  {t.tierListModal.patchBadge}
                </span>
              </div>
              <p className="text-xs text-[#94A3B8]">
                {t.tierListModal.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative w-56">
              <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.tierListModal.searchPlaceholder}
                className="w-full bg-[#151821] border border-[#262B3D] focus:border-[#D4A017] text-xs text-[#F8FAFC] placeholder-[#64748B] rounded-lg pl-8 pr-3 py-1.5 outline-none"
              />
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-[#151821] hover:bg-[#262B3D] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
              title={t.tierListModal.closeTooltip}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top View Selector Tabs (Ability Starts vs Item Starts) */}
        <div className="flex items-center justify-between border-b border-[#262B3D] bg-[#0A0C10] px-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveViewTab('ability_starts');
                setSelectedAbilityTier('all');
              }}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
                activeViewTab === 'ability_starts'
                  ? 'border-[#D4A017] text-[#D4A017] bg-[#151821]/80'
                  : 'border-transparent text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              <Sword className="w-4 h-4 text-[#D4A017]" />
              <span>{t.tierListModal.tabs.level1Skills}</span>
            </button>

            <button
              onClick={() => {
                setActiveViewTab('item_starts');
                setSelectedItemTier('all');
              }}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
                activeViewTab === 'item_starts'
                  ? 'border-[#D4A017] text-[#D4A017] bg-[#151821]/80'
                  : 'border-transparent text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-[#10B981]" />
              <span>{t.tierListModal.tabs.startingItems}</span>
            </button>
          </div>

          <span className="text-[11px] text-[#94A3B8] italic hidden sm:inline">
            {t.tierListModal.clickChampionHint}
          </span>
        </div>

        {/* Tier Filter Pills Bar */}
        <div className="px-6 py-2.5 border-b border-[#262B3D] bg-[#0F1015] flex items-center justify-between gap-4 overflow-x-auto flex-shrink-0">
          {activeViewTab === 'ability_starts' ? (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase text-[#64748B] mr-1">{t.tierListModal.filterSkillLabel}</span>
              <button
                onClick={() => setSelectedAbilityTier('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedAbilityTier === 'all'
                    ? 'bg-[#D4A017] text-[#090A0C]'
                    : 'bg-[#151821] text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                {t.tierListModal.allFilter} ({filteredChampionsForAbility.length})
              </button>
              {abilityTierConfigs.map((tierConfig) => (
                <button
                  key={tierConfig.id}
                  onClick={() => setSelectedAbilityTier(selectedAbilityTier === tierConfig.id ? 'all' : tierConfig.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                    selectedAbilityTier === tierConfig.id
                      ? `${tierConfig.bgColor} ${tierConfig.borderColor} ${tierConfig.textColor}`
                      : 'bg-[#151821] border-transparent text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  {tierConfig.badge} ({championsByAbilityTier[tierConfig.id].length})
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase text-[#64748B] mr-1">{t.tierListModal.filterItemLabel}</span>
              <button
                onClick={() => setSelectedItemTier('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedItemTier === 'all'
                    ? 'bg-[#D4A017] text-[#090A0C]'
                    : 'bg-[#151821] text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                {t.tierListModal.allFilter} ({allChampions.length})
              </button>
              {itemTierConfigs.map((tierConfig) => (
                <button
                  key={tierConfig.id}
                  onClick={() => setSelectedItemTier(selectedItemTier === tierConfig.id ? 'all' : tierConfig.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                    selectedItemTier === tierConfig.id
                      ? `${tierConfig.bgColor} ${tierConfig.borderColor} ${tierConfig.textColor}`
                      : 'bg-[#151821] border-transparent text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  {tierConfig.badge} ({championsByItemTier[tierConfig.id]?.length || 0})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-[#151821]">
          {activeViewTab === 'ability_starts' ? (
            // TAB 1: Ability Starts Tier List
            abilityTierConfigs.map((tierConfig) => {
              const champs = championsByAbilityTier[tierConfig.id] || [];
              if (selectedAbilityTier !== 'all' && selectedAbilityTier !== tierConfig.id) return null;
              if (champs.length === 0 && searchQuery.trim()) return null;

              return (
                <div
                  key={tierConfig.id}
                  className="p-4 rounded-xl bg-[#0F1015] border border-[#262B3D] space-y-3 shadow-sm"
                >
                  {/* Tier Banner */}
                  <div className="flex items-start justify-between gap-4 pb-2 border-b border-[#262B3D]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-black text-sm border ${tierConfig.bgColor} ${tierConfig.borderColor} ${tierConfig.textColor}`}
                        >
                          {tierConfig.icon}
                        </span>
                        <h3 className={`text-sm font-extrabold ${tierConfig.textColor}`}>
                          {tierConfig.title}
                        </h3>
                        <span className="text-xs font-mono font-bold text-[#94A3B8] bg-[#151821] px-2 py-0.5 rounded border border-[#262B3D]">
                          {champs.length} {t.tierListModal.championsCountSuffix}
                        </span>
                      </div>
                      <p className="text-xs text-[#94A3B8] leading-relaxed pl-9">
                        {tierConfig.description}
                      </p>
                    </div>
                  </div>

                  {/* Champion Icons Grid */}
                  {champs.length === 0 ? (
                    <div className="py-4 text-center text-xs text-[#64748B] italic">
                      {t.tierListModal.noChampionsFound}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2.5 pt-1">
                      {champs.map((champ) => (
                        <button
                          key={champ.id}
                          onClick={() => {
                            onSelectChampion(champ.championName);
                            onClose();
                          }}
                          className="group relative flex flex-col items-center p-2 rounded-xl bg-[#151821] border border-[#262B3D] hover:border-[#D4A017] hover:bg-[#1C212E] transition-all text-center hover:scale-105"
                          title={`${champ.championName} - Iniciar com ${champ.level1Start}\nClique para ver matchup completa`}
                        >
                          <div className="relative mb-1.5">
                            <img
                              src={dataDragon.getChampionIconUrl(champ.championName)}
                              alt={champ.championName}
                              className="w-11 h-11 rounded-lg border border-[#262B3D] group-hover:border-[#D4A017] transition-colors"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = dataDragon.getOfflineSvgFallback(champ.championName, tierConfig.accentColor);
                              }}
                            />
                            <span
                              className={`absolute -bottom-1 -right-1 text-[9px] font-black font-mono px-1 rounded border ${tierConfig.bgColor} ${tierConfig.borderColor} ${tierConfig.textColor}`}
                            >
                              {tierConfig.icon}
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-[#F8FAFC] group-hover:text-[#D4A017] transition-colors truncate max-w-[70px]">
                            {champ.championName}
                          </span>
                          <span className="text-[9px] text-[#64748B] font-mono">
                            {champ.difficultyRaw.split(' - ')[0]}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            // TAB 2: Item Starts Tier List
            itemTierConfigs.map((itemTier) => {
              const champs = championsByItemTier[itemTier.id] || [];
              if (selectedItemTier !== 'all' && selectedItemTier !== itemTier.id) return null;
              if (champs.length === 0 && searchQuery.trim()) return null;

              return (
                <div
                  key={itemTier.id}
                  className="p-4 rounded-xl bg-[#0F1015] border border-[#262B3D] space-y-3 shadow-sm"
                >
                  {/* Tier Banner */}
                  <div className="flex items-start justify-between gap-4 pb-2 border-b border-[#262B3D]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={dataDragon.getItemIconUrl(itemTier.itemId)}
                          alt={itemTier.itemName}
                          className="w-8 h-8 rounded-lg border border-[#262B3D] p-0.5 bg-[#090A0C]"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = dataDragon.getOfflineSvgFallback('Item', itemTier.accentColor);
                          }}
                        />
                        <h3 className={`text-sm font-extrabold ${itemTier.textColor}`}>
                          {itemTier.title}
                        </h3>
                        <span className="text-xs font-mono font-bold text-[#94A3B8] bg-[#151821] px-2 py-0.5 rounded border border-[#262B3D]">
                          {champs.length} {t.tierListModal.championsCountSuffix}
                        </span>
                      </div>
                      <p className="text-xs text-[#94A3B8] leading-relaxed pl-10">
                        {itemTier.description}
                      </p>
                    </div>
                  </div>

                  {/* Champion Icons Grid */}
                  {champs.length === 0 ? (
                    <div className="py-4 text-center text-xs text-[#64748B] italic">
                      {t.tierListModal.noChampionsFound}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2.5 pt-1">
                      {champs.map((champ) => (
                        <button
                          key={champ.id}
                          onClick={() => {
                            onSelectChampion(champ.championName);
                            onClose();
                          }}
                          className="group relative flex flex-col items-center p-2 rounded-xl bg-[#151821] border border-[#262B3D] hover:border-[#D4A017] hover:bg-[#1C212E] transition-all text-center hover:scale-105"
                          title={`${champ.championName} - Itens: ${champ.startingItems}\nClique para ver matchup completa`}
                        >
                          <div className="relative mb-1.5">
                            <img
                              src={dataDragon.getChampionIconUrl(champ.championName)}
                              alt={champ.championName}
                              className="w-11 h-11 rounded-lg border border-[#262B3D] group-hover:border-[#D4A017] transition-colors"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = dataDragon.getOfflineSvgFallback(champ.championName, itemTier.accentColor);
                              }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-[#F8FAFC] group-hover:text-[#D4A017] transition-colors truncate max-w-[70px]">
                            {champ.championName}
                          </span>
                          <span className="text-[9px] text-[#64748B] font-mono">
                            {champ.difficultyRaw.split(' - ')[0]}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Level1TierListModal;
