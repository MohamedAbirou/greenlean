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
  requirements: ChallengeRequirements;
  start_date: string;
  end_date: string;
  is_active: boolean;
  participants_count: number;
  completion_rate: number;
}
