// src/features/dashboard/components/PlanGeneratingState.tsx (NEW)

import { motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";

interface PlanGeneratingStateProps {
  planType: "meal" | "workout";
}

export const PlanGeneratingState: React.FC<PlanGeneratingStateProps> = ({ planType }) => {
  const messages = {
    meal: {
      title: "Crafting Your Personalized Meal Plan",
      subtitle: "AI is analyzing your goals and preferences...",
      tips: [
        "Creating balanced macro distribution",
        "Selecting recipes based on your preferences",
        "Optimizing meal timing for your schedule",
        "Calculating portion sizes",
      ],
    },
    workout: {
      title: "Designing Your Custom Workout Program",
      subtitle: "AI is building your training schedule...",
      tips: [
        "Structuring progressive overload phases",
        "Selecting exercises for your equipment",
        "Optimizing recovery periods",
        "Creating exercise variations",
      ],
    },
  };

  const content = messages[planType];

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-lg p-8 border border-primary/10"
      >
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="relative">
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
            <Sparkles className="h-8 w-8 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
          </div>

          <div>
            <h3 className="text-2xl font-bold text-foreground mb-2">{content.title}</h3>
            <p className="text-foreground/70">{content.subtitle}</p>
          </div>

          <div className="w-full max-w-md space-y-3 mt-6">
            {content.tips.map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className="flex items-center gap-3 bg-background/50 rounded-lg p-3"
              >
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm text-foreground/80">{tip}</span>
              </motion.div>
            ))}
          </div>

          <p className="text-sm text-foreground/60 mt-6">
            This usually takes 30-60 seconds. Feel free to explore other sections!
          </p>
        </div>
      </motion.div>
    </div>
  );
};
