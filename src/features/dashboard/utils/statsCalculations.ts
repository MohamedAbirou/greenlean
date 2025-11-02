/**
 * Stats Calculations
 * Pure functions for calculating statistics
 */

import type {
  AdherenceScore,
  AIMealPlan,
  AIWorkoutPlan,
  CalorieBalance,
  HydrationTrend,
  Insight,
  MacroDistribution,
  MealConsistency,
  MonthComparison,
  MonthlyHighlight,
  NutritionLog,
  WaterIntakeLog,
  WeeklyEffort,
  WeeklySummary,
  WorkoutCalendarDay,
  WorkoutLog,
  WorkoutStats,
} from "../types/stats.types";

export function getDateRange(days: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split("T")[0]);
  }
  return dates;
}

export function calculateStreak(
  nutritionLogs: NutritionLog[],
  waterLogs: WaterIntakeLog[],
  workoutLogs: WorkoutLog[]
): number {
  const dates = getDateRange(30);
  let streak = 0;

  for (let i = dates.length - 1; i >= 0; i--) {
    const date = dates[i];
    const hasNutrition = nutritionLogs.some((log) => log.log_date === date);
    const hasWater = waterLogs.some((log) => log.log_date === date);
    const hasWorkout = workoutLogs.some((log) => log.workout_date === date);

    if (hasNutrition || hasWater || hasWorkout) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export function calculateWeeklySummary(
  nutritionLogs: NutritionLog[],
  waterLogs: WaterIntakeLog[],
  workoutLogs: WorkoutLog[],
): WeeklySummary {
  const dates = getDateRange(7);

  const weekNutrition = nutritionLogs.filter((log) => dates.includes(log.log_date));
  const weekWater = waterLogs.filter((log) => dates.includes(log.log_date));
  const weekWorkouts = workoutLogs.filter((log) => dates.includes(log.workout_date));

  const totalCalories = weekNutrition.reduce((sum, log) => sum + (log.total_calories || 0), 0);
  const avgCalories = weekNutrition.length > 0 ? totalCalories / 7 : 0;

  const avgHydration =
    weekWater.length > 0
      ? weekWater.reduce((sum, log) => sum + (log.glasses || 0), 0) / weekWater.length
      : 0;

  const daysActive = new Set([
    ...weekNutrition.map((l) => l.log_date),
    ...weekWater.map((l) => l.log_date),
    ...weekWorkouts.map((l) => l.workout_date),
  ]).size;

  return {
    totalCalories: Math.round(totalCalories),
    avgCalories: Math.round(avgCalories),
    workoutsCompleted: weekWorkouts.filter((w) => w.completed).length,
    avgHydration: Math.round(avgHydration * 10) / 10,
    daysActive,
  };
}

export function calculateMonthlyHighlight(
  nutritionLogs: NutritionLog[],
  waterLogs: WaterIntakeLog[],
  workoutLogs: WorkoutLog[]
): MonthlyHighlight {
  // Find best week for consistency
  const dates = getDateRange(30);
  let bestWeekStart = 0;
  let bestWeekScore = 0;

  for (let i = 0; i <= dates.length - 7; i++) {
    const weekDates = dates.slice(i, i + 7);
    const score = weekDates.filter(
      (date) =>
        nutritionLogs.some((l) => l.log_date === date) ||
        waterLogs.some((l) => l.log_date === date) ||
        workoutLogs.some((l) => l.workout_date === date)
    ).length;

    if (score > bestWeekScore) {
      bestWeekScore = score;
      bestWeekStart = i;
    }
  }

  const startDate = dates[bestWeekStart];
  const endDate = dates[bestWeekStart + 6];

  return {
    title: "Most Active Week",
    description: `${new Date(startDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })} - ${new Date(endDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })}`,
    value: `${bestWeekScore}/7 days`,
    icon: "trophy",
  };
}

export function calculateCalorieBalance(
  nutritionLogs: NutritionLog[],
  mealPlan: AIMealPlan | null
): CalorieBalance[] {
  const dates = getDateRange(30);
  const goal = mealPlan?.daily_calories || 2000;

  return dates.map((date) => {
    const dayLogs = nutritionLogs.filter((log) => log.log_date === date);
    const consumed = dayLogs.reduce((sum, log) => sum + (log.total_calories || 0), 0);

    return { date, consumed, goal };
  });
}

export function calculateMacroDistribution(nutritionLogs: NutritionLog[]): MacroDistribution[] {
  const dates = getDateRange(30);

  return dates
    .map((date) => {
      const dayLogs = nutritionLogs.filter((log) => log.log_date === date);
      if (dayLogs.length === 0) return null;

      const protein = dayLogs.reduce((sum, log) => sum + Number(log.total_protein || 0), 0);
      const carbs = dayLogs.reduce((sum, log) => sum + Number(log.total_carbs || 0), 0);
      const fats = dayLogs.reduce((sum, log) => sum + Number(log.total_fats || 0), 0);

      return { date, protein, carbs, fats };
    })
    .filter((item): item is MacroDistribution => item !== null);
}

export function calculateMealConsistency(nutritionLogs: NutritionLog[]): MealConsistency[] {
  const dates = getDateRange(30);
  const expectedMeals = 3; // breakfast, lunch, dinner

  return dates.map((date) => {
    const dayLogs = nutritionLogs.filter((log) => log.log_date === date);
    const uniqueMealTypes = new Set(dayLogs.map((log) => log.meal_type)).size;

    return {
      date,
      mealsLogged: uniqueMealTypes,
      expectedMeals,
    };
  });
}

export function calculateHydrationTrends(waterLogs: WaterIntakeLog[]): HydrationTrend[] {
  const dates = getDateRange(14);
  const goal = 8; // 8 glasses per day

  return dates.map((date) => {
    const log = waterLogs.find((l) => l.log_date === date);
    return {
      date,
      glasses: log?.glasses || 0,
      goal,
    };
  });
}

export function calculateHydrationInsights(waterLogs: WaterIntakeLog[]) {
  const dates = getDateRange(30);
  const goal = 8;

  // Best day
  let bestDay = { date: "", glasses: 0 };
  waterLogs.forEach((log) => {
    if (log.glasses > bestDay.glasses) {
      bestDay = { date: log.log_date, glasses: log.glasses };
    }
  });

  // Current streak
  let currentStreak = 0;
  for (let i = dates.length - 1; i >= 0; i--) {
    const log = waterLogs.find((l) => l.log_date === dates[i]);
    if (log && log.glasses >= goal) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Averages
  const thisMonthLogs = waterLogs.filter((l) => dates.includes(l.log_date));
  const avgGlassesPerDay =
    thisMonthLogs.length > 0
      ? thisMonthLogs.reduce((sum, l) => sum + l.glasses, 0) / thisMonthLogs.length
      : 0;

  const lastMonthDates = getDateRange(60).slice(0, 30);
  const lastMonthLogs = waterLogs.filter((l) => lastMonthDates.includes(l.log_date));
  const lastMonthAvg =
    lastMonthLogs.length > 0
      ? lastMonthLogs.reduce((sum, l) => sum + l.glasses, 0) / lastMonthLogs.length
      : 0;

  return {
    bestDay,
    currentStreak,
    avgGlassesPerDay: Math.round(avgGlassesPerDay * 10) / 10,
    lastMonthAvg: Math.round(lastMonthAvg * 10) / 10,
  };
}

export function calculateWorkoutCalendar(workoutLogs: WorkoutLog[]): WorkoutCalendarDay[] {
  const dates = getDateRange(30);

  return dates.map((date) => {
    const workout = workoutLogs.find((w) => w.workout_date === date);
    return {
      date,
      workoutType: workout?.workout_type || null,
      duration: workout?.duration_minutes || 0,
      caloriesBurned: workout?.calories_burned || 0,
    };
  });
}

export function calculateWorkoutStats(workoutLogs: WorkoutLog[]): WorkoutStats {
  const thisMonthDates = getDateRange(30);
  const thisMonthWorkouts = workoutLogs.filter((w) => thisMonthDates.includes(w.workout_date));

  const totalWorkouts = thisMonthWorkouts.length;
  const totalMinutes = thisMonthWorkouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0);
  const totalCaloriesBurned = thisMonthWorkouts.reduce(
    (sum, w) => sum + (w.calories_burned || 0),
    0
  );

  const avgCaloriesPerSession = totalWorkouts > 0 ? totalCaloriesBurned / totalWorkouts : 0;

  // Most common type
  const typeCounts: Record<string, number> = {};
  thisMonthWorkouts.forEach((w) => {
    typeCounts[w.workout_type] = (typeCounts[w.workout_type] || 0) + 1;
  });
  const mostCommonType =
    Object.keys(typeCounts).length > 0
      ? Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0][0]
      : "None";

  const longestWorkout = Math.max(...thisMonthWorkouts.map((w) => w.duration_minutes || 0), 0);

  return {
    totalWorkouts,
    totalMinutes,
    totalCaloriesBurned,
    avgCaloriesPerSession: Math.round(avgCaloriesPerSession),
    mostCommonType,
    longestWorkout,
  };
}

export function calculateWeeklyEffort(workoutLogs: WorkoutLog[]): WeeklyEffort[] {
  const weeks: WeeklyEffort[] = [];
  const today = new Date();

  for (let i = 7; i >= 0; i--) {
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() - i * 7);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekEnd.getDate() - 6);

    const weekWorkouts = workoutLogs.filter((w) => {
      const date = new Date(w.workout_date);
      return date >= weekStart && date <= weekEnd;
    });

    const totalMinutes = weekWorkouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0);
    const totalCalories = weekWorkouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0);

    weeks.push({
      week: `${weekStart.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}`,
      totalMinutes,
      totalCalories,
    });
  }

  return weeks;
}

