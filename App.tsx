
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Settings, Home, ArrowLeft, Maximize2, Languages, History, LayoutGrid } from 'lucide-react';
import { Goal, Theme, YearData } from './types';
import { PASTEL_THEMES, createInitialYearData, createEmptyGoal } from './constants';
import { translations, Language } from './translations';
import MandalartGridComponent from './components/MandalartGrid';
import MandalartOverview from './components/MandalartOverview';
import DetailModal from './components/DetailModal';
import ThemePicker from './components/ThemePicker';
import TimelineView from './components/TimelineView';
import ChecklistView from './components/ChecklistView';

let sharedAudioCtx: AudioContext | null = null;

const getAudioCtx = () => {
  if (!sharedAudioCtx) {
    sharedAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume();
  }
  return sharedAudioCtx;
};

const playClickSound = () => {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch (e) {}
};

const playCompleteSound = () => {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const playNote = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.4, startTime + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };
    playNote(1046.50, now, 0.4); 
    playNote(1318.51, now + 0.05, 0.5); 
  } catch (e) {}
};

const playRegisterSound = () => {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {}
};

const App: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [data, setData] = useState<Record<number, YearData>>({});
  const [isOverviewMode, setIsOverviewMode] = useState(true);
  const [isVisionPath, setIsVisionPath] = useState(false); // 중앙 2026 비전을 통해 들어왔는지 여부
  const [navigationStack, setNavigationStack] = useState<Goal[]>([]);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [language, setLanguage] = useState<Language>('ko');

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
    if (root.id === targetId) {
      if (updates.isCompleted === true && !root.isCompleted) {
        updates.completedAt = new Date().toISOString();
      } else if (updates.isCompleted === false) {
        updates.completedAt = undefined;
      }
      return { ...root, ...updates };
    }
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
      const nextData = { ...prev, [selectedYear]: { ...yearData, rootGoal: updatedRoot } };
      persist(nextData, language);
      return nextData;
    });

    setEditingGoal(prev => (prev && prev.id === goalId ? { ...prev, ...updates } : prev));
  }, [selectedYear, language, persist]);

  const handleAddSubGoal = useCallback((parentId: string) => {
    playClickSound();
    setData(prev => {
      const yearData = prev[selectedYear] || createInitialYearData(selectedYear);
      const findAndAdd = (node: Goal): Goal => {
        if (node.id === parentId) {
          const newId = `${parentId}-sub-${Date.now()}`;
          return { ...node, subGoals: [...(node.subGoals || []), createEmptyGoal(newId, "")] };
        }
        if (!node.subGoals) return node;
        return { ...node, subGoals: node.subGoals.map(findAndAdd) };
      };
      const updatedRoot = findAndAdd(yearData.rootGoal);
      const nextData = { ...prev, [selectedYear]: { ...yearData, rootGoal: updatedRoot } };
      persist(nextData, language);
      return nextData;
    });
  }, [selectedYear, language, persist]);

  const handleCellClick = (goal: Goal) => {
    playClickSound();
    if (isOverviewMode) {
      setIsOverviewMode(false);
      if (goal.id === currentYearData.rootGoal.id) {
        // 중앙 2026 비전 클릭 시 -> 비전 경로 시작
        setIsVisionPath(true);
        setNavigationStack([]);
      } else {
        // 외부 분야 클릭 시 -> 외부 경로 시작
        setIsVisionPath(false);
        setNavigationStack([goal]);
      }
    } else {
      if (isVisionPath) {
        // [중앙 2026 비전 경로]
        if (navigationStack.length === 0) {
          // 1단계(루트 3x3)에서 분야 클릭 -> 2단계(분야별 3x3 세부과제 그리드)로 진입
          setNavigationStack([goal]);
        } else if (navigationStack.length === 1) {
          // 2단계(분야별 3x3)에서 세부과제 클릭 -> 비전 경로이므로 이름 편집만
          setEditingGoal(goal);
        }
      } else {
        // [외부 분야 경로]
        if (navigationStack.length === 1) {
          // 세부과제 클릭 시 바로 체크리스트 진입
          setNavigationStack(prev => [...prev, goal]);
        }
      }
    }
  };

  const handleYearChange = (delta: number) => {
    playClickSound();
    setSelectedYear(prev => prev + delta);
    setNavigationStack([]);
    setIsOverviewMode(true);
    setIsVisionPath(false);
    setShowTimeline(false);
  };

  const toggleOverview = () => {
    playClickSound();
    setIsOverviewMode(true);
    setIsVisionPath(false);
    setNavigationStack([]);
    setShowTimeline(false);
  };

  const handleBack = () => {
    playClickSound();
    if (navigationStack.length === 0) {
      setIsOverviewMode(true);
      setIsVisionPath(false);
    } else {
      setNavigationStack(prev => prev.slice(0, -1));
    }
  };

  const toggleLanguage = () => {
    playClickSound();
    const langs: Language[] = ['ko', 'en', 'jp'];
    const nextIdx = (langs.indexOf(language) + 1) % langs.length;
    const nextLang = langs[nextIdx];
    setLanguage(nextLang);
    persist(data, nextLang);
  };

  const displayTitle = useMemo(() => {
    if (isOverviewMode) return t.mainGrid;
    if (navigationStack.length === 0) return `${selectedYear} Vision`;
    return currentFocus.text || t.branch;
  }, [isOverviewMode, navigationStack.length, currentFocus, selectedYear, t]);

  return (
    <div className={`fixed inset-0 flex flex-col transition-colors duration-150 ${theme.bg} ${theme.text} safe-top overflow-hidden`}>
      <nav className="z-40 bg-white/90 border-b border-black/5 px-4 py-2 flex-none shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1">
             <div 
               className={`w-10 h-10 bg-white rounded-xl shadow-md border border-black/5 flex items-center justify-center mr-1 overflow-hidden active-scale cursor-pointer ${isOverviewMode && !showTimeline ? 'ring-2 ring-blue-400' : ''}`} 
               onClick={toggleOverview}
             >
                <span className={`font-black text-xl bg-gradient-to-br ${theme.solid.replace('bg-', 'from-').replace('-400', '-300')} to-white/0 bg-clip-text text-transparent`}>M</span>
             </div>
            <button onClick={() => { playClickSound(); setShowThemePicker(true); }} className="p-2 active-scale rounded-full hover:bg-black/5">
              <Settings size={20} className="opacity-60" />
            </button>
            <button onClick={toggleLanguage} className="p-2 active-scale rounded-full hover:bg-black/5 flex items-center gap-1">
              <Languages size={20} className="opacity-60" />
              <span className="text-[10px] font-black uppercase tracking-tighter opacity-40">{language}</span>
            </button>
          </div>
          
          <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-inner border border-black/5">
            <button onClick={() => handleYearChange(-1)} className="p-1 active-scale opacity-60 hover:opacity-100">
              <ChevronLeft size={18} />
            </button>
            <span className="text-lg font-black tracking-tight w-12 text-center">{selectedYear}</span>
            <button onClick={() => handleYearChange(1)} className="p-1 active-scale opacity-60 hover:opacity-100">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => { playClickSound(); setShowTimeline(!showTimeline); setIsOverviewMode(false); }}
              className={`p-2.5 active-scale rounded-xl shadow-md border border-black/5 ${showTimeline ? theme.solid + ' text-white' : 'bg-white'}`}>
              <History size={20} />
            </button>
          </div>
        </div>
      </nav>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 md:px-8 md:py-10">
        <div className="max-w-5xl mx-auto h-full flex flex-col">
          
          {!showTimeline && !isOverviewMode && (
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest opacity-25 mb-4 px-3">
              <span className="cursor-pointer hover:opacity-100" onClick={toggleOverview}>{selectedYear}</span>
              {navigationStack.map((step, idx) => (
                <React.Fragment key={step.id}>
                  <span>/</span>
                  <span className={`cursor-pointer ${idx === navigationStack.length - 1 ? 'text-black opacity-90' : 'hover:opacity-100'}`}
                    onClick={() => setNavigationStack(navigationStack.slice(0, idx + 1))}>
                    {step.text || (idx === 0 ? t.branch : t.subTask)}
                  </span>
                </React.Fragment>
              ))}
            </div>
          )}

          <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-2 duration-300">
            {showTimeline ? (
               <TimelineView rootGoal={currentYearData.rootGoal} theme={theme} t={t} onClose={() => setShowTimeline(false)} onGoalClick={setEditingGoal} />
            ) : isOverviewMode ? (
               <div className="w-full flex flex-col items-center">
                 <h2 className="mb-6 text-xl font-black tracking-tight opacity-40 uppercase tracking-[0.2em]">{t.mainGrid}</h2>
                 <MandalartOverview rootGoal={currentYearData.rootGoal} year={selectedYear} theme={theme} t={t} onCellClick={handleCellClick} onEditGoal={setEditingGoal} />
               </div>
            ) : (
              <>
                <h2 className="mb-8 text-2xl font-black tracking-tighter flex items-center justify-center gap-4">
                  <button onClick={handleBack} className="active-scale bg-white p-2 rounded-full shadow-md border border-black/5">
                    <ArrowLeft size={18} />
                  </button>
                  <span className={`bg-white/60 px-6 py-2 rounded-2xl border border-black/5 min-w-[200px] text-center`}>
                    {displayTitle}
                  </span>
                </h2>
                
                <div className="w-full flex items-center justify-center flex-1 min-h-0">
                  {/* 체크리스트 뷰는 오직 '외부 경로'의 마지막 단계에서만 보여줌 */}
                  {!isVisionPath && navigationStack.length === 2 ? (
                    <ChecklistView 
                      branchGoal={currentFocus} theme={theme} t={t} language={language}
                      onEditGoal={setEditingGoal} onUpdateGoal={handleUpdateGoal}
                      onAddSubGoal={() => handleAddSubGoal(currentFocus.id)}
                    />
                  ) : (
                    <div className="w-full max-w-xl aspect-square">
                      <MandalartGridComponent 
                        grid={{ 
                          center: currentFocus, 
                          surrounding: currentFocus.subGoals || Array.from({length:8}, (_,i)=>createEmptyGoal(`${currentFocus.id}-slot-${i}`)) 
                        }}
                        theme={theme} t={t} year={selectedYear} onCellClick={handleCellClick}
                        onCenterClick={(goal) => { playClickSound(); setEditingGoal(goal); }}
                        isMainLevel={navigationStack.length === 0}
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {editingGoal && (
        <DetailModal goal={editingGoal} onClose={() => { playClickSound(); setEditingGoal(null); }} onSave={handleUpdateGoal} theme={theme} t={t} />
      )}

      {showThemePicker && (
        <ThemePicker currentTheme={currentYearData.colorTheme} onSelect={(themeKey) => {
            playClickSound();
            setData(prev => ({ ...prev, [selectedYear]: { ...currentYearData, colorTheme: themeKey } }));
            persist({ ...data, [selectedYear]: { ...currentYearData, colorTheme: themeKey } }, language);
            setShowThemePicker(false);
          }} onClose={() => setShowThemePicker(false)} t={t}
        />
      )}

      <footer className="bg-white/10 px-6 py-4 flex-none safe-bottom border-t border-black/5">
        <div className="text-[10px] text-center font-black opacity-25 leading-tight uppercase tracking-[0.2em]">
          {t.instruction}
        </div>
      </footer>
    </div>
  );
};

export default App;
