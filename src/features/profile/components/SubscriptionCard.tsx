import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ModalDialog } from "@/shared/components/ui/modal-dialog";
import { AlertCircle, Calendar, CreditCard, Loader } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import type { SubscriptionInfo } from "../types/profile.types";

interface SubscriptionCardProps {
  subscription?: SubscriptionInfo | null;
  isLoading: boolean;
  planName: string;
  aiGenQuizCount: number;
  allowed: number;
  renewal: string;
  onCancel: (subscriptionId: string) => Promise<boolean>;
  isCancelling: boolean;
  onUpgrade?: () => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  isLoading,
  planName,
  aiGenQuizCount,
  allowed,
  renewal,
  onCancel,
  isCancelling,
  onUpgrade,
}) => {
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleCancel = async () => {
    if (!subscription) return;

    try {
      const success = await onCancel(subscription.subscription_id);
      if (success) {
        toast.success("Subscription will be cancelled at period end");
        setShowCancelModal(false);
      } else {
        toast.error("Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error("Failed to cancel subscription");
    }
  };

  const formatDate = (timestamp: number | string) => {
    const date = typeof timestamp === "number" ? new Date(timestamp * 1000) : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const isPro = planName.toLowerCase() === "pro";
  const isCancelled = subscription?.cancel_at_period_end;

  return (
    <>
      <Card className="px-0 py-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Subscription</span>
            <Badge className={isPro ? "badge-purple" : "badge-yellow"}>
              {planName[0]?.toUpperCase() + planName.slice(1)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Usage Stats */}
          <div className="bg-muted rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">AI Quiz Generation</span>
              <span className="text-sm font-semibold">
                {aiGenQuizCount} / {allowed} used
              </span>
            </div>
            <div className="w-full bg-background rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${(aiGenQuizCount / allowed) * 100}%` }}
              />
            </div>
          </div>

          {/* Renewal Date */}
          {subscription && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {isCancelled ? "Expires on:" : "Next billing date:"}
              </span>
              <span className="font-medium">{formatDate(subscription.current_period_end)}</span>
            </div>
          )}

          {renewal && !subscription && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Next reset:</span>
              <span className="font-medium">{formatDate(renewal)}</span>
            </div>
          )}

          {/* Cancellation Warning */}
          {isCancelled && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  Subscription Cancelled
                </p>
                <p className="text-yellow-700 dark:text-yellow-300">
                  Your subscription will end on {formatDate(subscription!.current_period_end)}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {!isPro && onUpgrade && (
              <Button onClick={onUpgrade} className="flex-1 bg-primary hover:bg-primary/90">
                <CreditCard className="h-4 w-4 mr-2" />
                Upgrade to Pro
              </Button>
            )}

            {isPro && subscription && !isCancelled && (
              <Button
                variant="outline"
                onClick={() => setShowCancelModal(true)}
                className="flex-1 text-destructive hover:bg-destructive/10"
              >
                Cancel Subscription
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cancel Confirmation Modal */}
      <ModalDialog
        open={showCancelModal}
        onOpenChange={setShowCancelModal}
        title="Cancel Subscription"
        description="Are you sure you want to cancel your subscription?"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your subscription will remain active until{" "}
            {subscription && formatDate(subscription.current_period_end)}. After that, you'll be
            downgraded to the Free plan.
          </p>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(false)}
              disabled={isCancelling}
            >
              Keep Subscription
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={isCancelling}>
              {isCancelling ? (
                <>
                  <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Cancelling...
                </>
              ) : (
                "Yes, Cancel"
              )}
            </Button>
          </div>
        </div>
      </ModalDialog>
    </>
  );
};