export function calculateDietAdherence(
  nutritionLogs: NutritionLog[],
  mealPlan: AIMealPlan | null
): AdherenceScore {
  const dates = getDateRange(28); // 4 weeks
  const goal = mealPlan?.daily_calories || 2000;
  const tolerance = 200; // +/- 200 calories is acceptable

  const dailyScores = dates.map((date) => {
    const dayLogs = nutritionLogs.filter((log) => log.log_date === date);
    if (dayLogs.length === 0) return { date, score: 0 };

    const consumed = dayLogs.reduce((sum, log) => sum + (log.total_calories || 0), 0);
    const diff = Math.abs(consumed - goal);
    const score = diff <= tolerance ? 100 : Math.max(0, 100 - (diff - tolerance) / 10);

    return { date, score: Math.round(score) };
  });

  const overall =
    dailyScores.length > 0
      ? Math.round(dailyScores.reduce((sum, d) => sum + d.score, 0) / dailyScores.length)
      : 0;

  // Weekly trend (last 4 weeks)
  const weeklyTrend: number[] = [];
  for (let i = 0; i < 4; i++) {
    const weekScores = dailyScores.slice(i * 7, (i + 1) * 7);
    const weekAvg =
      weekScores.length > 0
        ? Math.round(weekScores.reduce((sum, d) => sum + d.score, 0) / weekScores.length)
        : 0;
    weeklyTrend.push(weekAvg);
  }

  return { overall, dailyScores, weeklyTrend };
}

