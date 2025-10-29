// API for challenge actions: fetch, join, quit, update progress
import { supabase } from "@/lib/supabase";
import type { Challenge } from "@/shared/types/challenge";

export function getNextExpiration(type: string): string | null {
  const now = new Date();
  if (type === "daily") return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  if (type === "weekly") return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
  return null;
}

export async function fetchUserRewards(userId: string) {
  const { data: existingRewards, error: fetchError } = await supabase
    .from("user_rewards")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (fetchError && fetchError.code !== "PGRST116") throw fetchError;
  if (existingRewards) return existingRewards;
  const { data: newRewards, error: insertError } = await supabase
    .from("user_rewards")
    .insert({ user_id: userId, points: 0, badges: [] })
    .select()
    .maybeSingle();
  if (insertError) throw insertError;
  return newRewards;
}

export async function joinChallenge({ userId, challenge }: { userId: string; challenge: Challenge }) {
  return supabase.from("challenge_participants").insert({
    challenge_id: challenge.id,
    user_id: userId,
    progress: { current: 0 },
    streak_expires_at: getNextExpiration(challenge.type),
    streak_warning_sent: false,
  });
}

export async function quitChallenge({ userId, challengeId }: { userId: string; challengeId: string }) {
  return supabase.from("challenge_participants")
    .delete()
    .eq("challenge_id", challengeId)
    .eq("user_id", userId);
}

export async function updateProgress({
  userId,
  challenge,
  newProgress,
}: {
  userId: string;
  challenge: Challenge;
  newProgress: number;
}) {
  // Fetch participant row
  const { data: participant, error: participantError } = await supabase
    .from("challenge_participants")
    .select("*")
    .eq("challenge_id", challenge.id)
    .eq("user_id", userId)
    .maybeSingle();
  if (participantError) throw participantError;
  if (!participant) throw new Error("Not a challenge participant");

  const isCompleting = newProgress >= challenge.requirements.target;
  const updatePayload: Record<string, any> = {
    progress: { current: newProgress },
    completed: isCompleting,
    completion_date: isCompleting ? new Date().toISOString() : null,
    streak_count: newProgress,
    last_progress_date: new Date().toISOString(),
    streak_expires_at: isCompleting ? null : getNextExpiration(challenge.type),
    streak_warning_sent: false,
  };
  const { error: updateError } = await supabase
    .from("challenge_participants")
    .update(updatePayload)
    .eq("challenge_id", challenge.id)
    .eq("user_id", userId);
  if (updateError) throw updateError;
  return { ok: true, isCompleting };
}

export async function fetchParticipant({ userId, challengeId }: { userId: string; challengeId: string }) {
  const { data, error } = await supabase
    .from("challenge_participants")
    .select("*")
    .eq("challenge_id", challengeId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchChallenges(userId?: string) {
  // Keep original fetch logic
  const [challengesResp, participantsResp, userProgressResp] = await Promise.all([
    supabase.from("challenges").select(`*,badge:badge_id ( id, name, description, icon, color )`),
    supabase.from("challenge_participants").select("challenge_id, user_id, completed"),
    supabase.from("challenge_participants").select("challenge_id, progress, completed, streak_count, streak_expires_at").eq("user_id", userId),
  ]);
  if (challengesResp.error) throw challengesResp.error;
  if (participantsResp.error) throw participantsResp.error;
  if (userProgressResp.error) throw userProgressResp.error;

  const challengesWithStats = challengesResp.data.map((challenge: any) => {
    const participants = participantsResp.data.filter(
      (p: any) => p.challenge_id === challenge.id
    );
    const total = participants.length;
    const completed = participants.filter((p: any) => p.completed).length;

    const userProgress = userProgressResp.data?.find(
      (p: any) => p.challenge_id === challenge.id
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
}
