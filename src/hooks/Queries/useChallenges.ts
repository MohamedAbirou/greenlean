import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../lib/queryKeys";
import { supabase } from "../../lib/supabase";
import { Challenge } from "../../types/challenge";

export const fetchChallenges = async (): Promise<Challenge[]> => {
  const [challengesResp, participantsResp] = await Promise.all([
    supabase.from("challenges").select("*"),
    supabase.from("challenge_participants").select("challenge_id, completed"),
  ]);

  if (challengesResp.error) throw challengesResp.error;
  if (participantsResp.error) throw participantsResp.error;

  const challengesWithStats = challengesResp.data.map((challenge) => {
    const participants = participantsResp.data.filter(
      (p) => p.challenge_id === challenge.id
    );
    const total = participants.length;
    const completed = participants.filter((p) => p.completed).length;

    return {
      ...challenge,
      participants_count: total,
      completion_rate: total ? (completed / total) * 100 : 0,
    };
  });

  return challengesWithStats;
};

export const useChallengesQuery = () =>
  useQuery({
    queryKey: queryKeys.challenges,
    queryFn: fetchChallenges,
    staleTime: 5 * 60 * 1000,
  });