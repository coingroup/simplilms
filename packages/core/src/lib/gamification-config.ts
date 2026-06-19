// ============================================================
// Gamification constants and types
// Separated from server actions to allow client-side imports
// ============================================================

export interface BadgeDefinition {
  key: string;
  name: string;
  description: string;
  icon: string;
}

export type PointAction =
  | "lesson_complete"
  | "quiz_pass"
  | "quiz_perfect"
  | "streak_7"
  | "streak_30"
  | "course_complete"
  | "first_post"
  | "helpful_post";

export const BADGE_CATALOG: BadgeDefinition[] = [
  {
    key: "first_steps",
    name: "First Steps",
    description: "Completed your first lesson",
    icon: "Star",
  },
  {
    key: "quiz_whiz",
    name: "Quiz Whiz",
    description: "Passed 5 quizzes",
    icon: "Zap",
  },
  {
    key: "perfect_score",
    name: "Perfect Score",
    description: "Achieved 100% on a quiz",
    icon: "Award",
  },
  {
    key: "week_warrior",
    name: "Week Warrior",
    description: "Maintained a 7-day learning streak",
    icon: "Flame",
  },
  {
    key: "month_master",
    name: "Month Master",
    description: "Maintained a 30-day learning streak",
    icon: "Trophy",
  },
  {
    key: "course_champion",
    name: "Course Champion",
    description: "Completed a full course",
    icon: "GraduationCap",
  },
  {
    key: "discussion_starter",
    name: "Discussion Starter",
    description: "Created your first discussion thread",
    icon: "MessageSquare",
  },
  {
    key: "top_10",
    name: "Top 10",
    description: "Reached the top 10 on the leaderboard",
    icon: "BarChart3",
  },
];

export const POINT_VALUES: Record<PointAction, number> = {
  lesson_complete: 10,
  quiz_pass: 25,
  quiz_perfect: 50,
  course_complete: 100,
  first_post: 5,
  helpful_post: 5,
  streak_7: 50,
  streak_30: 200,
};
