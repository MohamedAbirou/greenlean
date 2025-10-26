import { AccountSetupStep } from "@/components/registration/AccountSetupStep";
import { MeasurementsStep } from "@/components/registration/MeasurementsStep";
import { OccupationStep } from "@/components/registration/OccupationStep";
import { PersonalInfoStep } from "@/components/registration/PersonalInfoStep";
import { StepIndicator } from "@/components/registration/StepIndicator";
import { SummaryStep } from "@/components/registration/SummaryStep";
import { useAuth } from "@/contexts/useAuth";
import { supabase } from "@/lib/supabase";
import type { RegistrationData } from "@/types/registration";
import {
  calculateAge,
  convertHeightToCm,
  convertWeightToKg,
  getUnitSystemForCountry,
} from "@/utils/countryUtils";
import { AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from "react";
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
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof RegistrationData, string>>>({});

  const [data, setData] = useState<RegistrationData>(() => {
    const saved = localStorage.getItem("registrationProgress");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {
          fullName: "",
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
          dateOfBirth: "",
          gender: "",
          country: "",
          heightValue: "",
          heightUnit: "cm",
          heightInches: "",
          weightValue: "",
          weightUnit: "kg",
          occupationActivity: "",
        };
      }
    }
    return {
      fullName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      dateOfBirth: "",
      gender: "",
      country: "",
      heightValue: "",
      heightUnit: "cm",
      heightInches: "",
      weightValue: "",
      weightUnit: "kg",
      occupationActivity: "",
    };
  });

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (currentStep > 0) {
      localStorage.setItem("registrationProgress", JSON.stringify(data));
    }
  }, [data, currentStep]);

  const handleChange = (field: keyof RegistrationData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof RegistrationData, string>> = {};

    switch (step) {
      case 0:
        if (!data.fullName) newErrors.fullName = "Full name is required";
        if (!data.username) newErrors.username = "Username is required";
        if (data.username && !/^[a-zA-Z0-9_]{3,20}$/.test(data.username)) {
          newErrors.username = "Username must be 3-20 characters (letters, numbers, underscores)";
        }
        if (!data.email) newErrors.email = "Email is required";
        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
          newErrors.email = "Invalid email address";
        }
        if (!data.password) newErrors.password = "Password is required";
        if (data.password && data.password.length < 8) {
          newErrors.password = "Password must be at least 8 characters";
        }
        if (!data.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
        if (data.password !== data.confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match";
        }
        break;

      case 1:
        if (!data.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
        if (data.dateOfBirth) {
          const age = calculateAge(new Date(data.dateOfBirth));
          if (age < 13) newErrors.dateOfBirth = "You must be at least 13 years old";
          if (age > 120) newErrors.dateOfBirth = "Please enter a valid date of birth";
        }
        if (!data.gender) newErrors.gender = "Gender is required";
        if (!data.country) newErrors.country = "Country is required";
        break;

      case 2:
        if (!data.heightValue) newErrors.heightValue = "Height is required";
        if (data.heightUnit === "ft" && !data.heightInches) {
          newErrors.heightInches = "Inches are required";
        }
        if (!data.weightValue) newErrors.weightValue = "Weight is required";
        break;

      case 3:
        if (!data.occupationActivity) {
          newErrors.occupationActivity = "Activity level is required";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);

    try {
      const heightInCm =
        data.heightUnit === "cm"
          ? parseFloat(data.heightValue)
          : convertHeightToCm(
              parseFloat(data.heightValue) * 12 + parseFloat(data.heightInches || "0"),
              "ft"
            );

      const weightInKg =
        data.weightUnit === "kg"
          ? parseFloat(data.weightValue)
          : convertWeightToKg(parseFloat(data.weightValue), "lbs");

      const age = calculateAge(new Date(data.dateOfBirth));
      const unitSystem = getUnitSystemForCountry(data.country);

      const registrationData = {
        age,
        date_of_birth: data.dateOfBirth,
        gender: data.gender,
        country: data.country,
        height_cm: heightInCm,
        weight_kg: weightInKg,
        occupation_activity: data.occupationActivity,
        unit_system: unitSystem,
      };

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            username: data.username.toLowerCase(),
            registration_data: registrationData,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) throw signUpError;

      if (!signUpData.user) {
        throw new Error("Failed to create user account");
      }

      localStorage.setItem(
        "pendingRegistrationData",
        JSON.stringify({
          userId: signUpData.user.id,
          email: data.email,
          ...registrationData,
        })
      );

      localStorage.removeItem("registrationProgress");

      toast.success(
        "Account created successfully! Please check your email and click the confirmation link to complete your registration.",
        { duration: 8000 }
      );

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof Error) {
        if (error.message.includes("already registered") || error.message.includes("already been registered")) {
          toast.error("This email is already registered. Please sign in instead.");
        } else {
          toast.error(error.message || "Failed to create account. Please try again.");
        }
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Join GreenLean</h1>
          <p className="text-muted-foreground">
            Create your personalized health and fitness journey
          </p>
        </div>

        <div className="bg-background rounded-2xl shadow-xl p-8">
          <StepIndicator currentStep={currentStep} totalSteps={STEPS.length} steps={STEPS} />

          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <AccountSetupStep
                key="step-0"
                data={data}
                onChange={handleChange}
                errors={errors}
                onNext={handleNext}
              />
            )}
            {currentStep === 1 && (
              <PersonalInfoStep
                key="step-1"
                data={data}
                onChange={handleChange}
                errors={errors}
                onNext={handleNext}
                onPrev={handlePrev}
              />
            )}
            {currentStep === 2 && (
              <MeasurementsStep
                key="step-2"
                data={data}
                onChange={handleChange}
                errors={errors}
                onNext={handleNext}
                onPrev={handlePrev}
              />
            )}
            {currentStep === 3 && (
              <OccupationStep
                key="step-3"
                data={data}
                onChange={handleChange}
                errors={errors}
                onNext={handleNext}
                onPrev={handlePrev}
              />
            )}
            {currentStep === 4 && (
              <SummaryStep
                key="step-4"
                data={data}
                onPrev={handlePrev}
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />
            )}
          </AnimatePresence>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/")}
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
