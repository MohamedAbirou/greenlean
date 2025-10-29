import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";
import React from "react";
import type { RegistrationData } from "../types";

interface OccupationStepProps {
  data: RegistrationData;
  onChange: (field: keyof RegistrationData, value: string) => void;
  errors: Partial<Record<keyof RegistrationData, string>>;
  onNext: () => void;
  onPrev: () => void;
}

const OCCUPATION_OPTIONS = [
  "Sedentary (desk job or minimal movement)",
  "Lightly active (some walking or movement during the day)",
  "Moderately active (on feet often, e.g., retail, teaching)",
  "Very active (physical or outdoor job)",
  "Student",
  "Self-employed / Freelancer",
  "Retired",
  "Currently not working",
];

export const OccupationStep: React.FC<OccupationStepProps> = ({
  data,
  onChange,
  errors,
  onNext,
  onPrev,
}) => {
  const canProceed = () => {
    return !!data.occupationActivity;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Activity Level</h2>
        <p className="text-muted-foreground">
          Tell us about your daily routine to optimize your plan
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="occupation">Daily Activity Level</Label>
          <div className="relative mt-2">
            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 pointer-events-none z-10" />
            <Select
              value={data.occupationActivity}
              onValueChange={(val) => onChange("occupationActivity", val)}
            >
              <SelectTrigger
                className={`pl-10 ${errors.occupationActivity ? "border-destructive" : ""}`}
              >
                <SelectValue placeholder="Select your activity level" />
              </SelectTrigger>
              <SelectContent>
                {OCCUPATION_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {errors.occupationActivity && (
            <p className="text-xs text-destructive mt-1">{errors.occupationActivity}</p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            This helps us calculate your daily calorie needs more accurately
          </p>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <p className="text-sm text-foreground">
            <span className="font-semibold">Tip:</span> Your activity level during work
            affects your base calorie needs. Exercise activity will be added separately
            in your fitness plan.
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
