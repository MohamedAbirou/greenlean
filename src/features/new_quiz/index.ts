// src/features/quiz/index.ts

// API
export * from "./api/quizApi";

// Components
export { AuthGate } from "./components/AuthGate";
export { PhaseDots } from "./components/PhaseDots";
export { PhaseHeader } from "./components/PhaseHeader";
export { QuestionRenderer } from "./components/QuestionRenderer";
export { QuizCard } from "./components/QuizCard";
export { QuizLoading } from "./components/QuizLoading";
export { QuizNavigation } from "./components/QuizNavigation";
export { QuizProgress } from "./components/QuizProgress";
export { QuizSummary } from "./components/QuizSummary";

// Data
export { LOADING_MESSAGES, QUIZ_PHASES } from "./data/phases";

// Hooks
export { useQuizState } from "./hooks/useQuizState";
export { useQuizSubmission } from "./hooks/useQuizSubmission";

// Types
export type {
    CompletePlan,
    Exercise,
    HeightAnswer,
    Meal,
    MealFood,
    MealPlan,
    ProfileData,
    QuestionType,
    QuizAnswers,
    QuizPhase,
    QuizProgressType,
    QuizQuestion,
    UnitSystem,
    WeightAnswer,
    WorkoutDay,
    WorkoutPlan
} from "./types";

// Utils
export {
    cmToFeetInches,
    combineProfileWithQuizAnswers,
    feetInchesToCm,
    formatHeight,
    formatWeight,
    kgToLbs,
    lbsToKg,
    prepareAnswersForBackend
} from "./utils/conversion";
export { clearQuizProgress, loadQuizProgress, saveQuizProgress } from "./utils/storage";
export { canProceed, validateAnswer } from "./utils/validation";

