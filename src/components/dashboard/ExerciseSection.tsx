import type { HealthProfile } from "@/types/dashboard";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import React from "react";

interface ExerciseSectionProps {
  healthProfile: HealthProfile;
  colorTheme: {
    primaryText: string;
  };
}

export const ExerciseSection: React.FC<ExerciseSectionProps> = ({
  healthProfile,
  colorTheme,
}) => {
  const { answers } = healthProfile;

  const weeklySchedule = [
    { day: "Monday", workout: "Cardio + Core", duration: "45 min" },
    { day: "Tuesday", workout: "Upper Body Strength", duration: "40 min" },
    { day: "Wednesday", workout: "Rest/Light Stretching", duration: "20 min" },
    { day: "Thursday", workout: "Lower Body Strength", duration: "40 min" },
    { day: "Friday", workout: "HIIT Training", duration: "30 min" },
    { day: "Saturday", workout: "Full Body Workout", duration: "45 min" },
    { day: "Sunday", workout: "Rest/Recovery", duration: "0 min" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Your Exercise Routine
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-background rounded-lg p-6">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Workout Summary
          </h3>
          <ul className="space-y-4">
            <li className="flex justify-between items-center">
              <span className="text-foreground/90">
                Preferred Type
              </span>
              <span className="font-semibold text-foreground">
                {answers[12] as string}
              </span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-foreground/90">Duration</span>
              <span className="font-semibold text-foreground">
                {answers[11] as string}
              </span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-foreground/90">Frequency</span>
              <span className="font-semibold text-foreground">
                4-5 times per week
              </span>
            </li>
          </ul>
        </div>

        <div className="bg-background rounded-lg p-6">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Weekly Goals
          </h3>
          <ul className="space-y-3">
            <li className="flex items-center">
              <Check className={`h-5 w-5 ${colorTheme.primaryText} mr-2`} />
              <span className="text-foreground/90">
                Complete 4-5 workout sessions
              </span>
            </li>
            <li className="flex items-center">
              <Check className={`h-5 w-5 ${colorTheme.primaryText} mr-2`} />
              <span className="text-foreground/90">
                Maintain consistent intensity
              </span>
            </li>
            <li className="flex items-center">
              <Check className={`h-5 w-5 ${colorTheme.primaryText} mr-2`} />
              <span className="text-foreground/90">
                Include both cardio and strength
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-background rounded-lg p-6">
        <h3 className="text-xl font-semibold text-foreground mb-6">
          Weekly Schedule
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {weeklySchedule.map((day, index) => (
            <div
              key={index}
              className="bg-card rounded-lg p-4 border border-border"
            >
              <h4 className="font-medium text-foreground mb-2">
                {day.day}
              </h4>
              <p className="text-foreground/90">{day.workout}</p>
              <p className="text-sm text-foreground/60 mt-1">
                {day.duration}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
