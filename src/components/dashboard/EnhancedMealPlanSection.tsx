import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import type { MealPlanResponse } from "@/services/mlService";
import { motion } from "framer-motion";
import {
  Check,
  ChefHat,
  Clock,
  Coffee,
  Flame,
  Plus,
  Save,
  Sun,
  Sunset,
  Utensils,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Props {
  userId: string;
  dailyCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
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
      const totalCalories = mealLog.foods.reduce((sum, f) => sum + f.calories, 0);
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

      toast.success("Meal logged successfully!");
      setShowLogModal(false);
      setMealLog({ meal_type: "breakfast", foods: [], notes: "" });
      loadTodayLogs();
    } catch (error) {
      console.error("Error saving meal log:", error);
      toast.error("Failed to save meal log");
    }
  };

  const getMealIcon = (mealType: string) => {
    switch (mealType.toLowerCase()) {
      case "breakfast":
        return <Coffee className="h-5 w-5" />;
      case "lunch":
        return <Sun className="h-5 w-5" />;
      case "dinner":
        return <Sunset className="h-5 w-5" />;
      default:
        return <Utensils className="h-5 w-5" />;
    }
  };

  const totalLoggedToday = todayLogs.reduce((sum, log) => sum + (log.total_calories || 0), 0);
  const remainingCalories = dailyCalories - totalLoggedToday;

  if (loading) {
    return <div className="text-center py-8">Loading meal plan...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          AI-Powered Meal Plan
        </h2>
        <Button
          onClick={() => setShowLogModal(true)}
          className={`${colorTheme.primaryBg} ${colorTheme.primaryHover} text-white`}
        >
          <Plus className="h-4 w-4 mr-2" />
          Log Meal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-foreground/70">Today's Calories</span>
            <Flame className={`h-5 w-5 ${colorTheme.primaryText}`} />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {totalLoggedToday}
            <span className="text-sm text-foreground/70"> / {dailyCalories}</span>
          </div>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`${colorTheme.primaryBg} h-2 rounded-full transition-all`}
              style={{ width: `${Math.min((totalLoggedToday / dailyCalories) * 100, 100)}%` }}
            />
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-foreground/70 mb-2">Protein Target</div>
          <div className="text-2xl font-bold text-foreground">{macros.protein}g</div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-foreground/70 mb-2">Remaining</div>
          <div className={`text-2xl font-bold ${remainingCalories >= 0 ? "text-primary" : "text-red-500"}`}>
            {remainingCalories} cal
          </div>
        </Card>
      </div>

      {aiMealPlan && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground">Recommended Meals</h3>
          {aiMealPlan.meals.map((meal, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${colorTheme.primaryBg}/10`}>
                    {getMealIcon(meal.meal_type)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground capitalize">
                      {meal.meal_type}
                    </h4>
                    <p className="text-sm text-foreground/70">{meal.meal_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-foreground/70">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {meal.prep_time_minutes} min
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="h-4 w-4" />
                    {meal.total_calories} cal
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                {meal.foods.map((food, foodIndex) => (
                  <div
                    key={foodIndex}
                    className="flex items-center justify-between text-sm bg-background p-2 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <Check className={`h-4 w-4 ${colorTheme.primaryText}`} />
                      <span className="font-medium">{food.name}</span>
                      <span className="text-foreground/60">({food.portion})</span>
                    </div>
                    <div className="text-foreground/70">
                      {food.protein}g P • {food.carbs}g C • {food.fats}g F
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3">
                <div className="flex items-start gap-2 mb-2">
                  <ChefHat className={`h-4 w-4 ${colorTheme.primaryText} mt-1`} />
                  <div>
                    <div className="text-sm font-medium text-foreground mb-1">Recipe:</div>
                    <p className="text-sm text-foreground/70">{meal.recipe}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-sm font-medium text-foreground mt-3 pt-3 border-t">
                <span>Total</span>
                <span>
                  {meal.total_calories} cal • {meal.total_protein}g P • {meal.total_carbs}g C • {meal.total_fats}g F
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {aiMealPlan?.tips && aiMealPlan.tips.length > 0 && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20">
          <h4 className="font-semibold text-foreground mb-2">Nutrition Tips</h4>
          <ul className="space-y-1">
            {aiMealPlan.tips.map((tip, index) => (
              <li key={index} className="text-sm text-foreground/80 flex items-start gap-2">
                <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                {tip}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {showLogModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-foreground">Log Your Meal</h3>
              <button onClick={() => setShowLogModal(false)} className="p-2">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Meal Type</Label>
                <select
                  value={mealLog.meal_type}
                  onChange={(e) => setMealLog({ ...mealLog, meal_type: e.target.value })}
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
                      onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                      placeholder="e.g., Grilled Chicken"
                    />
                  </div>
                  <div>
                    <Label>Portion</Label>
                    <Input
                      value={newFood.portion}
                      onChange={(e) => setNewFood({ ...newFood, portion: e.target.value })}
                      placeholder="e.g., 150g"
                    />
                  </div>
                  <div>
                    <Label>Calories</Label>
                    <Input
                      type="number"
                      value={newFood.calories || ""}
                      onChange={(e) => setNewFood({ ...newFood, calories: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Protein (g)</Label>
                    <Input
                      type="number"
                      value={newFood.protein || ""}
                      onChange={(e) => setNewFood({ ...newFood, protein: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Carbs (g)</Label>
                    <Input
                      type="number"
                      value={newFood.carbs || ""}
                      onChange={(e) => setNewFood({ ...newFood, carbs: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Fats (g)</Label>
                    <Input
                      type="number"
                      value={newFood.fats || ""}
                      onChange={(e) => setNewFood({ ...newFood, fats: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <Button onClick={addFoodToLog} variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Food
                </Button>
              </div>

              {mealLog.foods.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Added Foods</h4>
                  <div className="space-y-2">
                    {mealLog.foods.map((food, index) => (
                      <div key={index} className="flex items-center justify-between bg-background p-2 rounded">
                        <div>
                          <div className="font-medium">{food.name}</div>
                          <div className="text-sm text-foreground/70">
                            {food.calories} cal • {food.protein}g P
                          </div>
                        </div>
                        <button onClick={() => removeFoodFromLog(index)} className="text-red-500">
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
                  onChange={(e) => setMealLog({ ...mealLog, notes: e.target.value })}
                  placeholder="Any additional notes about this meal..."
                />
              </div>

              <Button onClick={saveMealLog} className={`w-full ${colorTheme.primaryBg} ${colorTheme.primaryHover} text-white`}>
                <Save className="h-4 w-4 mr-2" />
                Save Meal Log
              </Button>
            </div>
          </Card>
        </div>
      )}
    </motion.div>
  );
};
