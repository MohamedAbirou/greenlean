// src/features/admin/api/analyticsService.ts
import { supabase } from "@/lib/supabase/client";
import { AdminService } from "./adminService";

export class AnalyticsService {
  /**
   * Get comprehensive dashboard metrics - OPTIMIZED with parallel queries
   */
  static async getDashboardMetrics(dateRange: "7d" | "30d" | "90d" | "1y" = "30d") {
    const daysAgo =
      dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : dateRange === "90d" ? 90 : 365;
    const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

    try {
      // Fetch main data in parallel (engagements view + other data)
      const [
        stripeMetrics,
        allUsersResult,
        recentUsersResult,
        mealPlansResult,
        workoutPlansResult,
        quizzesResult,
        challengesResult,
        engagementsResult,
        snapshotsResult,
      ] = await Promise.all([
        AdminService.getSaasMetrics(),
        supabase.from("profiles").select("id, created_at, plan_id"),
        supabase.from("profiles").select("id").gte("created_at", startDate),
        supabase
          .from("ai_meal_plans")
          .select("id, status, created_at, updated_at, generated_at, error_message")
          .gte("created_at", startDate),
        supabase
          .from("ai_workout_plans")
          .select("id, status, created_at, updated_at, generated_at, error_message")
          .gte("created_at", startDate),
        supabase.from("quiz_results").select("id, created_at").gte("created_at", startDate),
        supabase.from("challenges").select(`
          id,
          is_active,
          points,
          challenge_participants!inner (
            user_id,
            completed
          )
        `),
        // pull aggregated engagement per user from the view
        supabase.from("user_engagements").select("user_id, daily_logs, weekly_logs, monthly_logs"),
        // fetch latest 2 snapshots for growth calculation
        supabase
          .from("engagement_snapshots")
          .select("*")
          .order("snapshot_date", { ascending: false })
          .limit(2),
      ]);

      const allUsers = allUsersResult.data ?? [];
      const recentUsers = recentUsersResult.data ?? [];
      const mealPlans = mealPlansResult.data ?? [];
      const workoutPlans = workoutPlansResult.data ?? [];
      const quizzes = quizzesResult.data ?? [];
      const challenges = challengesResult.data ?? [];
      const engagements = engagementsResult.data ?? [];
      const snapshots = snapshotsResult.data ?? [];

      // Simple challenge calculations
      const activeChallenges = challenges.filter((c) => c.is_active);
      const totalParticipants = challenges.reduce(
        (sum, c) => sum + (c.challenge_participants?.length || 0),
        0
      );
      const completedChallenges = challenges.reduce(
        (sum, c) => sum + (c.challenge_participants?.filter((p) => p.completed).length || 0),
        0
      );

      // Engagement metrics from the view
      const dau = engagements.filter((e: any) => Number(e.daily_logs) > 0).length;
      const wau = engagements.filter((e: any) => Number(e.weekly_logs) > 0).length;
      const mau = engagements.filter((e: any) => Number(e.monthly_logs) > 0).length;

      // Calculate growth using latest snapshot vs previous snapshot (if available)
      const [latestSnapshot, previousSnapshot] = snapshots || [];

      const calcGrowth = (current: number, previous: number): number => {
        if (!previous || previous === 0) return 0; // or null if you prefer
        return Number((((current - previous) / previous) * 100).toFixed(1));
      };

      const dauGrowth = calcGrowth(dau, previousSnapshot?.daily_active_users ?? 0);
      const wauGrowth = calcGrowth(wau, previousSnapshot?.weekly_active_users ?? 0);
      const mauGrowth = calcGrowth(mau, previousSnapshot?.monthly_active_users ?? 0);

      // ---- Meal Plan Metrics ----
      const totalMealPlans = mealPlans.length;
      const completedMealPlans = mealPlans.filter(
        (p) => p.status === "completed" || p.status === "generated"
      ).length;
      const failedMealPlans = mealPlans.filter((p) => p.status === "failed").length;

      // calculate generation time (if both timestamps exist)
      const mealPlanTimes = mealPlans
        .filter((p) => p.generated_at || p.updated_at)
        .map((p) => {
          const end = new Date(p.generated_at || p.updated_at).getTime();
          const start = new Date(p.created_at).getTime();
          return Math.max(0, (end - start) / 1000); // seconds
        });
      const avgMealPlanGenTime =
        mealPlanTimes.length > 0
          ? Number((mealPlanTimes.reduce((a, b) => a + b, 0) / mealPlanTimes.length).toFixed(1))
          : 0;

      // ---- Workout Plan Metrics ----
      const totalWorkoutPlans = workoutPlans.length;
      const completedWorkoutPlans = workoutPlans.filter(
        (p) => p.status === "completed" || p.status === "generated"
      ).length;
      const failedWorkoutPlans = workoutPlans.filter((p) => p.status === "failed").length;

      const workoutPlanTimes = workoutPlans
        .filter((p) => p.generated_at || p.updated_at)
        .map((p) => {
          const end = new Date(p.generated_at || p.updated_at).getTime();
          const start = new Date(p.created_at).getTime();
          return Math.max(0, (end - start) / 1000);
        });
      const avgWorkoutGenTime =
        workoutPlanTimes.length > 0
          ? Number(
              (workoutPlanTimes.reduce((a, b) => a + b, 0) / workoutPlanTimes.length).toFixed(1)
            )
          : 0;

      // Recompute some derived metrics you previously had
      return {
        conversionRate: stripeMetrics.conversionRate || 0,
        conversionRateGrowth: this.calculateGrowth(
          stripeMetrics.conversionRate,
          stripeMetrics.conversionRateLast30Days
        ),
        revenue: {
          total: stripeMetrics.totalEarnings || 0,
          monthly: stripeMetrics.mrr || 0,
          thisMonth: stripeMetrics.earningsThisMonth || 0,
          last30Days: stripeMetrics.earningsLast30Days || 0,
          growth: this.calculateGrowth(
            stripeMetrics.earningsThisMonth,
            stripeMetrics.earningsLast30Days
          ),
          arr: (stripeMetrics.mrr || 0) * 12,
        },
        users: {
          total: allUsers.length,
          active: mau, // or uniqueActiveUsers from previous method if you prefer
          newThisMonth: recentUsers.length,
          churnedThisMonth: stripeMetrics.churnedThisMonth || 0,
          growthRate: ((recentUsers.length / (allUsers.length || 1)) * 100).toFixed(1),
        },
        subscriptions: {
          active: stripeMetrics.activeSubscribers || 0,
          total: stripeMetrics.totalSubscribers || 0,
          trial: 0,
          canceled: stripeMetrics.churnedThisMonth || 0,
          arpu: stripeMetrics.arpu || 0,
          churnRate: stripeMetrics.churnRate || 0,
          ltv: stripeMetrics.ltv || 0,
          ltvGrowth: stripeMetrics.ltvGrowth || 0,
        },
        plans: {
          // Meal Plans
          mealPlansGenerated: totalMealPlans,
          mealPlansCompleted: completedMealPlans,
          mealPlansFailed: failedMealPlans,
          mealPlanSuccessRate:
            totalMealPlans > 0 ? ((completedMealPlans / totalMealPlans) * 100).toFixed(1) : 0,
          avgMealPlanGenerationTime: avgMealPlanGenTime, // in seconds

          // Workout Plans
          workoutPlansGenerated: totalWorkoutPlans,
          workoutPlansCompleted: completedWorkoutPlans,
          workoutPlansFailed: failedWorkoutPlans,
          workoutPlanSuccessRate:
            totalWorkoutPlans > 0
              ? ((completedWorkoutPlans / totalWorkoutPlans) * 100).toFixed(1)
              : 0,
          avgWorkoutPlanGenerationTime: avgWorkoutGenTime, // in seconds

          // Combined summary (optional)
          totalQuizzes: quizzes.length,
          totalGenerated: totalMealPlans + totalWorkoutPlans,
          totalCompleted: completedMealPlans + completedWorkoutPlans,
          totalFailed: failedMealPlans + failedWorkoutPlans,
          avgCompletionRate: this.calculateCompletionRate(mealPlans, workoutPlans),
        },
        challenges: {
          active: activeChallenges.length,
          total: challenges.length,
          totalParticipants,
          completedChallenges,
          avgCompletionRate:
            totalParticipants > 0
              ? ((completedChallenges / totalParticipants) * 100).toFixed(1)
              : 0,
          totalPointsAwarded: challenges.reduce((sum, c) => sum + c.points, 0),
        },
        engagement: {
          dau,
          wau,
          mau,
          dauGrowth,
          wauGrowth,
          mauGrowth,
          avgWorkoutDuration: latestSnapshot?.avg_workout_duration ?? 0,
          avgWaterIntake: latestSnapshot?.avg_water_intake ?? 0,
          avgNutritionIntake: latestSnapshot?.avg_nutrition_intake ?? 0,
        },
      };
    } catch (err) {
      console.error("🔥 Error in getDashboardMetrics:", err);
      return {
        error: "Failed to fetch dashboard metrics",
      };
    }
  }

