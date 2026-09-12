import React, { useState } from 'react';
import { Flame, ChevronRight } from 'lucide-react';
import { dataDragon } from '../services/dataDragon';
import { useLanguage } from '../i18n';

export interface ComboStep {
  type: 'ability' | 'aa' | 'item';
  key?: 'Q' | 'W' | 'E' | 'R' | 'P';
  empowered?: boolean;
  itemKey?: 'Tiamat' | 'Stridebreaker' | 'Profane' | 'Ravenous' | 'Titanic';
  itemId?: number;
  label: string;
}

export interface ComboItem {
  id: string;
  name: string;
  nameEn?: string;
  category: 'auto_cancel' | 'safe_counters' | 'fast_trade' | 'item_actives' | 'all_in';
  furyCost: number;
  furyLabel: string;
  descriptionPt: string;
  descriptionEn: string;
  steps: ComboStep[];
  notes?: string;
  notesEn?: string;
}

export const RENENKTON_COMBOS: ComboItem[] = [
  // 1. Auto Cancel Basic Combos
  {
    id: 'ac_1',
    name: 'Auto Cancel Q > W Padrão',
    nameEn: 'Standard Q > W Auto Cancel',
    category: 'auto_cancel',
    furyCost: 15,
    furyLabel: '15 Fúria',
    descriptionPt: 'Cancela a animação do auto-ataque com Q, seguido de outro AA e W cancelando a recuperação.',
    descriptionEn: 'Auto attack cancel with Q, followed by another AA and W to cancel post-attack windup.',
    steps: [
      { type: 'aa', label: 'AA' },
      { type: 'ability', key: 'Q', label: 'Q' },
      { type: 'aa', label: 'AA' },
      { type: 'ability', key: 'W', label: 'W' },
      { type: 'aa', label: 'AA' },
      { type: 'ability', key: 'E', label: 'E' },
      { type: 'aa', label: 'AA' },
      { type: 'ability', key: 'E', label: 'E2' },
    ],
  },
  {
    id: 'ac_2',
    name: 'Auto Cancel W > Q Rápido',
    nameEn: 'Fast W > Q Auto Cancel',
    category: 'auto_cancel',
    furyCost: 15,
    furyLabel: '15 Fúria',
    descriptionPt: 'Inicia com AA > W para stun imediato, cancela com Q e desengaja com E duplo.',
    descriptionEn: 'AA > W for immediate stun, cancel with Q and double dash away.',
    steps: [
      { type: 'aa', label: 'AA' },
      { type: 'ability', key: 'W', label: 'W' },
      { type: 'aa', label: 'AA' },
      { type: 'ability', key: 'Q', label: 'Q' },
      { type: 'aa', label: 'AA' },
      { type: 'ability', key: 'E', label: 'E' },
      { type: 'aa', label: 'AA' },
      { type: 'ability', key: 'E', label: 'E2' },
    ],
  },
  {
    id: 'ac_3',
    name: 'E Iniciar + Auto Cancel',
    nameEn: 'E Gapclose + Auto Cancel',
    category: 'auto_cancel',
    furyCost: 20,
    furyLabel: '20 Fúria',
    descriptionPt: 'Usa o E1 para fechar distância, encaixa AA no frame de chegada, cancela com Q e W.',
    descriptionEn: 'E1 gapclose, buffer AA on landing frame, cancel into Q and W.',
    steps: [
      { type: 'ability', key: 'E', label: 'E' },
      { type: 'aa', label: 'AA' },
      { type: 'ability', key: 'Q', label: 'Q' },
      { type: 'aa', label: 'AA' },
      { type: 'ability', key: 'W', label: 'W' },
      { type: 'aa', label: 'AA' },
      { type: 'ability', key: 'E', label: 'E2' },
      { type: 'aa', label: 'AA' },
    ],
  },

  // 2. Safe Trading vs Counters
  {
    id: 'safe_1',
    name: 'Sustain + Poke Seguro (Q Fortalecido)',
    nameEn: 'Safe Sustain + Poke (Empowered Q)',
    category: 'safe_counters',
    furyCost: 40,
    furyLabel: '40 Fúria',
    descriptionPt: 'E1 para dentro da wave, Q Fortalecido para curar massivamente e causar dano, E2 de volta para segurança.',
    descriptionEn: 'E1 into wave, Empowered Q for massive healing and poke, E2 back to safety.',
    steps: [
      { type: 'ability', key: 'E', label: 'E' },
      { type: 'ability', key: 'Q', empowered: true, label: 'Q Fortalecido' },
      { type: 'ability', key: 'E', label: 'E2 Recuo' },
    ],
    notes: 'Sustain + Poke Combo',
    notesEn: 'Sustain + Poke Combo',
  },
  {
    id: 'safe_2',
    name: 'Sustain + Burst com Item Ativo',
    nameEn: 'Sustain + Burst with Item Active',
    category: 'safe_counters',
    furyCost: 40,
    furyLabel: '40 Fúria',
    descriptionPt: 'E1 > Q Fortalecido > Ativação de Hydra/Stridebreaker > AA > E2 para fora.',
    descriptionEn: 'E1 > Empowered Q > Item Active > AA > E2 out.',
    steps: [
      { type: 'ability', key: 'E', label: 'E' },
      { type: 'ability', key: 'Q', empowered: true, label: 'Q Fortalecido' },
      { type: 'item', itemKey: 'Stridebreaker', itemId: 6631, label: 'Item Ativo' },
      { type: 'aa', label: 'AA' },
      { type: 'ability', key: 'E', label: 'E2 Recuo' },
    ],
    notes: 'Sustain + Burst Combo',
    notesEn: 'Sustain + Burst Combo',
  },
  {
    id: 'safe_3',
    name: 'Fast Burst Zero Counterplay (30 Fúria)',
    nameEn: 'Fast Burst Zero Counterplay (30 Fury)',
    category: 'safe_counters',
    furyCost: 30,
    furyLabel: '30 Fúria',
    descriptionPt: 'E1 para colar > W Fortalecido (stun 1.5s) > Q imediato > AA > E2 para fora sem dar tempo de reação ao oponente.',
    descriptionEn: 'E1 gapclose > Empowered W (1.5s stun) > instant Q > AA > E2 out with 0 counterplay.',
    steps: [
      { type: 'ability', key: 'E', label: 'E' },
      { type: 'ability', key: 'W', empowered: true, label: 'W Fortalecido' },
      { type: 'ability', key: 'Q', label: 'Q' },
      { type: 'aa', label: 'AA' },
      { type: 'ability', key: 'E', label: 'E2' },
    ],
    notes: 'Fast Burst Combo, 0 Counter Play',
    notesEn: 'Fast Burst Combo, 0 Counter Play',
  },

  // 3. Fast Trade Combos
  {
    id: 'fast_1',
    name: 'Troca Rápida com Finalização de AA',
    nameEn: 'Fast Trade with AA Finish',
    category: 'fast_trade',
    furyCost: 20,
    furyLabel: '20 Fúria',
    descriptionPt: 'E1 > AA rápido > W (cancela animação) > Q > E2 para frente perseguindo > AA.',
    descriptionEn: 'E1 > fast AA > W animation cancel > Q > E2 forward > AA.',
    steps: [
      { type: 'ability', key: 'E', label: 'E' },
      { type: 'aa', label: 'AA' },
      { type: 'ability', key: 'W', label: 'W' },
      { type: 'ability', key: 'Q', label: 'Q' },
      { type: 'ability', key: 'E', label: 'E2' },
      { type: 'aa', label: 'AA' },
    ],
  },
  {
    id: 'fast_2',
    name: 'Combo Padrão de Troca Curta',
    nameEn: 'Standard Short Trade Combo',
    category: 'fast_trade',
    furyCost: 20,
    furyLabel: '20 Fúria',
    descriptionPt: 'E1 para dentro > Q poke > W stun > E2 para fora. Ideal contra Darius e Jax.',
    descriptionEn: 'E1 in > Q poke > W stun > E2 out. Ideal against Darius and Jax.',
    steps: [
      { type: 'ability', key: 'E', label: 'E' },
      { type: 'ability', key: 'Q', label: 'Q' },
      { type: 'ability', key: 'W', label: 'W' },
      { type: 'ability', key: 'E', label: 'E2 Recuo' },
    ],
    notes: 'Ideal vs Darius / Jax',
    notesEn: 'Ideal vs Darius / Jax',
  },

  // 4. Item Actives Combos
  {
    id: 'item_1',
    name: 'Cancel de W com Tiamat / Hidra',
    nameEn: 'W Animation Cancel with Tiamat / Hydra',
    category: 'item_actives',
    furyCost: 50,
    furyLabel: '50 Fúria',
    descriptionPt: 'W Fortalecido > ativação imediata de Tiamat/Hidra no primeiro frame para cortar o autostun de 0.5s > Q.',
    descriptionEn: 'Empowered W > instant Tiamat/Hydra active to cut 0.5s self-lockout > Q.',
    steps: [
      { type: 'ability', key: 'W', empowered: true, label: 'W Fortalecido' },
      { type: 'item', itemKey: 'Tiamat', itemId: 3077, label: 'Tiamat' },
      { type: 'ability', key: 'Q', label: 'Q' },
      { type: 'aa', label: 'AA' },
      { type: 'ability', key: 'E', label: 'E' },
    ],
    notes: 'Corta o autostun do W',
    notesEn: 'Cuts W self-stun lockout',
  },

  // 5. All-In Combos
  {
    id: 'allin_1',
    name: 'All-In Nível 6 Letal Completo',
    nameEn: 'Level 6 All-In Lethal Execution',
    category: 'all_in',
    furyCost: 50,
    furyLabel: '50 Fúria',
    descriptionPt: 'R pré-ativado na névoa ou no engage > E1 > AA > W Fortalecido (quebra escudo) > Tiamat > Q > E2 > AA.',
    descriptionEn: 'Pre-cast R > E1 gapclose > AA > Empowered W (shield break) > Tiamat > Q > E2 > AA finish.',
    steps: [
      { type: 'ability', key: 'R', label: 'R Dominus' },
      { type: 'ability', key: 'E', label: 'E' },
      { type: 'aa', label: 'AA' },
      { type: 'ability', key: 'W', empowered: true, label: 'W Fortalecido' },
      { type: 'item', itemKey: 'Profane', itemId: 6698, label: 'Hidra Ativa' },
      { type: 'ability', key: 'Q', label: 'Q' },
      { type: 'ability', key: 'E', label: 'E2' },
      { type: 'aa', label: 'AA' },
    ],
    notes: 'Máximo DPS em 2 segundos',
    notesEn: 'Max DPS within 2 seconds',
  },
];

