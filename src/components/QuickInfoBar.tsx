import React from 'react';
import type { MatchupDetail } from '../types';
import { dataDragon } from '../services/dataDragon';
import { Sparkles, Zap, Shield, Sword } from 'lucide-react';
import { useLanguage } from '../i18n';

interface QuickInfoBarProps {
  matchup: MatchupDetail;
}

export const QuickInfoBar: React.FC<QuickInfoBarProps> = ({ matchup }) => {
  const { t, isEn } = useLanguage();

  // Parse summoner spells for visual icons
  const summonersText = matchup.summonerSpells || 'Flash + Ignite';
  const hasFlash = /flash/i.test(summonersText);
  const hasIgnite = /ignite/i.test(summonersText);
  const hasTeleport = /tp|teleport/i.test(summonersText);
  const hasGhost = /ghost/i.test(summonersText);

  // Parse runes for visual icons
  const runesText = matchup.runesRecommendation || 'PTA > Resolve';
  const isPta = /pta|press the attack/i.test(runesText);
  const isConq = /conq|conqueror/i.test(runesText);
  const isGrasp = /grasp/i.test(runesText);

  // Parse starting items
  const itemsText = matchup.startingItems || "Doran's Blade";
  const hasDoranBlade = /blade|espada doran/i.test(itemsText);
  const hasDoranShield = /shield|escudo doran/i.test(itemsText);

  // Level 1 labels & descriptions
  const getLevel1BadgeLabel = () => {
    switch (matchup.level1Start) {
      case 'E':
        return isEn ? 'Lv. 1: E Start' : 'Nv. 1: E Início';
      case 'W':
        return isEn ? 'Lv. 1: W Anti-Allin' : 'Nv. 1: W Anti-Allin';
      case 'E_ALCOVE':
        return isEn ? 'Lv. 1: E Alcove' : 'Nv. 1: E Alcove';
      case 'SITUATIONAL':
        return isEn ? 'Lv. 1: Situational' : 'Nv. 1: Situacional';
      default:
        return isEn ? 'Lv. 1: Q Start' : 'Nv. 1: Q Início';
    }
  };

  const getLevel1Tooltip = () => {
    if (isEn) {
      switch (matchup.level1Start) {
        case 'E':
          return 'Slice and Dice (E) - Quick Trades / Gapclose';
        case 'W':
          return 'Ruthless Predator (W) - Anti-All-in Stun';
        case 'E_ALCOVE':
          return 'Slice and Dice (E) - Alcove Rush';
        case 'SITUATIONAL':
          return 'Reactive to Enemy Pick';
        default:
          return 'Cull the Meek (Q) - Poke & Push';
      }
    } else {
      switch (matchup.level1Start) {
        case 'E':
          return 'Fatiar e Cortar (E) - Trocas Rápidas';
        case 'W':
          return 'Predador Impiedoso (W) - Quebra de All-in';
        case 'E_ALCOVE':
          return 'Fatiar e Cortar (E) - Rush no Alcove';
        case 'SITUATIONAL':
          return 'Reativo ao Oponente';
        default:
          return 'Abater os Indefesos (Q) - Poke & Push';
      }
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 select-none">
      {/* 1. Recommended Runes */}
      <div className="lol-card p-3.5 flex flex-col justify-between border border-[#262B3D] hover:border-[#3A4259] transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#D4A017]" />
            {t.quickInfo.runes.title}
          </span>
          <span className="text-[10px] font-mono text-[#D4A017] bg-[#D4A017]/10 px-1.5 py-0.5 rounded border border-[#D4A017]/20">
            {t.quickInfo.runes.badge}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex -space-x-1.5 items-center">
            {isPta && (
              <img
                src={dataDragon.getRuneIconUrl('perk-images/Styles/Precision/PressTheAttack/PressTheAttack.png')}
                alt="PTA"
                className="w-8 h-8 rounded-full bg-[#090A0C] border-2 border-[#D4A017] p-0.5"
                title={isEn ? "Press the Attack (PTA)" : "Press the Attack (Pressione o Ataque)"}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = dataDragon.getOfflineSvgFallback('PTA', '#D4A017');
                }}
              />
            )}
            {isConq && (
              <img
                src={dataDragon.getRuneIconUrl('perk-images/Styles/Precision/Conqueror/Conqueror.png')}
                alt="Conqueror"
                className="w-8 h-8 rounded-full bg-[#090A0C] border-2 border-[#F3B72C] p-0.5"
                title={isEn ? "Conqueror" : "Conqueror (Conquistador)"}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = dataDragon.getOfflineSvgFallback('Conq', '#F3B72C');
                }}
              />
            )}
            {isGrasp && (
              <img
                src={dataDragon.getRuneIconUrl('perk-images/Styles/Resolve/GraspOfTheUndying/GraspOfTheUndying.png')}
                alt="Grasp"
                className="w-8 h-8 rounded-full bg-[#090A0C] border-2 border-[#10B981] p-0.5"
                title={isEn ? "Grasp of the Undying" : "Grasp of the Undying (Aperto dos Mortos-Vivos)"}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = dataDragon.getOfflineSvgFallback('Grasp', '#10B981');
                }}
              />
            )}
          </div>
          <p className="text-xs font-bold text-[#F8FAFC] leading-snug line-clamp-2">
            {matchup.runesRecommendation}
          </p>
        </div>
      </div>

      {/* 2. Summoner Spells */}
      <div className="lol-card p-3.5 flex flex-col justify-between border border-[#262B3D] hover:border-[#3A4259] transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#38BDF8]" />
            {t.quickInfo.spells.title}
          </span>
          <span className="text-[10px] font-mono text-[#38BDF8] bg-[#38BDF8]/10 px-1.5 py-0.5 rounded border border-[#38BDF8]/20">
            {t.quickInfo.spells.badge}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            {hasFlash && (
              <img
                src={dataDragon.getSpellIconUrl('Flash')}
                alt="Flash"
                className="w-7 h-7 rounded bg-[#090A0C] border border-[#262B3D]"
                title="Flash"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = dataDragon.getOfflineSvgFallback('Flash', '#F59E0B');
                }}
              />
            )}
            {hasIgnite && (
              <img
                src={dataDragon.getSpellIconUrl('Ignite')}
                alt="Ignite"
                className="w-7 h-7 rounded bg-[#090A0C] border border-[#262B3D]"
                title={isEn ? "Ignite" : "Ignite (Incendiar)"}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = dataDragon.getOfflineSvgFallback('Ignite', '#EF4444');
                }}
              />
            )}
            {hasTeleport && (
              <img
                src={dataDragon.getSpellIconUrl('Teleport')}
                alt="Teleport"
                className="w-7 h-7 rounded bg-[#090A0C] border border-[#262B3D]"
                title={isEn ? "Teleport" : "Teleport (Teleporte)"}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = dataDragon.getOfflineSvgFallback('TP', '#A78BFA');
                }}
              />
            )}
            {hasGhost && (
              <img
                src={dataDragon.getSpellIconUrl('Ghost')}
                alt="Ghost"
                className="w-7 h-7 rounded bg-[#090A0C] border border-[#262B3D]"
                title={isEn ? "Ghost" : "Ghost (Fantasma)"}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = dataDragon.getOfflineSvgFallback('Ghost', '#38BDF8');
                }}
              />
            )}
          </div>
          <p className="text-xs font-bold text-[#F8FAFC] leading-snug line-clamp-2">
            {matchup.summonerSpells}
          </p>
        </div>
      </div>

      {/* 3. Ability Max Order & Level 1 Start */}
      <div className="lol-card p-3.5 flex flex-col justify-between border border-[#262B3D] hover:border-[#3A4259] transition-all group relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
            <Sword className="w-3.5 h-3.5 text-[#10B981]" />
            {t.quickInfo.abilityMax.title}
          </span>
          <span
            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
              matchup.level1Start === 'E'
                ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
                : matchup.level1Start === 'W'
                ? 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30'
                : matchup.level1Start === 'E_ALCOVE'
                ? 'bg-[#0284C7]/15 text-[#38BDF8] border-[#0284C7]/30'
                : matchup.level1Start === 'SITUATIONAL'
                ? 'bg-[#8B5CF6]/15 text-[#A78BFA] border-[#8B5CF6]/30'
                : 'bg-[#D4A017]/15 text-[#D4A017] border-[#D4A017]/30'
            }`}
            title={
              (isEn ? matchup.level1ExplanationEn : matchup.level1ExplanationPt) ||
              getLevel1Tooltip()
            }
          >
            {getLevel1BadgeLabel()}
          </span>
        </div>

        {/* Visual Level 1 + Maxing progression */}
        <div className="flex items-center gap-2.5">
          {/* Level 1 Highlight Icon */}
          <div className="relative flex-shrink-0" title={getLevel1Tooltip()}>
            {matchup.level1Start === 'SITUATIONAL' ? (
              <div className="w-8 h-8 rounded-lg bg-[#151821] border-2 border-[#8B5CF6] flex items-center justify-center font-mono font-black text-sm text-[#A78BFA] shadow-sm">
                ?
              </div>
            ) : (
              <img
                src={dataDragon.getRenektonSpellIconUrl(
                  matchup.level1Start === 'W'
                    ? 'W'
                    : matchup.level1Start === 'E' || matchup.level1Start === 'E_ALCOVE'
                    ? 'E'
                    : 'Q'
                )}
                alt="Level 1 Start"
                className={`w-8 h-8 rounded-lg border-2 bg-[#090A0C] p-0.5 shadow-sm ${
                  matchup.level1Start === 'E' || matchup.level1Start === 'E_ALCOVE'
                    ? 'border-[#10B981]'
                    : matchup.level1Start === 'W'
                    ? 'border-[#EF4444]'
                    : 'border-[#D4A017]'
                }`}
              />
            )}
            <span className="absolute -bottom-1 -right-1 text-[8px] font-black font-mono bg-[#090A0C] text-[#F8FAFC] px-1 rounded border border-[#262B3D]">
              {isEn ? 'Lv1' : 'Nv1'}
            </span>
          </div>

          {/* Max Order Progression */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 font-mono font-bold text-xs">
              <span className="text-[#D4A017] bg-[#151821] px-1.5 py-0.5 rounded border border-[#D4A017]/30">
                {isEn ? '1st Q' : '1º Q'}
              </span>
              <span className="text-[#64748B] text-[10px]">&gt;</span>
              <span className="text-[#38BDF8] bg-[#151821] px-1.5 py-0.5 rounded border border-[#262B3D]">
                {isEn ? '2nd E' : '2º E'}
              </span>
              <span className="text-[#64748B] text-[10px]">&gt;</span>
              <span className="text-[#EF4444] bg-[#151821] px-1.5 py-0.5 rounded border border-[#262B3D]">
                {isEn ? '3rd W' : '3º W'}
              </span>
            </div>
            <p className="text-[10px] text-[#94A3B8] truncate mt-0.5" title={matchup.abilityMaxOrder}>
              Max: {matchup.abilityMaxOrder}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Starting Items */}
      <div className="lol-card p-3.5 flex flex-col justify-between border border-[#262B3D] hover:border-[#3A4259] transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#F59E0B]" />
            {t.quickInfo.items.title}
          </span>
          <span className="text-[10px] font-mono text-[#F59E0B] bg-[#F59E0B]/10 px-1.5 py-0.5 rounded border border-[#F59E0B]/20">
            {t.quickInfo.items.badge}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            {hasDoranBlade && (
              <img
                src={dataDragon.getItemIconUrl(1055)}
                alt="Doran's Blade"
                className="w-7 h-7 rounded bg-[#090A0C] border border-[#262B3D]"
                title={isEn ? "Doran's Blade" : "Lâmina de Doran (Doran's Blade)"}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = dataDragon.getOfflineSvgFallback('DBlade', '#EF4444');
                }}
              />
            )}
            {hasDoranShield && (
              <img
                src={dataDragon.getItemIconUrl(1054)}
                alt="Doran's Shield"
                className="w-7 h-7 rounded bg-[#090A0C] border border-[#262B3D]"
                title={isEn ? "Doran's Shield" : "Escudo de Doran (Doran's Shield)"}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = dataDragon.getOfflineSvgFallback('DShield', '#10B981');
                }}
              />
            )}
          </div>
          <p className="text-xs font-bold text-[#F8FAFC] leading-snug line-clamp-2">
            {matchup.startingItems}
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuickInfoBar;
