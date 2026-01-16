
import { Theme, Goal } from './types';

export const PASTEL_THEMES: Record<string, Theme> = {
  softBlue: {
    name: 'Soft Blue',
    bg: 'bg-blue-50',
    card: 'bg-white',
    accent: 'bg-blue-200',
    text: 'text-blue-900',
    hover: 'hover:bg-blue-100',
    solid: 'bg-blue-400',
  },
  mintGreen: {
    name: 'Mint Green',
    bg: 'bg-emerald-50',
    card: 'bg-white',
    accent: 'bg-emerald-200',
    text: 'text-emerald-900',
    hover: 'hover:bg-emerald-100',
    solid: 'bg-emerald-400',
  },
  peachPink: {
    name: 'Peach Pink',
    bg: 'bg-rose-50',
    card: 'bg-white',
    accent: 'bg-rose-200',
    text: 'text-rose-900',
    hover: 'hover:bg-rose-100',
    solid: 'bg-rose-400',
  },
  lavender: {
    name: 'Lavender',
    bg: 'bg-purple-50',
    card: 'bg-white',
    accent: 'bg-purple-200',
    text: 'text-purple-900',
    hover: 'hover:bg-purple-100',
    solid: 'bg-purple-400',
  },
  warmBeige: {
    name: 'Warm Beige',
    bg: 'bg-orange-50',
    card: 'bg-white',
    accent: 'bg-orange-100',
    text: 'text-orange-900',
    hover: 'hover:bg-orange-50',
    solid: 'bg-orange-300',
  },
};

// 키워드 최종 변경: 연구->도전, 자산->배움, 운동->미용, 책->취미, 배움->디자인
export const INITIAL_8_KEYWORDS = ["도전", "미용", "학교", "일상", "디자인", "취미", "배움", "건강"];

export const RECOMMEND_KEYWORDS = [
  ...INITIAL_8_KEYWORDS,
  "회사", "여행", "작업", "습관", "재테크", "자기계발", "가족", "친구", "명상"
];

export const createEmptyGoal = (id: string, text: string = ''): Goal => ({
  id,
  text,
  notes: '',
  isCompleted: false,
});

export const createInitialYearData = (year: number): any => {
  const root = createEmptyGoal(`root-${year}`, `${year} Vision`);
  
  // 1단계(루트) 하위에는 반드시 8개의 분야(2단계)가 존재
  root.subGoals = INITIAL_8_KEYWORDS.map((kw, i) => {
    const categoryGoal = createEmptyGoal(`sub-${year}-${i}`, kw);
    
    // 각 분야(2단계) 하위에도 반드시 8개의 세부과제(3단계)가 존재하도록 미리 생성
    // 이렇게 해야 9x9 전체 차트와 3x3 빙고판에서 즉시 키워드를 입력할 수 있음
    categoryGoal.subGoals = Array.from({ length: 8 }, (_, j) => 
      createEmptyGoal(`task-${year}-${i}-${j}`, '')
    );
    
    return categoryGoal;
  });
  
  return {
    year,
    rootGoal: root,
    colorTheme: 'softBlue',
  };
};
