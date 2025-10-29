import { Activity, Dumbbell, Target, Wind } from "lucide-react";

export const getDifficultyColor = (difficulty: string) => {
  switch (difficulty?.toLowerCase()) {
    case "beginner":
      return "badge-green text-green-700";
    case "intermediate":
      return "badge-yellow text-yellow-700";
    case "advanced":
      return "badge-red text-red-700";
    default:
      return "badge-gray text-gray-700";
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
      return "badge-green";
    case "moderate":
      return "badge-yellow";
    case "moderate-high":
      return "badge-orange";
    case "high":
      return "badge-red";
    default:
      return "badge-blue";
  }
};
