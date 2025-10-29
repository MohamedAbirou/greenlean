import type { ExerciseLibrary, LifestyleIntegration } from "@/shared/types/dashboard";
import { motion } from "framer-motion";
import {
  Briefcase,
  Building2,
  Calendar,
  Coffee,
  Home,
  MapPin,
  Users,
} from "lucide-react";
import React, { useMemo } from "react";

interface LifestylePanelProps {
  lifestyle: LifestyleIntegration;
  exerciseLibrary: ExerciseLibrary;
}

const LifestyleItem = React.memo<{
  icon: React.ElementType;
  title: string;
  content: string;
  delay: number;
}>(({ icon: Icon, title, content, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-background backdrop-blur-sm rounded-md p-5 border border-purple-200/50 dark:border-purple-800/50 hover:shadow-lg transition-all"
  >
    <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
      <Icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
      {title}
    </h4>
    <p className="text-sm text-muted-foreground leading-relaxed">
      {content}
    </p>
  </motion.div>
));

LifestyleItem.displayName = "LifestyleItem";

const ExerciseList = React.memo<{
  title: string;
  icon: React.ElementType;
  exercises: string[];
  iconColor: string;
  bulletColor: string;
  delay: number;
}>(({ title, icon: Icon, exercises, iconColor, bulletColor, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-background backdrop-blur-sm rounded-md p-5 border border-blue-200/50 dark:border-blue-800/50"
  >
    <div className="flex items-center gap-2 mb-4">
      <div className={`bg-gradient-to-r ${iconColor} p-2 rounded-lg`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <h4 className="font-bold text-foreground">{title}</h4>
    </div>
    <ul className="space-y-2">
      {exercises.map((exercise, index) => (
        <li
          key={index}
          className="flex items-start gap-2 text-sm text-muted-foreground"
        >
          <div
            className={`w-1.5 h-1.5 rounded-full ${bulletColor} mt-1.5 flex-shrink-0`}
          />
          <span>{exercise}</span>
        </li>
      ))}
    </ul>
  </motion.div>
));

ExerciseList.displayName = "ExerciseList";

export const LifestylePanel: React.FC<LifestylePanelProps> = React.memo(
  ({ lifestyle, exerciseLibrary }) => {
    const lifestyleItems = useMemo(() => {
      if (!lifestyle) return [];

      const items = [];
      if (lifestyle.work_schedule_tips) {
        items.push({
          icon: Briefcase,
          title: "Work Schedule Tips",
          content: lifestyle.work_schedule_tips,
          delay: 0,
        });
      }
      if (lifestyle.busy_day_workouts) {
        items.push({
          icon: Calendar,
          title: "Busy Day Workouts",
          content: lifestyle.busy_day_workouts,
          delay: 0.1,
        });
      }
      if (lifestyle.travel_workouts) {
        items.push({
          icon: MapPin,
          title: "Travel Workouts",
          content: lifestyle.travel_workouts,
          delay: 0.2,
        });
      }
      if (lifestyle.social_considerations) {
        items.push({
          icon: Users,
          title: "Social Considerations",
          content: lifestyle.social_considerations,
          delay: 0.3,
        });
      }
      return items;
    }, [lifestyle]);

    const exerciseLocations = useMemo(() => {
      if (!exerciseLibrary) return [];

      const locations = [];
      if (exerciseLibrary.gym_exercises?.length > 0) {
        locations.push({
          title: "Gym Exercises",
          icon: Building2,
          exercises: exerciseLibrary.gym_exercises,
          iconColor: "from-orange-500 to-red-500",
          bulletColor: "bg-orange-500",
          delay: 0,
        });
      }
      if (exerciseLibrary.home_exercises?.length > 0) {
        locations.push({
          title: "Home Exercises",
          icon: Home,
          exercises: exerciseLibrary.home_exercises,
          iconColor: "from-green-500 to-emerald-500",
          bulletColor: "bg-green-500",
          delay: 0.1,
        });
      }
      if (exerciseLibrary.outdoor_exercises?.length > 0) {
        locations.push({
          title: "Outdoor Exercises",
          icon: MapPin,
          exercises: exerciseLibrary.outdoor_exercises,
          iconColor: "from-blue-500 to-cyan-500",
          bulletColor: "bg-blue-500",
          delay: 0.2,
        });
      }
      return locations;
    }, [exerciseLibrary]);

    if (!lifestyle && !exerciseLibrary) return null;

    return (
      <div className="space-y-6">
        {lifestyle && lifestyleItems.length > 0 && (
          <div className="bg-stat-purple rounded-md p-8 border border-purple-200/50 dark:border-purple-800/50 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-progress-purple-pink p-4 rounded-md shadow-lg">
                <Coffee className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">
                  Lifestyle Integration
                </h3>
                <p className="text-muted-foreground">
                  Fitness tips that fit your life
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              {lifestyleItems.map((item, index) => (
                <LifestyleItem key={index} {...item} />
              ))}
            </div>
          </div>
        )}

        {exerciseLibrary && exerciseLocations.length > 0 && (
          <div className="bg-stat-blue rounded-md p-8 border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-progress-blue-cyan p-4 rounded-md shadow-lg">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">
                  Exercise Library by Location
                </h3>
                <p className="text-muted-foreground">
                  Workout anywhere, anytime
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {exerciseLocations.map((location, index) => (
                <ExerciseList key={index} {...location} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

LifestylePanel.displayName = "LifestylePanel";
