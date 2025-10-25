import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModalDialog } from "@/components/ui/modal-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { Plus, Save, X } from "lucide-react";
import React, { useState, type Dispatch, type SetStateAction } from "react";
import toast from "react-hot-toast";

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

interface MealLogModalProps {
  userId: string;
  show: boolean;
  setShowLogModal: Dispatch<SetStateAction<boolean>>;
  onClose: () => void;
  loadTodayLogs: () => void;
}

export const MealLogModal: React.FC<MealLogModalProps> = ({
  userId,
  show,
  setShowLogModal,
  onClose,
  loadTodayLogs,
}) => {
  const [newFood, setNewFood] = useState<FoodLog>({
    name: "",
    portion: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  });

  const [mealLog, setMealLog] = useState<MealLog>({
    meal_type: "breakfast",
    foods: [],
    notes: "",
  });

  const addFoodToLog = () => {
    if (!newFood.name || newFood.calories <= 0) {
      toast.error("Please fill in food name and calories");
      return;
    }
    setMealLog((prev) => ({ ...prev, foods: [...prev.foods, { ...newFood }] }));
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

  return (
    <ModalDialog
      open={show}
      onOpenChange={onClose}
      title="Log Your Meal"
      size="md"
    >
      <div className="space-y-4">
        <div>
          <Label>Meal Type*</Label>
          <Select
            value={mealLog.meal_type}
            onValueChange={(value) =>
              setMealLog({ ...mealLog, meal_type: value })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Meal Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="breakfast">Breakfast</SelectItem>
              <SelectItem value="lunch">Lunch</SelectItem>
              <SelectItem value="dinner">Dinner</SelectItem>
              <SelectItem value="snack">Snack</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-lg p-4 space-y-3">
          <h4 className="font-semibold">Add Food Items</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Food Name*</Label>
              <Input
                value={newFood.name}
                onChange={(e) =>
                  setNewFood({ ...newFood, name: e.target.value })
                }
                placeholder="e.g., Grilled Chicken"
              />
            </div>
            <div>
              <Label>Portion*</Label>
              <Input
                value={newFood.portion}
                onChange={(e) =>
                  setNewFood({ ...newFood, portion: e.target.value })
                }
                placeholder="e.g., 150g"
              />
            </div>
            <div>
              <Label>Calories (kcal)*</Label>
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
              <Label>Protein (g)*</Label>
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
              <Label>Carbs (g)*</Label>
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
              <Label>Fats (g)*</Label>
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
          <Button onClick={addFoodToLog} variant="secondary" className="w-full">
            <Plus className="h-4 w-4" />
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
          <Label>Notes</Label>
          <Textarea
            value={mealLog.notes}
            onChange={(e) => setMealLog({ ...mealLog, notes: e.target.value })}
            placeholder="Any additional notes about this meal..."
          />
        </div>

        <Button onClick={saveMealLog} className={`w-full  text-white`}>
          <Save className="h-4 w-4" />
          Save Meal Log
        </Button>
      </div>
    </ModalDialog>
  );
};
