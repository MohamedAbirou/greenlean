// src/features/quiz/components/QuestionRenderer.tsx

import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Slider } from "@/shared/components/ui/slider";
import { Textarea } from "@/shared/components/ui/textarea";
import { Check } from "lucide-react";
import React from "react";
import type { QuizAnswers, QuizQuestion } from "../types";

interface QuestionRendererProps {
  question: QuizQuestion;
  answers: QuizAnswers;
  heightUnit: string;
  weightUnit: string;
  errors: Record<string, string>;
  onAnswer: (questionId: keyof QuizAnswers, value: any) => void;
  onToggleMultiSelect: (questionId: keyof QuizAnswers, option: string) => void;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  answers,
  heightUnit,
  weightUnit,
  errors,
  onAnswer,
  onToggleMultiSelect,
}) => {
  const error = errors[question.id];
  const answer = answers[question.id];

  switch (question.type) {
    case "number":
      return (
        <>
          <Input
            type="number"
            value={answer || ""}
            onChange={(e) => onAnswer(question.id, e.target.value)}
            placeholder={question.placeholder}
            min={question.min}
            max={question.max}
            step={question.step || 1}
            className={`bg-background text-lg ${error && "border-red-500 dark:border-red-400"}`}
          />
          {error && (
            <p className="mt-2 text-destructive/90 bg-destructive/20 rounded-md px-2 py-0.5">
              {error}
            </p>
          )}
        </>
      );

    case "height":
      return (
        <div className="space-y-4">
          {heightUnit === "cm" ? (
            <Input
              type="number"
              value={(answer as any)?.cm || ""}
              onChange={(e) => onAnswer(question.id, { cm: e.target.value })}
              className={`bg-background text-lg ${error && "border-red-500 dark:border-red-400"}`}
              placeholder="170"
              required
            />
          ) : (
            <div className="flex gap-2 justify-center">
              <Input
                type="number"
                value={(answer as any)?.ft || ""}
                onChange={(e) => onAnswer(question.id, { ...(answer as any), ft: e.target.value })}
                placeholder="5"
                className={`w-16 bg-background text-lg ${
                  error && "border-red-500 dark:border-red-400"
                }`}
                required
              />
              <span className="self-center">ft</span>
              <Input
                type="number"
                value={(answer as any)?.inch || ""}
                onChange={(e) =>
                  onAnswer(question.id, {
                    ...(answer as any),
                    inch: e.target.value,
                  })
                }
                placeholder="11"
                className={`w-16 bg-background text-lg ${
                  error && "border-red-500 dark:border-red-400"
                }`}
                required
              />
              <span className="self-center">in</span>
            </div>
          )}
          {error && (
            <p className="mt-2 text-destructive/90 bg-destructive/20 rounded-md px-2 py-0.5">
              {error}
            </p>
          )}
          <p className="text-sm text-foreground/80 text-center">
            {heightUnit === "cm" ? "Range: 100-250 cm" : "Range: 3'3\" - 8'2\""}
          </p>
        </div>
      );

    case "weight":
      return (
        <div className="space-y-4">
          <Input
            type="number"
            value={(answer as any)?.[weightUnit] || ""}
            onChange={(e) =>
              onAnswer(question.id, {
                ...(answer as any),
                [weightUnit]: e.target.value,
              })
            }
            placeholder={weightUnit === "kg" ? "70" : "154"}
            className={`bg-background text-lg ${error && "border-red-500 dark:border-red-400"}`}
          />
          {error && (
            <p className="mt-2 text-destructive/90 bg-destructive/20 rounded-md px-2 py-0.5">
              {error}
            </p>
          )}
          <p className="text-sm text-foreground/80 text-center">
            {weightUnit === "kg" ? "Range: 30-250 kg" : "Range: 66-550 lbs"}
          </p>
        </div>
      );

    case "radio":
      return (
        <RadioGroup value={answer as string} onValueChange={(val) => onAnswer(question.id, val)}>
          <div className="space-y-3">
            {question.options?.map((option) => (
              <Label
                key={option}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  answer === option
                    ? "border-primary bg-primary/5"
                    : "border-background hover:border-primary/50"
                }`}
              >
                <RadioGroupItem value={option} className="mr-3 bg-background dark:bg-black/40" />
                <span className="flex-1">{option}</span>
              </Label>
            ))}
          </div>
        </RadioGroup>
      );

    case "select":
      return (
        <>
          <Select value={answer as string} onValueChange={(val) => onAnswer(question.id, val)}>
            <SelectTrigger
              className={`bg-background w-full ${error && "border-red-500 dark:border-red-400"}`}
            >
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && (
            <p className="mt-2 text-destructive/90 bg-destructive/20 rounded-md px-2 py-0.5">
              {error}
            </p>
          )}
        </>
      );

    case "multiSelect":
      const selected = (answer as string[]) || [];
      return (
        <div className="space-y-3">
          {question.options?.map((option) => (
            <Label
              key={option}
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selected.includes(option)
                  ? "border-primary bg-primary/5"
                  : "border-background hover:border-primary/50"
              }`}
              onClick={() => onToggleMultiSelect(question.id, option)}
            >
              <div
                className={`w-5 h-5 border-2 rounded mr-3 flex items-center justify-center ${
                  selected.includes(option) ? "bg-primary border-primary" : "border-background"
                }`}
              >
                {selected.includes(option) && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="flex-1">{option}</span>
            </Label>
          ))}
          {selected.includes("Other") && (
            <div className="mt-3">
              <Input
                type="text"
                placeholder="Please specify"
                value={(answers[`${question.id}_other` as keyof QuizAnswers] as string) || ""}
                onChange={(e) =>
                  onAnswer(`${question.id}_other` as keyof QuizAnswers, e.target.value)
                }
                className="bg-background text-lg"
              />
            </div>
          )}
          <p className="text-sm text-foreground/80">Select all that apply</p>
        </div>
      );

    case "slider":
      return (
        <div className="space-y-6">
          <div className="text-center">
            <span className="text-4xl font-bold text-primary">{answer || question.min}</span>
            {question.id === "bodyFat" && <span className="text-2xl text-foreground/80">%</span>}
          </div>
          <Slider
            value={[(answer as number) || question.min!]}
            onValueChange={(val) => onAnswer(question.id, val[0])}
            min={question.min}
            max={question.max}
            step={question.step || 1}
            className="w-full bg-background"
          />
          <div className="flex justify-between text-sm text-foreground/80">
            <span>{question.min}</span>
            <span>{question.max}</span>
          </div>
        </div>
      );

    case "textarea":
      return (
        <Textarea
          value={(answer as string) || ""}
          onChange={(e) => onAnswer(question.id, e.target.value)}
          placeholder={question.placeholder}
          rows={4}
          className="resize-y"
        />
      );

    default:
      return null;
  }
};
