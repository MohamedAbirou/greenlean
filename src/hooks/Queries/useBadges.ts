import { queryKeys } from "@/lib/queryKeys";
import { supabase } from "@/lib/supabase";
import type { Badge } from "@/types/challenge";
import { useQuery } from "@tanstack/react-query";

export const fetchBadges = async (): Promise<Badge[]> => {
  const { data, error } = await supabase.from("badges").select("*");

  if (error) throw error;
  return data;
};

export const useBadgesQuery = () =>
  useQuery({
    queryKey: queryKeys.badges,
    queryFn: fetchBadges,
    staleTime: 5 * 60 * 1000,
  });
