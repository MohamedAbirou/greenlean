import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Spinner } from "@/shared/components/ui/spinner";
import { motion } from "framer-motion";
import { Check, Lock, Mail, User, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { isUsernameAvailable } from "../api/registerApi";
import type { RegistrationData } from "../types";

interface AccountSetupStepProps {
  data: RegistrationData;
  onChange: (field: keyof RegistrationData, value: string) => void;
  errors: Partial<Record<keyof RegistrationData, string>>;
  onNext: () => void;
}

export const AccountSetupStep: React.FC<AccountSetupStepProps> = ({
  data,
  onChange,
  errors,
  onNext,
}) => {
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  useEffect(() => {
    const checkUsername = async () => {
      if (!data.username || data.username.length < 3) {
        setUsernameAvailable(null);
        return;
      }
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(data.username)) {
        setUsernameAvailable(false);
        return;
      }
      setCheckingUsername(true);
      try {
        const available = await isUsernameAvailable(data.username);
        setUsernameAvailable(available);
      } catch {
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    };
    const debounce = setTimeout(checkUsername, 500);
    return () => clearTimeout(debounce);
  }, [data.username]);

  const isPasswordStrong = (password: string) => password.length >= 8;
  const canProceed = () => (
    data.fullName &&
    data.username &&
    usernameAvailable === true &&
    data.email &&
    data.password &&
    data.confirmPassword &&
    data.password === data.confirmPassword &&
    isPasswordStrong(data.password)
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Create Your Account</h2>
        <p className="text-muted-foreground">Let's start with the basics to get you set up</p>
      </div>
      <div className="space-y-4">
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              id="fullName"
              type="text"
              value={data.fullName}
              onChange={e => onChange("fullName", e.target.value)}
              placeholder="John Doe"
              className={`pl-10 ${errors.fullName ? "border-destructive" : ""}`}
            />
          </div>
          {errors.fullName && (
            <p className="text-xs text-destructive mt-1">{errors.fullName}</p>
          )}
        </div>
        <div>
          <Label htmlFor="username">Username</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              id="username"
              type="text"
              value={data.username}
              onChange={e => onChange("username", e.target.value)}
              placeholder="johndoe"
              className={`pl-10 pr-10 ${
                errors.username
                  ? "border-destructive"
                  : usernameAvailable === true
                  ? "border-primary"
                  : usernameAvailable === false
                  ? "border-destructive"
                  : ""
              }`}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {checkingUsername ? (
                <Spinner />
              ) : usernameAvailable === true ? (
                <Check className="w-5 h-5 text-primary" />
              ) : usernameAvailable === false ? (
                <X className="w-5 h-5 text-destructive" />
              ) : null}
            </div>
          </div>
          {errors.username && (
            <p className="text-xs text-destructive mt-1">{errors.username}</p>
          )}
          {!errors.username && data.username && usernameAvailable === false && (
            <p className="text-xs text-destructive mt-1">Username is already taken</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">3-20 characters, letters, numbers, and underscores only</p>
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={e => onChange("email", e.target.value)}
              placeholder="john@example.com"
              className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
            />
          </div>
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              id="password"
              type="password"
              value={data.password}
              onChange={e => onChange("password", e.target.value)}
              placeholder="Create a strong password"
              className={`pl-10 ${errors.password ? "border-destructive" : ""}`}
            />
          </div>
          {errors.password && (
            <p className="text-xs text-destructive mt-1">{errors.password}</p>
          )}
          {data.password && (
            <div className="mt-2">
              <div className="flex items-center gap-2 text-xs">
                <div className={`h-1 flex-1 rounded ${data.password.length >= 12 ? "bg-primary" : data.password.length >= 8 ? "bg-yellow-500" : "bg-destructive"}`} />
                <span className={`${data.password.length >= 12 ? "text-primary" : data.password.length >= 8 ? "text-yellow-600" : "text-destructive"}`}>
                  {data.password.length >= 12 ? "Strong" : data.password.length >= 8 ? "Good" : "Weak"}
                </span>
              </div>
            </div>
          )}
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              id="confirmPassword"
              type="password"
              value={data.confirmPassword}
              onChange={e => onChange("confirmPassword", e.target.value)}
              placeholder="Re-enter your password"
              className={`pl-10 ${errors.confirmPassword ? "border-destructive" : ""}`}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>
          )}
          {data.password && data.confirmPassword && data.password === data.confirmPassword && (
            <p className="text-xs text-primary mt-1 flex items-center gap-1"><Check className="w-3 h-3" /> Passwords match</p>
          )}
        </div>
      </div>
      <Button onClick={onNext} disabled={!canProceed()} className="w-full" size="lg">
        Continue
      </Button>
    </motion.div>
  );
};
