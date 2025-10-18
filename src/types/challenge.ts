export interface ChallengeRequirements {
  target: number;
  metric?: string;
  timeframe?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "daily" | "weekly" | "streak" | "goal";
  difficulty: "beginner" | "intermediate" | "advanced";
  points: number;
  badge_id?: string | null;
  badge?: Badge | null;
  requirements: ChallengeRequirements;
  start_date: string;
  end_date: string;
  is_active: boolean;
  participants_count: number;
  completion_rate: number;
  user_progress: {
    progress: {
      current: number;
    };
    completed: boolean;
    streak_count: number;
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}