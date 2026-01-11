
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Settings, Home, ArrowLeft, Maximize2, Languages } from 'lucide-react';
import { Goal, Theme, YearData } from './types';
import { PASTEL_THEMES, createInitialYearData, createEmptyGoal } from './constants';
import { translations, Language } from './translations';
import MandalartGridComponent from './components/MandalartGrid';
import MandalartOverview from './components/MandalartOverview';
import DetailModal from './components/DetailModal';
import ThemePicker from './components/ThemePicker';

// 가벼운 클릭 소리 (틱)
const playClickSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.04);
  } catch (e) {}
};

const playCompleteSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const playNote = (freq: number, startTime: number, duration: number) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.4, startTime + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };
    const now = audioCtx.currentTime;
    playNote(1046.50, now, 0.4); 
    playNote(1318.51, now + 0.05, 0.5); 
  } catch (e) {}
};

const playRegisterSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  } catch (e) {}
};

const App: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [data, setData] = useState<Record<number, YearData>>({});
  const [navigationStack, setNavigationStack] = useState<Goal[]>([]);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [language, setLanguage] = useState<Language>('ko');
  const [isOverviewMode, setIsOverviewMode] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('mandalart_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData(parsed.data || {});
        if (parsed.language) setLanguage(parsed.language);
      } catch (e) {}
    }
  }, []);

  const persist = useCallback((newData: Record<number, YearData>, newLang: Language) => {
    localStorage.setItem('mandalart_v3', JSON.stringify({ data: newData, language: newLang }));
  }, []);

  const currentYearData = useMemo(() => {
    return data[selectedYear] || createInitialYearData(selectedYear);
  }, [data, selectedYear]);

  const theme = PASTEL_THEMES[currentYearData.colorTheme] || PASTEL_THEMES.softBlue;
  const t = translations[language];

  const currentFocus = useMemo(() => {
    if (navigationStack.length === 0) return currentYearData.rootGoal;
    
    const lastId = navigationStack[navigationStack.length - 1].id;
    const findInTree = (node: Goal): Goal | null => {
      if (node.id === lastId) return node;
      if (!node.subGoals) return null;
      for (const sub of node.subGoals) {
        const found = findInTree(sub);
        if (found) return found;
      }
      return null;
    };
    return findInTree(currentYearData.rootGoal) || navigationStack[navigationStack.length - 1];
  }, [navigationStack, currentYearData.rootGoal]);

  const findAndUpdateGoal = (root: Goal, targetId: string, updates: Partial<Goal>): Goal => {
    if (root.id === targetId) return { ...root, ...updates };
    if (!root.subGoals) return root;
    return {
      ...root,
      subGoals: root.subGoals.map(g => findAndUpdateGoal(g, targetId, updates))
    };
  };

  const handleUpdateGoal = useCallback((goalId: string, updates: Partial<Goal>, soundType: 'none' | 'register' | 'complete' | 'click' = 'none') => {
    if (soundType === 'register') playRegisterSound();
    else if (soundType === 'complete') playCompleteSound();
    else if (soundType === 'click') playClickSound();

    setData(prev => {
      const yearData = prev[selectedYear] || createInitialYearData(selectedYear);
      const updatedRoot = findAndUpdateGoal(yearData.rootGoal, goalId, updates);
      const nextData = {
        ...prev,
        [selectedYear]: { ...yearData, rootGoal: updatedRoot }
      };
      persist(nextData, language);
      return nextData;
    });

    setEditingGoal(prev => (prev && prev.id === goalId ? { ...prev, ...updates } : prev));
  }, [selectedYear, language, persist]);

  const handleCellClick = (goal: Goal) => {
    playClickSound();
    if (isOverviewMode) {
      setIsOverviewMode(false);
      setNavigationStack([goal]);
    } else {
      if (navigationStack.length < 2) {
        if (!goal.subGoals) {
          const subGoals = Array.from({ length: 8 }, (_, i) => createEmptyGoal(`${goal.id}-sub-${i}`));
          handleUpdateGoal(goal.id, { subGoals }, 'none');
        }
        setNavigationStack(prev => [...prev, goal]);
      } else {
        setEditingGoal(goal);
      }
    }
  };

  const handleYearChange = (delta: number) => {
    playClickSound();
    setSelectedYear(prev => prev + delta);
    setNavigationStack([]);
    setIsOverviewMode(true);
  };

  const toggleOverview = () => {
    playClickSound();
    setIsOverviewMode(!isOverviewMode);
    setNavigationStack([]);
  };

  const toggleLanguage = () => {
    playClickSound();
    const langs: Language[] = ['ko', 'en', 'jp'];
    const nextIdx = (langs.indexOf(language) + 1) % langs.length;
    const nextLang = langs[nextIdx];
    setLanguage(nextLang);
    persist(data, nextLang);
  };

  return (
    <div className={`fixed inset-0 flex flex-col transition-colors duration-75 ${theme.bg} ${theme.text} safe-top overflow-hidden`}>
      <nav className="z-40 bg-white/70 backdrop-blur-xl border-b border-white/50 px-4 py-3 flex-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { playClickSound(); setShowThemePicker(true); }} 
              className="p-2 active-scale bg-white/50 rounded-full shadow-sm"
              title={t.pickPalette}
            >
              <Settings size={18} />
            </button>
            <button 
              onClick={toggleLanguage} 
              className="p-2 active-scale bg-white/50 rounded-full shadow-sm flex items-center gap-1.5"
              title={t.language}
            >
              <Languages size={18} />
              <span className="text-[10px] font-bold uppercase tracking-tighter opacity-60">{language}</span>
            </button>
          </div>
          
          <div className="flex items-center gap-3 bg-white/80 px-3 py-1 rounded-full shadow-inner border border-white/50">
            <button onClick={() => handleYearChange(-1)} className="p-1 active-scale">
              <ChevronLeft size={18} />
            </button>
            <span className="text-lg font-black tracking-tighter w-12 text-center">{selectedYear}</span>
            <button onClick={() => handleYearChange(1)} className="p-1 active-scale">
              <ChevronRight size={18} />
            </button>
          </div>

          <button 
            onClick={toggleOverview}
            className="p-2 active-scale bg-white/50 rounded-full shadow-sm"
            title={isOverviewMode ? t.zoomView : t.overview}
          >
            {isOverviewMode ? <Maximize2 size={18} /> : <Home size={18} />} 
          </button>
        </div>
      </nav>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-40 mb-4 px-2">
            <span onClick={() => { playClickSound(); setIsOverviewMode(true); setNavigationStack([]); }}>{selectedYear}</span>
            {!isOverviewMode && navigationStack.map((step, idx) => (
              <React.Fragment key={step.id}>
                <span>/</span>
                <span 
                  className={idx === navigationStack.length - 1 ? 'text-black' : ''}
                  onClick={() => { playClickSound(); setNavigationStack(navigationStack.slice(0, idx + 1)); }}
                >
                  {step.text || t.branch}
                </span>
              </React.Fragment>
            ))}
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
            <h2 className="text-center mb-6 text-xl font-black tracking-tight flex items-center justify-center gap-3">
              {!isOverviewMode && navigationStack.length > 0 && (
                <button 
                  onClick={() => { playClickSound(); setNavigationStack(prev => prev.slice(0, -1)); }} 
                  className="active-scale bg-white/60 p-2 rounded-full shadow-sm"
                >
                  <ArrowLeft size={16} />
                </button>
              )}
              {isOverviewMode ? t.mainGrid : (currentFocus.text || t.branch)}
            </h2>
            
            <div className="flex justify-center items-center">
              {isOverviewMode ? (
                <MandalartOverview 
                  rootGoal={currentYearData.rootGoal}
                  theme={theme}
                  t={t}
                  onCellClick={handleCellClick}
                  onEditGoal={setEditingGoal}
                />
              ) : (
                <div className="w-full max-w-lg">
                  <MandalartGridComponent 
                    grid={{
                      center: currentFocus,
                      surrounding: currentFocus.subGoals || []
                    }}
                    theme={theme}
                    t={t}
                    onCellClick={handleCellClick}
                    onCenterClick={(goal) => { playClickSound(); setEditingGoal(goal); }}
                    isMainLevel={navigationStack.length === 1}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {editingGoal && (
        <DetailModal 
          goal={editingGoal} 
          onClose={() => { playClickSound(); setEditingGoal(null); }} 
          onSave={handleUpdateGoal}
          theme={theme}
          t={t}
        />
      )}

      {showThemePicker && (
        <ThemePicker 
          currentTheme={currentYearData.colorTheme} 
          onSelect={(themeKey) => {
            playClickSound();
            setData(prev => {
              const yearData = prev[selectedYear] || createInitialYearData(selectedYear);
              const nextData = { ...prev, [selectedYear]: { ...yearData, colorTheme: themeKey } };
              persist(nextData, language);
              return nextData;
            });
            setShowThemePicker(false);
          }} 
          onClose={() => { playClickSound(); setShowThemePicker(false); }} 
          t={t}
        />
      )}

      <footer className="bg-white/60 backdrop-blur-md border-t border-white/40 px-6 py-4 flex-none safe-bottom">
        <div className="text-[10px] text-center font-bold opacity-60 leading-tight uppercase tracking-tighter">
          {t.instruction}
        </div>
      </footer>
    </div>
  );
};

export default App;
