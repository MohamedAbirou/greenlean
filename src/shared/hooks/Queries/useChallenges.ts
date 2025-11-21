import { supabase } from "@/lib/supabase/client";
import type { Challenge } from "@/shared/types/challenge";
import { useQuery } from "@tanstack/react-query";
import { useChallengesRealtime } from "../useSupabaseRealtime";

export const fetchChallenges = async (
  userId?: string
): Promise<Challenge[]> => {
  const [challengesResp, participantsResp, userProgressResp] =
    await Promise.all([
      supabase.from("challenges").select(`
      *,
      badge:badge_id ( id, name, description, icon, color )
    `),
      supabase.from("challenge_participants").select("challenge_id, user_id, completed"),
      supabase
            .from("challenge_participants")
            .select("challenge_id, progress, completed, streak_count, streak_expires_at")
            .eq("user_id", userId)
        ,
    ]);

  if (challengesResp.error) throw challengesResp.error;
  if (participantsResp.error) throw participantsResp.error;
  if (userProgressResp.error) throw userProgressResp.error;

  const challengesWithStats = challengesResp.data.map((challenge) => {
    const participants = participantsResp.data.filter(
      (p) => p.challenge_id === challenge.id
    );
    const total = participants.length;
    const completed = participants.filter((p) => p.completed).length;

    const userProgress = userProgressResp.data?.find(
      (p) => p.challenge_id === challenge.id
    );

    return {
      ...challenge,
      participants,
      participants_count: total,
      completion_rate: total ? (completed / total) * 100 : 0,
      user_progress: userProgress || null,
    };
  });

  return challengesWithStats;
};

export const useChallengesQuery = (userId?: string) => {
  // Subscribe to real-time updates for challenges and participants
  useChallengesRealtime(userId, !!userId);

  return useQuery({
    queryKey: ["challenges", userId],
    queryFn: () => fetchChallenges(userId),
    staleTime: 0, // Always check for updates (realtime will invalidate when needed)
    refetchOnWindowFocus: false, // Rely on realtime instead of window focus
  });
};
