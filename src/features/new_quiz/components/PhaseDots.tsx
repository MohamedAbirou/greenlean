// src/features/quiz/components/PhaseDots.tsx

import React from "react";
import { QUIZ_PHASES } from "../data/phases";

interface PhaseDotsProps {
  currentPhase: number;
}

export const PhaseDots: React.FC<PhaseDotsProps> = ({ currentPhase }) => {
  return (
    <div className="flex justify-center gap-2 mt-6">
      {QUIZ_PHASES.map((_, idx) => (
        <div
          key={idx}
          className={`h-2 rounded-full transition-all ${
            idx === currentPhase
              ? "w-8 bg-primary"
              : idx < currentPhase
              ? "w-2 bg-primary/50"
              : "w-2 bg-muted"
          }`}
        />
      ))}
    </div>
  );
};
