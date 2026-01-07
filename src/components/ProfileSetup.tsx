
import React, { useState, useEffect } from 'react';
import type { UserProfile } from '../types';
import { Skull, ArrowRight, X } from 'lucide-react';
import { translations } from '../translations';
import type { Language } from '../translations';

interface Props {
  onComplete: (profile: UserProfile) => void;
  lang: Language;
  initialProfile?: UserProfile;
  onCancel?: () => void;
}

const ProfileSetup: React.FC<Props> = ({ onComplete, lang, initialProfile, onCancel }) => {
  const [name, setName] = useState(initialProfile?.name || '');
  const [birthday, setBirthday] = useState(initialProfile?.birthday || '');
  const [expectedAge, setExpectedAge] = useState(initialProfile?.expectedAge || 80);
  const t = translations[lang];

  useEffect(() => {
    if (initialProfile) {
      setName(initialProfile.name);
      setBirthday(initialProfile.birthday);
      setExpectedAge(initialProfile.expectedAge);
    }
  }, [initialProfile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && birthday) {
      onComplete({ name, birthday, expectedAge });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6 relative overflow-hidden" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000000' }}>
      {/* Background aesthetics */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/5 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="max-w-md w-full relative z-10">
        {onCancel && (
          <button 
            onClick={onCancel}
            className="absolute -top-4 -right-4 p-2 text-gray-500 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        )}

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-4 border-red-600 mb-6 group transition-all duration-700 hover:rotate-[360deg]">
            <Skull size={40} className="text-red-600" />
          </div>
          <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">{t.title}</h1>
          <p className="text-gray-500 text-sm">{t.setupTitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block ml-1">{t.setupNameLabel}</label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.setupNamePlaceholder}
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-red-600 transition-all focus:ring-1 focus:ring-red-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block ml-1">{t.setupBirthLabel}</label>
            <input
              required
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-red-600 [color-scheme:dark] transition-all focus:ring-1 focus:ring-red-600"
            />
          </div>

          <div className="space-y-2">
            <label className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-400 px-1">
              {t.setupAgeLabel}
              <span className="text-red-500 font-mono">{expectedAge} {t.years}</span>
            </label>
            <input
              type="range"
              min="30"
              max="120"
              value={expectedAge}
              onChange={(e) => setExpectedAge(parseInt(e.target.value))}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-white text-black font-black uppercase py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-all active:scale-95 shadow-lg shadow-red-950/20"
          >
            {t.setupBtn} <ArrowRight size={20} />
          </button>
        </form>

        <p className="mt-12 text-center text-[10px] text-gray-600 uppercase tracking-widest leading-relaxed opacity-60">
          {t.setupFooter}
        </p>
      </div>
    </div>
  );
};

export default ProfileSetup;

