/**
 * Quiz Progress Component
 * Shows progress bar and phase indicators
 */

interface QuizProgressProps {
  currentPhase: number;
  totalPhases: number;
  percentComplete: number;
}

export function QuizProgressBar({ percentComplete }: QuizProgressProps) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="mb-2 flex justify-between text-sm text-muted-foreground">
        <span>Progress</span>
        <span className="font-semibold">{percentComplete}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${percentComplete}%` }}
        />
      </div>
    </div>
  );
}

export function PhaseIndicators({ currentPhase, totalPhases }: { currentPhase: number; totalPhases: number }) {
  return (
    <div className="flex justify-center gap-2 mt-6">
      {Array.from({ length: totalPhases }).map((_, idx) => (
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
}
