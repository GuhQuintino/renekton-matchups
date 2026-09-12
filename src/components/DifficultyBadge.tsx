import React from 'react';
import type { DifficultyTier } from '../types';

interface DifficultyBadgeProps {
  tier: DifficultyTier | string;
  rating?: number;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({
  tier,
  rating,
  showScore = true,
  size = 'md',
  className = ''
}) => {
  const normalizedTier = (tier || 'MEDIUM').toUpperCase();

  let colors = {
    bg: '#2E1E05',
    border: '#D97706',
    text: '#F59E0B',
    label: 'MÉDIO'
  };

  if (normalizedTier === 'EASY' || normalizedTier === 'FÁCIL') {
    colors = {
      bg: '#062E22',
      border: '#059669',
      text: '#10B981',
      label: 'FÁCIL'
    };
  } else if (normalizedTier === 'MEDIUM' || normalizedTier === 'MÉDIO') {
    colors = {
      bg: '#2E1E05',
      border: '#D97706',
      text: '#F59E0B',
      label: 'MÉDIO'
    };
  } else if (normalizedTier === 'HARD' || normalizedTier === 'DIFÍCIL') {
    colors = {
      bg: '#381308',
      border: '#EA580C',
      text: '#FB923C',
      label: 'DIFÍCIL'
    };
  } else if (normalizedTier === 'VERY HARD' || normalizedTier === 'EXTREME' || normalizedTier === 'MUITO DIFÍCIL') {
    colors = {
      bg: '#2F0909',
      border: '#DC2626',
      text: '#EF4444',
      label: 'MUITO DIFÍCIL'
    };
  }

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 font-semibold tracking-wide',
    md: 'text-xs px-2.5 py-1 font-bold tracking-wider',
    lg: 'text-sm px-3.5 py-1.5 font-extrabold tracking-widest'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full uppercase border shadow-sm transition-all duration-200 ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
        color: colors.text
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: colors.text }}
      />
      <span>{colors.label}</span>
      {showScore && rating !== undefined && (
        <span className="opacity-90 font-mono text-[90%]">
          {rating}/10
        </span>
      )}
    </span>
  );
};

export default DifficultyBadge;
