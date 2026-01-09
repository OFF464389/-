
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

// 기본 초기 세팅 8개
export const INITIAL_8_KEYWORDS = ["연구", "운동", "학교", "일상", "배움", "책", "자산", "건강"];

// 추천 리스트에 추가될 확장 키워드
export const RECOMMEND_KEYWORDS = [
  ...INITIAL_8_KEYWORDS,
  "회사", "여행", "디자인", "작업", "취미", "습관", "목표", "도전", "재테크"
];

export const createEmptyGoal = (id: string, text: string = ''): Goal => ({
  id,
  text,
  notes: '',
  isCompleted: false,
});

export const createInitialYearData = (year: number): any => {
  const root = createEmptyGoal(`root-${year}`, `${year} Vision`);
  // 요청하신 순서대로 초기 8대 키워드 세팅
  root.subGoals = INITIAL_8_KEYWORDS.map((kw, i) => createEmptyGoal(`sub-${year}-${i}`, kw));
  
  return {
    year,
    rootGoal: root,
    colorTheme: 'softBlue',
  };
};
