import { useUsersQuery } from "@/shared/hooks/Queries/useUsers";
import type { User as ProfileUser } from "@/shared/types/user";
import { useMemo } from "react";
import { useAllSubscribers } from "./useSaasMetrics";

// Correct StripeSubscriber according to backend API shape (customer_id is a string, not object)
interface StripePlan {
  price_id?: string;
  nickname?: string;
  amount?: number;
  currency?: string;
  interval?: string;
  quantity?: number;
}
interface StripeSubscriber {
  customer_id: string;
  subscription_id?: string;
  email?: string;
  status?: string;
  created?: number;
  canceled_at?: number;
  plans?: StripePlan[];
}

export interface AdminUser extends ProfileUser {
  plan: string;
  status: string;
  stripe_customer_id?: string;
  subscription_id?: string;
  joined?: string;
  canceled_at?: string | null;
  stripe_plan_nickname?: string;
  stripe_plan_amount?: number;
  stripe_plan_interval?: string;
  stripe_plan_currency?: string;
}

export function useAdminUsersTable() {
  const { data: profiles = [], isLoading: isLoadingUsers } = useUsersQuery();
  const { data: stripe = { subscribers: [] }, isLoading: isLoadingStripe } = useAllSubscribers();

  console.log("Subscribers: ", stripe.subscribers);

  const stripeMap = useMemo(() => {
    return new Map(
      (stripe.subscribers as StripeSubscriber[]).map((sub: StripeSubscriber) => [sub.customer_id, sub])
    );
  }, [stripe]);

  const users: AdminUser[] = useMemo(() =>
    profiles.map(profile => {
      const s: StripeSubscriber | undefined = profile.stripe_customer_id
        ? stripeMap.get(profile.stripe_customer_id)
        : undefined;
      // Get first plan if present
      const plan = s?.plans && s?.plans.length > 0 ? s.plans[0] : undefined;
      return {
        ...profile,
        subscription_id: s?.subscription_id || "",
        plan: plan?.nickname || profile.plan_id || "free",
        status: s?.status || (profile.plan_id === "pro" ? "active" : "free"),
        stripe_customer_id: profile.stripe_customer_id,
        joined: s?.created ? new Date(s.created * 1000).toISOString() : profile.created_at,
        canceled_at: s?.canceled_at ? new Date(s.canceled_at * 1000).toISOString() : null,
        stripe_plan_nickname: plan?.nickname,
        stripe_plan_amount: plan?.amount ? plan.amount / 100 : undefined,
        stripe_plan_interval: plan?.interval,
        stripe_plan_currency: plan?.currency,
      };
    }), [profiles, stripeMap]
  );
  return { users, isLoading: isLoadingUsers || isLoadingStripe };
}