import React from 'react';
import type { MatchupDetail } from '../types';
import { HeroCard } from './HeroCard';
import { QuickInfoBar } from './QuickInfoBar';
import { MatchupTabs } from './MatchupTabs';
import { ShieldAlert } from 'lucide-react';

interface MatchupViewProps {
  matchup?: MatchupDetail;
  isLoading?: boolean;
  isLiveLocked?: boolean;
}

export const MatchupView: React.FC<MatchupViewProps> = ({
  matchup,
  isLoading = false,
  isLiveLocked = false
}) => {
  if (!matchup) {
    return (
      <main className="flex-1 h-full bg-[#090A0C] p-5 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#D4A017] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#94A3B8] font-medium">Carregando dados da matchup...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 h-full overflow-y-auto bg-[#090A0C] p-4 lg:p-6 flex flex-col gap-4">
      {/* 1. Hero Card */}
      <HeroCard matchup={matchup} isLiveLocked={isLiveLocked} />

      {/* 2. Quick Info Bar (3-Second Decision) */}
      <QuickInfoBar matchup={matchup} />

      {/* 3. Detailed Tabs (Summary, 10-15 Tips, Fury, Videos) */}
      <MatchupTabs matchup={matchup} />
    </main>
  );
};

export default MatchupView;
