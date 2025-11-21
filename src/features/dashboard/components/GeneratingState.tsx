// src/features/dashboard/components/GeneratingState.tsx
/**
 * Professional loading state for AI plan generation
 * Shows progress, time estimate, and what's happening behind the scenes
 */

import { Brain, Check, Lightbulb, Loader2, Sparkles, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Progress } from "@/shared/components/ui/progress";
import { Card, CardContent } from "@/shared/components/ui/card";

interface GenerationProgress {
  progress: number; // 0-100
  currentStep: string;
  estimatedSecondsRemaining: number;
  startedAt: Date;
}

interface GeneratingStateProps {
  type: "meal" | "workout";
  startedAt?: Date;
  status?: string;
}

const GENERATION_STEPS = {
  meal: [
    { threshold: 0, message: "Analyzing your nutritional needs..." },
    { threshold: 20, message: "Selecting recipes that match your preferences..." },
    { threshold: 40, message: "Balancing macros for optimal results..." },
    { threshold: 60, message: "Creating your personalized meal schedule..." },
    { threshold: 80, message: "Almost there! Adding final touches..." },
  ],
  workout: [
    { threshold: 0, message: "Analyzing your fitness level..." },
    { threshold: 20, message: "Selecting exercises for your goals..." },
    { threshold: 40, message: "Building progressive workout schedule..." },
    { threshold: 60, message: "Optimizing rest and recovery..." },
    { threshold: 80, message: "Almost done! Finalizing your plan..." },
  ],
};

const ESTIMATED_DURATION = {
  meal: 45000, // 45 seconds
  workout: 40000, // 40 seconds
};

const BEHIND_SCENES_INFO = {
  meal: [
    "Calculated your caloric needs",
    "AI is crafting personalized meal plan",
    "Validating nutritional balance",
  ],
  workout: [
    "Calculated your fitness baseline",
    "AI is designing workout program",
    "Optimizing exercise progression",
  ],
};

const FUN_FACTS = [
  "Our AI considers 100+ factors to create your perfect plan!",
  "Each plan is unique - we never generate the same plan twice!",
  "Pro tip: You can regenerate your plan anytime if you want variety!",
  "Your plan adapts to your preferences and constraints!",
];

export function GeneratingState({ type, startedAt, status }: GeneratingStateProps) {
  const [progress, setProgress] = useState<GenerationProgress>({
    progress: 0,
    currentStep: GENERATION_STEPS[type][0].message,
    estimatedSecondsRemaining: Math.floor(ESTIMATED_DURATION[type] / 1000),
    startedAt: startedAt || new Date(),
  });

  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  useEffect(() => {
    const start = startedAt ? startedAt.getTime() : Date.now();
    const estimatedTotal = ESTIMATED_DURATION[type];

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const currentProgress = Math.min(95, (elapsed / estimatedTotal) * 100);

      // Find current step based on progress
      const steps = GENERATION_STEPS[type];
      let currentStepMessage = steps[0].message;
      for (let i = steps.length - 1; i >= 0; i--) {
        if (currentProgress >= steps[i].threshold) {
          currentStepMessage = steps[i].message;
          break;
        }
      }

      const remaining = Math.max(0, Math.ceil((estimatedTotal - elapsed) / 1000));

      setProgress({
        progress: currentProgress,
        currentStep: currentStepMessage,
        estimatedSecondsRemaining: remaining,
        startedAt: new Date(start),
      });

      // If progress is complete but status is still generating, show 95%
      if (currentProgress >= 95 && remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);

    // Rotate fun facts every 8 seconds
    const factInterval = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % FUN_FACTS.length);
    }, 8000);

    return () => {
      clearInterval(interval);
      clearInterval(factInterval);
    };
  }, [type, startedAt]);

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds === 0) return "Just a moment...";
    if (seconds < 60) return `~${seconds} seconds`;
    return `~${Math.ceil(seconds / 60)} minute${seconds >= 120 ? "s" : ""}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 p-6">
      {/* Animated AI Brain Icon */}
      <div className="relative">
        <Brain className="w-20 h-20 text-primary animate-pulse" />
        <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-500 animate-bounce" />
      </div>

      {/* Main Status */}
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">
          Generating Your {type === "meal" ? "Meal" : "Workout"} Plan
        </h3>
        <p className="text-muted-foreground">
          Our AI is creating a personalized plan just for you...
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">{progress.currentStep}</span>
          <span className="font-semibold text-primary">{Math.round(progress.progress)}%</span>
        </div>
        <Progress value={progress.progress} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {progress.estimatedSecondsRemaining > 0
            ? `Estimated time: ${formatTimeRemaining(progress.estimatedSecondsRemaining)}`
            : "Finalizing your plan..."}
        </p>
      </div>

      {/* What's Happening Behind the Scenes */}
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            What's happening behind the scenes
          </h4>
          <ul className="text-sm text-muted-foreground space-y-2">
            {BEHIND_SCENES_INFO[type].map((info, index) => (
              <li key={index} className="flex items-center gap-2">
                {progress.progress > index * 40 ? (
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                ) : progress.progress > (index - 1) * 40 ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 border-2 border-muted rounded-full flex-shrink-0" />
                )}
                <span className={progress.progress > index * 40 ? "line-through" : ""}>
                  {info}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Fun Fact */}
      <div className="text-center text-sm text-muted-foreground max-w-md">
        <Lightbulb className="w-4 h-4 inline mr-1 text-yellow-500" />
        <strong>Did you know?</strong> {FUN_FACTS[currentFactIndex]}
      </div>

      {/* Loading Animation */}
      <div className="flex gap-2">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
      </div>
    </div>
  );
}