  /**
   * Get historical revenue data for trends
   */
  static async getRevenueHistory(dateRange: "7d" | "30d" | "90d" | "1y" = "30d") {
    // This would query a historical_metrics table if you create one
    // For now, return current period data
    const metrics = await this.getDashboardMetrics(dateRange);

    return [
      {
        period: "Current Period",
        revenue: metrics.revenue?.thisMonth,
        subscriptions: metrics.subscriptions?.active,
        mrr: metrics.revenue?.monthly,
      },
    ];
  }

  /**
   * Get conversion funnel
   */
  static async getConversionFunnel(dateRange: "7d" | "30d" | "90d" | "1y" = "30d") {
    const now = new Date();
    const daysAgo =
      dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : dateRange === "90d" ? 90 : 365;
    const startDate = new Date(now.setDate(now.getDate() - daysAgo)).toISOString();

    try {
      // Fetch users once
      const usersResult = await supabase
        .from("profiles")
        .select("id, plan_id, created_at")
        .gte("created_at", startDate);

      const users = usersResult.data || [];
      const visitorCount = users.length;
      const paidCount = users.filter((u) => u.plan_id === "pro").length;

      // Parallel queries for the other steps
      const [quizzesResult, mealPlansResult, workoutPlansResult] = await Promise.all([
        supabase
          .from("quiz_results")
          .select("user_id", { count: "exact", head: true })
          .gte("created_at", startDate),
        supabase
          .from("ai_meal_plans")
          .select("user_id", { count: "exact", head: true })
          .eq("status", "completed")
          .gte("generated_at", startDate),
        supabase
          .from("ai_workout_plans")
          .select("user_id", { count: "exact", head: true })
          .eq("status", "completed")
          .gte("generated_at", startDate),
      ]);

      const quizCount = quizzesResult.count || 0;
      const plansCount = (mealPlansResult.count || 0) + (workoutPlansResult.count || 0);

      return [
        { stage: "Site Visitors", count: visitorCount, percent: 100 },
        {
          stage: "Quiz Started",
          count: quizCount,
          percent: Math.round((quizCount / visitorCount) * 100),
        },
        {
          stage: "Plans Generated",
          count: plansCount,
          percent: Math.round((plansCount / visitorCount) * 100),
        },
        {
          stage: "Paid Subscribers",
          count: paidCount,
          percent: Math.round((paidCount / visitorCount) * 100),
        },
      ];
    } catch (err) {
      console.error("🔥 Error in getConversionFunnel:", err);
      return [];
    }
  }

