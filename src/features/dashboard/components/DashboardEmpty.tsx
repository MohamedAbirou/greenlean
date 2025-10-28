/**
 * Dashboard Empty State Component
 * Shown when user hasn't taken the quiz
 */

import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../shared/components/ui/button";

interface DashboardEmptyProps {
  primaryBg?: string;
  primaryHover?: string;
}

export function DashboardEmpty({ primaryBg = "bg-primary", primaryHover = "hover:opacity-90" }: DashboardEmptyProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <ArrowRight className="w-12 h-12 text-primary" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-4">
          No Health Profile Found
        </h1>

        <p className="text-muted-foreground mb-6">
          Please take the quiz to get your personalized recommendations and unlock your dashboard.
        </p>

        <Button
          onClick={() => navigate("/quiz")}
          className={`${primaryBg} text-primary-foreground ${primaryHover} transition-opacity`}
          size="lg"
        >
          Take the Quiz
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
