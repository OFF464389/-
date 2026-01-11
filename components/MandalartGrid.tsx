
import React, { memo } from 'react';
import { Goal, Theme } from '../types';

interface MandalartGridProps {
  grid: {
    center: Goal;
    surrounding: Goal[];
  };
  theme: Theme;
  year: number;
  onCellClick: (goal: Goal) => void;
  onCenterClick: (goal: Goal) => void;
  isMainLevel: boolean;
  t: any;
}

const MandalartGrid: React.FC<MandalartGridProps> = memo(({ grid, theme, year, onCellClick, onCenterClick, isMainLevel, t }) => {
  
  const getGoalProgress = (goal: Goal): number => {
    if (goal.isCompleted) return 1;
    if (!goal.subGoals || goal.subGoals.length === 0) return 0;
    const completedCount = goal.subGoals.reduce((acc, sub) => acc + getGoalProgress(sub), 0);
    return completedCount / goal.subGoals.length;
  };

  const renderCell = (index: number) => {
    const goal = grid.surrounding[index];
    if (!goal) return <div key={index} className="aspect-square bg-gray-50/50 rounded-lg border border-dashed border-gray-200" />;

    const progress = getGoalProgress(goal);
    let bgClass = isMainLevel ? `${theme.accent} bg-opacity-30` : theme.card;

    if (goal.isCompleted) {
      bgClass = theme.solid; 
    } else if (progress > 0) {
      bgClass = theme.accent;
    }

    return (
      <button
        key={goal.id}
        onClick={() => onCellClick(goal)}
        className={`relative aspect-square flex items-center justify-center p-2 rounded-lg md:rounded-xl shadow-sm border border-black/5 active:scale-95 transition-transform duration-75 paper-shadow
          ${bgClass}
          ${isMainLevel ? 'text-xs md:text-base font-black' : 'text-[10px] md:text-xs font-bold'}
          ${goal.isCompleted ? 'text-white' : ''}
        `}
      >
        {!goal.isCompleted && progress > 0 && (
           <div 
             className={`absolute inset-0 rounded-lg md:rounded-xl ${theme.accent} opacity-40`} 
           />
        )}

        <span className="relative z-10 text-center line-clamp-3 leading-tight">
          {goal.text || (isMainLevel ? `${t.branch}` : `${t.subTask}`)}
        </span>

        {goal.isCompleted && (
          <div className="absolute top-1.5 right-1.5 w-3 h-3 rounded-full bg-white/30 border border-white/50 flex items-center justify-center">
             <div className="w-1 h-1 bg-white rounded-full" />
          </div>
        )}
      </button>
    );
  };

  const centerProgress = getGoalProgress(grid.center);
  
  return (
    <div className="grid grid-cols-3 gap-2 md:gap-4 w-full aspect-square p-2 bg-white/60 rounded-xl border border-black/5 shadow-md">
      {renderCell(0)}
      {renderCell(1)}
      {renderCell(2)}

      {renderCell(3)}
      <button
        onClick={() => onCenterClick(grid.center)}
        className={`relative aspect-square flex items-center justify-center p-3 rounded-xl md:rounded-2xl shadow-md border-2 border-white active:scale-95 transition-transform duration-75
          bg-white ${theme.text}
          text-sm md:text-xl font-black text-center uppercase tracking-tight leading-tight paper-shadow overflow-hidden
        `}
      >
        <div 
          className={`absolute bottom-0 left-0 right-0 ${theme.solid} opacity-10`}
          style={{ height: `${centerProgress * 100}%` }}
        />
        <span className={`relative z-10 line-clamp-3 ${isMainLevel ? theme.text + ' text-2xl md:text-3xl' : ''}`}>
          {isMainLevel ? year : (grid.center.text || t.focus)}
        </span>
      </button>
      {renderCell(4)}

      {renderCell(5)}
      {renderCell(6)}
      {renderCell(7)}
    </div>
  );
});

export default MandalartGrid;