interface CombosVisualizerProps {
  initialCategory?: 'all' | 'auto_cancel' | 'safe_counters' | 'fast_trade' | 'item_actives' | 'all_in';
  showCategoryFilter?: boolean;
  usePortuguese?: boolean;
}

export const CombosVisualizer: React.FC<CombosVisualizerProps> = ({
  initialCategory = 'all',
  showCategoryFilter = true,
  usePortuguese: explicitPortuguese,
}) => {
  const { t, isPt } = useLanguage();
  const isPortuguese = explicitPortuguese !== undefined ? explicitPortuguese : isPt;

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedFury, setSelectedFury] = useState<number | null>(null);

  const filteredCombos = RENENKTON_COMBOS.filter((c) => {
    if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
    if (selectedFury !== null && c.furyCost > selectedFury) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Category Pills & Fury Selector */}
      {showCategoryFilter && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#0F1015] rounded-xl border border-[#262B3D]">
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: t.combos.categories.all },
              { id: 'auto_cancel', label: `⚡ ${t.combos.categories.auto_cancel}` },
              { id: 'safe_counters', label: `🛡️ ${t.combos.categories.safe_counters}` },
              { id: 'fast_trade', label: `🎯 ${t.combos.categories.fast_trade}` },
              { id: 'item_actives', label: `⚔️ ${t.combos.categories.item_actives}` },
              { id: 'all_in', label: `💀 ${t.combos.categories.all_in}` },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#D4A017] text-[#090A0C] shadow-sm'
                    : 'bg-[#151821] text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#262B3D]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 text-xs font-mono text-[#94A3B8]">
            <Flame className="w-3.5 h-3.5 text-[#EAB308]" />
            <span className="text-[11px] uppercase font-bold text-[#64748B] mr-1">
              {isPortuguese ? 'Fúria Disp:' : 'Fury Req:'}
            </span>
            {[15, 30, 40, 50].map((fury) => (
              <button
                key={fury}
                onClick={() => setSelectedFury(selectedFury === fury ? null : fury)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors ${
                  selectedFury === fury
                    ? 'bg-[#EAB308]/20 border-[#EAB308] text-[#EAB308]'
                    : 'bg-[#151821] border-[#262B3D] text-[#94A3B8] hover:border-[#64748B]'
                }`}
              >
                {fury}+
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Combos List */}
      <div className="space-y-3">
        {filteredCombos.map((combo) => (
          <div
            key={combo.id}
            className="p-4 rounded-xl bg-[#0F1015] border border-[#262B3D] hover:border-[#3A4259] transition-all space-y-3"
          >
            {/* Header info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-black font-mono uppercase bg-[#EAB308]/10 text-[#EAB308] border border-[#EAB308]/30">
                  {combo.furyCost} {isPortuguese ? 'Fúria' : 'Fury'}
                </span>
                <h4 className="text-sm font-bold text-[#F8FAFC]">
                  {isPortuguese ? combo.name : combo.nameEn || combo.name}
                </h4>
              </div>

              {(combo.notes || combo.notesEn) && (
                <span className="text-[11px] font-semibold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20">
                  {isPortuguese ? combo.notes : combo.notesEn || combo.notes}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              {isPortuguese ? combo.descriptionPt : combo.descriptionEn}
            </p>

            {/* Visual Step by Step Flow */}
            <div className="flex items-center gap-2 overflow-x-auto py-2 px-1">
              {combo.steps.map((step, idx) => {
                let resolvedLabel = step.label;
                if (!isPortuguese) {
                  if (step.label === 'Q Fortalecido') resolvedLabel = 'Empowered Q';
                  else if (step.label === 'W Fortalecido') resolvedLabel = 'Empowered W';
                  else if (step.label === 'E2 Recuo') resolvedLabel = 'E2 Dash Out';
                  else if (step.label === 'Item Ativo' || step.label === 'Hidra Ativa') resolvedLabel = 'Item Active';
                  else if (step.label === 'R Dominus') resolvedLabel = 'R Dominus';
                }

                return (
                  <React.Fragment key={idx}>
                    {idx > 0 && (
                      <ChevronRight className="w-3.5 h-3.5 text-[#64748B] flex-shrink-0" />
                    )}

                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      {/* Icon Representation */}
                      {step.type === 'ability' && step.key && (
                        <div className="relative group">
                          <img
                            src={dataDragon.getRenektonSpellIconUrl(step.key)}
                            alt={resolvedLabel}
                            className={`w-9 h-9 rounded-lg border-2 bg-[#090A0C] p-0.5 transition-transform hover:scale-105 ${
                              step.empowered
                                ? 'border-[#EF4444] shadow-[0_0_8px_rgba(239,68,68,0.5)] ring-1 ring-[#EF4444]'
                                : step.key === 'W'
                                ? 'border-[#DC2626]/70'
                                : step.key === 'E'
                                ? 'border-[#0284C7]/70'
                                : step.key === 'R'
                                ? 'border-[#9333EA]/70'
                                : 'border-[#D4A017]/70'
                            }`}
                          />
                          <span
                            className={`absolute -bottom-1 -right-1 text-[8px] font-black font-mono px-1 rounded ${
                              step.empowered
                                ? 'bg-[#EF4444] text-white'
                                : 'bg-[#151821] text-[#F8FAFC] border border-[#262B3D]'
                            }`}
                          >
                            {step.key}
                          </span>
                        </div>
                      )}

                      {step.type === 'aa' && (
                        <div className="w-9 h-9 rounded-lg bg-[#151821] border border-[#64748B]/60 flex items-center justify-center text-xs font-black font-mono text-[#F8FAFC] shadow-sm">
                          AA
                        </div>
                      )}

                      {step.type === 'item' && (
                        <div className="relative group">
                          <img
                            src={dataDragon.getItemIconUrl(step.itemId || 3077)}
                            alt={resolvedLabel}
                            className="w-9 h-9 rounded-lg border border-[#F59E0B] bg-[#090A0C] p-0.5"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = dataDragon.getOfflineSvgFallback(
                                step.itemKey || 'Item',
                                '#F59E0B'
                              );
                            }}
                          />
                          <span className="absolute -bottom-1 -right-1 text-[8px] font-bold bg-[#F59E0B] text-black px-0.5 rounded">
                            Item
                          </span>
                        </div>
                      )}

                      {/* Step text label */}
                      <span className="text-[10px] font-medium text-[#94A3B8] max-w-[68px] text-center truncate">
                        {resolvedLabel}
                      </span>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CombosVisualizer;
