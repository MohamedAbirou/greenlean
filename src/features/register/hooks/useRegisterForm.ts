import { useState } from "react";
import type { RegistrationData } from "../types";

export function getInitialRegistrationData(): RegistrationData {
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

export function useRegisterForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<RegistrationData>(getInitialRegistrationData);
  const [errors, setErrors] = useState<Partial<Record<keyof RegistrationData, string>>>({});

  function handleChange(field: keyof RegistrationData, value: string) {
    setData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
  }

  function validateStep(step: number): boolean {
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
          const dob = new Date(data.dateOfBirth);
          const age = dob.getFullYear() ? new Date().getFullYear() - dob.getFullYear() : 0;
          if (age < 13) newErrors.dateOfBirth = "You must be at least 13 years old";
          if (age > 120) newErrors.dateOfBirth = "Please enter a valid date of birth";
        }
        if (!data.gender) newErrors.gender = "Gender is required";
        if (!data.country) newErrors.country = "Country is required";
        break;
      case 2:
        if (!data.heightValue) newErrors.heightValue = "Height is required";
        if (data.heightUnit === "ft" && !data.heightInches) newErrors.heightInches = "Inches are required";
        if (!data.weightValue) newErrors.weightValue = "Weight is required";
        break;
      case 3:
        if (!data.occupationActivity) newErrors.occupationActivity = "Activity level is required";
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleNext() {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  }
  function handlePrev() {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }
  function canProceed() {
    return validateStep(currentStep);
  }
  return {
    data,
    setData,
    errors,
    setErrors,
    currentStep,
    setCurrentStep,
    handleChange,
    handleNext,
    handlePrev,
    validateStep,
    canProceed,
  };
}
