/**
 * Sign Up Form Component
 */

import { useState, useEffect } from "react";
import { Mail, Lock, User } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { LoadingSpinner } from "../../../shared/components/feedback";
import { useAuth } from "../hooks";
import { AuthService } from "../api/authService";
import toast from "react-hot-toast";

interface SignUpFormProps {
  onSuccess?: () => void;
  onSwitchToSignIn?: () => void;
}

export function SignUpForm({ onSuccess, onSwitchToSignIn }: SignUpFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const { signUp } = useAuth();

  useEffect(() => {
    if (!username) {
      setUsernameAvailable(null);
      return;
    }

    if (!AuthService.validateUsername(username)) {
      setUsernameAvailable(false);
      return;
    }

    const checkUsername = async () => {
      setCheckingUsername(true);
      try {
        const available = await AuthService.checkUsernameAvailability(username);
        setUsernameAvailable(available);
      } catch (error) {
        console.error("Error checking username:", error);
      } finally {
        setCheckingUsername(false);
      }
    };

    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usernameAvailable) {
      toast.error("Please choose a different username");
      return;
    }

    setLoading(true);

    try {
      const result = await signUp({ email, password, fullName, username });
      if (result.success) {
        toast.success(
          "Account created successfully! Please check your email to confirm your account."
        );
        onSuccess?.();
      } else {
        toast.error(result.error || "Failed to sign up");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="fullName">Full Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="pl-10"
            placeholder="Enter your full name"
            required
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="username">Username</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`pl-10 pr-10 ${
              username &&
              (usernameAvailable === true
                ? "border-primary"
                : usernameAvailable === false
                ? "border-destructive"
                : "")
            }`}
            placeholder="Choose a username"
            pattern="[a-zA-Z0-9_]{3,20}"
            title="Username must be 3-20 characters long and can only contain letters, numbers, and underscores"
            required
            disabled={loading}
          />
          {username && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {checkingUsername ? (
                <LoadingSpinner size="sm" />
              ) : usernameAvailable === true ? (
                <span className="text-primary">✓</span>
              ) : usernameAvailable === false ? (
                <span className="text-destructive">✗</span>
              ) : null}
            </div>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          3-20 characters, letters, numbers, and underscores only
        </p>
      </div>

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
            minLength={6}
            required
            disabled={loading}
          />
        </div>
      </div>

      <Button type="submit" disabled={loading || !usernameAvailable} className="w-full">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <LoadingSpinner size="sm" />
            Creating account...
          </span>
        ) : (
          "Create Account"
        )}
      </Button>

      {onSwitchToSignIn && (
        <div className="text-center">
          <button
            type="button"
            onClick={onSwitchToSignIn}
            className="text-primary hover:text-primary/80 text-sm font-medium"
          >
            Already have an account? Sign in
          </button>
        </div>
      )}
    </form>
  );
}
