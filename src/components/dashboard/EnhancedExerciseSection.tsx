import { supabase } from '@/lib/supabase';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertCircle, Award, BarChart3,
  Calendar,
  Check,
  ChevronDown, ChevronUp,
  Clock,
  Dumbbell,
  Flame,
  Heart,
  Info,
  MapPin,
  Play,
  Plus,
  Repeat,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  Trophy,
  Wind,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const EnhancedWorkoutSection = ({ userId, colorTheme }) => {
  const [expandedDay, setExpandedDay] = useState(null);
  const [selectedTab, setSelectedTab] = useState('weekly');
  const [expandedExercise, setExpandedExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiWorkoutPlan, setAiWorkoutPlan] = useState(null);
  const [dailyLogs, setDailyLogs] = useState([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);


  // const loadWorkoutPlan = async () => {
  //   try {
  //     // First try localStorage
  //     const stored = localStorage.getItem("aiGeneratedPlans");
  //     if (stored) {
  //       const plans = JSON.parse(stored);
  //       if (plans.workoutPlan) {
  //         setAiWorkoutPlan(plans.workoutPlan);
  //       }
  //     }

  //     // Then check Supabase (in real app, use actual supabase client)
  //     // For demo purposes, we'll use mock data structure matching the document
  //     const mockData = {
  //       weekly_plan: [
  //         {
  //           day: "Monday",
  //           workout_type: "Upper Body Strength",
  //           training_location: "Gym",
  //           focus: "Chest, Back, Shoulders",
  //           duration_minutes: 60,
  //           intensity: "Moderate-High",
  //           estimated_calories_burned: 350,
  //           rpe_target: "7-8 out of 10",
  //           warmup: {
  //             duration_minutes: 10,
  //             activities: [
  //               "5 min light cardio (treadmill/bike)",
  //               "Arm circles: 10 each direction",
  //               "Band pull-aparts: 2x15",
  //               "Push-up plus: 2x10",
  //               "Specific warm-up sets for first exercise"
  //             ]
  //           },
  //           exercises: [
  //             {
  //               name: "Barbell Bench Press",
  //               category: "compound",
  //               sets: 4,
  //               reps: "8-10",
  //               rest_seconds: 90,
  //               tempo: "2-0-2-0",
  //               instructions: "Clear, safe execution cues. Form > weight. Control eccentric.",
  //               muscle_groups: ["chest", "triceps", "shoulders"],
  //               difficulty: "intermediate",
  //               equipment_needed: ["barbell", "bench"],
  //               alternatives: {
  //                 home: "Push-ups with elevation",
  //                 outdoor: "Decline push-ups on bench",
  //                 easier: "Dumbbell press",
  //                 harder: "Incline barbell press"
  //               },
  //               progression: "Add 2.5kg when you hit 4x10 with good form",
  //               safety_notes: "Keep shoulder blades retracted, avoid flaring elbows"
  //             },
  //             {
  //               name: "Pull-Ups",
  //               category: "compound",
  //               sets: 3,
  //               reps: "6-8",
  //               rest_seconds: 90,
  //               tempo: "2-0-2-0",
  //               instructions: "Engage lats, control the descent.",
  //               muscle_groups: ["back", "biceps"],
  //               difficulty: "intermediate",
  //               equipment_needed: ["pull-up bar"],
  //               alternatives: {
  //                 home: "Inverted rows under table",
  //                 easier: "Lat pull-down",
  //                 harder: "Weighted pull-ups",
  //                 outdoor: "Assisted pull-ups with band"
  //               },
  //               progression: "Add weight or increase reps gradually",
  //               safety_notes: "Avoid swinging, focus on control"
  //             }
  //           ],
  //           cooldown: {
  //             duration_minutes: 10,
  //             activities: [
  //               "Child's pose: 60 seconds",
  //               "Chest doorway stretch: 60s each side",
  //               "Shoulder dislocations with band: 2x10",
  //               "Deep breathing exercises: 3 minutes"
  //             ]
  //           },
  //           success_criteria: "Complete all sets with good form, feel muscle engagement",
  //           if_low_energy: "Reduce sets by 25%, maintain intensity on key lifts"
  //         },
  //         {
  //           day: "Tuesday",
  //           workout_type: "Lower Body Strength",
  //           training_location: "Gym",
  //           focus: "Legs, Core",
  //           duration_minutes: 60,
  //           intensity: "Moderate-High",
  //           estimated_calories_burned: 400,
  //           rpe_target: "7-8 out of 10",
  //           warmup: {
  //             duration_minutes: 10,
  //             activities: [
  //               "5 min light cardio (treadmill/bike)",
  //               "Hip circles: 10 each direction",
  //               "Leg swings: 10 each leg",
  //               "Bodyweight lunges: 2x10"
  //             ]
  //           },
  //           exercises: [
  //             {
  //               name: "Squats",
  //               category: "compound",
  //               sets: 4,
  //               reps: "8-10",
  //               rest_seconds: 90,
  //               tempo: "2-0-2-0",
  //               instructions: "Keep chest up, push through heels.",
  //               muscle_groups: ["quads", "glutes", "hamstrings"],
  //               difficulty: "intermediate",
  //               equipment_needed: ["barbell", "squat rack"],
  //               alternatives: {
  //                 home: "Bodyweight squats",
  //                 easier: "Goblet squats",
  //                 harder: "Front squats"
  //               },
  //               progression: "Add 5-10kg when you can complete 4x10",
  //               safety_notes: "Keep knees aligned with toes"
  //             },
  //             {
  //               name: "Deadlifts",
  //               category: "compound",
  //               sets: 3,
  //               reps: "6-8",
  //               rest_seconds: 90,
  //               tempo: "2-0-2-0",
  //               instructions: "Maintain a neutral spine, engage core.",
  //               muscle_groups: ["hamstrings", "glutes", "lower back"],
  //               difficulty: "intermediate",
  //               equipment_needed: ["barbell"],
  //               alternatives: {
  //                 home: "Kettlebell deadlifts",
  //                 easier: "Dumbbell deadlifts",
  //                 harder: "Sumo deadlifts"
  //               },
  //               progression: "Add 5-10kg as form improves",
  //               safety_notes: "Avoid rounding back during lift"
  //             }
  //           ],
  //           cooldown: {
  //             duration_minutes: 10,
  //             activities: [
  //               "Seated forward fold: 60 seconds",
  //               "Figure-four stretch: 60s each side",
  //               "Deep breathing exercises: 3 minutes"
  //             ]
  //           },
  //           success_criteria: "Complete all sets with good form",
  //           if_low_energy: "Reduce sets by 25%"
  //         },
  //         {
  //           day: "Wednesday",
  //           workout_type: "HIIT Cardio",
  //           training_location: "Outdoor",
  //           focus: "Cardiovascular Endurance",
  //           duration_minutes: 30,
  //           intensity: "High",
  //           estimated_calories_burned: 300,
  //           rpe_target: "8-9 out of 10",
  //           warmup: {
  //             duration_minutes: 10,
  //             activities: [
  //               "5 min light jogging",
  //               "Dynamic stretches: high knees, butt kicks",
  //               "Leg swings: 10 each leg"
  //             ]
  //           },
  //           exercises: [
  //             {
  //               name: "Sprint Intervals",
  //               category: "cardio",
  //               sets: 8,
  //               reps: "30 seconds sprint, 1 minute walk",
  //               rest_seconds: 60,
  //               instructions: "Sprint at max effort, recover fully during walk.",
  //               muscle_groups: ["full body"],
  //               difficulty: "intermediate",
  //               equipment_needed: ["none"],
  //               alternatives: {
  //                 home: "Treadmill sprints",
  //                 easier: "Bike sprints",
  //                 outdoor: "Park sprints"
  //               },
  //               progression: "Add more intervals or decrease recovery time",
  //               safety_notes: "Warm-up before starting intervals"
  //             }
  //           ],
  //           cooldown: {
  //             duration_minutes: 10,
  //             activities: [
  //               "Walking: 3-5 minutes",
  //               "Seated hamstring stretch: 60 seconds",
  //               "Deep breathing: 3 minutes"
  //             ]
  //           },
  //           success_criteria: "Complete all intervals with high effort",
  //           if_low_energy: "Reduce sprint duration by 10 seconds"
  //         },
  //         {
  //           day: "Thursday",
  //           workout_type: "Active Recovery / Mobility",
  //           training_location: "Home or Outdoor",
  //           focus: "Recovery, flexibility, stress reduction",
  //           duration_minutes: 30,
  //           intensity: "Low",
  //           optional: true,
  //           purpose: "Facilitate recovery, reduce stress, improve sleep",
  //           exercises: [
  //             {
  //               name: "Yoga Flow",
  //               category: "mobility",
  //               sets: 1,
  //               reps: "20 minutes",
  //               rest_seconds: 0,
  //               instructions: "Gentle flow focusing on breath and movement quality",
  //               muscle_groups: ["full body"],
  //               difficulty: "beginner",
  //               equipment_needed: ["yoga mat"],
  //               alternatives: {
  //                 home: "Follow online yoga video",
  //                 easier: "Stretching routine",
  //                 if_busy: "10-min mobility routine"
  //               }
  //             }
  //           ],
  //           if_feeling_good: "Can do light cardio instead (20-30 min walk/bike)"
  //         },
  //         {
  //           day: "Friday",
  //           workout_type: "Full Body Strength",
  //           training_location: "Gym",
  //           focus: "Total Body",
  //           duration_minutes: 60,
  //           intensity: "Moderate-High",
  //           estimated_calories_burned: 350,
  //           rpe_target: "7-8 out of 10",
  //           warmup: {
  //             duration_minutes: 10,
  //             activities: [
  //               "5 min light cardio",
  //               "Dynamic stretches",
  //               "Bodyweight lunges: 2x10"
  //             ]
  //           },
  //           exercises: [
  //             {
  //               name: "Barbell Squat",
  //               category: "compound",
  //               sets: 4,
  //               reps: "8-10",
  //               rest_seconds: 90,
  //               tempo: "2-0-2-0",
  //               instructions: "Keep your back straight, go deep into the squat.",
  //               muscle_groups: ["quads", "hamstrings", "glutes"],
  //               difficulty: "intermediate",
  //               equipment_needed: ["barbell", "squat rack"],
  //               progression: "Add 5-10kg once comfortable with reps",
  //               safety_notes: "Avoid letting knees cave in"
  //             },
  //             {
  //               name: "Push Press",
  //               category: "compound",
  //               sets: 3,
  //               reps: "8-10",
  //               rest_seconds: 90,
  //               tempo: "2-0-2-0",
  //               instructions: "Use legs to drive the weight up.",
  //               muscle_groups: ["shoulders", "triceps", "upper chest"],
  //               difficulty: "intermediate",
  //               equipment_needed: ["barbell"],
  //               progression: "Add 2.5kg when comfortable with reps",
  //               safety_notes: "Keep core tight during lift"
  //             }
  //           ],
  //           cooldown: {
  //             duration_minutes: 10,
  //             activities: [
  //               "Child's pose: 60 seconds",
  //               "Deep breathing: 3 minutes"
  //             ]
  //           },
  //           success_criteria: "Complete all sets with good form",
  //           if_low_energy: "Reduce sets by 25%"
  //         },
  //         {
  //           day: "Saturday",
  //           workout_type: "HIIT Cardio",
  //           training_location: "Outdoor",
  //           focus: "Cardiovascular Endurance",
  //           duration_minutes: 30,
  //           intensity: "High",
  //           estimated_calories_burned: 300,
  //           rpe_target: "8-9 out of 10",
  //           exercises: [
  //             {
  //               name: "Circuit Training",
  //               category: "cardio",
  //               sets: 3,
  //               reps: "30 seconds each exercise",
  //               rest_seconds: 60,
  //               instructions: "Perform each exercise back-to-back with minimal rest.",
  //               muscle_groups: ["full body"],
  //               difficulty: "intermediate",
  //               equipment_needed: ["none"],
  //               progression: "Increase duration or add more exercises",
  //               safety_notes: "Focus on form over speed"
  //             }
  //           ],
  //           success_criteria: "Complete all intervals with high effort",
  //           if_low_energy: "Reduce duration by 10 seconds"
  //         },
  //         {
  //           day: "Sunday",
  //           workout_type: "Rest Day",
  //           training_location: "Home",
  //           focus: "Recovery",
  //           duration_minutes: 0,
  //           intensity: "None",
  //           optional: true,
  //           purpose: "Rest and recovery",
  //           exercises: [],
  //           if_feeling_good: "Light stretching or a walk"
  //         }
  //       ],
  //       weekly_summary: {
  //         total_workout_days: 5,
  //         strength_days: 3,
  //         cardio_days: 2,
  //         rest_days: 1,
  //         total_time_minutes: 300,
  //         estimated_weekly_calories_burned: 2100,
  //         training_split: "Upper/Lower/Full Body + Conditioning",
  //         progression_strategy: "Linear progression with deload every 4th week"
  //       },
  //       nutrition_timing: {
  //         pre_workout: "Eat 1-2 hours before, focus on carbs + moderate protein.",
  //         post_workout: "Within 2 hours, protein + carbs for recovery.",
  //         rest_days: "Maintain protein, slightly lower carbs.",
  //         hydration: "Drink 500ml 2 hours before, sip during workout."
  //       },
  //       injury_prevention: {
  //         mobility_work: "Daily 10-min routine focusing on weak points.",
  //         red_flags: "Stop if sharp pain, dizziness, or unusual symptoms.",
  //         modification_guidelines: "Adjust intensity or volume if feeling fatigued."
  //       }
  //     };

  //     setAiWorkoutPlan(mockData);
  //   } catch (error) {
  //     console.error("Error loading workout plan:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
      loadWorkoutPlan();
      loadDailyLogs();
    }, [userId]);
  
    const loadWorkoutPlan = async () => {
      try {
        // const stored = localStorage.getItem("aiGeneratedPlans");
        // if (stored) {
        //   const plans = JSON.parse(stored);
        //   setAiWorkoutPlan(plans.workoutPlan);
        // }
  
        const { data, error } = await supabase
          .from("ai_workout_plans")
          .select("*")
          .eq("user_id", userId)
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
  
        if (data && !error) {
          setAiWorkoutPlan(data.plan_data);
        }

        console.log(data);
      } catch (error) {
        console.error("Error loading AI meal plan:", error);
      } finally {
        setLoading(false);
      }
    };

    const loadDailyLogs = async () => {
        try {
          const today = new Date().toISOString().split("T")[0];
          const { data, error } = await supabase
            .from("workout_logs")
            .select("*")
            .eq("user_id", userId)
            .eq("workout_date", today)
            .order("created_at", { ascending: false });
    
          if (data && !error) {
            setDailyLogs(data);
          }
        } catch (error) {
          console.error("Error loading today's logs:", error);
        }
      };
    
      // const addWorkouToLog = () => {
      //   if (!newWorkout.name || newWorkout.calories <= 0) {
      //     toast.error("Please fill in food name and calories");
      //     return;
      //   }
    
      //   setWorkoutLog((prev) => ({
      //     ...prev,
      //     foods: [...prev.foods, { ...newWorkout }],
      //   }));
    
      //   setNewWorkout({
      //     name: "",
      //     portion: "",
      //     calories: 0,
      //     protein: 0,
      //     carbs: 0,
      //     fats: 0,
      //   });
      // };
    
      // const removeFoodFromLog = (index: number) => {
      //   setWorkoutLog((prev) => ({
      //     ...prev,
      //     foods: prev.foods.filter((_, i) => i !== index),
      //   }));
      // };
    
      // const saveMealLog = async () => {
      //   if (mealLog.foods.length === 0) {
      //     toast.error("Please add at least one food item");
      //     return;
      //   }
    
      //   try {
      //     const totalCalories = mealLog.foods.reduce(
      //       (sum, f) => sum + f.calories,
      //       0
      //     );
      //     const totalProtein = mealLog.foods.reduce((sum, f) => sum + f.protein, 0);
      //     const totalCarbs = mealLog.foods.reduce((sum, f) => sum + f.carbs, 0);
      //     const totalFats = mealLog.foods.reduce((sum, f) => sum + f.fats, 0);
    
      //     const { error } = await supabase.from("daily_nutrition_logs").insert({
      //       user_id: userId,
      //       meal_type: mealLog.meal_type,
      //       food_items: mealLog.foods,
      //       total_calories: totalCalories,
      //       total_protein: totalProtein,
      //       total_carbs: totalCarbs,
      //       total_fats: totalFats,
      //       notes: mealLog.notes,
      //     });
    
      //     if (error) throw error;
    
      //     toast.success("Meal logged successfully! 🎉");
      //     setShowLogModal(false);
      //     setWorkoutLog({ meal_type: "breakfast", foods: [], notes: "" });
      //     loadTodayLogs();
      //   } catch (error) {
      //     console.error("Error saving meal log:", error);
      //     toast.error("Failed to save meal log");
      //   }
      // };

  // const loadWeeklyStats = () => {
  //   // Mock weekly stats - in real app, load from database
  //   setWeeklyLogs([
  //     { completed: true, calories_burned: 350 },
  //     { completed: true, calories_burned: 400 },
  //     { completed: true, calories_burned: 300 },
  //     { completed: true, calories_burned: 350 }
  //   ]);
  // };

  const weeklyWorkoutCount = dailyLogs.filter(log => log.completed).length;
  const weeklyCaloriesBurned = dailyLogs.reduce((sum, log) => sum + (log.calories_burned || 0), 0);
  const weeklyTarget = aiWorkoutPlan?.weekly_summary?.total_workout_days || 5;
  const weeklyProgress = (weeklyWorkoutCount / weeklyTarget) * 100;

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "intermediate":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "advanced":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case "compound": return <Dumbbell className="h-4 w-4" />;
      case "isolation": return <Target className="h-4 w-4" />;
      case "cardio": return <Activity className="h-4 w-4" />;
      case "mobility": return <Wind className="h-4 w-4" />;
      default: return <Dumbbell className="h-4 w-4" />;
    }
  };

  const getIntensityColor = (intensity) => {
    switch (intensity?.toLowerCase()) {
      case "low": return "from-green-500/20 to-emerald-500/20";
      case "moderate": return "from-yellow-500/20 to-orange-500/20";
      case "moderate-high": return "from-orange-500/20 to-red-500/20";
      case "high": return "from-red-500/20 to-pink-500/20";
      default: return "from-blue-500/20 to-cyan-500/20";
    }
  };

  const startWorkout = (workout) => {
    setSelectedWorkout(workout);
    setShowLogModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-foreground/70 font-medium">Loading your workout plan...</p>
        </div>
      </div>
    );
  }

  if (!aiWorkoutPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-md p-12 border border-slate-200/50 dark:border-slate-700/50">
            <AlertCircle className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Workout Plan Yet</h3>
            <p className="text-slate-600 dark:text-slate-400">Complete the fitness quiz to get your personalized AI workout plan!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="mx-auto space-y-6">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between flex-wrap gap-4"
        >
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Your AI Workout Plan
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Personalized training designed for your goals
            </p>
          </div>
          <button
            onClick={() => setShowLogModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Log Workout
          </button>
        </motion.div>

        {/* Weekly Progress Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-md bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-6 border border-indigo-200/20 dark:border-indigo-800/20 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-md shadow-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {weeklyProgress.toFixed(0)}%
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Complete</div>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">This Week</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
              {weeklyWorkoutCount}
              <span className="text-lg text-slate-500 dark:text-slate-400 font-normal"> / {weeklyTarget} workouts</span>
            </p>
            <div className="h-3 bg-white/50 dark:bg-slate-800/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(weeklyProgress, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-md bg-gradient-to-br from-orange-500/10 via-red-500/10 to-pink-500/10 p-6 border border-orange-200/20 dark:border-orange-800/20 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-orange-600 to-red-600 p-3 rounded-md shadow-lg">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <Trophy className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">Calories Burned</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {weeklyCaloriesBurned}
              <span className="text-sm text-slate-500 dark:text-slate-400 font-normal"> kcal</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-md bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 p-6 border border-green-200/20 dark:border-green-800/20 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-3 rounded-md shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <Sparkles className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">Streak</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {weeklyWorkoutCount}
              <span className="text-sm text-slate-500 dark:text-slate-400 font-normal"> days</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-md bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-sky-500/10 p-6 border border-blue-200/20 dark:border-blue-800/20 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-3 rounded-md shadow-lg">
                <Timer className="h-6 w-6 text-white" />
              </div>
              <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">Total Time</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {aiWorkoutPlan.weekly_summary?.total_time_minutes}
              <span className="text-sm text-slate-500 dark:text-slate-400 font-normal"> min</span>
            </p>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-auto gap-2 bg-white/50 dark:bg-slate-900/50 p-2 rounded-md backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
          {['weekly', 'nutrition', 'tips'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                selectedTab === tab
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
              }`}
            >
              {tab === 'weekly' && <Calendar className="h-4 w-4 inline mr-2" />}
              {tab === 'nutrition' && <Heart className="h-4 w-4 inline mr-2" />}
              {tab === 'tips' && <Info className="h-4 w-4 inline mr-2" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {selectedTab === 'weekly' && (
            <motion.div
              key="weekly"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-md shadow-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Weekly Schedule</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {aiWorkoutPlan.weekly_summary?.training_split}
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                {aiWorkoutPlan.weekly_plan.map((workout, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className={`rounded-md bg-gradient-to-br ${getIntensityColor(workout.intensity)} border border-white/20 dark:border-slate-700/20 overflow-hidden backdrop-blur-sm shadow-lg hover:shadow-xl transition-all`}
                  >
                    <button
                      onClick={() => setExpandedDay(expandedDay === workout.day ? null : workout.day)}
                      className="w-full p-6 flex items-center justify-between hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-md shadow-lg">
                          <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">
                              {workout.day}
                            </h4>
                            {workout.optional && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-semibold">
                                Optional
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{workout.workout_type}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-600 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {workout.training_location}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              {workout.focus}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 font-semibold">
                            <Clock className="h-4 w-4" />
                            {workout.duration_minutes} min
                          </div>
                          {workout.estimated_calories_burned && (
                            <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400 font-semibold mt-1">
                              <Flame className="h-4 w-4" />
                              {workout.estimated_calories_burned} cal
                            </div>
                          )}
                          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {workout.intensity} intensity
                          </div>
                        </div>
                        {expandedDay === workout.day ? (
                          <ChevronUp className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                        ) : (
                          <ChevronDown className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                        )}
                      </div>
                    </button>

                    <AnimatePresence>
                      {expandedDay === workout.day && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="px-6 pb-6 space-y-4"
                        >
                          {/* Warmup */}
                          {workout.warmup && (
                            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm rounded-md p-5 border border-blue-200/50 dark:border-blue-800/50">
                              <h5 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <Wind className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                Warm-up ({workout.warmup.duration_minutes} min)
                              </h5>
                              <div className="space-y-2">
                                {workout.warmup.activities.map((activity, actIndex) => (
                                  <div key={actIndex} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                    <Check className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                    <span>{activity}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Exercises */}
                          {workout.exercises && workout.exercises.length > 0 && (
                            <div className="space-y-3">
                              <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Dumbbell className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                Exercises ({workout.exercises.length})
                              </h5>
                              {workout.exercises.map((exercise, exIndex) => (
                                <div key={exIndex} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-md border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                                  <button
                                    onClick={() => setExpandedExercise(expandedExercise === `${workout.day}-${exIndex}` ? null : `${workout.day}-${exIndex}`)}
                                    className="w-full p-4 flex items-start justify-between hover:bg-white/70 dark:hover:bg-slate-800/70 transition-colors"
                                  >
                                    <div className="flex items-start gap-3 flex-1">
                                      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-lg shadow-md">
                                        {getCategoryIcon(exercise.category)}
                                        <div className="text-white text-xs font-bold mt-1">{exIndex + 1}</div>
                                      </div>
                                      <div className="text-left">
                                        <div className="flex items-center gap-2 mb-1">
                                          <h6 className="font-semibold text-slate-900 dark:text-white">{exercise.name}</h6>
                                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getDifficultyColor(exercise.difficulty)}`}>
                                            {exercise.difficulty}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                          <span className="font-semibold">{exercise.sets} sets × {exercise.reps}</span>
                                          <span>•</span>
                                          <span className="flex items-center gap-1">
                                            <Timer className="h-3 w-3" />
                                            {exercise.rest_seconds}s rest
                                          </span>
                                        </div>
                                        {exercise.tempo && (
                                          <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                                            Tempo: {exercise.tempo}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    {expandedExercise === `${workout.day}-${exIndex}` ? (
                                      <ChevronUp className="h-5 w-5 text-slate-600 dark:text-slate-400 flex-shrink-0" />
                                    ) : (
                                      <ChevronDown className="h-5 w-5 text-slate-600 dark:text-slate-400 flex-shrink-0" />
                                    )}
                                  </button>

                                  <AnimatePresence>
                                    {expandedExercise === `${workout.day}-${exIndex}` && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="px-4 pb-4 space-y-3"
                                      >
                                        {/* Instructions */}
                                        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-200/50 dark:border-purple-800/50">
                                          <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2 flex items-center gap-1">
                                            <Info className="h-3 w-3" />
                                            Instructions
                                          </p>
                                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                            {exercise.instructions}
                                          </p>
                                        </div>

                                        {/* Muscle Groups */}
                                        {exercise.muscle_groups && exercise.muscle_groups.length > 0 && (
                                          <div>
                                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Target Muscles</p>
                                            <div className="flex flex-wrap gap-2">
                                              {exercise.muscle_groups.map((muscle, mIndex) => (
                                                <span
                                                  key={mIndex}
                                                  className="px-3 py-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300 border border-indigo-200/50 dark:border-indigo-800/50"
                                                >
                                                  {muscle}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {/* Equipment */}
                                        {exercise.equipment_needed && exercise.equipment_needed.length > 0 && (
                                          <div>
                                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Equipment Needed</p>
                                            <div className="flex flex-wrap gap-2">
                                              {exercise.equipment_needed.map((equip, eIndex) => (
                                                <span
                                                  key={eIndex}
                                                  className="px-3 py-1 bg-white/70 dark:bg-slate-900/70 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50"
                                                >
                                                  {equip}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {/* Progression & Safety */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                          {exercise.progression && (
                                            <div className="bg-green-500/10 rounded-lg p-3 border border-green-200/50 dark:border-green-800/50">
                                              <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1 flex items-center gap-1">
                                                <TrendingUp className="h-3 w-3" />
                                                Progression
                                              </p>
                                              <p className="text-xs text-slate-700 dark:text-slate-300">{exercise.progression}</p>
                                            </div>
                                          )}
                                          {exercise.safety_notes && (
                                            <div className="bg-red-500/10 rounded-lg p-3 border border-red-200/50 dark:border-red-800/50">
                                              <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                Safety
                                              </p>
                                              <p className="text-xs text-slate-700 dark:text-slate-300">{exercise.safety_notes}</p>
                                            </div>
                                          )}
                                        </div>

                                        {/* Alternatives */}
                                        {exercise.alternatives && Object.keys(exercise.alternatives).length > 0 && (
                                          <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-200/50 dark:border-blue-800/50">
                                            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1">
                                              <Repeat className="h-3 w-3" />
                                              Alternative Options
                                            </p>
                                            <div className="grid grid-cols-2 gap-2">
                                              {Object.entries(exercise.alternatives).map(([key, value]) => (
                                                <div key={key} className="text-xs">
                                                  <span className="font-semibold text-slate-600 dark:text-slate-400 capitalize">{key}:</span>
                                                  <span className="text-slate-700 dark:text-slate-300 ml-1">{value}</span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Cooldown */}
                          {workout.cooldown && (
                            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm rounded-md p-5 border border-green-200/50 dark:border-green-800/50">
                              <h5 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <Heart className="h-5 w-5 text-green-600 dark:text-green-400" />
                                Cool-down ({workout.cooldown.duration_minutes} min)
                              </h5>
                              <div className="space-y-2">
                                {workout.cooldown.activities.map((activity, actIndex) => (
                                  <div key={actIndex} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                    <Check className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                    <span>{activity}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Workout Notes */}
                          {(workout.success_criteria || workout.if_low_energy || workout.rpe_target) && (
                            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-md p-5 border border-yellow-200/50 dark:border-yellow-800/50">
                              <h5 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                Workout Notes
                              </h5>
                              <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                                {workout.rpe_target && (
                                  <p><strong>Target Intensity:</strong> RPE {workout.rpe_target}</p>
                                )}
                                {workout.success_criteria && (
                                  <p><strong>Success Criteria:</strong> {workout.success_criteria}</p>
                                )}
                                {workout.if_low_energy && (
                                  <p><strong>Low Energy Option:</strong> {workout.if_low_energy}</p>
                                )}
                                {workout.if_feeling_good && (
                                  <p><strong>Feeling Great?</strong> {workout.if_feeling_good}</p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Start Workout Button */}
                          {workout.exercises && workout.exercises.length > 0 && (
                            <button
                              onClick={() => startWorkout(workout)}
                              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                            >
                              <Play className="h-5 w-5" />
                              Start This Workout
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {selectedTab === 'nutrition' && (
            <motion.div
              key="nutrition"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-br from-pink-500/10 via-rose-500/10 to-red-500/10 rounded-md p-8 border border-pink-200/50 dark:border-pink-800/50 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-gradient-to-br from-pink-600 to-rose-600 p-4 rounded-md shadow-lg">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Nutrition Timing</h3>
                    <p className="text-slate-600 dark:text-slate-400">Optimize your meals around workouts</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {Object.entries(aiWorkoutPlan.nutrition_timing).map(([key, value], index) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-md p-5 border border-pink-200/50 dark:border-pink-800/50"
                    >
                      <h4 className="font-bold text-slate-900 dark:text-white capitalize mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500"></div>
                        {key.replace('_', ' ')}
                      </h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{value}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Injury Prevention */}
              {aiWorkoutPlan.injury_prevention && (
                <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-md p-8 border border-red-200/50 dark:border-red-800/50 backdrop-blur-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-gradient-to-br from-red-600 to-orange-600 p-4 rounded-md shadow-lg">
                      <AlertCircle className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Injury Prevention</h3>
                      <p className="text-slate-600 dark:text-slate-400">Stay safe and train smart</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(aiWorkoutPlan.injury_prevention).map(([key, value]) => (
                      <div key={key} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-md p-5 border border-red-200/50 dark:border-red-800/50">
                        <h4 className="font-bold text-slate-900 dark:text-white capitalize mb-2 flex items-center gap-2">
                          <Check className="h-4 w-4 text-red-600 dark:text-red-400" />
                          {key.replace('_', ' ')}
                        </h4>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {selectedTab === 'tips' && (
            <motion.div
              key="tips"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-4 rounded-md shadow-lg">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Training Insights</h3>
                  <p className="text-slate-600 dark:text-slate-400">Expert tips for success</p>
                </div>
              </div>

              {/* Weekly Summary */}
              <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-md p-8 border border-indigo-200/50 dark:border-indigo-800/50 backdrop-blur-sm">
                <h4 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Weekly Summary
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-white/60 dark:bg-slate-800/60 rounded-md">
                    <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{aiWorkoutPlan.weekly_summary?.total_workout_days}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Workout Days</p>
                  </div>
                  <div className="text-center p-4 bg-white/60 dark:bg-slate-800/60 rounded-md">
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{aiWorkoutPlan.weekly_summary?.strength_days}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Strength Days</p>
                  </div>
                  <div className="text-center p-4 bg-white/60 dark:bg-slate-800/60 rounded-md">
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{aiWorkoutPlan.weekly_summary?.cardio_days}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Cardio Days</p>
                  </div>
                  <div className="text-center p-4 bg-white/60 dark:bg-slate-800/60 rounded-md">
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{aiWorkoutPlan.weekly_summary?.rest_days}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Rest Days</p>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between bg-white/60 dark:bg-slate-800/60 p-4 rounded-md">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Training Split</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{aiWorkoutPlan.weekly_summary?.training_split}</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/60 dark:bg-slate-800/60 p-4 rounded-md">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Weekly Time</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{aiWorkoutPlan.weekly_summary?.total_time_minutes} minutes</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/60 dark:bg-slate-800/60 p-4 rounded-md">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Est. Calories Burned</span>
                    <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{aiWorkoutPlan.weekly_summary?.estimated_weekly_calories_burned} kcal</span>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded-md">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Progression Strategy</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{aiWorkoutPlan.weekly_summary?.progression_strategy}</p>
                  </div>
                </div>
              </div>

              {/* Additional Tips Card */}
              <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-md p-8 border border-yellow-200/50 dark:border-yellow-800/50 backdrop-blur-sm">
                <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  Success Tips
                </h4>
                <div className="space-y-3">
                  {[
                    "Track your workouts to monitor progressive overload",
                    "Prioritize sleep - aim for 7-9 hours for optimal recovery",
                    "Stay consistent - missing one workout won't derail progress",
                    "Listen to your body - rest when needed to prevent injury",
                    "Focus on form before adding weight",
                    "Stay hydrated before, during, and after workouts"
                  ].map((tip, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 bg-white/60 dark:bg-slate-800/60 p-4 rounded-md"
                    >
                      <Check className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-700 dark:text-slate-300">{tip}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
};

export default EnhancedWorkoutSection;