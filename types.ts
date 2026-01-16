
export interface Goal {
  id: string;
  text: string;
  notes: string;
  isCompleted: boolean;
  completedAt?: string; // ISO string for the date of completion
  subGoals?: Goal[]; // Exactly 8 sub-goals if it has any
}

export interface YearData {
  year: number;
  rootGoal: Goal;
  colorTheme: string;
}

export interface NavigationPath {
  goal: Goal;
  index: number | null; // null for root
}

export interface Theme {
  name: string;
  bg: string;
  card: string;
  accent: string;
  text: string;
  hover: string;
  solid: string; // Solid color for Bingo effect
}
