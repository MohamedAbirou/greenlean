import { queryKeys } from "@/lib/queryKeys";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export const useCurrentUserQuery = () =>
  useQuery({
    queryKey: [queryKeys.currentUser],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
