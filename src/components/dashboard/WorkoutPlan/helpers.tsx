import { Activity, Dumbbell, Target, Wind } from "lucide-react";

export const getDifficultyColor = (difficulty: string) => {
  switch (difficulty?.toLowerCase()) {
    case "beginner":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "intermediate":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "advanced":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
  }
};

export const getCategoryIcon = (category: string) => {
  switch (category?.toLowerCase()) {
    case "compound":
      return <Dumbbell className="h-4 w-4 text-white" />;
    case "isolation":
      return <Target className="h-4 w-4 text-white" />;
    case "cardio":
      return <Activity className="h-4 w-4 text-white" />;
    case "mobility":
      return <Wind className="h-4 w-4 text-white" />;
    default:
      return <Dumbbell className="h-4 w-4 text-white" />;
  }
};

export const getIntensityColor = (intensity: string) => {
  switch (intensity?.toLowerCase()) {
    case "low":
      return "from-green-500/20 to-emerald-500/20";
    case "moderate":
      return "from-yellow-500/20 to-orange-500/20";
    case "moderate-high":
      return "from-orange-500/20 to-red-500/20";
    case "high":
      return "from-red-500/20 to-pink-500/20";
    default:
      return "from-blue-500/20 to-cyan-500/20";
  }
};
