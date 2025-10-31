import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProfileService } from "../services/profile.service";

export const useSubscription = (customerId: string | null | undefined) => {
  const queryClient = useQueryClient();

  const {
    data: subscription,
    isLoading: isLoadingSubscription,
    error: subscriptionError,
  } = useQuery({
    queryKey: ["subscription", customerId],
    queryFn: () => ProfileService.getSubscription(customerId!),
    enabled: !!customerId,
  });

  const {
    data: invoices,
    isLoading: isLoadingInvoices,
    error: invoicesError,
  } = useQuery({
    queryKey: ["invoices", customerId],
    queryFn: () => ProfileService.getInvoices(customerId!),
    enabled: !!customerId,
  });

  const cancelMutation = useMutation({
    mutationFn: (subscriptionId: string) => ProfileService.cancelSubscription(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription", customerId] });
    },
  });

  const changePlanMutation = useMutation({
    mutationFn: ({ subscriptionId, newPriceId }: { subscriptionId: string; newPriceId: string }) =>
      ProfileService.changePlan(subscriptionId, newPriceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription", customerId] });
    },
  });

  return {
    subscription,
    isLoadingSubscription,
    subscriptionError,
    invoices: invoices || [],
    isLoadingInvoices,
    invoicesError,
    cancelSubscription: cancelMutation.mutateAsync,
    isCancelling: cancelMutation.isPending,
    changePlan: changePlanMutation.mutateAsync,
    isChangingPlan: changePlanMutation.isPending,
  };
};
