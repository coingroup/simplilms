// ============================================================
// Gamification Constants — Badge definitions & point values
// ============================================================

export const BADGE_DEFINITIONS: Record<
  string,
  { name: string; description: string; icon: string }
> = {
  first_lesson: {
    name: "First Steps",
    description: "Completed your first lesson",
    icon: "footprints",
  },
  five_lessons: {
    name: "Quick Learner",
    description: "Completed 5 lessons",
    icon: "zap",
  },
  twenty_lessons: {
    name: "Knowledge Seeker",
    description: "Completed 20 lessons",
    icon: "book-open",
  },
  fifty_lessons: {
    name: "Scholar",
    description: "Completed 50 lessons",
    icon: "graduation-cap",
  },
  first_quiz: {
    name: "Quiz Taker",
    description: "Passed your first quiz",
    icon: "check-circle",
  },
  perfect_quiz: {
    name: "Perfect Score",
    description: "Got 100% on a quiz",
    icon: "star",
  },
  first_course: {
    name: "Graduate",
    description: "Completed your first course",
    icon: "award",
  },
  three_courses: {
    name: "Overachiever",
    description: "Completed 3 courses",
    icon: "trophy",
  },
  streak_7: {
    name: "On Fire",
    description: "7-day activity streak",
    icon: "flame",
  },
  streak_30: {
    name: "Dedicated",
    description: "30-day activity streak",
    icon: "calendar-check",
  },
  first_post: {
    name: "Community Member",
    description: "Made your first forum post",
    icon: "message-square",
  },
  ten_posts: {
    name: "Contributor",
    description: "Made 10 forum posts",
    icon: "messages-square",
  },
  hundred_points: {
    name: "Century",
    description: "Earned 100 XP",
    icon: "target",
  },
  five_hundred_points: {
    name: "Rising Star",
    description: "Earned 500 XP",
    icon: "sparkles",
  },
  thousand_points: {
    name: "Legend",
    description: "Earned 1,000 XP",
    icon: "crown",
  },
};

// Point values for activities
export const POINTS = {
  lesson_complete: 10,
  quiz_pass: 25,
  quiz_perfect: 50,
  course_complete: 100,
  forum_post: 5,
  forum_reply: 3,
  streak_bonus_7: 25,
  streak_bonus_30: 100,
} as const;
