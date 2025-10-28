import type { QuizProgressType } from "../types";


export const saveQuizProgress = (userId: string, progress: QuizProgressType): void => {
  try {
    localStorage.setItem(`quizProgress_${userId}`, JSON.stringify(progress));
  } catch (error) {
    console.error("Failed to save quiz progress:", error);
  }
};

export const loadQuizProgress = (userId: string): QuizProgressType | null => {
  try {
    const saved = localStorage.getItem(`quizProgress_${userId}`);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error("Failed to load quiz progress:", error);
  }
  return null;
};

export const clearQuizProgress = (userId: string): void => {
  try {
    localStorage.removeItem(`quizProgress_${userId}`);
  } catch (error) {
    console.error("Failed to clear quiz progress:", error);
  }
};
