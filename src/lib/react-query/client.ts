/**
 * React Query Configuration
 * Optimized query client setup with proper defaults
 */

import { QueryClient } from "@tanstack/react-query";
import type { DefaultOptions } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { handleSupabaseError } from "../supabase/errors";
import type { ApiError } from "../supabase/errors";

const queryConfig: DefaultOptions = {
  queries: {
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      const apiError = error as ApiError;
      if (apiError?.code === "42501") return false;
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  },
  mutations: {
    onError: (error) => {
      const apiError = handleSupabaseError(error as Error);
      toast.error(apiError.message);
    },
  },
};

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: queryConfig,
  });
}

let queryClientInstance: QueryClient | null = null;

export function getQueryClient(): QueryClient {
  if (!queryClientInstance) {
    queryClientInstance = createQueryClient();
  }
  return queryClientInstance;
}
