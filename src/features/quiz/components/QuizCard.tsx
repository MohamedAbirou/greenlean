// src/features/quiz/components/QuizCard.tsx

import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { motion } from "framer-motion";
import React from "react";
import type { QuizAnswers, QuizQuestion } from "../types";
import { QuestionRenderer } from "./QuestionRenderer";
import { QuizNavigation } from "./QuizNavigation";

interface QuizCardProps {
  currentPhase: number;
  currentQuestion: number;
  question: QuizQuestion;
  answers: QuizAnswers;
  heightUnit: string;
  weightUnit: string;
  errors: Record<string, string>;
  canProceed: boolean;
  onAnswer: (questionId: keyof QuizAnswers, value: any) => void;
  onToggleMultiSelect: (questionId: keyof QuizAnswers, option: string) => void;
  onPrevious: () => void;
  onSkip: () => void;
  onNext: () => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  currentPhase,
  currentQuestion,
  question,
  answers,
  heightUnit,
  weightUnit,
  errors,
  canProceed,
  onAnswer,
  onToggleMultiSelect,
  onPrevious,
  onSkip,
  onNext,
}) => {
  return (
    <Card>
      <motion.div
        key={question.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <CardContent className="space-y-6">
          <Label className="text-xl font-semibold">
            {question.label}
            {!question.required && (
              <Badge variant="secondary" className="ml-2">
                Optional
              </Badge>
            )}
          </Label>

          {question.description && (
            <p className="italic text-sm text-foreground/70">{question.description}</p>
          )}

          <QuestionRenderer
            question={question}
            answers={answers}
            heightUnit={heightUnit}
            weightUnit={weightUnit}
            errors={errors}
            onAnswer={onAnswer}
            onToggleMultiSelect={onToggleMultiSelect}
          />

          <QuizNavigation
            currentPhase={currentPhase}
            currentQuestion={currentQuestion}
            question={question}
            canProceed={canProceed}
            onPrevious={onPrevious}
            onSkip={onSkip}
            onNext={onNext}
          />
        </CardContent>
      </motion.div>
    </Card>
  );
};
