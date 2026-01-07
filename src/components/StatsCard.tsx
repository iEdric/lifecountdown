
import React from 'react';
import type { LifeStats } from '../types';
import { translations } from '../translations';
import type { Language } from '../translations';
import { Clock } from 'lucide-react';

interface Props {
  stats: LifeStats | null;
  lang: Language;
}

const StatsCard: React.FC<Props> = ({ stats, lang }) => {
  const t = translations[lang];
  if (!stats) return null;

  return (
    <div className="bg-zinc-900/80 p-8 rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Clock size={80} />
      </div>
      
      <div className="mb-8">
        <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{t.lifeProgress}</div>
        <div className="flex items-baseline gap-2">
          <span className="text-6xl font-black tracking-tighter text-white">
            {stats.percentagePassed.toFixed(4)}
          </span>
          <span className="text-xl font-bold text-red-600">%</span>
        </div>
        <div className="w-full bg-white/5 h-2 rounded-full mt-4 overflow-hidden">
          <div 
            className="h-full bg-red-600 transition-all duration-1000" 
            style={{ width: `${stats.percentagePassed}%` }}
          />
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">{t.countdown}</div>
          <div className="text-3xl font-mono text-white tabular-nums">
            {stats.secondsRemaining.toLocaleString()}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">{t.daysRemaining}</div>
            <div className="text-xl font-mono text-white tabular-nums">{stats.daysRemaining.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">{t.hoursRemaining}</div>
            <div className="text-xl font-mono text-white tabular-nums">{stats.hoursRemaining.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;

