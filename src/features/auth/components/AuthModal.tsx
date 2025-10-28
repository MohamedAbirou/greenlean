/**
 * Auth Modal Component
 * Modal dialog for authentication (sign in, sign up, reset password)
 */

import { ArrowLeft, UserCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../shared/components/ui/dialog";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { SignInForm } from "./SignInForm";

type AuthMode = "signin" | "reset";

interface AuthModalProps {
  defaultMode?: AuthMode;
  buttonText?: string;
  buttonClassName?: string;
  buttonSize?: "default" | "xs" | "sm" | "lg" | "xl" | "icon" | "icon-sm" | "icon-lg";
  onAuthSuccess?: () => void;
}

export function AuthModal({
  defaultMode = "signin",
  buttonText = "Sign In",
  buttonClassName = "",
  buttonSize = "default",
  onAuthSuccess,
}: AuthModalProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>(defaultMode);

  const handleClose = () => {
    setOpen(false);
    setMode(defaultMode);
  };

  const handleSuccess = () => {
    handleClose();
    onAuthSuccess?.();
  };

  const titles: Record<AuthMode, string> = {
    signin: "Sign In",
    reset: "Reset Password",
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size={buttonSize}
          className={`rounded-full bg-primary text-white hover:opacity-90 transition-opacity ${buttonClassName}`}
        >
          <UserCircle size={20} />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            {mode !== "signin" && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setMode("signin")}
                className="mr-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            {titles[mode]}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {mode === "signin" && (
            <SignInForm
              onSuccess={handleSuccess}
              onSwitchToSignUp={() => navigate("/register")}
              onSwitchToReset={() => setMode("reset")}
            />
          )}

          {mode === "reset" && (
            <ResetPasswordForm
              onSuccess={() => setMode("signin")}
              onSwitchToSignIn={() => setMode("signin")}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