  /**
   * Get recent activity
   */
  static async getRecentActivity(limit = 10) {
    try {
      const [newUsers, mealPlans, challenges] = await Promise.all([
        supabase
          .from("profiles")
          .select("email, created_at")
          .order("created_at", { ascending: false })
          .limit(limit),
        supabase
          .from("ai_meal_plans")
          .select("created_at, profiles!inner(email)")
          .order("created_at", { ascending: false })
          .limit(limit),
        supabase
          .from("challenge_participants")
          .select("completion_date, challenges!inner(title), profiles!inner(email)")
          .eq("completed", true)
          .not("completion_date", "is", null)
          .order("completion_date", { ascending: false })
          .limit(limit),
      ]);

      if (newUsers.error || mealPlans.error || challenges.error)
        throw new Error(
          JSON.stringify({
            newUsers: newUsers.error,
            mealPlans: mealPlans.error,
            challenges: challenges.error,
          })
        );

      const activities = [
        ...((newUsers.data as any[]) || []).map((u) => ({
          type: "user_signup",
          user: u.email,
          time: this.getTimeAgo(u.created_at),
          timestamp: new Date(u.created_at).getTime(),
        })),
        ...((mealPlans.data as any[]) || []).map((p) => ({
          type: "plan_generated",
          user: p.profiles?.email || "Unknown",
          plan: "Meal Plan",
          time: this.getTimeAgo(p.created_at),
          timestamp: new Date(p.created_at).getTime(),
        })),
        ...((challenges.data as any[]) || []).map((c) => ({
          type: "challenge_completed",
          user: c.profiles?.email || "Unknown",
          challenge: c.challenges?.title || "Challenge",
          time: this.getTimeAgo(c.completion_date),
          timestamp: new Date(c.completion_date).getTime(),
        })),
      ];

      return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
    } catch (err) {
      console.error("🔥 Error in getRecentActivity:", err);
      return [];
    }
  }

