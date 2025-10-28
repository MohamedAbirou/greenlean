// src/features/quiz/hooks/useQuizState.ts

import { useAuth } from "@/features/auth";
import { useEffect, useState } from "react";
import { quizApi } from "../api/quizApi";
import { QUIZ_PHASES } from "../data/phases";
import type { ProfileData, QuizAnswers } from "../types";
import { clearQuizProgress, loadQuizProgress, saveQuizProgress } from "../utils/storage";
import { canProceed as canProceedUtil, validateAnswer } from "../utils/validation";

export const useQuizState = () => {
  const { user, loading: authLoading } = useAuth();

  const [currentPhase, setCurrentPhase] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [heightUnit, setHeightUnit] = useState("cm");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [progressRestored, setProgressRestored] = useState(false);

  const phase = QUIZ_PHASES[currentPhase];
  const question = phase.questions[currentQuestion];

  // Load saved progress
  useEffect(() => {
    if (!user) return;

    const savedProgress = loadQuizProgress(user.id);
    if (savedProgress) {
      setCurrentPhase(savedProgress.currentPhase || 0);
      setCurrentQuestion(savedProgress.currentQuestion || 0);
      setAnswers(savedProgress.answers || {});
      setHeightUnit(savedProgress.heightUnit || "cm");
      setWeightUnit(savedProgress.weightUnit || "kg");
      setProgressRestored(true);
    }
  }, [user]);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoadingProfile(false);
        return;
      }

      setLoadingProfile(true);

      try {
        const data = await quizApi.fetchProfile(user.id);

        if (data && data.onboarding_completed) {
          setProfileData(data);

          if (data.unit_system === "imperial") {
            setHeightUnit("ft/inch");
            setWeightUnit("lbs");
          } else {
            setHeightUnit("cm");
            setWeightUnit("kg");
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Save progress
  useEffect(() => {
    if (!user || !progressRestored || loadingProfile) return;

    saveQuizProgress(user.id, {
      currentPhase,
      currentQuestion,
      answers,
      heightUnit,
      weightUnit,
      timestamp: Date.now(),
    });
  }, [
    currentPhase,
    currentQuestion,
    answers,
    heightUnit,
    weightUnit,
    user,
    loadingProfile,
    progressRestored,
  ]);

  const handleAnswer = (questionId: keyof QuizAnswers, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[questionId];
      return newErrors;
    });
  };

  const isFirstQuestion = currentPhase === 0 && currentQuestion === 0;
  const isLastQuestion =
    currentPhase === QUIZ_PHASES.length - 1 && currentQuestion === phase.questions.length - 1;
  const canProceed = () => canProceedUtil(question, answers);

  const handleNext = () => {
    if (!user || !canProceed()) return;

    const error = validateAnswer(question, answers[question.id] || "");
    if (error) {
      setErrors((prev) => ({ ...prev, [question.id]: error }));
      return;
    }

    if (currentQuestion < phase.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (currentPhase < QUIZ_PHASES.length - 1) {
      setCurrentPhase(currentPhase + 1);
      setCurrentQuestion(0);
    } else {
      return "complete";
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else if (currentPhase > 0) {
      setCurrentPhase(currentPhase - 1);
      setCurrentQuestion(QUIZ_PHASES[currentPhase - 1].questions.length - 1);
    }
  };

  const handleSkip = () => {
    if (question.skippable) handleNext();
  };

  const clearProgress = () => {
    if (user) clearQuizProgress(user.id);
  };

  // Calculate progress
  const totalQuestions = QUIZ_PHASES.reduce((sum, p) => sum + p.questions.length, 0);
  const questionsBeforeCurrentPhase = QUIZ_PHASES.slice(0, currentPhase).reduce(
    (sum, p) => sum + p.questions.length,
    0
  );
  const answeredCount = questionsBeforeCurrentPhase + currentQuestion + 1;
  const progress = (answeredCount / totalQuestions) * 100;

  return {
    // State
    currentPhase,
    currentQuestion,
    answers,
    heightUnit,
    weightUnit,
    errors,
    profileData,
    loadingProfile,
    progressRestored,
    phase,
    question,
    progress,
    isFirstQuestion,
    isLastQuestion,

    // Computed
    isLoading: authLoading || loadingProfile,
    isAuthenticated: !!user,

    // Actions
    setHeightUnit,
    setWeightUnit,
    handleAnswer,
    handleNext,
    handlePrevious,
    handleSkip,
    canProceed,
    clearProgress,
  };
};
