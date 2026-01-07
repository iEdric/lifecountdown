
import React, { useState, useEffect } from 'react';
import type { UserProfile, BucketItem, LifeStats } from './types';
import { calculateLifeStats, getAgePhaseKey } from './utils';
import { translations } from './translations';
import type { Language } from './translations';
import LifeGrid from './components/LifeGrid';
import LifeList from './components/LifeList';
import StatsCard from './components/StatsCard';
import ProfileSetup from './components/ProfileSetup';
import { Skull, Zap, Heart, Settings, Trash2, Download, X } from 'lucide-react';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('chronos_lang');
      if (saved === 'en' || saved === 'zh') return saved;
      return navigator.language.startsWith('zh') ? 'zh' : 'en';
    } catch (error) {
      console.error('Error initializing language:', error);
      return 'en';
    }
  });

  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('chronos_profile');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Failed to parse profile from localStorage:', error);
      return null;
    }
  });

  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPoster, setShowPoster] = useState<string | null>(null);

  const [bucketList, setBucketList] = useState<BucketItem[]>(() => {
    try {
      const saved = localStorage.getItem('chronos_bucket');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to parse bucket list from localStorage:', error);
      return [];
    }
  });

  const [stats, setStats] = useState<LifeStats | null>(null);

  const t = translations[lang];

  useEffect(() => {
    localStorage.setItem('chronos_lang', lang);
  }, [lang]);

  useEffect(() => {
    if (profile) {
      try {
        const update = () => {
          try {
            setStats(calculateLifeStats(profile));
          } catch (error) {
            console.error('Failed to calculate life stats:', error);
          }
        };
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
      } catch (error) {
        console.error('Error setting up stats update:', error);
      }
    }
  }, [profile]);

  useEffect(() => {
    if (profile) {
      localStorage.setItem('chronos_profile', JSON.stringify(profile));
      setIsConfiguring(false);
    }
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('chronos_bucket', JSON.stringify(bucketList));
  }, [bucketList]);

  const generateShareImage = async (): Promise<string | null> => {
    if (!stats || !profile) return null;

    try {
      if ('fonts' in document) await document.fonts.ready;
    } catch (e) {}

    const canvas = document.createElement('canvas');
    // 使用更高倍率确保清晰
    const scale = 2;
    canvas.width = 1080 * scale;
    canvas.height = 1440 * scale; 
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.scale(scale, scale);

    // Background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 1080, 1440);

    // MEMENTO MORI Background Text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.font = 'bold 130px "Playfair Display", serif';
    ctx.textAlign = 'center';
    ctx.fillText('MEMENTO MORI', 540, 220);

    // Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 45px "Inter", sans-serif';
    ctx.fillText(profile.name.toUpperCase(), 540, 520);

    // Percentage
    ctx.fillStyle = '#dc2626';
    ctx.font = '900 180px "Inter", sans-serif';
    ctx.fillText(`${stats.percentagePassed.toFixed(4)}%`, 540, 720);
    
    ctx.fillStyle = '#666666';
    ctx.font = '32px "Inter", sans-serif';
    ctx.fillText(lang === 'zh' ? '已逝生命进度' : 'LIFE PROGRESS EXHAUSTED', 540, 785);

    // Weeks
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 90px "Inter", sans-serif';
    ctx.fillText(stats.weeksRemaining.toLocaleString(), 540, 980);
    ctx.fillStyle = '#666666';
    ctx.font = '32px "Inter", sans-serif';
    ctx.fillText(lang === 'zh' ? '剩余周数' : 'WEEKS REMAINING', 540, 1040);

    // Phase Warning
    const phaseKey = getAgePhaseKey(new Date().getFullYear() - new Date(profile.birthday).getFullYear());
    ctx.fillStyle = '#ffffff';
    ctx.font = 'italic 36px "Playfair Display", serif';
    const warningText = t.agePhaseWarnings[phaseKey];
    
    const maxWidth = 800;
    const words = lang === 'zh' ? warningText.split('') : warningText.split(' ');
    let line = '';
    let y = 1180;
    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + (lang === 'zh' ? '' : ' ');
      let metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, 540, y);
        line = words[n] + (lang === 'zh' ? '' : ' ');
        y += 55;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 540, y);

    // Footer
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '24px "Inter", sans-serif';
    ctx.fillText('CHRONOS MIRROR • BEHOLD YOUR MORTALITY', 540, 1380);

    return canvas.toDataURL('image/png');
  };

  const handleShareClick = async () => {
    if (!stats || isGenerating) return;
    setIsGenerating(true);

    try {
      const dataUrl = await generateShareImage();
      if (!dataUrl) throw new Error("Generation failed");
      
      setShowPoster(dataUrl);
      
      // 尝试自动下载 (PC端友好)
      const fileName = `memento-mori-${profile?.name.replace(/\s+/g, '-').toLowerCase() || 'life'}.png`;
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // 复制文案
      const shareMessage = t.shareText(stats.percentagePassed.toFixed(2), stats.weeksRemaining.toLocaleString());
      try { await navigator.clipboard.writeText(`${shareMessage}\n\nGenerated via Chronos Mirror`); } catch(e) {}

    } catch (err) {
      console.error('Share failed', err);
      alert(lang === 'zh' ? '海报生成失败' : 'Failed to generate poster');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReconfigure = () => {
    if (window.confirm(t.reconfigConfirm)) setIsConfiguring(true);
  };

  const handleFullReset = () => {
    if (window.confirm(t.resetConfirm)) {
      localStorage.clear();
      window.location.reload();
    }
  };

  if (!profile || isConfiguring) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        width: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: '#000000',
        color: '#ffffff'
      }}>
        <ProfileSetup 
          onComplete={setProfile} 
          lang={lang} 
          initialProfile={profile || undefined} 
          onCancel={profile ? () => setIsConfiguring(false) : undefined} 
        />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-black text-gray-200 pb-20 selection:bg-red-900 selection:text-white"
      style={{ 
        minHeight: '100vh', 
        width: '100%', 
        background: '#000000', 
        color: '#e5e5e5',
        paddingBottom: '80px'
      }}
    >
      {/* 海报预览遮罩层 */}
      {showPoster && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center p-6 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setShowPoster(null)}>
          <button className="absolute top-6 right-6 p-2 text-white/50 hover:text-white transition-colors" onClick={() => setShowPoster(null)}>
            <X size={32} />
          </button>
          
          <div className="relative max-w-full max-h-[80vh] group shadow-2xl shadow-red-900/20" onClick={(e) => e.stopPropagation()}>
            <img 
              src={showPoster} 
              alt="Life Poster" 
              className="max-h-[80vh] rounded-lg border border-white/10" 
            />
            <div className="absolute inset-x-0 -bottom-12 text-center">
              <p className="text-red-500 text-sm font-bold animate-bounce">
                {lang === 'zh' ? '↑ 长按上方图片保存到相册 ↑' : '↑ Long press image to save ↑'}
              </p>
            </div>
          </div>
          
          <button 
            className="mt-20 px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-sm font-bold tracking-widest uppercase transition-all"
            onClick={() => setShowPoster(null)}
          >
            {lang === 'zh' ? '返回镜面' : 'CLOSE MIRROR'}
          </button>
        </div>
      )}

      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-red-600 flex items-center justify-center">
              <div className="w-1.5 h-3 bg-red-600 rotate-12"></div>
            </div>
            <h1 className="text-xl font-bold tracking-tighter uppercase">{t.title}</h1>
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            <div className="hidden lg:flex items-center gap-4 text-[10px] font-medium tracking-widest uppercase text-gray-500">
              <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-600"></div> {t.lived}</div>
              <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-white/10"></div> {t.remaining}</div>
            </div>
            
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
              <button onClick={() => setLang('en')} className={`px-2 py-1 text-[10px] font-bold rounded ${lang === 'en' ? 'bg-red-600 text-white' : 'text-gray-500'}`}>EN</button>
              <button onClick={() => setLang('zh')} className={`px-2 py-1 text-[10px] font-bold rounded ${lang === 'zh' ? 'bg-red-600 text-white' : 'text-gray-500'}`}>中文</button>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={handleReconfigure} className="p-2 bg-white/5 border border-white/10 rounded-lg text-gray-500 hover:text-white"><Settings size={18} /></button>
              <button onClick={handleFullReset} className="p-2 bg-white/5 border border-white/10 rounded-lg text-gray-500 hover:text-red-500"><Trash2 size={18} /></button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-12">
        <section className="mb-16 text-center">
          <h2 className="serif text-4xl md:text-6xl mb-4 italic text-white animate-pulse-subtle">"{t.mementoMori}"</h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">{t.introText(profile.name)}</p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-12">
            <section className="bg-zinc-900/30 p-8 rounded-3xl border border-white/5">
              <div className="flex items-center justify-between mb-8">
                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-red-500"><Zap size={16} /> {t.lifeGrid}</h3>
                <span className="text-xs text-gray-500">{stats?.weeksRemaining.toLocaleString()} {t.weeksRemaining}</span>
              </div>
              <LifeGrid profile={profile} stats={stats} />
            </section>

            <section className="bg-zinc-900/30 p-8 rounded-3xl border border-white/5">
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-red-500 mb-8"><Heart size={16} /> {t.bucketList}</h3>
              <LifeList list={bucketList} onUpdate={setBucketList} lang={lang} />
            </section>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-28 space-y-6">
              <StatsCard stats={stats} profile={profile} lang={lang} />
              <div className="bg-red-950/20 p-6 rounded-3xl border border-red-900/30">
                <h4 className="text-red-500 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2"><Skull size={14} /> {t.fatalWarning}</h4>
                <ul className="space-y-4 text-sm">
                  <li className="flex justify-between items-center text-gray-400"><span>{t.remainingSleep}</span><span className="text-white font-mono">≈ {stats?.sleepRemainingYears.toFixed(1)} {t.years}</span></li>
                  <li className="flex justify-between items-center text-gray-400"><span>{t.remainingWork}</span><span className="text-white font-mono">≈ {stats?.workRemainingYears.toFixed(1)} {t.years}</span></li>
                  <li className="pt-2 border-t border-red-900/20 text-red-400 font-medium italic">{t.freedomText}</li>
                </ul>
              </div>

              <div className="bg-zinc-900/50 p-6 rounded-3xl border border-white/5 text-center">
                <button 
                  onClick={handleShareClick}
                  disabled={isGenerating}
                  className={`w-full py-4 rounded-xl font-bold uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 ${
                    isGenerating ? 'bg-zinc-800 text-zinc-500 cursor-wait' : 'bg-white text-black hover:bg-gray-200'
                  }`}
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-t-transparent border-zinc-500 rounded-full animate-spin"></div> {lang === 'zh' ? '正在渲染真相...' : 'RENDERING TRUTH...'}</div>
                  ) : (
                    <><Download size={16} /> {t.shareBtn}</>
                  )}
                </button>
                <p className="mt-2 text-[10px] text-gray-500 uppercase tracking-tighter">
                  {lang === 'zh' ? '生成后长按图片可保存分享' : 'Long press to save after generation'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 w-full bg-red-600 text-white py-2 overflow-hidden whitespace-nowrap z-[100] pointer-events-none">
        <div className="flex animate-pulse-subtle">
           {[...Array(10)].map((_, i) => <span key={i} className="mx-4 text-xs font-black uppercase tracking-widest">{t.footerWarning}</span>)}
        </div>
      </div>
    </div>
  );
};

export default App;
