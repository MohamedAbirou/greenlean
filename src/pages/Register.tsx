import { useAuth } from "@/features/auth";
import { AccountSetupStep } from "@/features/register/components/AccountSetupStep";
import { MeasurementsStep } from "@/features/register/components/MeasurementsStep";
import { OccupationStep } from "@/features/register/components/OccupationStep";
import { PersonalInfoStep } from "@/features/register/components/PersonalInfoStep";
import { StepIndicator } from "@/features/register/components/StepIndicator";
import { SummaryStep } from "@/features/register/components/SummaryStep";
import { useRegisterUser } from "@/features/register/hooks/useRegister";
import { useRegisterForm } from "@/features/register/hooks/useRegisterForm";
import { AnimatePresence } from "framer-motion";
import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const STEPS = [
  { title: "Account", subtitle: "Create your account" },
  { title: "Personal", subtitle: "Personal information" },
  { title: "Body", subtitle: "Measurements" },
  { title: "Activity", subtitle: "Daily routine" },
  { title: "Review", subtitle: "Confirm details" },
];

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const form = useRegisterForm();
  const registerUser = useRegisterUser((userData: any) => {
    localStorage.setItem("pendingRegistrationData", JSON.stringify({ userId: userData.id, ...form.data }));
    localStorage.removeItem("registrationProgress");
    toast.success("Account created! Please check your email and click the confirmation link to complete your registration.", { duration: 8000 });
    setTimeout(() => navigate("/"), 2000);
  });
  useEffect(() => { if (user) navigate("/dashboard"); }, [user, navigate]);
  useEffect(() => { if (form.currentStep > 0) localStorage.setItem("registrationProgress", JSON.stringify(form.data)); }, [form.data, form.currentStep]);
  const handleSubmit = async () => {
    if (!form.validateStep(form.currentStep)) return;
    registerUser.mutate(form.data, {
      onError: (error: any) => {
        if (error?.message?.includes("already registered")) {
          toast.error("This email is already registered. Please sign in instead.");
        } else {
          toast.error(error?.message || "Failed to create account. Please try again.");
        }
      },
    });
  };
  if (user) return null;
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Join GreenLean</h1>
          <p className="text-muted-foreground">Create your personalized health and fitness journey</p>
        </div>
        <div className="bg-background rounded-2xl shadow-xl p-8">
          <StepIndicator currentStep={form.currentStep} totalSteps={STEPS.length} steps={STEPS} />
          <AnimatePresence mode="wait">
            {form.currentStep === 0 && (
              <AccountSetupStep
                key="step-0"
                data={form.data}
                onChange={form.handleChange as any}
                errors={form.errors}
                onNext={form.handleNext}
              />
            )}
            {form.currentStep === 1 && (
              <PersonalInfoStep
                key="step-1"
                data={form.data}
                onChange={form.handleChange as any}
                errors={form.errors}
                onNext={form.handleNext}
                onPrev={form.handlePrev}
              />
            )}
            {form.currentStep === 2 && (
              <MeasurementsStep
                key="step-2"
                data={form.data}
                onChange={form.handleChange as any}
                errors={form.errors}
                onNext={form.handleNext}
                onPrev={form.handlePrev}
              />
            )}
            {form.currentStep === 3 && (
              <OccupationStep
                key="step-3"
                data={form.data}
                onChange={form.handleChange as any}
                errors={form.errors}
                onNext={form.handleNext}
                onPrev={form.handlePrev}
              />
            )}
            {form.currentStep === 4 && (
              <SummaryStep
                key="step-4"
                data={form.data}
                onPrev={form.handlePrev}
                onSubmit={handleSubmit}
                isLoading={registerUser.isPending}
              />
            )}
          </AnimatePresence>
        </div>
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <button onClick={() => navigate("/")} className="text-primary hover:underline font-medium">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
