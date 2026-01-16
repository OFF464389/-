
import React, { useMemo } from 'react';
import { Goal, Theme } from '../types';
import { ArrowLeft, CalendarDays, CheckCircle2 } from 'lucide-react';

interface TimelineViewProps {
  rootGoal: Goal;
  theme: Theme;
  t: any;
  onClose: () => void;
  onGoalClick: (goal: Goal) => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({ rootGoal, theme, t, onClose, onGoalClick }) => {
  const allCompletedGoals = useMemo(() => {
    const goals: Goal[] = [];
    const traverse = (node: Goal) => {
      if (node.isCompleted && node.completedAt) {
        goals.push(node);
      }
      if (node.subGoals) {
        node.subGoals.forEach(traverse);
      }
    };
    traverse(rootGoal);
    return goals.sort((a, b) => new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime());
  }, [rootGoal]);

  const semesters = useMemo(() => {
    const firstHalf: Record<number, Goal[]> = {};
    const secondHalf: Record<number, Goal[]> = {};

    allCompletedGoals.forEach(goal => {
      const date = new Date(goal.completedAt!);
      const month = date.getMonth(); // 0-11
      if (month < 6) {
        if (!firstHalf[month]) firstHalf[month] = [];
        firstHalf[month].push(goal);
      } else {
        if (!secondHalf[month]) secondHalf[month] = [];
        secondHalf[month].push(goal);
      }
    });

    return { firstHalf, secondHalf };
  }, [allCompletedGoals]);

  const renderMonthSection = (monthIdx: number, goals: Goal[]) => (
    <div key={monthIdx} className="mb-6">
      <h5 className={`text-xs font-black uppercase tracking-widest ${theme.text} opacity-60 mb-2 px-1`}>
        {t.months[monthIdx]}
      </h5>
      <div className="space-y-2">
        {goals.map(goal => (
          <div 
            key={goal.id} 
            onClick={() => onGoalClick(goal)}
            className="bg-white/70 border border-black/[0.03] p-3 rounded-xl shadow-sm flex items-start gap-3 active:scale-[0.98] transition-transform cursor-pointer hover:bg-white"
          >
            <CheckCircle2 size={16} className={`${theme.text} mt-0.5 opacity-50`} />
            <div>
              <p className="text-sm font-bold leading-tight">{goal.text}</p>
              {goal.completedAt && (
                <span className="text-[10px] opacity-40 font-bold">
                  {new Date(goal.completedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const hasH1 = Object.keys(semesters.firstHalf).length > 0;
  const hasH2 = Object.keys(semesters.secondHalf).length > 0;

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right duration-300 w-full">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onClose} className="p-2.5 bg-white rounded-full shadow-md border border-black/5 active-scale">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
          <CalendarDays size={24} className="opacity-40" /> {t.timeline}
        </h2>
      </div>

      {allCompletedGoals.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center opacity-30 text-center px-10">
          <CalendarDays size={48} className="mb-4" />
          <p className="font-black text-sm uppercase tracking-widest">{t.noHistory}</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className={`p-6 rounded-3xl ${hasH1 ? 'bg-white/30 border border-white/50' : 'opacity-30'}`}>
              <h3 className={`text-lg font-black mb-6 flex items-center justify-between ${theme.text}`}>
                {t.firstHalf}
                <span className="text-[10px] bg-white/50 px-2 py-0.5 rounded-full border border-black/5">01-06</span>
              </h3>
              {(Object.entries(semesters.firstHalf) as [string, Goal[]][]).map(([m, goals]) => renderMonthSection(Number(m), goals))}
            </div>

            <div className={`p-6 rounded-3xl ${hasH2 ? 'bg-white/30 border border-white/50' : 'opacity-30'}`}>
              <h3 className={`text-lg font-black mb-6 flex items-center justify-between ${theme.text}`}>
                {t.secondHalf}
                <span className="text-[10px] bg-white/50 px-2 py-0.5 rounded-full border border-black/5">07-12</span>
              </h3>
              {(Object.entries(semesters.secondHalf) as [string, Goal[]][]).map(([m, goals]) => renderMonthSection(Number(m), goals))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineView;
