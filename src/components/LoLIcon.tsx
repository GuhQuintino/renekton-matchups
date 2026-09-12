import React, { useState } from 'react';
import { dataDragon } from '../services/dataDragon';
import { useLanguage } from '../i18n';

export type LoLIconType = 'champion' | 'item' | 'spell' | 'rune' | 'ability' | 'passive';
export type LoLIconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

export interface LoLIconProps {
  type: LoLIconType;
  nameOrId: string | number;
  size?: LoLIconSize;
  language?: 'pt-br' | 'en';
  empowered?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showBorder?: boolean;
  showBadge?: boolean;
  badgeLabel?: string;
  title?: string;
  className?: string;
  onClick?: () => void;
}

const SIZE_MAP: Record<string, { container: string; img: string; px: number }> = {
  xs: { container: 'w-4 h-4', img: 'w-4 h-4', px: 16 },
  sm: { container: 'w-6 h-6', img: 'w-6 h-6', px: 24 },
  md: { container: 'w-8 h-8', img: 'w-8 h-8', px: 32 },
  lg: { container: 'w-10 h-10', img: 'w-10 h-10', px: 40 },
  xl: { container: 'w-12 h-12', img: 'w-12 h-12', px: 48 },
};

const ROUNDED_MAP: Record<string, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
};

export const LoLIcon: React.FC<LoLIconProps> = ({
  type,
  nameOrId,
  size = 'md',
  language: explicitLanguage,
  empowered = false,
  rounded = 'lg',
  showBorder = true,
  showBadge = false,
  badgeLabel,
  title,
  className = '',
  onClick,
}) => {
  const { language: contextLanguage } = useLanguage();
  const language = explicitLanguage || contextLanguage || 'en';
  const [hasError, setHasError] = useState<boolean>(false);

  // Dimension styling
  const isCustomSize = typeof size === 'number';
  const sizeClass = !isCustomSize ? SIZE_MAP[size] || SIZE_MAP.md : null;
  const customStyle = isCustomSize ? { width: `${size}px`, height: `${size}px` } : undefined;
  const roundedClass = ROUNDED_MAP[rounded] || 'rounded-lg';

  // Resolve Image URL, Tooltip Name and Border Color
  let iconUrl = '';
  let resolvedTitle = title;
  let borderColor = '#262B3D';
  let badgeText = badgeLabel;

  switch (type) {
    case 'champion': {
      const champName = String(nameOrId);
      iconUrl = dataDragon.getChampionIconUrl(champName);
      resolvedTitle = title || champName;
      borderColor = '#D4A017';
      break;
    }
    case 'item': {
      iconUrl = dataDragon.getItemIconUrl(nameOrId);
      resolvedTitle = title || dataDragon.getItemName(nameOrId, language);
      borderColor = '#F59E0B';
      badgeText = badgeLabel || 'Item';
      break;
    }
    case 'spell': {
      const spellKey = String(nameOrId);
      iconUrl = dataDragon.getSpellIconUrl(spellKey);
      resolvedTitle = title || dataDragon.getSpellName(spellKey, language);
      borderColor = '#38BDF8';
      break;
    }
    case 'rune': {
      const runeKey = String(nameOrId);
      iconUrl = dataDragon.getRuneIconUrl(runeKey);
      resolvedTitle = title || dataDragon.getRuneName(runeKey, language);
      borderColor = '#10B981';
      break;
    }
    case 'ability':
    case 'passive': {
      const spell = (String(nameOrId).toUpperCase() as 'Q' | 'W' | 'E' | 'R' | 'P') || 'Q';
      iconUrl = dataDragon.getRenektonSpellIconUrl(spell);
      resolvedTitle = title || (dataDragon.getRenektonSpellName(spell, language) as string);
      badgeText = badgeLabel || spell;
      if (empowered) {
        borderColor = '#EF4444';
      } else if (spell === 'Q') {
        borderColor = '#10B981';
      } else if (spell === 'W') {
        borderColor = '#EF4444';
      } else if (spell === 'E') {
        borderColor = '#38BDF8';
      } else if (spell === 'R') {
        borderColor = '#A855F7';
      } else {
        borderColor = '#D4A017';
      }
      break;
    }
  }

  // Fallback offline SVG if image failed to load
  const fallbackUrl = dataDragon.getOfflineSvgFallback(String(nameOrId), borderColor);

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${sizeClass ? sizeClass.container : ''} ${className}`}
      style={customStyle}
      title={resolvedTitle}
      onClick={onClick}
    >
      <img
        src={hasError ? fallbackUrl : iconUrl}
        alt={resolvedTitle || 'LoL Icon'}
        className={`w-full h-full object-cover bg-[#090A0C] transition-transform ${roundedClass} ${
          showBorder
            ? empowered
              ? 'border-2 border-[#EF4444] shadow-[0_0_10px_rgba(239,68,68,0.5)] ring-1 ring-[#EF4444]'
              : 'border'
            : ''
        }`}
        style={showBorder && !empowered ? { borderColor } : undefined}
        onError={() => setHasError(true)}
        loading="lazy"
      />

      {/* Optional Tag Badge */}
      {showBadge && badgeText && (
        <span
          className={`absolute -bottom-1 -right-1 text-[8px] font-black font-mono px-1 rounded shadow-sm border ${
            empowered
              ? 'bg-[#EF4444] text-white border-[#EF4444]'
              : 'bg-[#151821] text-[#F8FAFC] border-[#262B3D]'
          }`}
        >
          {badgeText}
        </span>
      )}
    </div>
  );
};

export default LoLIcon;
