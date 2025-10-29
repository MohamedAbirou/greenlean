import { motion } from "framer-motion";
import { Check, Lightbulb, ShoppingCart } from "lucide-react";
import React from "react";

interface ShoppingPanelProps {
  shoppingList: { [category: string]: string[] | string }; // estimated_cost may be string
  mealPrepStrategy: {
    batch_cooking: string[];
    storage_tips: string[];
    time_saving_hacks: string[];
  };
}

export const ShoppingPanel: React.FC<ShoppingPanelProps> = ({
  shoppingList,
  mealPrepStrategy,
}) => {
  if (!shoppingList || !mealPrepStrategy) return null;
  return (
    <div className="bg-stat-green rounded-md p-8 border border-green-200/50 dark:border-green-800/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-4 rounded-md shadow-lg">
            <ShoppingCart className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground/80">
              Weekly Shopping List
            </h3>
            <p className="text-green-600 dark:text-green-400 font-semibold">
              {shoppingList.estimated_cost}
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(shoppingList)
          .filter(([key]) => key !== "estimated_cost")
          .map(([category, items], index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-background backdrop-blur-sm rounded-md p-5 border border-green-200/50 dark:border-green-800/50"
            >
              <h4 className="font-bold text-foreground/80 capitalize mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
                {category.replace("_", " ")}
              </h4>
              <div className="space-y-2">
                {(items as string[]).map((item: string, itemIndex: number) => (
                  <div
                    key={itemIndex}
                    className="flex items-start gap-2 text-sm text-foreground/80"
                  >
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
      </div>

      <div className="mt-6 bg-page-green-emerald rounded-md p-6 border border-green-200/50 dark:border-green-800/50">
        <h4 className="font-bold text-foreground/80 mb-4 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-green-600 dark:text-green-400" />
          Meal Prep Strategy
        </h4>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2">
              Batch Cooking
            </p>
            {mealPrepStrategy.batch_cooking.map((tip: string, i: number) => (
              <p
                key={i}
                className="text-sm text-foreground/70 mb-1"
              >
                • {tip}
              </p>
            ))}
          </div>
          <div>
            <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2">
              Storage Tips
            </p>
            {mealPrepStrategy.storage_tips.map((tip: string, i: number) => (
              <p
                key={i}
                className="text-sm text-foreground/70 mb-1"
              >
                • {tip}
              </p>
            ))}
          </div>
          <div>
            <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2">
              Time Savers
            </p>
            {mealPrepStrategy.time_saving_hacks.map(
              (tip: string, i: number) => (
                <p
                  key={i}
                  className="text-sm text-foreground/70 mb-1"
                >
                  • {tip}
                </p>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
