// src/features/quiz/hooks/useQuizSubmission.ts (UPDATED)

import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { quizApi } from "../api/quizApi";
import type { ProfileData, QuizAnswers } from "../types";
import { combineProfileWithQuizAnswers, prepareAnswersForBackend } from "../utils/conversion";

export const useQuizSubmission = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitQuiz = async (
    userId: string,
    profileData: ProfileData | null,
    quizAnswers: QuizAnswers,
    clearProgress: () => void
  ) => {
    setIsSubmitting(true);

    try {
      const userUnitSystem = profileData?.unit_system || "metric";

      const combinedAnswers = combineProfileWithQuizAnswers(
        profileData!,
        quizAnswers,
        userUnitSystem
      );

      const preparedAnswers = prepareAnswersForBackend(combinedAnswers, userUnitSystem);

      quizApi.storeHealthProfile(combinedAnswers);
      clearProgress();

      // Save quiz results to database
      const quizResult = await quizApi.saveQuizResults(userId, preparedAnswers);

      if (!quizResult) {
        throw new Error("Failed to save quiz results");
      }

      // Generate plans asynchronously - returns immediately with calculations
      try {
        const { calculations, macros } = await quizApi.generatePlansAsync(
          userId,
          quizResult.id,
          preparedAnswers,
          "openai",
          "gpt-4o-mini"
        );

        // Store calculations
        localStorage.setItem(
          "quizCalculations",
          JSON.stringify({
            calculations,
            macros,
            generatedAt: new Date().toISOString(),
          })
        );

        toast.success("Quiz complete! Your plans are being generated...");
      } catch (mlError) {
        console.error("Error starting plan generation:", mlError);
        toast.error("Something went wrong while starting plan generation");
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
      
      // Navigate immediately - plans will load in background
      navigate("/dashboard");
    }
  };

  return {
    submitQuiz,
    isSubmitting,
  };
};