export function calculateWorkoutAdherence(
  workoutLogs: WorkoutLog[],
  workoutPlan: AIWorkoutPlan | null
): AdherenceScore {
  const dates = getDateRange(28); // 4 weeks
  const plannedPerWeek = workoutPlan?.frequency_per_week || 3;

  const dailyScores = dates.map((date) => {
    const hasWorkout = workoutLogs.some((w) => w.workout_date === date && w.completed);
    return { date, score: hasWorkout ? 100 : 0 };
  });

  // Calculate weekly adherence
  const weeklyTrend: number[] = [];
  for (let i = 0; i < 4; i++) {
    const weekDates = dates.slice(i * 7, (i + 1) * 7);
    const weekWorkouts = workoutLogs.filter(
      (w) => weekDates.includes(w.workout_date) && w.completed
    ).length;
    const adherence = Math.min(100, (weekWorkouts / plannedPerWeek) * 100);
    weeklyTrend.push(Math.round(adherence));
  }

  const overall =
    weeklyTrend.length > 0
      ? Math.round(weeklyTrend.reduce((sum, v) => sum + v, 0) / weeklyTrend.length)
      : 0;

  return { overall, dailyScores, weeklyTrend };
}

export function calculateMonthComparisons(
  nutritionLogs: NutritionLog[],
  waterLogs: WaterIntakeLog[],
  workoutLogs: WorkoutLog[]
) {
  const thisMonthDates = getDateRange(30);
  const lastMonthDates = getDateRange(60).slice(0, 30);

  // Nutrition comparisons
  const thisMonthNutrition = nutritionLogs.filter((l) => thisMonthDates.includes(l.log_date));
  const lastMonthNutrition = nutritionLogs.filter((l) => lastMonthDates.includes(l.log_date));

  const thisMonthAvgCal =
    thisMonthNutrition.length > 0
      ? thisMonthNutrition.reduce((sum, l) => sum + l.total_calories, 0) / thisMonthDates.length
      : 0;
  const lastMonthAvgCal =
    lastMonthNutrition.length > 0
      ? lastMonthNutrition.reduce((sum, l) => sum + l.total_calories, 0) / lastMonthDates.length
      : 0;

  const nutrition: MonthComparison[] = [
    {
      metric: "Avg Daily Calories",
      thisMonth: Math.round(thisMonthAvgCal),
      lastMonth: Math.round(lastMonthAvgCal),
      change:
        lastMonthAvgCal > 0
          ? Math.round(((thisMonthAvgCal - lastMonthAvgCal) / lastMonthAvgCal) * 100)
          : 0,
      unit: "cal",
    },
    {
      metric: "Days Logged",
      thisMonth: thisMonthNutrition.length,
      lastMonth: lastMonthNutrition.length,
      change:
        lastMonthNutrition.length > 0
          ? Math.round(
              ((thisMonthNutrition.length - lastMonthNutrition.length) /
                lastMonthNutrition.length) *
                100
            )
          : 0,
      unit: "days",
    },
  ];

  // Hydration comparisons
  const thisMonthWater = waterLogs.filter((l) => thisMonthDates.includes(l.log_date));
  const lastMonthWater = waterLogs.filter((l) => lastMonthDates.includes(l.log_date));

  const thisMonthAvgGlasses =
    thisMonthWater.length > 0
      ? thisMonthWater.reduce((sum, l) => sum + l.glasses, 0) / thisMonthWater.length
      : 0;
  const lastMonthAvgGlasses =
    lastMonthWater.length > 0
      ? lastMonthWater.reduce((sum, l) => sum + l.glasses, 0) / lastMonthWater.length
      : 0;

  const hydration: MonthComparison[] = [
    {
      metric: "Avg Glasses/Day",
      thisMonth: Math.round(thisMonthAvgGlasses * 10) / 10,
      lastMonth: Math.round(lastMonthAvgGlasses * 10) / 10,
      change:
        lastMonthAvgGlasses > 0
          ? Math.round(((thisMonthAvgGlasses - lastMonthAvgGlasses) / lastMonthAvgGlasses) * 100)
          : 0,
      unit: "glasses",
    },
  ];

  // Fitness comparisons
  const thisMonthWorkouts = workoutLogs.filter((w) => thisMonthDates.includes(w.workout_date));
  const lastMonthWorkouts = workoutLogs.filter((w) => lastMonthDates.includes(w.workout_date));

  const thisMonthTotalMin = thisMonthWorkouts.reduce((sum, w) => sum + w.duration_minutes, 0);
  const lastMonthTotalMin = lastMonthWorkouts.reduce((sum, w) => sum + w.duration_minutes, 0);

  const fitness: MonthComparison[] = [
    {
      metric: "Total Minutes",
      thisMonth: thisMonthTotalMin,
      lastMonth: lastMonthTotalMin,
      change:
        lastMonthTotalMin > 0
          ? Math.round(((thisMonthTotalMin - lastMonthTotalMin) / lastMonthTotalMin) * 100)
          : 0,
      unit: "min",
    },
    {
      metric: "Workouts Completed",
      thisMonth: thisMonthWorkouts.length,
      lastMonth: lastMonthWorkouts.length,
      change:
        lastMonthWorkouts.length > 0
          ? Math.round(
              ((thisMonthWorkouts.length - lastMonthWorkouts.length) / lastMonthWorkouts.length) *
                100
            )
          : 0,
      unit: "workouts",
    },
  ];

  return { nutrition, hydration, fitness };
}

