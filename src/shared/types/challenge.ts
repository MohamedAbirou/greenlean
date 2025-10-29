interface ChallengeRequirements {
  target: number;
  metric?: string;
  timeframe?: string;
}

interface Participant {
  id: string;
  user_id: string;
  completed: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "daily" | "weekly" | "streak" | "goal";
  difficulty: "beginner" | "intermediate" | "advanced";
  points: number;
  badge_id?: string;
  badge?: Badge;
  requirements: ChallengeRequirements;
  start_date: string;
  end_date: string;
  is_active: boolean;
  participants: Participant[];
  participants_count: number;
  completion_rate: number;
  user_progress: {
    progress: {
      current: number;
    };
    completed: boolean;
    streak_count: number;
    streak_expires_at: string;
  };
  created_at: string;
}

export interface UserRewards {
  points: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earned_at: string;
}