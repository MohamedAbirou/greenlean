import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { RegistrationData } from "@/shared/types/registration";
import { calculateAge, COUNTRIES } from "@/shared/utils/countryUtils";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import React from "react";

interface PersonalInfoStepProps {
  data: RegistrationData;
  onChange: (field: keyof RegistrationData, value: string) => void;
  errors: Partial<Record<keyof RegistrationData, string>>;
  onNext: () => void;
  onPrev: () => void;
}

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  data,
  onChange,
  errors,
  onNext,
  onPrev,
}) => {
  const calculateUserAge = () => {
    if (!data.dateOfBirth) return null;
    try {
      const dob = new Date(data.dateOfBirth);
      return calculateAge(dob);
    } catch {
      return null;
    }
  };

  const age = calculateUserAge();

  const canProceed = () => {
    return data.dateOfBirth && data.gender && data.country;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Personal Information</h2>
        <p className="text-muted-foreground">
          Help us understand you better for personalized recommendations
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              id="dateOfBirth"
              type="date"
              value={data.dateOfBirth}
              onChange={(e) => onChange("dateOfBirth", e.target.value)}
              className={`pl-10 ${errors.dateOfBirth ? "border-destructive" : ""}`}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>
          {errors.dateOfBirth && (
            <p className="text-xs text-destructive mt-1">{errors.dateOfBirth}</p>
          )}
          {age !== null && (
            <p className="text-sm text-primary mt-2 font-medium">
              You're {age} years old
            </p>
          )}
        </div>

        <div>
          <Label>Gender</Label>
          <RadioGroup value={data.gender} onValueChange={(val) => onChange("gender", val)}>
            <div className="grid grid-cols-2 gap-3">
              {["Male", "Female", "Other", "Prefer not to say"].map((option) => (
                <Label
                  key={option}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    data.gender === option
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value={option} className="mr-3" />
                  <span className="text-sm">{option}</span>
                </Label>
              ))}
            </div>
          </RadioGroup>
          {errors.gender && (
            <p className="text-xs text-destructive mt-1">{errors.gender}</p>
          )}
        </div>

        <div>
          <Label htmlFor="country">Country</Label>
          <Select value={data.country} onValueChange={(val) => onChange("country", val)}>
            <SelectTrigger
              className={`${errors.country ? "border-destructive" : ""}`}
            >
              <SelectValue placeholder="Select your country" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {COUNTRIES.map((country) => (
                <SelectItem key={country.code} value={country.name}>
                  <span className="flex items-center gap-2">
                    <span>{country.flag}</span>
                    <span>{country.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.country && (
            <p className="text-xs text-destructive mt-1">{errors.country}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            This helps us determine the best unit system for you
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={onPrev} variant="outline" className="flex-1">
          Back
        </Button>
        <Button onClick={onNext} disabled={!canProceed()} className="flex-1">
          Continue
        </Button>
      </div>
    </motion.div>
  );
};
