
import React from 'react';
import type { UserProfile, LifeStats } from '../types';

interface Props {
  profile: UserProfile;
  stats: LifeStats | null;
}

const LifeGrid: React.FC<Props> = ({ profile, stats }) => {
  if (!stats) return null;

  const totalWeeks = profile.expectedAge * 52;
  const passedWeeks = stats.weeksPassed;

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(8px,1fr))] gap-1 md:gap-1.5">
      {Array.from({ length: totalWeeks }).map((_, i) => {
        const isPassed = i < passedWeeks;
        const isCurrent = i === passedWeeks;
        
        return (
          <div
            key={i}
            title={`Week ${i + 1}`}
            className={`
              aspect-square rounded-[1px] md:rounded-sm transition-all duration-500
              ${isPassed ? 'bg-zinc-800' : 'bg-white/5 hover:bg-white/20'}
              ${isCurrent ? 'bg-red-600 scale-125 shadow-[0_0_10px_rgba(220,38,38,0.8)] animate-pulse' : ''}
            `}
          />
        );
      })}
    </div>
  );
};

export default LifeGrid;

