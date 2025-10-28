/**
 * Sign In Form Component
 */

import { Lock, Mail } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { LoadingSpinner } from "../../../shared/components/feedback";
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { useAuth } from "../hooks";

interface SignInFormProps {
  onSuccess?: () => void;
  onSwitchToSignUp?: () => void;
  onSwitchToReset?: () => void;
}

export function SignInForm({ onSuccess, onSwitchToSignUp, onSwitchToReset }: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn({ email, password });
      toast.success("Signed in successfully!");
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to sign in");
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
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10"
            placeholder="Enter your password"
            required
            disabled={loading}
          />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <LoadingSpinner size="sm" />
            Signing in...
          </span>
        ) : (
          "Sign In"
        )}
      </Button>

      {(onSwitchToSignUp || onSwitchToReset) && (
        <div className="text-center space-y-2">
          {onSwitchToSignUp && (
            <button
              type="button"
              onClick={onSwitchToSignUp}
              className="text-primary hover:text-primary/80 text-sm font-medium"
            >
              Don't have an account? Sign up
            </button>
          )}
          {onSwitchToReset && (
            <div>
              <button
                type="button"
                onClick={onSwitchToReset}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                Forgot your password?
              </button>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
