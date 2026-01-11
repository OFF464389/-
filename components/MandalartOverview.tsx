
import React, { memo } from 'react';
import { Goal, Theme } from '../types';

interface MandalartOverviewProps {
  rootGoal: Goal;
  year: number;
  theme: Theme;
  t: any;
  onCellClick: (goal: Goal) => void;
  onEditGoal: (goal: Goal) => void;
}

const MandalartOverview: React.FC<MandalartOverviewProps> = memo(({ rootGoal, year, theme, t, onCellClick, onEditGoal }) => {
  
  const getGoalProgress = (goal: Goal): number => {
    if (goal.isCompleted) return 1;
    if (!goal.subGoals || goal.subGoals.length === 0) return 0;
    const completedCount = goal.subGoals.reduce((acc, sub) => acc + getGoalProgress(sub), 0);
    return completedCount / goal.subGoals.length;
  };

  const renderSmallCell = (goal: Goal | undefined, isCenter: boolean = false, isRootCenterGrid: boolean = false) => {
    const progress = goal ? getGoalProgress(goal) : 0;
    const isCompleted = goal?.isCompleted || false;

    let bgStyle = "bg-white/95";
    let textColor = theme.text;

    if (isRootCenterGrid) {
      if (isCenter) {
        // 정중앙: 비전 대신 연도만 표시하며, 배경은 깨끗한 화이트
        bgStyle = "bg-white shadow-sm ring-1 ring-black/5 z-20";
        textColor = "font-black text-[10px] md:text-[14px]";
      } else {
        bgStyle = `${theme.accent} bg-opacity-40`;
      }
    } else {
      if (isCenter) {
        bgStyle = `${theme.accent} bg-opacity-30`;
      } else {
        bgStyle = "bg-white/80";
      }
    }

    if (isCompleted) {
      bgStyle = theme.solid;
      textColor = "text-white";
    } else if (progress > 0 && !isRootCenterGrid) {
      bgStyle = `${theme.accent} bg-opacity-80`;
    }

    // 연도 색상이 너무 밝다는 피드백을 반영하여 theme.text(어두운 톤)를 그대로 사용
    const getThemeTextColor = () => {
      if (isCenter && isRootCenterGrid) {
        return theme.text; // 기존 theme.solid(밝음) 대신 theme.text(어두움) 적용
      }
      return textColor;
    };

    return (
      <div
        className={`aspect-square flex items-center justify-center p-0.5 rounded-[4px] border border-black/5 transition-all duration-200 text-[6px] md:text-[9px] font-bold overflow-hidden leading-tight
          ${bgStyle} ${getThemeTextColor()}
        `}
      >
        <span className="line-clamp-2 text-center">
          {isCenter && isRootCenterGrid ? year : (goal?.text || "")}
        </span>
      </div>
    );
  };

  const renderGrid = (category: Goal | undefined, isRootCenter: boolean = false) => {
    const cells = isRootCenter 
        ? rootGoal.subGoals || [] 
        : category?.subGoals || [];

    const gridBg = isRootCenter 
      ? `bg-white/90 border-white/50 shadow-md scale-[1.04] z-10 rounded-xl` 
      : 'bg-white/20 border-white/10 backdrop-blur-[2px] rounded-lg shadow-sm';

    return (
      <div 
        className={`grid grid-cols-3 gap-[3px] md:gap-1.5 p-1 md:p-2 border transition-all duration-300 h-full cursor-pointer hover:scale-[1.01] active:scale-95
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
    <div className="grid grid-cols-3 gap-2 md:gap-5 w-full max-w-lg md:max-w-4xl mx-auto aspect-square p-2 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-500">
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
