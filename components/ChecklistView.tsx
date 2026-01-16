
import React from 'react';
import { Goal, Theme } from '../types';
import { CheckCircle2, Circle, Edit3, Sparkles, Calendar, Plus } from 'lucide-react';
import { Language } from '../translations';

interface ChecklistViewProps {
  branchGoal: Goal;
  theme: Theme;
  t: any;
  language: Language;
  onEditGoal: (goal: Goal) => void;
  onUpdateGoal: (id: string, updates: Partial<Goal>, sound: any) => void;
  onAddSubGoal: () => void;
}

const ChecklistView: React.FC<ChecklistViewProps> = ({ branchGoal, theme, t, language, onEditGoal, onUpdateGoal, onAddSubGoal }) => {
  const subGoals = branchGoal.subGoals || [];
  
  const completedCount = subGoals.filter(g => g.isCompleted).length;
  const progress = subGoals.length > 0 ? (completedCount / subGoals.length) * 100 : 0;

  const handleToggle = (goal: Goal) => {
    const nextVal = !goal.isCompleted;
    onUpdateGoal(goal.id, { isCompleted: nextVal }, nextVal ? 'complete' : 'click');
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <div className="w-full max-w-md flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Progress Header */}
      <div className="bg-white/90 border border-black/[0.02] p-6 rounded-[2.5rem] mb-6 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className={theme.text} />
            <span className="text-xs font-black uppercase tracking-widest opacity-30">Detailed Schedule</span>
          </div>
          <span className={`text-xl font-black ${theme.text}`}>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-3 bg-black/5 rounded-full overflow-hidden">
          <div 
            className={`h-full ${theme.solid} transition-all duration-700 ease-out shadow-sm`} 
            style={{ width: `${progress}%` }} 
          />
        </div>
      </div>

      {/* List Items */}
      <div className="flex-1 space-y-2.5 overflow-y-auto no-scrollbar pb-10 px-1">
        {subGoals.map((goal, idx) => (
          <div 
            key={goal.id}
            className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all active-scale
              ${goal.isCompleted 
                ? 'bg-white/60 border-black/5 opacity-70' 
                : 'bg-white border-black/[0.03] shadow-sm hover:border-black/10'}
            `}
          >
            <button 
              onClick={() => handleToggle(goal)}
              className={`p-1 rounded-full transition-colors ${goal.isCompleted ? theme.text : 'opacity-10'}`}
            >
              {goal.isCompleted ? (
                <CheckCircle2 size={26} className="animate-in zoom-in-50" />
              ) : (
                <Circle size={26} />
              )}
            </button>
            
            <div 
              className="flex-1 cursor-pointer"
              onClick={() => onEditGoal(goal)}
            >
              <p className={`font-bold text-sm md:text-base leading-tight ${goal.isCompleted ? 'line-through opacity-40' : 'text-gray-800'}`}>
                {goal.text || (language === 'ko' ? `세부 내용을 입력하세요` : `Enter detail`)}
              </p>
              {goal.isCompleted && goal.completedAt && (
                <div className="flex items-center gap-1 mt-1 opacity-40">
                  <Calendar size={10} />
                  <p className="text-[9px] font-black uppercase tracking-tighter">
                    {formatDate(goal.completedAt)}
                  </p>
                </div>
              )}
            </div>

            <button 
              onClick={() => onEditGoal(goal)}
              className="p-2 opacity-10 group-hover:opacity-60 hover:bg-black/5 rounded-xl transition-all"
            >
              <Edit3 size={16} />
            </button>
          </div>
        ))}
        
        {/* 항목 추가 버튼 */}
        <button
          onClick={onAddSubGoal}
          className={`w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-black/5 bg-white/30 text-xs font-black uppercase tracking-widest opacity-40 hover:opacity-100 hover:border-black/20 transition-all active-scale`}
        >
          <Plus size={16} />
          {language === 'ko' ? "상세 일정 추가하기" : "Add Detail"}
        </button>
      </div>
    </div>
  );
};

export default ChecklistView;
