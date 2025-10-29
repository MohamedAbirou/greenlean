import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { getUnitSystemForCountry } from "@/shared/utils/countryUtils";
import { motion } from "framer-motion";
import { Ruler, Weight } from "lucide-react";
import React, { useEffect } from "react";
import type { RegistrationData } from "../types";

interface MeasurementsStepProps {
  data: RegistrationData;
  onChange: (field: keyof RegistrationData, value: string) => void;
  errors: Partial<Record<keyof RegistrationData, string>>;
  onNext: () => void;
  onPrev: () => void;
}

export const MeasurementsStep: React.FC<MeasurementsStepProps> = ({
  data,
  onChange,
  errors,
  onNext,
  onPrev,
}) => {
  useEffect(() => {
    if (data.country) {
      const unitSystem = getUnitSystemForCountry(data.country);
      if (unitSystem === "imperial") {
        if (data.heightUnit !== "ft") onChange("heightUnit", "ft");
        if (data.weightUnit !== "lbs") onChange("weightUnit", "lbs");
      } else {
        if (data.heightUnit !== "cm") onChange("heightUnit", "cm");
        if (data.weightUnit !== "kg") onChange("weightUnit", "kg");
      }
    }
  }, [data.country]);

  const canProceed = () => {
    const hasHeight =
      data.heightValue &&
      parseFloat(data.heightValue) > 0 &&
      (data.heightUnit === "cm" || (data.heightInches && parseFloat(data.heightInches) >= 0));
    const hasWeight = data.weightValue && parseFloat(data.weightValue) > 0;
    return hasHeight && hasWeight;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Body Measurements</h2>
        <p className="text-muted-foreground">
          These help us calculate your personalized nutrition and fitness plan
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Height</Label>
          <div className="flex gap-2 mb-3">
            <Button
              type="button"
              variant={data.heightUnit === "cm" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                onChange("heightUnit", "cm");
                onChange("heightValue", "");
                onChange("heightInches", "");
              }}
            >
              cm
            </Button>
            <Button
              type="button"
              variant={data.heightUnit === "ft" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                onChange("heightUnit", "ft");
                onChange("heightValue", "");
                onChange("heightInches", "");
              }}
            >
              ft / in
            </Button>
          </div>

          {data.heightUnit === "cm" ? (
            <div className="relative">
              <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="number"
                value={data.heightValue}
                onChange={(e) => onChange("heightValue", e.target.value)}
                placeholder="170"
                className={`pl-10 ${errors.heightValue ? "border-destructive" : ""}`}
                min="100"
                max="250"
              />
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  type="number"
                  value={data.heightValue}
                  onChange={(e) => onChange("heightValue", e.target.value)}
                  placeholder="5"
                  className={`pl-10 ${errors.heightValue ? "border-destructive" : ""}`}
                  min="3"
                  max="8"
                />
              </div>
              <span className="self-center text-muted-foreground">ft</span>
              <div className="relative flex-1">
                <Input
                  type="number"
                  value={data.heightInches || ""}
                  onChange={(e) => onChange("heightInches", e.target.value)}
                  placeholder="10"
                  className={errors.heightInches ? "border-destructive" : ""}
                  min="0"
                  max="11"
                />
              </div>
              <span className="self-center text-muted-foreground">in</span>
            </div>
          )}
          {errors.heightValue && (
            <p className="text-xs text-destructive mt-1">{errors.heightValue}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {data.heightUnit === "cm" ? "Range: 100-250 cm" : "Range: 3'0\" - 8'2\""}
          </p>
        </div>

        <div>
          <Label>Weight</Label>
          <div className="flex gap-2 mb-3">
            <Button
              type="button"
              variant={data.weightUnit === "kg" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                onChange("weightUnit", "kg");
                onChange("weightValue", "");
              }}
            >
              kg
            </Button>
            <Button
              type="button"
              variant={data.weightUnit === "lbs" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                onChange("weightUnit", "lbs");
                onChange("weightValue", "");
              }}
            >
              lbs
            </Button>
          </div>

          <div className="relative">
            <Weight className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="number"
              value={data.weightValue}
              onChange={(e) => onChange("weightValue", e.target.value)}
              placeholder={data.weightUnit === "kg" ? "70" : "154"}
              className={`pl-10 ${errors.weightValue ? "border-destructive" : ""}`}
              min={data.weightUnit === "kg" ? "30" : "66"}
              max={data.weightUnit === "kg" ? "250" : "550"}
              step="0.1"
            />
          </div>
          {errors.weightValue && (
            <p className="text-xs text-destructive mt-1">{errors.weightValue}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {data.weightUnit === "kg" ? "Range: 30-250 kg" : "Range: 66-550 lbs"}
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
