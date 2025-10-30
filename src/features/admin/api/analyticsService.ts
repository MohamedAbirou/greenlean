// src/features/admin/api/analyticsService.ts
import { supabase } from "@/lib/supabase/client";
import { AdminService } from "./adminService";

export class AnalyticsService {
  /**
   * Get comprehensive dashboard metrics - OPTIMIZED with parallel queries
   */
  static async getDashboardMetrics(dateRange: "7d" | "30d" | "90d" | "1y" = "30d") {
    const now = new Date();
    const daysAgo =
      dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : dateRange === "90d" ? 90 : 365;
    const startDate = new Date(now.setDate(now.getDate() - daysAgo)).toISOString();

    // ✅ Fetch ALL data in parallel (single round trip)
    const [
      stripeMetrics,
      allUsersResult,
      recentUsersResult,
      activeUsersResult,
      mealPlansResult,
      workoutPlansResult,
      quizzesResult,
      challengesResult,
    ] = await Promise.all([
      AdminService.getSaasMetrics(),
      supabase.from("profiles").select("id, created_at, plan_id"),
      supabase.from("profiles").select("id").gte("created_at", startDate),
      supabase.from("user_activity_logs").select("user_id").gte("activity_date", startDate),
      supabase.from("ai_meal_plans").select("id, status, created_at").gte("created_at", startDate),
      supabase
        .from("ai_workout_plans")
        .select("id, status, created_at")
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
    ]);

    // Process results
    const allUsers = allUsersResult.data || [];
    const recentUsers = recentUsersResult.data || [];
    const activeUsersData = activeUsersResult.data || [];
    const uniqueActiveUsers = [...new Set(activeUsersData.map((u) => u.user_id))];
    const mealPlans = mealPlansResult.data || [];
    const workoutPlans = workoutPlansResult.data || [];
    const quizzes = quizzesResult.data || [];
    const challenges = challengesResult.data || [];

    // Challenge calculations
    const activeChallenges = challenges.filter((c) => c.is_active);
    const totalParticipants = challenges.reduce(
      (sum, c) => sum + (c.challenge_participants?.length || 0),
      0
    );
    const completedChallenges = challenges.reduce(
      (sum, c) => sum + (c.challenge_participants?.filter((p) => p.completed).length || 0),
      0
    );

    return {
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
        active: uniqueActiveUsers.length,
        newThisMonth: recentUsers.length,
        churnedThisMonth: stripeMetrics.churnedThisMonth || 0,
        growthRate: ((recentUsers.length / (allUsers.length || 1)) * 100).toFixed(1),
      },
      subscriptions: {
        active: stripeMetrics.activeSubscribers || 0,
        total: stripeMetrics.totalSubscribers || 0,
        trial: 0,
        canceled: stripeMetrics.churnedThisMonth || 0,
        churnRate: stripeMetrics.churnedThisMonth || 0,
        ltv: 890, // TODO: Calculate from Stripe historical data
      },
      plans: {
        mealPlansGenerated: mealPlans.length,
        workoutPlansGenerated: workoutPlans.length,
        totalQuizzes: quizzes.length,
        mealPlansCompleted: mealPlans.filter((p) => p.status === "completed").length,
        workoutPlansCompleted: workoutPlans.filter((p) => p.status === "completed").length,
        avgCompletionRate: this.calculateCompletionRate(mealPlans, workoutPlans),
      },
      challenges: {
        active: activeChallenges.length,
        total: challenges.length,
        totalParticipants,
        completedChallenges,
        avgCompletionRate:
          totalParticipants > 0 ? ((completedChallenges / totalParticipants) * 100).toFixed(1) : 0,
        totalPointsAwarded: challenges.reduce((sum, c) => sum + c.points, 0),
      },
      engagement: {
        dau: uniqueActiveUsers.length, // TODO: Refine with actual daily activity
        wau: uniqueActiveUsers.length,
        mau: uniqueActiveUsers.length,
        avgSessionDuration: 23.5, // TODO: Calculate from activity logs
      },
    };
  }

  /**
   * Get conversion funnel - OPTIMIZED
   */
  static async getConversionFunnel(dateRange: string) {
    const now = new Date();
    const daysAgo = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
    const startDate = new Date(now.setDate(now.getDate() - daysAgo)).toISOString();

    // Parallel queries
    const [visitorsResult, quizzesResult, plansResult, paidUsersResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", startDate),
      supabase
        .from("quiz_results")
        .select("user_id", { count: "exact", head: true })
        .gte("created_at", startDate),
      supabase
        .from("ai_meal_plans")
        .select("user_id", { count: "exact", head: true })
        .gte("created_at", startDate),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("plan_id", "pro")
        .gte("created_at", startDate),
    ]);

    const visitorCount = visitorsResult.count || 1;
    const quizCount = quizzesResult.count || 0;
    const planCount = plansResult.count || 0;
    const paidCount = paidUsersResult.count || 0;

    return [
      { stage: "Site Visitors", count: visitorCount, percent: 100 },
      {
        stage: "Quiz Started",
        count: quizCount,
        percent: Math.round((quizCount / visitorCount) * 100),
      },
      {
        stage: "Plans Generated",
        count: planCount,
        percent: Math.round((planCount / visitorCount) * 100),
      },
      {
        stage: "Paid Subscribers",
        count: paidCount,
        percent: Math.round((paidCount / visitorCount) * 100),
      },
    ];
  }

  /**
   * Get recent activity - OPTIMIZED with single query
   */
  static async getRecentActivity(limit = 10) {
    // Use a single query with union-like approach
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

    const activities = [
      ...(newUsers.data || []).map((u) => ({
        type: "user_signup",
        user: u.email,
        time: this.getTimeAgo(u.created_at),
        timestamp: new Date(u.created_at).getTime(),
      })),
      ...(mealPlans.data || []).map((p) => ({
        type: "plan_generated",
        user: p.profiles?.email || "Unknown",
        plan: "Meal Plan",
        time: this.getTimeAgo(p.created_at),
        timestamp: new Date(p.created_at).getTime(),
      })),
      ...(challenges.data || []).map((c) => ({
        type: "challenge_completed",
        user: c.profiles?.email || "Unknown",
        challenge: c.challenges?.title || "Challenge",
        time: this.getTimeAgo(c.completion_date),
        timestamp: new Date(c.completion_date).getTime(),
      })),
    ];

    return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }

  /**
   * Get top users - already optimized
   */
  static async getTopUsers(limit = 10) {
    const { data } = await supabase
      .from("user_rewards")
      .select("points, profiles!inner(username, full_name, email, plan_id)")
      .order("points", { ascending: false })
      .limit(limit);

    return (
      data?.map((u) => ({
        name: u.profiles?.full_name || u.profiles?.username || "Unknown",
        email: u.profiles?.email || "",
        points: u.points,
        status: u.profiles?.plan_id || "free",
      })) || []
    );
  }


  /**
   * Get system health - SIMPLIFIED (remove non-existent tables)
   */
  static async getSystemHealth() {
    const [dbSizeRes, connRes, uptimeRes, respTimeRes, errorsRes] = await Promise.all([
      supabase.rpc("get_db_size"),
      supabase.rpc("get_active_connections"),
      supabase.rpc("get_uptime"),
      supabase.rpc("get_avg_response_time"),
      supabase
        .from("admin_logs")
        .select("*")
        .eq("level", "error")
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: false })
        .limit(10),
    ]);
  
    const errors = errorsRes.data || [];

    const storageUsed = await AnalyticsService.calcStorageUsed();
  
    return {
      apiUptime: uptimeRes.data || 0,
      avgResponseTime: respTimeRes.data || 0,
      errorRate: ((errors.length || 0) / 1000) * 100,
      activeConnections: connRes.data || 0,
      dbSize: dbSizeRes.data || 0,
      storageUsed,
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

  private static async calcStorageUsed() {
    const buckets = ["avatars", "uploads", "documents"]; // change to your buckets
    let totalBytes = 0;
  
    for (const bucket of buckets) {
      // List all files in each bucket
      const { data: files, error } = await supabase.storage.from(bucket).list("", {
        limit: 1000, // adjust if you have many files
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      });
  
      if (error) {
        console.error(`Error listing files in bucket ${bucket}:`, error);
        continue;
      }
  
      // Sum up file sizes
      for (const file of files || []) {
        totalBytes += file.metadata?.size || 0;
      }
    }
  
    // Convert bytes → MB (or GB)
    const totalMB = totalBytes / (1024 * 1024);
    return Math.round(totalMB * 100) / 100; // e.g. 67.42 MB
  }
  
}
