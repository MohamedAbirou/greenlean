/**
 * Reset Password Form Component
 */

import { Mail } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { LoadingSpinner } from "../../../shared/components/feedback";
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { useAuth } from "../hooks";

interface ResetPasswordFormProps {
  onSuccess?: () => void;
  onSwitchToSignIn?: () => void;
}

export function ResetPasswordForm({ onSuccess, onSwitchToSignIn }: ResetPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await resetPassword(email);
      toast.success("Password reset instructions have been sent to your email");
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            placeholder="Enter your email"
            required
            disabled={loading}
          />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          We'll send you instructions to reset your password
        </p>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <LoadingSpinner size="sm" />
            Sending...
          </span>
        ) : (
          "Send Reset Instructions"
        )}
      </Button>

      {onSwitchToSignIn && (
        <div className="text-center">
          <button
            type="button"
            onClick={onSwitchToSignIn}
            className="text-primary hover:text-primary/80 text-sm font-medium"
          >
            Back to sign in
          </button>
        </div>
      )}
    </form>
  );
}
