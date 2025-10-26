import { useAuth } from "@/contexts/useAuth";
import { supabase } from "@/lib/supabase";
import type { ColorTheme } from "@/utils/colorUtils";
import { ArrowLeft, Lock, Mail, User, UserCircle } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Spinner } from "../ui/spinner";

interface AuthModalProps {
  defaultMode?: "signin" | "signup" | "reset";
  colorTheme: ColorTheme;
  classNames?: string;
  btnContent?: string;
  size?: "default" | "xs" | "sm" | "lg" | "xl" | "icon" | "icon-sm" | "icon-lg" | null | undefined
}

const AuthModal: React.FC<AuthModalProps> = ({
  defaultMode = "signin",
  colorTheme,
  classNames,
  btnContent,
  size
}) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup" | "reset">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );
  const [checkingUsername, setCheckingUsername] = useState(false);

  const { signIn, signUp, resetPassword } = useAuth();

  const checkUsername = async (username: string) => {
    if (!username) {
      setUsernameAvailable(null);
      return;
    }

    // Username validation
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      setUsernameAvailable(false);
      return;
    }

    setCheckingUsername(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username.toLowerCase())
        .maybeSingle();

      if (error) throw error;

      setUsernameAvailable(!data);
    } catch (error) {
      console.error("Error checking username:", error);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    checkUsername(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === "signin") {
        await signIn(email, password);
      } else if (mode === "signup") {
        if (!usernameAvailable) {
          setError("Please choose a different username");
          return;
        }

        const { error: signUpError } = await signUp(
          email,
          password,
          fullName,
          username
        );
        if (signUpError) {
          setError(signUpError);
          return;
        }
        setSuccess(
          "Account created successfully! Please check your email to confirm your account before signing in."
        );
        setMode("signin");
      } else if (mode === "reset") {
        await resetPassword(email);
        setSuccess("Password reset instructions have been sent to your email");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setMode("signin");
    setError(null);
    setSuccess(null);
  };

  const handleReset = () => {
    setMode("reset");
    setError(null);
    setSuccess(null);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
        size={size}
          className={`rounded-full ${colorTheme.primaryBg} ${classNames} text-white hover:${colorTheme.primaryHover} transition-colors duration-300 cursor-pointer`}
        >
          <UserCircle size={20} />
          {btnContent ?? "Sign In"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground">
              {mode !== "signin" && (
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="w-2 h-2 mr-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              {mode === "signin"
                ? "Sign In"
                : mode === "signup"
                ? "Create Account"
                : "Reset Password"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            {mode === "signup" && (
              <>
                <div>
                  <Label className="block text-sm font-medium text-foreground/90 mb-1">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/80" />
                    <Input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-input text-foreground"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="block text-sm font-medium text-foreground/90 mb-1">
                    Username
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/80" />
                    <Input
                      type="text"
                      value={username}
                      onChange={handleUsernameChange}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-input text-foreground ${
                        username &&
                        (usernameAvailable === true
                          ? "border-primary"
                          : usernameAvailable === false
                          ? "border-destructive"
                          : "border-border")
                      }`}
                      placeholder="Choose a username"
                      pattern="[a-zA-Z0-9_]{3,20}"
                      title="Username must be 3-20 characters long and can only contain letters, numbers, and underscores"
                      required
                    />
                    {username && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {checkingUsername ? (
                          <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                        ) : usernameAvailable === true ? (
                          <span className="text-primary">✓</span>
                        ) : usernameAvailable === false ? (
                          <span className="text-destructive">✗</span>
                        ) : null}
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-foreground/80">
                    3-20 characters, letters, numbers, and underscores only
                  </p>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/80"
                />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-input text-foreground"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {mode !== "reset" && (
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/80" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-input text-foreground"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>
            )}
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}

          {success && <p className="text-primary text-sm">{success}</p>}
          <DialogFooter>
            <Button
              type="submit"
              disabled={loading || (mode === "signup" && !usernameAvailable)}
              className="w-full"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Spinner />
                  Processing...
                </span>
              ) : mode === "signin" ? (
                "Sign In"
              ) : mode === "signup" ? (
                "Create Account"
              ) : (
                "Reset Password"
              )}
            </Button>
          </DialogFooter>
          {mode === "signin" && (
            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-primary hover:text-primary/80 text-sm font-medium cursor-pointer"
              >
                Don't have an account? Sign up
              </button>
              <div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-foreground/80 text-sm cursor-pointer"
                >
                  Forgot your password?
                </button>
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
