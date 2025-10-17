import { queryKeys } from "@/lib/queryKeys";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export interface DashboardProps {
  totalParticipants: number;
  activeUsers: number;
  completionRate: number;
  averageStreak: number;
  pointsAwarded: number;
  badgesEarned: number;
  dailyActiveUsers: number[];
}

export const fetchDashboardStats = async (): Promise<DashboardProps> => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // last 7 days

  // Fetch all data in parallel
  const [
    totalParticipantsResp,
    activeUsersResp,
    completedChallengesResp,
    streaksResp,
    rewardsResp,
    participantsData,
  ] = await Promise.all([
    supabase.from("challenge_participants").select("*", { count: "exact" }),
    supabase
      .from("challenge_participants")
      .select("*", { count: "exact" })
      .gte("created_at", sevenDaysAgo.toISOString()),
    supabase
      .from("challenge_participants")
      .select("*", { count: "exact" })
      .eq("completed", true),
    supabase.from("challenge_participants").select("streak_count"),
    supabase.from("user_rewards").select("points, badges"),
    supabase.from("challenge_participants").select("created_at"),
  ]);

  const totalParticipants = totalParticipantsResp.count || 0;
  const activeUsers = activeUsersResp.count || 0;
  const completedChallenges = completedChallengesResp.count || 0;
  const streaks = streaksResp.data || [];
  const rewards = rewardsResp.data || [];
  const participants = participantsData.data || [];

  // Calculate other stats
  const completionRate = totalParticipants
    ? (completedChallenges / totalParticipants) * 100
    : 0;
  const averageStreak =
    streaks.reduce((acc, curr) => acc + curr.streak_count, 0) /
    (streaks.length || 1);
  const pointsAwarded = rewards.reduce((acc, curr) => acc + curr.points, 0);
  const badgesEarned = rewards.reduce((acc, curr) => {
    const badges = Array.isArray(curr.badges) ? curr.badges : [];
    return acc + badges.length;
  }, 0);

  // Calculate daily active users for the chart
  const counts: Record<string, number> = {};
  participants.forEach((row) => {
    const day = new Date(row.created_at).toLocaleDateString("en-US", {
      weekday: "short",
    });
    counts[day] = (counts[day] || 0) + 1;
  });
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dailyActiveUsers = days.map((day) => counts[day] || 0);

  return {
    totalParticipants,
    activeUsers,
    completionRate,
    averageStreak,
    pointsAwarded,
    badgesEarned,
    dailyActiveUsers,
  };
};

export const useDashboardQuery = () =>
  useQuery({
    queryKey: queryKeys.overview,
    queryFn: fetchDashboardStats,
    staleTime: 5 * 60 * 1000,
  });