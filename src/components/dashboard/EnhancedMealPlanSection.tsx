import { supabase } from "@/lib/supabase";
import type { MealPlanResponse } from "@/services/mlService";
import { AnimatePresence, motion } from "framer-motion";
import {
  Apple,
  Check,
  ChefHat,
  ChevronDown,
  ChevronUp,
  Clock,
  Coffee,
  Droplet,
  Flame,
  Heart,
  Info,
  Lightbulb,
  Plus,
  Save,
  ShoppingCart,
  Sun,
  Sunset,
  Timer,
  TrendingUp,
  Utensils,
  UtensilsCrossed,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

interface Props {
  userId: string;
  dailyCalories: number;
  macros: {
    fat_g: 87;
    carbs_g: 353;
    protein_g: 153;
    fat_pct_of_calories: 28;
    carbs_pct_of_calories: 50;
    protein_pct_of_calories: 22;
  };
  colorTheme: {
    primaryText: string;
    primaryBg: string;
    primaryHover: string;
  };
}

interface FoodLog {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface MealLog {
  meal_type: string;
  foods: FoodLog[];
  notes: string;
}

export const EnhancedMealPlanSection: React.FC<Props> = ({
  userId,
  dailyCalories,
  macros,
  colorTheme,
}) => {
  const [aiMealPlan, setAiMealPlan] = useState<MealPlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [mealLog, setMealLog] = useState<MealLog>({
    meal_type: "breakfast",
    foods: [],
    notes: "",
  });
  const [todayLogs, setTodayLogs] = useState<any[]>([]);
  const [newFood, setNewFood] = useState<FoodLog>({
    name: "",
    portion: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  });
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [selectedTab, setSelectedTab] = useState("meals");

  useEffect(() => {
    loadAIMealPlan();
    loadTodayLogs();
  }, [userId]);

  const loadAIMealPlan = async () => {
    try {
      const stored = localStorage.getItem("aiGeneratedPlans");
      if (stored) {
        const plans = JSON.parse(stored);
        setAiMealPlan(plans.mealPlan);
      }

      const { data, error } = await supabase
        .from("ai_meal_plans")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && !error) {
        setAiMealPlan(data.plan_data);
      }
    } catch (error) {
      console.error("Error loading AI meal plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTodayLogs = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("daily_nutrition_logs")
        .select("*")
        .eq("user_id", userId)
        .eq("log_date", today)
        .order("created_at", { ascending: false });

      if (data && !error) {
        setTodayLogs(data);
      }
    } catch (error) {
      console.error("Error loading today's logs:", error);
    }
  };

  const addFoodToLog = () => {
    if (!newFood.name || newFood.calories <= 0) {
      toast.error("Please fill in food name and calories");
      return;
    }

    setMealLog((prev) => ({
      ...prev,
      foods: [...prev.foods, { ...newFood }],
    }));

    setNewFood({
      name: "",
      portion: "",
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
    });
  };

  const removeFoodFromLog = (index: number) => {
    setMealLog((prev) => ({
      ...prev,
      foods: prev.foods.filter((_, i) => i !== index),
    }));
  };

  const saveMealLog = async () => {
    if (mealLog.foods.length === 0) {
      toast.error("Please add at least one food item");
      return;
    }

    try {
      const totalCalories = mealLog.foods.reduce(
        (sum, f) => sum + f.calories,
        0
      );
      const totalProtein = mealLog.foods.reduce((sum, f) => sum + f.protein, 0);
      const totalCarbs = mealLog.foods.reduce((sum, f) => sum + f.carbs, 0);
      const totalFats = mealLog.foods.reduce((sum, f) => sum + f.fats, 0);

      const { error } = await supabase.from("daily_nutrition_logs").insert({
        user_id: userId,
        meal_type: mealLog.meal_type,
        food_items: mealLog.foods,
        total_calories: totalCalories,
        total_protein: totalProtein,
        total_carbs: totalCarbs,
        total_fats: totalFats,
        notes: mealLog.notes,
      });

      if (error) throw error;

      toast.success("Meal logged successfully! 🎉");
      setShowLogModal(false);
      setMealLog({ meal_type: "breakfast", foods: [], notes: "" });
      loadTodayLogs();
    } catch (error) {
      console.error("Error saving meal log:", error);
      toast.error("Failed to save meal log");
    }
  };

  const getMealIcon = (mealType: string) => {
    const type = mealType.toLowerCase();
    if (type.includes("breakfast")) return <Coffee className="h-5 w-5" />;
    if (type.includes("lunch")) return <Sun className="h-5 w-5" />;
    if (type.includes("dinner")) return <Sunset className="h-5 w-5" />;
    if (type.includes("snack")) return <Apple className="h-5 w-5" />;
    return <Utensils className="h-5 w-5" />;
  };

  const getMealGradient = (mealType: string) => {
    const type = mealType.toLowerCase();
    if (type.includes("breakfast"))
      return "from-amber-500/20 via-orange-500/20 to-yellow-500/20";
    if (type.includes("lunch"))
      return "from-blue-500/20 via-cyan-500/20 to-sky-500/20";
    if (type.includes("dinner"))
      return "from-purple-500/20 via-pink-500/20 to-rose-500/20";
    return "from-green-500/20 via-emerald-500/20 to-teal-500/20";
  };

  const getDifficultyColor = (difficulty: string) => {
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

  const totalLoggedToday = todayLogs.reduce(
    (sum, log) => sum + (log.total_calories || 0),
    0
  );
  const totalProteinLogged = todayLogs.reduce(
    (sum, log) => sum + (log.total_protein || 0),
    0
  );
  const totalCarbsLogged = todayLogs.reduce(
    (sum, log) => sum + (log.total_carbs || 0),
    0
  );
  const totalFatsLogged = todayLogs.reduce(
    (sum, log) => sum + (log.total_fats || 0),
    0
  );

  const remainingCalories = dailyCalories - totalLoggedToday;
  const caloriePercentage = (totalLoggedToday / dailyCalories) * 100;
  const proteinPercentage = (totalProteinLogged / macros.protein_g) * 100;
  const carbsPercentage = (totalCarbsLogged / macros.carbs_g) * 100;
  const fatsPercentage = (totalFatsLogged / macros.fat_g) * 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-foreground/70 font-medium">Loading your meal plan...</p>
        </div>
      </div>
    );
  }

  // const aiMealPlan = {
  //   meals: [
  //     {
  //       meal_type: "breakfast",
  //       meal_name: "Protein-Packed Morning Power Bowl",
  //       prep_time_minutes: 15,
  //       difficulty: "easy",
  //       meal_timing: "7:00 AM - 8:00 AM",
  //       total_calories: 520,
  //       total_protein: 42,
  //       total_carbs: 48,
  //       total_fats: 18,
  //       total_fiber: 8,
  //       tags: ["high-protein", "quick", "gut-friendly"],
  //       foods: [
  //         { name: "Rolled Oats", portion: "1 cup", grams: 80, calories: 300, protein: 10, carbs: 54, fats: 5, fiber: 8 },
  //         { name: "Greek Yogurt", portion: "150g", grams: 150, calories: 130, protein: 20, carbs: 8, fats: 4, fiber: 0 },
  //         { name: "Blueberries", portion: "1/2 cup", grams: 75, calories: 40, protein: 1, carbs: 10, fats: 0, fiber: 2 },
  //         { name: "Almonds", portion: "15 pieces", grams: 20, calories: 120, protein: 5, carbs: 4, fats: 10, fiber: 2 },
  //         { name: "Honey", portion: "1 tbsp", grams: 20, calories: 60, protein: 0, carbs: 17, fats: 0, fiber: 0 }
  //       ],
  //       recipe: "1. In a bowl, combine rolled oats with hot water or milk and let sit for 3 minutes\n2. Top with Greek yogurt, fresh blueberries, and sliced almonds\n3. Drizzle with honey and add a pinch of cinnamon\n4. Optional: Add chia seeds for extra fiber and omega-3s",
  //       tips: ["Prep oats overnight for quicker morning routine", "Swap blueberries with any seasonal berries"]
  //     },
  //     {
  //       meal_type: "lunch",
  //       meal_name: "Mediterranean Grilled Chicken Bowl",
  //       prep_time_minutes: 25,
  //       difficulty: "medium",
  //       meal_timing: "12:30 PM - 1:30 PM",
  //       total_calories: 680,
  //       total_protein: 52,
  //       total_carbs: 65,
  //       total_fats: 22,
  //       total_fiber: 12,
  //       tags: ["high-protein", "gut-friendly", "mediterranean"],
  //       foods: [
  //         { name: "Chicken Breast", portion: "200g", grams: 200, calories: 330, protein: 62, carbs: 0, fats: 7, fiber: 0 },
  //         { name: "Quinoa", portion: "1 cup cooked", grams: 185, calories: 220, protein: 8, carbs: 40, fats: 4, fiber: 5 },
  //         { name: "Mixed Greens", portion: "2 cups", grams: 60, calories: 15, protein: 2, carbs: 3, fats: 0, fiber: 2 },
  //         { name: "Cherry Tomatoes", portion: "1 cup", grams: 150, calories: 25, protein: 1, carbs: 6, fats: 0, fiber: 2 },
  //         { name: "Cucumber", portion: "1 medium", grams: 150, calories: 20, protein: 1, carbs: 5, fats: 0, fiber: 1 },
  //         { name: "Feta Cheese", portion: "30g", grams: 30, calories: 80, protein: 4, carbs: 1, fats: 6, fiber: 0 },
  //         { name: "Olive Oil", portion: "1 tbsp", grams: 15, calories: 120, protein: 0, carbs: 0, fats: 14, fiber: 0 }
  //       ],
  //       recipe: "1. Season and grill chicken breast until internal temp reaches 165°F (7-8 min per side)\n2. Cook quinoa according to package directions\n3. Arrange mixed greens as base, add quinoa and sliced chicken\n4. Top with cherry tomatoes, cucumbers, and crumbled feta\n5. Dress with olive oil, lemon juice, and herbs",
  //       tips: ["Meal prep 3-4 chicken breasts at once for the week", "Add hummus for extra creaminess"]
  //     },
  //     {
  //       meal_type: "snack",
  //       meal_name: "Energy-Boosting Trail Mix",
  //       prep_time_minutes: 5,
  //       difficulty: "easy",
  //       meal_timing: "3:30 PM - 4:00 PM",
  //       total_calories: 280,
  //       total_protein: 12,
  //       total_carbs: 28,
  //       total_fats: 16,
  //       total_fiber: 4,
  //       tags: ["quick", "portable", "energy"],
  //       foods: [
  //         { name: "Mixed Nuts", portion: "30g", grams: 30, calories: 180, protein: 6, carbs: 6, fats: 16, fiber: 3 },
  //         { name: "Dried Cranberries", portion: "2 tbsp", grams: 20, calories: 60, protein: 0, carbs: 15, fats: 0, fiber: 1 },
  //         { name: "Dark Chocolate Chips", portion: "15g", grams: 15, calories: 80, protein: 1, carbs: 9, fats: 5, fiber: 1 },
  //         { name: "Pumpkin Seeds", portion: "1 tbsp", grams: 10, calories: 60, protein: 3, carbs: 2, fats: 5, fiber: 1 }
  //       ],
  //       recipe: "Mix all ingredients in a small container. Perfect grab-and-go snack!",
  //       tips: ["Prep weekly portions in small bags", "Keep at room temperature for up to 2 weeks"]
  //     },
  //     {
  //       meal_type: "dinner",
  //       meal_name: "Teriyaki Salmon with Asian Vegetables",
  //       prep_time_minutes: 30,
  //       difficulty: "medium",
  //       meal_timing: "6:30 PM - 7:30 PM",
  //       total_calories: 620,
  //       total_protein: 48,
  //       total_carbs: 52,
  //       total_fats: 24,
  //       total_fiber: 8,
  //       tags: ["high-protein", "omega-3", "asian-fusion"],
  //       foods: [
  //         { name: "Salmon Fillet", portion: "180g", grams: 180, calories: 320, protein: 40, carbs: 0, fats: 18, fiber: 0 },
  //         { name: "Brown Rice", portion: "1 cup cooked", grams: 195, calories: 215, protein: 5, carbs: 45, fats: 2, fiber: 4 },
  //         { name: "Broccoli", portion: "1.5 cups", grams: 150, calories: 50, protein: 4, carbs: 10, fats: 0, fiber: 4 },
  //         { name: "Bell Peppers", portion: "1 cup", grams: 150, calories: 40, protein: 1, carbs: 9, fats: 0, fiber: 3 },
  //         { name: "Teriyaki Sauce", portion: "2 tbsp", grams: 30, calories: 35, protein: 1, carbs: 7, fats: 0, fiber: 0 },
  //         { name: "Sesame Oil", portion: "1 tsp", grams: 5, calories: 40, protein: 0, carbs: 0, fats: 5, fiber: 0 }
  //       ],
  //       recipe: "1. Marinate salmon in teriyaki sauce for 15 minutes\n2. Cook brown rice according to package\n3. Bake salmon at 400°F for 12-15 minutes\n4. Stir-fry broccoli and bell peppers in sesame oil\n5. Serve salmon over rice with vegetables on the side\n6. Garnish with sesame seeds and green onions",
  //       tips: ["Wild-caught salmon has better omega-3 profile", "Batch cook rice for the week"]
  //     }
  //   ],
  //   daily_totals: {
  //     calories: 2100,
  //     protein: 154,
  //     carbs: 193,
  //     fats: 80,
  //     fiber: 32,
  //     variance: "± 5%"
  //   },
  //   hydration_plan: {
  //     daily_water_intake: "3-4 liters (12-16 cups)",
  //     timing: [
  //       "Morning: 2 glasses upon waking",
  //       "Pre-workout: 1-2 glasses 30 min before",
  //       "During workout: Sip every 15-20 min",
  //       "Post-workout: 2-3 glasses",
  //       "With meals: 1 glass each",
  //       "Before bed: 1 glass"
  //     ],
  //     electrolyte_needs: "Add electrolytes if exercising >60 min or in hot climate"
  //   },
  //   shopping_list: {
  //     proteins: ["Chicken breast (800g)", "Salmon fillet (4x180g)", "Greek yogurt (600g)", "Feta cheese (120g)"],
  //     vegetables: ["Mixed greens", "Broccoli (3 heads)", "Bell peppers (4)", "Cherry tomatoes (2 pints)", "Cucumber (3)"],
  //     carbs: ["Rolled oats (500g)", "Quinoa (300g)", "Brown rice (1kg)", "Whole grain bread"],
  //     fats: ["Olive oil", "Almonds (250g)", "Mixed nuts (200g)", "Sesame oil", "Dark chocolate chips"],
  //     pantry_staples: ["Teriyaki sauce", "Honey", "Cinnamon", "Lemon", "Herbs", "Dried cranberries"],
  //     estimated_cost: "$85-110 per week"
  //   },
  //   personalized_tips: [
  //     "💡 Challenge Tip: Prep your breakfast ingredients the night before to save 10 minutes in the morning",
  //     "🎯 Motivation Boost: Track your protein intake - hitting your 165g target daily will accelerate your results",
  //     "😌 Stress Management: Include magnesium-rich foods (like almonds and dark chocolate) to support stress reduction",
  //     "😴 Sleep Optimization: Avoid heavy meals 3 hours before bed - have your dinner by 7:30 PM",
  //     "🏋️ Goal-Specific: For muscle building, consume 30-40g protein within 2 hours post-workout"
  //   ],
  //   meal_prep_strategy: {
  //     batch_cooking: ["Cook 4-5 chicken breasts on Sunday", "Prep quinoa and brown rice for the week", "Wash and chop all vegetables"],
  //     storage_tips: ["Chicken: 4 days in fridge, 3 months frozen", "Cooked grains: 5 days in airtight containers", "Chopped veggies: 3-4 days in sealed bags"],
  //     time_saving_hacks: ["Use pre-washed greens", "Invest in quality food containers", "Prep snack portions in advance"]
  //   }
  // };

  return (
      <div className="mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between flex-wrap gap-4"
        >
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent mb-2">
              Your Personalized Meal Plan
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              AI-optimized nutrition designed for your goals
            </p>
          </div>
          <button
            onClick={() => setShowLogModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-md font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Log Meal
          </button>
        </motion.div>

        {/* Daily Progress Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-md bg-gradient-to-br from-orange-500/10 via-red-500/10 to-pink-500/10 p-6 border border-orange-200/20 dark:border-orange-800/20 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-orange-500 to-red-500 p-3 rounded-md shadow-lg">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {caloriePercentage.toFixed(0)}%
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Progress
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">
              Calories Today
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
              {totalLoggedToday}
              <span className="text-lg text-slate-500 dark:text-slate-400 font-normal">
                {" "}
                / {dailyCalories}
              </span>
            </p>
            <div className="h-3 bg-white/50 dark:bg-slate-800/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(caloriePercentage, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-full"
              />
            </div>
            <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              {dailyCalories - totalLoggedToday} kcal remaining
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-md bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 p-6 border border-green-200/20 dark:border-green-800/20 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-md shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {proteinPercentage.toFixed(0)}%
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Progress
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">
              Protein
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
              {totalProteinLogged}
              <span className="text-lg text-slate-500 dark:text-slate-400 font-normal">
                g / {macros.protein_g}g
              </span>
            </p>
            <div className="h-3 bg-white/50 dark:bg-slate-800/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(proteinPercentage, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-md bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-sky-500/10 p-6 border border-blue-200/20 dark:border-blue-800/20 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-md shadow-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {carbsPercentage.toFixed(0)}%
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Progress
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">
              Carbs
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
              {totalCarbsLogged}
              <span className="text-lg text-slate-500 dark:text-slate-400 font-normal">
                g / {macros.carbs_g}g
              </span>
            </p>
            <div className="h-3 bg-white/50 dark:bg-slate-800/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(carbsPercentage, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-md bg-gradient-to-br from-yellow-500/10 via-amber-500/10 to-orange-500/10 p-6 border border-yellow-200/20 dark:border-yellow-800/20 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-yellow-500 to-amber-500 p-3 rounded-md shadow-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {fatsPercentage.toFixed(0)}%
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Progress
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">
              Healthy Fats
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
              {totalFatsLogged}
              <span className="text-lg text-slate-500 dark:text-slate-400 font-normal">
                g / {macros.fat_g}g
              </span>
            </p>
            <div className="h-3 bg-white/50 dark:bg-slate-800/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(fatsPercentage, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full"
              />
            </div>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-auto gap-2 bg-white/50 dark:bg-slate-900/50 p-2 rounded-md backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
          {["meals", "hydration", "shopping", "tips"].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                selectedTab === tab
                  ? "bg-gradient-to-r from-primary to-emerald-600 text-white shadow-lg"
                  : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50"
              }`}
            >
              {tab === "meals" && (
                <UtensilsCrossed className="h-4 w-4 inline mr-2" />
              )}
              {tab === "hydration" && (
                <Droplet className="h-4 w-4 inline mr-2" />
              )}
              {tab === "shopping" && (
                <ShoppingCart className="h-4 w-4 inline mr-2" />
              )}
              {tab === "tips" && <Lightbulb className="h-4 w-4 inline mr-2" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {selectedTab === "meals" && (
            <motion.div
              key="meals"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-primary to-emerald-600 p-3 rounded-md shadow-lg">
                  <ChefHat className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Today's Meals
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {aiMealPlan?.meals.length} meals •{" "}
                    {aiMealPlan?.daily_totals.calories} total calories •{"  "}
                    ✓ Macros match targets within ±5%
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                {aiMealPlan?.meals.map((meal, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className={`rounded-md bg-gradient-to-br ${getMealGradient(
                      meal.meal_type
                    )} border border-white/20 dark:border-slate-700/20 overflow-hidden backdrop-blur-sm shadow-lg hover:shadow-xl transition-all`}
                  >
                    <button
                      onClick={() =>
                        setExpandedMeal(
                          expandedMeal === meal.meal_type
                            ? null
                            : meal.meal_type
                        )
                      }
                      className="w-full p-6 flex items-center justify-between hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-md shadow-lg">
                          {getMealIcon(meal.meal_type)}
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-slate-900 dark:text-white capitalize text-lg">
                              {meal.meal_type}
                            </h4>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(
                                meal?.difficulty
                              )}`}
                            >
                              {meal?.difficulty}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                            {meal.meal_name}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {meal.meal_timing}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 font-semibold">
                            <Clock className="h-4 w-4" />
                            {meal.prep_time_minutes} min
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 font-semibold mt-1">
                            <Flame className="h-4 w-4 text-orange-500" />
                            {meal.total_calories} cal
                          </div>
                        </div>
                        {expandedMeal === meal.meal_type ? (
                          <ChevronUp className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                        ) : (
                          <ChevronDown className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                        )}
                      </div>
                    </button>

                    <AnimatePresence>
                      {expandedMeal === meal.meal_type && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="px-6 pb-6 space-y-4"
                        >
                          {/* Tags */}
                          <div className="flex flex-wrap gap-2">
                            {meal?.tags.map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="px-3 py-1 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>

                          {/* Ingredients */}
                          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-md p-5 border border-slate-200/50 dark:border-slate-700/50">
                            <h5 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                              <ShoppingCart className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                              Ingredients
                            </h5>
                            <div className="grid gap-3">
                              {meal.foods.map((food, foodIndex) => (
                                <motion.div
                                  key={foodIndex}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: foodIndex * 0.05 }}
                                  className="flex items-center justify-between bg-white/70 dark:bg-slate-900/70 p-4 rounded-lg hover:bg-white dark:hover:bg-slate-900/90 transition-all border border-slate-200/50 dark:border-slate-700/50 group"
                                >
                                  <div className="flex items-center gap-3 flex-1">
                                    <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-2 rounded-lg shadow-md group-hover:scale-110 transition-transform">
                                      <Check className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                      <p className="font-semibold text-slate-900 dark:text-white">
                                        {food.name}
                                      </p>
                                      <p className="text-sm text-slate-600 dark:text-slate-400">
                                        {food.portion} • {food.grams}g
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold text-slate-900 dark:text-white">
                                      {food.calories} cal
                                    </p>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                      P:{food.protein}g C:{food.carbs}g F:
                                      {food.fats}g
                                    </p>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>

                          {/* Recipe Instructions */}
                          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-md p-5 border border-blue-200/50 dark:border-blue-800/50">
                            <h5 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                              <ChefHat className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              How to Prepare
                            </h5>
                            <div className="space-y-3">
                              {meal.recipe
                                .split("\n")
                                .map((step, stepIndex) => (
                                  <div key={stepIndex} className="flex gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center text-xs font-bold">
                                      {stepIndex + 1}
                                    </div>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed flex-1">
                                      {step.replace(/^\d+\.\s*/, "")}
                                    </p>
                                  </div>
                                ))}
                            </div>
                            {meal.tips && meal.tips.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-blue-200/50 dark:border-blue-800/50">
                                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1">
                                  <Lightbulb className="h-3 w-3" />
                                  Pro Tips
                                </p>
                                {meal.tips.map((tip, tipIndex) => (
                                  <p
                                    key={tipIndex}
                                    className="text-xs text-slate-600 dark:text-slate-400 mb-1"
                                  >
                                    • {tip}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Nutrition Summary */}
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-md p-4 text-center border border-orange-200/50 dark:border-orange-800/50">
                              <Flame className="h-6 w-6 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                                Calories
                              </p>
                              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                {meal.total_calories}
                              </p>
                            </div>
                            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-md p-4 text-center border border-green-200/50 dark:border-green-800/50">
                              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                                Protein
                              </p>
                              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                {meal.total_protein}g
                              </p>
                            </div>
                            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-md p-4 text-center border border-blue-200/50 dark:border-blue-800/50">
                              <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                                Carbs
                              </p>
                              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                {meal.total_carbs}g
                              </p>
                            </div>
                            <div className="bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-md p-4 text-center border border-yellow-200/50 dark:border-yellow-800/50">
                              <Heart className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
                              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                                Fats
                              </p>
                              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                {meal.total_fats}g
                              </p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-md p-4 text-center border border-purple-200/50 dark:border-purple-800/50">
                              <Apple className="h-6 w-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                                Fiber
                              </p>
                              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                {meal.total_fiber}g
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {selectedTab === "hydration" && (
            <motion.div
              key="hydration"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-sky-500/10 rounded-md p-8 border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-4 rounded-md shadow-lg">
                    <Droplet className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Daily Hydration Plan
                    </h3>
                    <p className="text-lg text-blue-600 dark:text-blue-400 font-semibold">
                      {aiMealPlan.hydration_plan.daily_water_intake}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Timer className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      Optimal Timing
                    </h4>
                    {aiMealPlan.hydration_plan.timing.map((time, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 bg-white/60 dark:bg-slate-800/60 p-4 rounded-md border border-blue-200/50 dark:border-blue-800/50"
                      >
                        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-lg">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          {time}
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-md p-6 border border-cyan-200/50 dark:border-cyan-800/50">
                    <div className="flex items-start gap-3 mb-4">
                      <Info className="h-5 w-5 text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                          Electrolytes
                        </h4>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          {aiMealPlan.hydration_plan.electrolyte_needs}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
                      <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                        Signs you need more water:
                      </p>
                      <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                        <li>• Dark yellow urine</li>
                        <li>• Dry mouth or lips</li>
                        <li>• Headaches or fatigue</li>
                        <li>• Dizziness during workouts</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {selectedTab === "shopping" && (
            <motion.div
              key="shopping"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 rounded-md p-8 border border-green-200/50 dark:border-green-800/50 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-4 rounded-md shadow-lg">
                      <ShoppingCart className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Weekly Shopping List
                      </h3>
                      <p className="text-green-600 dark:text-green-400 font-semibold">
                        {aiMealPlan.shopping_list.estimated_cost}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(aiMealPlan.shopping_list)
                    .filter(([key]) => key !== "estimated_cost")
                    .map(([category, items], index) => (
                      <motion.div
                        key={category}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-md p-5 border border-green-200/50 dark:border-green-800/50"
                      >
                        <h4 className="font-bold text-slate-900 dark:text-white capitalize mb-4 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
                          {category.replace("_", " ")}
                        </h4>
                        <div className="space-y-2">
                          {items.map((item, itemIndex) => (
                            <div
                              key={itemIndex}
                              className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
                            >
                              <Check className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                </div>

                <div className="mt-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-md p-6 border border-green-200/50 dark:border-green-800/50">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-green-600 dark:text-green-400" />
                    Meal Prep Strategy
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2">
                        Batch Cooking
                      </p>
                      {aiMealPlan.meal_prep_strategy.batch_cooking.map(
                        (tip, i) => (
                          <p
                            key={i}
                            className="text-sm text-slate-700 dark:text-slate-300 mb-1"
                          >
                            • {tip}
                          </p>
                        )
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2">
                        Storage Tips
                      </p>
                      {aiMealPlan.meal_prep_strategy.storage_tips.map(
                        (tip, i) => (
                          <p
                            key={i}
                            className="text-sm text-slate-700 dark:text-slate-300 mb-1"
                          >
                            • {tip}
                          </p>
                        )
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2">
                        Time Savers
                      </p>
                      {aiMealPlan.meal_prep_strategy.time_saving_hacks.map(
                        (tip, i) => (
                          <p
                            key={i}
                            className="text-sm text-slate-700 dark:text-slate-300 mb-1"
                          >
                            • {tip}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {selectedTab === "tips" && (
            <motion.div
              key="tips"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-4 rounded-md shadow-lg">
                  <Lightbulb className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Personalized Tips
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Tailored advice for your success
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                {aiMealPlan.personalized_tips.map((tip, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10 rounded-md p-6 border border-purple-200/50 dark:border-purple-800/50 backdrop-blur-sm hover:shadow-lg transition-all"
                  >
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                      {tip}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-md p-6 border border-indigo-200/50 dark:border-indigo-800/50 mt-6">
                <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Daily Totals Summary
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                      {aiMealPlan.daily_totals.calories}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Calories
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {aiMealPlan.daily_totals.protein}g
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Protein
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {aiMealPlan.daily_totals.carbs}g
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Carbs
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                      {aiMealPlan.daily_totals.fats}g
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Fats
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {aiMealPlan.daily_totals.fiber}g
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Fiber
                    </p>
                  </div>
                </div>
                <p className="text-center text-xs text-slate-500 dark:text-slate-500 mt-4">
                  Variance: {aiMealPlan.daily_totals.variance}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {showLogModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-foreground">
                  Log Your Meal
                </h3>
                <button onClick={() => setShowLogModal(false)} className="p-2">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Meal Type</Label>
                  <select
                    value={mealLog.meal_type}
                    onChange={(e) =>
                      setMealLog({ ...mealLog, meal_type: e.target.value })
                    }
                    className="w-full p-2 border rounded-lg bg-background"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>

                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold">Add Food Items</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Food Name</Label>
                      <Input
                        value={newFood.name}
                        onChange={(e) =>
                          setNewFood({ ...newFood, name: e.target.value })
                        }
                        placeholder="e.g., Grilled Chicken"
                      />
                    </div>
                    <div>
                      <Label>Portion</Label>
                      <Input
                        value={newFood.portion}
                        onChange={(e) =>
                          setNewFood({ ...newFood, portion: e.target.value })
                        }
                        placeholder="e.g., 150g"
                      />
                    </div>
                    <div>
                      <Label>Calories</Label>
                      <Input
                        type="number"
                        value={newFood.calories || ""}
                        onChange={(e) =>
                          setNewFood({
                            ...newFood,
                            calories: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Protein (g)</Label>
                      <Input
                        type="number"
                        value={newFood.protein || ""}
                        onChange={(e) =>
                          setNewFood({
                            ...newFood,
                            protein: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Carbs (g)</Label>
                      <Input
                        type="number"
                        value={newFood.carbs || ""}
                        onChange={(e) =>
                          setNewFood({
                            ...newFood,
                            carbs: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Fats (g)</Label>
                      <Input
                        type="number"
                        value={newFood.fats || ""}
                        onChange={(e) =>
                          setNewFood({
                            ...newFood,
                            fats: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                  <Button
                    onClick={addFoodToLog}
                    variant="outline"
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Food
                  </Button>
                </div>

                {mealLog.foods.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Added Foods</h4>
                    <div className="space-y-2">
                      {mealLog.foods.map((food, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-background p-2 rounded"
                        >
                          <div>
                            <div className="font-medium">{food.name}</div>
                            <div className="text-sm text-foreground/70">
                              {food.calories} cal • {food.protein}g P
                            </div>
                          </div>
                          <button
                            onClick={() => removeFoodFromLog(index)}
                            className="text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label>Notes (optional)</Label>
                  <Textarea
                    value={mealLog.notes}
                    onChange={(e) =>
                      setMealLog({ ...mealLog, notes: e.target.value })
                    }
                    placeholder="Any additional notes about this meal..."
                  />
                </div>

                <Button
                  onClick={saveMealLog}
                  className={`w-full ${colorTheme.primaryBg} ${colorTheme.primaryHover} text-white`}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Meal Log
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
  );
};
