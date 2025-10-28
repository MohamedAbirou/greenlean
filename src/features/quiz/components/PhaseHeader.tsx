// src/features/quiz/components/PhaseHeader.tsx

import { Card, CardContent } from "@/shared/components/ui/card";
import React from "react";
import type { QuizPhase } from "../types";

interface PhaseHeaderProps {
  phase: QuizPhase;
}

export const PhaseHeader: React.FC<PhaseHeaderProps> = ({ phase }) => {
  const PhaseIcon = phase.icon;

  return (
    <Card className="mb-6">
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <PhaseIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{phase.name}</h2>
            <p className="text-foreground/80">{phase.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
