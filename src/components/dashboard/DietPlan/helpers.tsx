import { Apple, ChefHat, Coffee, Droplet, Lightbulb, ShoppingCart, Sun, Sunset, Utensils } from "lucide-react";

export const getMealIcon = (mealType: string) => {
  const type = mealType.toLowerCase();
  if (type.includes("breakfast")) return <Coffee className="h-5 w-5" />;
  if (type.includes("lunch")) return <Sun className="h-5 w-5" />;
  if (type.includes("dinner")) return <Sunset className="h-5 w-5" />;
  if (type.includes("snack")) return <Apple className="h-5 w-5" />;
  return <Utensils className="h-5 w-5" />;
};

export const getMealGradient = (mealType: string) => {
  const type = mealType.toLowerCase();
  if (type.includes("breakfast"))
    return "from-amber-500/20 via-orange-500/20 to-yellow-500/20";
  if (type.includes("lunch"))
    return "from-blue-500/20 via-cyan-500/20 to-sky-500/20";
  if (type.includes("dinner"))
    return "from-purple-500/20 via-pink-500/20 to-rose-500/20";
  return "from-green-500/20 via-emerald-500/20 to-teal-500/20";
};

export const getDifficultyColor = (difficulty: string) => {
  switch (difficulty?.toLowerCase()) {
    case "easy":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "medium":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "advanced":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
  }
};

export const getTabPanelsHeader = (mealsCount: number, dailyCalories: number, daily_water_intake: string, estimated_cost: string) => [
  {
    icon: ChefHat,
    iconStyle: "from-primary to-emerald-600",
    title: "Today's Meals",
    description: `${mealsCount} meals • 
                  ${dailyCalories} total calories • ✓
                  Macros match targets within ±5%`,
  },
  {
    icon: Droplet,
    iconStyle: "from-blue-600 to-cyan-600",
    title: "Daily Hydration Plan",
    description: daily_water_intake,
  },
  {
    icon: ShoppingCart,
    iconStyle: "from-green-600 to-emerald-600",
    title: "Weekly Shopping List",
    description: estimated_cost,
  },
  {
    icon: Lightbulb,
    iconStyle: "from-purple-600 to-pink-600",
    title: "Personalized Tips",
    description: "Tailored advice for your success",
  },
];