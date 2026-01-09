
import React, { memo } from 'react';
import { Goal, Theme } from '../types';

interface MandalartOverviewProps {
  rootGoal: Goal;
  theme: Theme;
  t: any;
  onCellClick: (goal: Goal) => void;
  onEditGoal: (goal: Goal) => void;
}

const MandalartOverview: React.FC<MandalartOverviewProps> = memo(({ rootGoal, theme, t, onCellClick, onEditGoal }) => {
  
  const getGoalProgress = (goal: Goal): number => {
    if (goal.isCompleted) return 1;
    if (!goal.subGoals || goal.subGoals.length === 0) return 0;
    const completedCount = goal.subGoals.reduce((acc, sub) => acc + getGoalProgress(sub), 0);
    return completedCount / goal.subGoals.length;
  };

  const renderSmallCell = (goal: Goal | undefined, isCenter: boolean = false, isRootCenterGrid: boolean = false) => {
    const progress = goal ? getGoalProgress(goal) : 0;
    const isCompleted = goal?.isCompleted || false;

    let bgStyle = "bg-white/90";
    let textColor = theme.text;

    if (isRootCenterGrid) {
      if (isCenter) {
        bgStyle = "bg-white ring-1 ring-black/5";
      } else {
        bgStyle = `${theme.accent} bg-opacity-40`;
      }
    } else {
      if (isCenter) {
        bgStyle = `${theme.accent} bg-opacity-40`;
      } else {
        bgStyle = "bg-white/70";
      }
    }

    if (isCompleted) {
      bgStyle = theme.solid;
      textColor = "text-white";
    } else if (progress > 0 && !isRootCenterGrid) {
      bgStyle = `${theme.accent} bg-opacity-80`;
    }

    return (
      <div
        className={`aspect-square flex items-center justify-center p-0.5 rounded-sm border border-black/5 transition-all duration-200 text-[6px] md:text-[8px] font-bold overflow-hidden leading-tight
          ${bgStyle} ${textColor} shadow-sm
        `}
      >
        <span className="line-clamp-2 text-center">
          {goal?.text || (isCenter && isRootCenterGrid ? "VISION" : "")}
        </span>
      </div>
    );
  };

  const renderGrid = (category: Goal | undefined, isRootCenter: boolean = false) => {
    const cells = isRootCenter 
        ? rootGoal.subGoals || [] 
        : category?.subGoals || [];

    const gridBg = isRootCenter 
      ? `bg-white/80 border-black/5 shadow-md scale-[1.02] z-10` 
      : 'bg-white/40 border-white/40 backdrop-blur-sm';

    return (
      <div 
        className={`grid grid-cols-3 gap-0.5 p-1 rounded-lg border transition-all duration-300 h-full cursor-pointer hover:scale-[1.01] active:scale-95
          ${gridBg}
        `}
        onClick={() => category && onCellClick(category)}
      >
        {[0, 1, 2, 3, 'C', 4, 5, 6, 7].map((pos, idx) => {
          if (pos === 'C') {
            return (
              <React.Fragment key="center">
                {renderSmallCell(isRootCenter ? rootGoal : category, true, isRootCenter)}
              </React.Fragment>
            );
          }
          const cellIdx = pos as number;
          return (
            <React.Fragment key={idx}>
              {renderSmallCell(cells[cellIdx], false, isRootCenter)}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-3 gap-2 md:gap-4 w-full max-w-6xl mx-auto aspect-square p-3 bg-white/20 rounded-2xl border border-white/30 backdrop-blur-sm shadow-sm animate-in fade-in zoom-in-95 duration-500">
      {[0, 1, 2, 3, 'ROOT', 4, 5, 6, 7].map((pos, idx) => {
        if (pos === 'ROOT') {
          return <React.Fragment key="root">{renderGrid(rootGoal, true)}</React.Fragment>;
        }
        const catIdx = pos as number;
        const category = rootGoal.subGoals?.[catIdx];
        return <React.Fragment key={idx}>{renderGrid(category, false)}</React.Fragment>;
      })}
    </div>
  );
});

export default MandalartOverview;
