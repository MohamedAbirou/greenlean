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
    return "bg-stat-orange";
  if (type.includes("lunch"))
    return "bg-stat-blue";
  if (type.includes("dinner"))
    return "bg-stat-purple";
  return "bg-stat-green";
};

export const getDifficultyColor = (difficulty: string) => {
  switch (difficulty?.toLowerCase()) {
    case "easy":
      return "badge-green";
    case "medium":
      return "badge-yellow";
    case "advanced":
      return "badge-red";
    default:
      return "badge-gray";
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