export function generateInsights(
  nutritionLogs: NutritionLog[],
  waterLogs: WaterIntakeLog[],
  workoutLogs: WorkoutLog[],
): Insight[] {
  const insights: Insight[] = [];

  // Weekend logging pattern
  const dates = getDateRange(30);
  const weekendDates = dates.filter((date) => {
    const day = new Date(date).getDay();
    return day === 0 || day === 6;
  });
  const weekdayDates = dates.filter((date) => {
    const day = new Date(date).getDay();
    return day !== 0 && day !== 6;
  });

  const weekendLogs = nutritionLogs.filter((l) => weekendDates.includes(l.log_date)).length;
  const weekdayLogs = nutritionLogs.filter((l) => weekdayDates.includes(l.log_date)).length;

  if (weekdayLogs > weekendLogs * 2) {
    insights.push({
      id: "weekend-logging",
      type: "warning",
      title: "Weekend Logging Gap",
      description: "You log fewer meals on weekends. Try meal prep to stay consistent!",
    });
  }

  // Hydration on workout days
  const workoutDates = workoutLogs.map((w) => w.workout_date);
  const waterOnWorkoutDays = waterLogs.filter((l) => workoutDates.includes(l.log_date));
  const avgWaterWorkout =
    waterOnWorkoutDays.length > 0
      ? waterOnWorkoutDays.reduce((sum, l) => sum + l.glasses, 0) / waterOnWorkoutDays.length
      : 0;

  const allWaterAvg =
    waterLogs.length > 0 ? waterLogs.reduce((sum, l) => sum + l.glasses, 0) / waterLogs.length : 0;

  if (avgWaterWorkout > allWaterAvg * 1.2) {
    insights.push({
      id: "hydration-workout",
      type: "success",
      title: "Great Hydration Habit",
      description: "You drink more water on workout days - keep it up!",
    });
  }

  // Calorie burn progress
  const thisMonthDates = getDateRange(30);
  const lastMonthDates = getDateRange(60).slice(0, 30);
  const thisMonthBurn = workoutLogs
    .filter((w) => thisMonthDates.includes(w.workout_date))
    .reduce((sum, w) => sum + w.calories_burned, 0);
  const lastMonthBurn = workoutLogs
    .filter((w) => lastMonthDates.includes(w.workout_date))
    .reduce((sum, w) => sum + w.calories_burned, 0);

  if (thisMonthBurn > lastMonthBurn * 1.1) {
    insights.push({
      id: "calorie-progress",
      type: "success",
      title: "Impressive Progress",
      description: `You've burned ${thisMonthBurn - lastMonthBurn} more calories this month!`,
    });
  }

  // Consistency insight
  const streak = calculateStreak(nutritionLogs, waterLogs, workoutLogs);
  if (streak >= 7) {
    insights.push({
      id: "consistency",
      type: "success",
      title: `${streak}-Day Streak!`,
      description: "Your consistency is paying off. Don't break the chain!",
    });
  }

  return insights;
}
