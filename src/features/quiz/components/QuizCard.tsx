/**
 * Quiz Card Component
 * Displays current question with navigation
 */

import { motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "../../../shared/components/ui/badge";
import { Button } from "../../../shared/components/ui/button";
import { Card, CardContent } from "../../../shared/components/ui/card";
import { Label } from "../../../shared/components/ui/label";
import type { QuizPhase, QuizQuestion } from "../types";
import { QuestionRenderer } from "./QuestionRenderer";

interface QuizCardProps {
  phase: QuizPhase;
  question: QuizQuestion;
  value: any;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  canProceed: boolean;
  onChange: (value: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
}

export function QuizCard({
  phase,
  question,
  value,
  isFirstQuestion,
  isLastQuestion,
  canProceed,
  onChange,
  onNext,
  onPrevious,
  onSkip,
}: QuizCardProps) {
  const PhaseIcon = phase.icon;

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl border-2">
      <motion.div
        key={`${phase.id}-${question.id}`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-full">
              <PhaseIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{phase.name}</h3>
              <p className="text-sm text-muted-foreground">{phase.description}</p>
            </div>
          </div>

          <Label className="text-lg font-medium text-foreground mb-2 block">
            {question.label}
            {!question.required && (
              <Badge variant="secondary" className="ml-2">
                Optional
              </Badge>
            )}
          </Label>

          {question.description && (
            <p className="italic text-sm text-muted-foreground mb-4">{question.description}</p>
          )}

          <div className="mb-6">
            <QuestionRenderer question={question} value={value} onChange={onChange} />
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={onPrevious} disabled={isFirstQuestion}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              {question.skippable && (
                <Button variant="ghost" onClick={onSkip}>
                  Skip
                </Button>
              )}
              <Button onClick={onNext} disabled={!canProceed}>
                {isLastQuestion ? (
                  <>
                    Complete
                    <Check className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </motion.div>
    </Card>
  );
}
