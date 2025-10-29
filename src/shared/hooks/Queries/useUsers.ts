import { queryKeys } from "@/lib/queryKeys";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@/shared/types/user";
import { useQuery } from "@tanstack/react-query";

const fetchUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      username,
      full_name,
      email,
      created_at,
      admin_users(role)
    `)
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((profile: any) => ({
    ...profile,
    is_admin: !!profile.admin_users,
    role: profile.admin_users?.role,
  }));
};

export const useUsersQuery = () =>
  useQuery({
    queryKey: queryKeys.users,
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000,
  });
