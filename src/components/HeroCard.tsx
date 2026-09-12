import React from 'react';
import type { MatchupDetail } from '../types';
import { DifficultyBadge } from './DifficultyBadge';
import { dataDragon } from '../services/dataDragon';
import { Swords, Video, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../i18n';

interface HeroCardProps {
  matchup: MatchupDetail;
  isLiveLocked?: boolean;
}

export const HeroCard: React.FC<HeroCardProps> = ({ matchup, isLiveLocked = false }) => {
  const { t, isEn } = useLanguage();
  const splashUrl = dataDragon.getChampionSplashUrl(matchup.championName);
  const iconUrl = dataDragon.getChampionIconUrl(matchup.championName);

  return (
    <div className="relative rounded-xl overflow-hidden border border-[#262B3D] bg-[#151821] shadow-card-glow select-none">
      {/* Background Splash with Dark Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={splashUrl}
          alt={matchup.championName}
          className="w-full h-full object-cover object-top opacity-20 filter blur-[1px] scale-105 transition-transform duration-700"
          onError={(e) => {
            // Hide failed background image gracefully
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F1015] via-[#151821]/90 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#151821] via-transparent to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left Side: Avatar & Identification */}
        <div className="flex items-center gap-4">
          {/* Portrait with Golden / Difficulty Frame */}
          <div className="relative group">
            <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-[#D4A017] shadow-gold-glow bg-[#090A0C] flex-shrink-0">
              <img
                src={iconUrl}
                alt={matchup.championName}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = dataDragon.getOfflineSvgFallback(matchup.championName);
                }}
              />
            </div>
            {isLiveLocked && (
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-[#10B981] border-2 border-[#090A0C]"></span>
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4A017] flex items-center gap-1">
                <Swords className="w-3.5 h-3.5" />
                {t.heroCard.vsRenekton}
              </span>
              {isLiveLocked && (
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#062E22] text-[#10B981] border border-[#059669] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  {t.heroCard.laneOpponentDetected}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#F8FAFC] tracking-tight flex items-center gap-2">
              {matchup.championName}
            </h1>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              {matchup.roles && matchup.roles.length > 0 ? matchup.roles.join(' • ') : t.heroCard.defaultRole}
            </p>
          </div>
        </div>

        {/* Right Side: Difficulty Badge & Meta Pills */}
        <div className="flex items-center gap-3 self-end md:self-center">
          {matchup.hasVideo && matchup.videoUrl && (
            <a
              href={matchup.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#262B3D]/80 hover:bg-[#3A4259] border border-[#3A4259] text-xs font-semibold text-[#F8FAFC] transition-all duration-150"
              title={
                matchup.videoSource === 'godrekton_sheet'
                  ? t.heroCard.watchGodrektonGuideTooltip
                  : t.heroCard.watchReplayTooltip
              }
            >
              <Video className="w-3.5 h-3.5 text-[#EF4444]" />
              <span>
                {matchup.videoSource === 'godrekton_sheet'
                  ? t.heroCard.watchGodrektonGuide
                  : t.heroCard.watchReplay}
              </span>
            </a>
          )}

          <div className="flex flex-col items-end">
            <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
              {isEn ? "Godrekton's Difficulty" : 'Classificação do Godrekton'}
            </span>
            <DifficultyBadge
              tier={matchup.difficultyTier}
              rating={matchup.difficultyRating}
              size="lg"
              showScore={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroCard;
