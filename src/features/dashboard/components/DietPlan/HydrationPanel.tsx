import { motion } from "framer-motion";
import { Check, Droplet, Info, Timer } from "lucide-react";
import React from "react";
import WaterIntakeCard from "../WaterIntakeCard";

interface HydrationPlan {
  daily_water_intake: string;
  timing: string[];
  electrolyte_needs: string;
}

interface HydrationPanelProps {
  hydrationPlan: HydrationPlan;
}

export const HydrationPanel: React.FC<HydrationPanelProps> = ({
  hydrationPlan,
}) => {
  if (!hydrationPlan) return null;
  return (
    <div className="bg-stat-blue rounded-md p-8 border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-progress-blue-cyan p-4 rounded-md shadow-lg">
          <Droplet className="h-8 w-8 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-foreground/80">
            Daily Hydration Plan
          </h3>
          <p className="text-lg text-blue-600 dark:text-blue-400 font-semibold">
            {hydrationPlan.daily_water_intake}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h4 className="font-bold text-foreground/80 flex items-center gap-2">
            <Timer className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Optimal Timing
          </h4>
          {hydrationPlan.timing.map((time: string, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 bg-background p-4 rounded-md border border-blue-200/50 dark:border-blue-800/50"
            >
              <div className="bg-progress-blue-cyan p-2 rounded-lg">
                <Check className="h-4 w-4 text-white" />
              </div>
              <p className="text-sm text-foreground/90">
                {time}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-md p-6 border border-cyan-200/50 dark:border-cyan-800/50">
          <div className="flex items-start gap-3 mb-4">
            <Info className="h-5 w-5 text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-foreground/80 mb-2">
                Electrolytes
              </h4>
              <p className="text-sm text-foreground/90">
                {hydrationPlan.electrolyte_needs}
              </p>
            </div>
          </div>
          {/* Daily Water Intake Card */}
        <WaterIntakeCard />
          <div className="space-y-2 mt-4">
            <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">
              Signs you need more water:
            </p>
            <ul className="text-xs text-foreground/60 space-y-1">
              <li>• Dark yellow urine</li>
              <li>• Dry mouth or lips</li>
              <li>• Headaches or fatigue</li>
              <li>• Dizziness during workouts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
