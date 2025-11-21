/**
 * Plan Generation Error Component
 * Displays error state with retry functionality for failed AI plan generation
 */

import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { quizApi } from "@/features/quiz/api/quizApi";

interface PlanGenerationErrorProps {
  userId: string;
  planType: "meal" | "workout";
  errorMessage?: string;
  onRetrySuccess?: () => void;
}

export function PlanGenerationError({
  userId,
  planType,
  errorMessage,
  onRetrySuccess,
}: PlanGenerationErrorProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const navigate = useNavigate();

  const handleRetry = async () => {
    setIsRetrying(true);

    try {
      await quizApi.retryPlanGeneration(userId);

      toast.success(
        `${planType === "meal" ? "Meal" : "Workout"} plan generation restarted! This may take a few moments.`,
        { duration: 5000 }
      );

      // Callback for parent component to refetch data
      if (onRetrySuccess) {
        onRetrySuccess();
      }
    } catch (error) {
      console.error("Retry failed:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to retry plan generation. Please try again."
      );
    } finally {
      setIsRetrying(false);
    }
  };

  const handleRetakeQuiz = () => {
    navigate("/quiz");
  };

  return (
    <div className="mx-auto space-y-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-8 border-2 border-red-200 dark:border-red-800 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-red-100 dark:bg-red-900/40 p-3 flex-shrink-0">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>

            <div className="flex-1">
              <h3 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-2">
                {planType === "meal" ? "Meal" : "Workout"} Plan Generation Failed
              </h3>

              <p className="text-red-700 dark:text-red-300 mb-1">
                {errorMessage || "An error occurred while generating your personalized plan."}
              </p>

              <p className="text-sm text-red-600 dark:text-red-400 mb-6">
                Don't worry - this happens occasionally due to temporary issues with the AI service.
                You can retry generation or retake the quiz if needed.
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
                >
                  <RefreshCw className={`h-5 w-5 ${isRetrying ? "animate-spin" : ""}`} />
                  {isRetrying ? "Retrying..." : "Retry Generation"}
                </button>

                <button
                  onClick={handleRetakeQuiz}
                  disabled={isRetrying}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 border-2 border-red-600 dark:border-red-400 rounded-lg font-semibold hover:bg-red-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Home className="h-5 w-5" />
                  Retake Quiz
                </button>
              </div>

              <div className="mt-6 p-4 bg-red-100/50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-800 dark:text-red-200 font-semibold mb-2">
                  Common causes:
                </p>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 list-disc list-inside">
                  <li>Temporary AI service outage</li>
                  <li>Network connection issues</li>
                  <li>Rate limiting (too many requests)</li>
                  <li>Invalid quiz data</li>
                </ul>
              </div>

              <p className="text-xs text-red-600 dark:text-red-400 mt-4">
                If the problem persists after multiple retries, please contact support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlanGenerationError;
