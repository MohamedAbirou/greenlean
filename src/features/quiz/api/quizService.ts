/**
 * Quiz API Service
 * Handles all quiz-related API operations
 */

import { supabase } from "../../../lib/supabase";
import type { QuizAnswers, QuizResult, QuizSubmission } from "../types";

export class QuizService {
  /**
   * Submit quiz answers and get recommendations
   */
  static async submitQuiz(
    userId: string,
    answers: QuizAnswers
  ): Promise<QuizResult> {
    const submission: QuizSubmission = {
      userId,
      answers,
      completedAt: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("quiz_results")
      .insert({
        user_id: userId,
        answers: answers,
        completed_at: submission.completedAt,
      })
      .select()
      .single();

    if (error) throw error;

    const recommendations = {};

    return {
      id: data.id,
      userId: data.user_id,
      answers: data.answers,
      recommendations,
      createdAt: data.created_at,
    };
  }

  /**
   * Get user's quiz history
   */
  static async getQuizHistory(userId: string): Promise<QuizResult[]> {
    const { data, error } = await supabase
      .from("quiz_results")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (
      data?.map((item) => ({
        id: item.id,
        userId: item.user_id,
        answers: item.answers,
        recommendations: item.recommendations || {},
        createdAt: item.created_at,
      })) || []
    );
  }

  /**
   * Get specific quiz result
   */
  static async getQuizResult(resultId: string): Promise<QuizResult | null> {
    const { data, error } = await supabase
      .from("quiz_results")
      .select("*")
      .eq("id", resultId)
      .single();

    if (error) throw error;

    return data
      ? {
          id: data.id,
          userId: data.user_id,
          answers: data.answers,
          recommendations: data.recommendations || {},
          createdAt: data.created_at,
        }
      : null;
  }

  /**
   * Get latest quiz result for user
   */
  static async getLatestQuizResult(userId: string): Promise<QuizResult | null> {
    const { data, error } = await supabase
      .from("quiz_results")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    return data
      ? {
          id: data.id,
          userId: data.user_id,
          answers: data.answers,
          recommendations: data.recommendations || {},
          createdAt: data.created_at,
        }
      : null;
  }
}
