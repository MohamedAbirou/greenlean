/**
 * Quiz Feature Types
 */

export type QuestionType =
  | "weight"
  | "height"
  | "radio"
  | "select"
  | "slider"
  | "textarea"
  | "multiselect"
  | "number";

export interface QuizQuestion {
  id: string;
  label: string;
  type: QuestionType;
  required: boolean;
  skippable?: boolean;
  description?: string;
  placeholder?: string;
  units?: string[];
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
}

export interface QuizPhase {
  id: number;
  name: string;
  description: string;
  icon: any;
  questions: QuizQuestion[];
}

export interface QuizAnswers {
  [key: string]: any;
}

export interface QuizProgress {
  currentPhase: number;
  currentQuestion: number;
  totalPhases: number;
  totalQuestions: number;
  percentComplete: number;
}

export interface QuizSubmission {
  userId: string;
  answers: QuizAnswers;
  completedAt: string;
}

export interface QuizResult {
  id: string;
  userId: string;
  answers: QuizAnswers;
  recommendations: {
    dietPlan?: any;
    workoutPlan?: any;
    calorieSuggestion?: number;
  };
  createdAt: string;
}