  /**
   * Get top users
   */
  static async getTopUsers(limit = 10) {
    try {
      const { data, error } = await supabase
        .from("user_rewards")
        .select("points, profiles!inner(username, full_name, email, plan_id)")
        .order("points", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (
        (data as any[])?.map((u) => ({
          name: u.profiles?.full_name || u.profiles?.username || "Unknown",
          email: u.profiles?.email || "",
          points: u.points,
          status: u.profiles?.plan_id || "free",
        })) || []
      );
    } catch (err) {
      console.error("🔥 Error in getTopUsers:", err);
      return [];
    }
  }

  /**
   * Get system health
   */
  static async getSystemHealth() {
    const [dbSizeRes, connRes, storageRes] = await Promise.all([
      supabase.rpc("get_db_size"),
      supabase.rpc("get_active_connections"),
      supabase.rpc("get_total_storage_used"),
    ]);

    let errors = [];

    // get errors from all the subapase requests above!
    for (const request of [dbSizeRes, connRes, storageRes]) {
      if (request.error) {
        errors.push(request.error);
      }
    }
    const totalMB = (storageRes.data || 0) / (1024 * 1024);

    return {
      errorRate: ((errors.length || 0) / 1000) * 100,
      activeConnections: connRes.data || 0,
      dbSize: dbSizeRes.data || 0,
      totalMB,
      recentErrors: errors,
    };
  }

  // ========== HELPER FUNCTIONS ==========
  private static getTimeAgo(date: string): string {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  private static calculateGrowth(current: number, previous: number): number {
    if (previous === 0) return 0;
    return parseFloat((((current - previous) / previous) * 100).toFixed(1));
  }

  private static calculateCompletionRate(mealPlans: any[], workoutPlans: any[]): number {
    const totalPlans = mealPlans.length + workoutPlans.length;
    if (totalPlans === 0) return 0;
    const completed =
      mealPlans.filter((p) => p.status === "completed").length +
      workoutPlans.filter((p) => p.status === "completed").length;
    return parseFloat(((completed / totalPlans) * 100).toFixed(1));
  }
}
