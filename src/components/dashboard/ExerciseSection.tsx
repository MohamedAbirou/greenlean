import { motion } from "framer-motion";
import { Check } from "lucide-react";
import React from "react";
import { HealthProfile } from "../../types/dashboard";

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
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Your Exercise Routine
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Workout Summary
          </h3>
          <ul className="space-y-4">
            <li className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">
                Preferred Type
              </span>
              <span className="font-semibold text-gray-800 dark:text-white">
                {answers[12] as string}
              </span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Duration</span>
              <span className="font-semibold text-gray-800 dark:text-white">
                {answers[11] as string}
              </span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">Frequency</span>
              <span className="font-semibold text-gray-800 dark:text-white">
                4-5 times per week
              </span>
            </li>
          </ul>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Weekly Goals
          </h3>
          <ul className="space-y-3">
            <li className="flex items-center">
              <Check className={`h-5 w-5 ${colorTheme.primaryText} mr-2`} />
              <span className="text-gray-600 dark:text-gray-300">
                Complete 4-5 workout sessions
              </span>
            </li>
            <li className="flex items-center">
              <Check className={`h-5 w-5 ${colorTheme.primaryText} mr-2`} />
              <span className="text-gray-600 dark:text-gray-300">
                Maintain consistent intensity
              </span>
            </li>
            <li className="flex items-center">
              <Check className={`h-5 w-5 ${colorTheme.primaryText} mr-2`} />
              <span className="text-gray-600 dark:text-gray-300">
                Include both cardio and strength
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
          Weekly Schedule
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {weeklySchedule.map((day, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700"
            >
              <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                {day.day}
              </h4>
              <p className="text-gray-600 dark:text-gray-300">{day.workout}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {day.duration}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
