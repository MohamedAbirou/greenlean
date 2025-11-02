import { triggerStripeCheckout } from "@/shared/hooks/useStripe";
import { useState } from "react";
import { Button } from "../ui/button";
import { ModalDialog } from "../ui/modal-dialog";

interface UpgradeModalProps {
  showUpgradeModal: boolean;
  setShowUpgradeModal: (show: boolean) => void;
  userId: string;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  showUpgradeModal,
  setShowUpgradeModal,
  userId,
}) => {
  const [loading, setLoading] = useState(false);
  const handleUpgrade = async () => {
    setLoading(true);
    await triggerStripeCheckout(userId);
    setLoading(false);
  };
  return (
    <ModalDialog
      open={showUpgradeModal}
      onOpenChange={setShowUpgradeModal}
      title="Upgrade to Pro"
      description="Unlock unlimited AI-generated quizzes and premium features"
      size="md"
    >
      <div className="space-y-6">
        <div className="bg-muted rounded-lg p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Pro Plan</span>
            <span className="text-2xl font-bold">$9.99/mo</span>
          </div>

          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>20 AI-generated quizzes per month</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>Advanced analytics and insights</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>Priority support</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>Custom workout plans</span>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleUpgrade}
            className="w-full bg-primary hover:bg-primary/90"
            size="lg"
          >
            {loading ? "Processing..." : "Upgrade Now"}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Secure payment processed by Stripe. Cancel anytime.
          </p>
        </div>
      </div>
    </ModalDialog>
  );
};
