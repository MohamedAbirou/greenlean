import { queryKeys } from "@/lib/queryKeys";
import { supabase } from "@/lib/supabase/client";
import type { Badge } from "@/shared/types/challenge";
import { useQuery } from "@tanstack/react-query";

export interface Reward {
  id: string;
  user_id: string;
  points: number;
  badges: Badge[];
  user: {
    username?: string;
    full_name: string;
    email: string;
  };
}

export const fetchRewards = async (): Promise<Reward[]> => {
  const { data, error } = await supabase.from("user_rewards").select(`
          *,
          user:profiles(username, full_name, email)
        `);

  if (error) throw error;
  return data;
};

export const useRewardsQuery = () =>
  useQuery({
    queryKey: queryKeys.rewards,
    queryFn: fetchRewards,
    staleTime: 5 * 60 * 1000,
  });