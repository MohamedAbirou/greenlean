// src/features/quiz/components/QuizSummary.tsx

import { Button } from "@/shared/components/ui/button";
import { motion } from "framer-motion";
import React from "react";
import type { QuizAnswers } from "../types";

interface QuizSummaryProps {
  answers: QuizAnswers;
  onEdit: () => void;
  onConfirm: () => void;
}

export const QuizSummary: React.FC<QuizSummaryProps> = ({ answers, onEdit, onConfirm }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="bg-background rounded-2xl shadow-lg p-6 text-center"
    >
      <h2 className="text-xl font-bold text-foreground mb-3">Almost ready!</h2>

      <p className="text-foreground mb-4">
        Got it — you want to <span className="font-semibold">{answers.mainGoal}</span>, eat{" "}
        <span className="font-semibold">
          {answers.mealsPerDay}{" "}
          {answers.dietaryStyle && answers.dietaryStyle !== "other"
            ? `of ${answers.dietaryStyle}`
            : ""}
        </span>
        , and train <span className="font-semibold">{answers.exerciseFrequency}</span>.
      </p>

      {answers.healthConditions && (answers.healthConditions as string[]).length > 0 && (
        <p className="text-foreground mb-4">
          Health conditions:{" "}
          <span className="font-semibold">
            {(answers.healthConditions as string[]).includes("Other") &&
            answers.healthConditions_other
              ? answers.healthConditions_other
              : (answers.healthConditions as string[]).join(", ")}
          </span>
        </p>
      )}

      <p className="text-foreground/70 mb-6">Does this look correct?</p>

      <div className="flex justify-center gap-4">
        <Button className="bg-primary hover:bg-primary/90 text-white" onClick={onConfirm}>
          Yes, generate my plan
        </Button>
        <Button variant="outline" onClick={onEdit}>
          Edit my answers
        </Button>
      </div>
    </motion.div>
  );
};
