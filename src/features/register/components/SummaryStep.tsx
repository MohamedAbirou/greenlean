import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Spinner } from "@/shared/components/ui/spinner";
import { calculateAge, COUNTRIES } from "@/shared/utils/countryUtils";
import { motion } from "framer-motion";
import { Calendar, Check, Globe, Mail, Ruler, User, Weight } from "lucide-react";
import React from "react";
import type { RegistrationData } from "../types";

interface SummaryStepProps {
  data: RegistrationData;
  onPrev: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const SummaryStep: React.FC<SummaryStepProps> = ({
  data,
  onPrev,
  onSubmit,
  isLoading,
}) => {
  const age = data.dateOfBirth ? calculateAge(new Date(data.dateOfBirth)) : null;
  const country = COUNTRIES.find((c) => c.name === data.country);

  const formatHeight = () => {
    if (data.heightUnit === "cm") {
      return `${data.heightValue} cm`;
    }
    return `${data.heightValue}' ${data.heightInches || 0}"`;
  };

  const formatWeight = () => {
    return `${data.weightValue} ${data.weightUnit}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Confirm Your Information
        </h2>
        <p className="text-muted-foreground">
          Please review your details before creating your account
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="text-base font-medium text-foreground">{data.fullName}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Username</p>
              <p className="text-base font-medium text-foreground">@{data.username}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-base font-medium text-foreground">{data.email}</p>
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold text-foreground mb-3">Personal Details</h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p className="text-base font-medium text-foreground">
                    {age} years old
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="text-base font-medium text-foreground">{data.gender}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Country</p>
                  <p className="text-base font-medium text-foreground">
                    {country?.flag} {data.country}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Ruler className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Height</p>
                  <p className="text-base font-medium text-foreground">{formatHeight()}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Weight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Weight</p>
                  <p className="text-base font-medium text-foreground">{formatWeight()}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Activity Level</p>
                  <p className="text-base font-medium text-foreground">
                    {data.occupationActivity}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <p className="text-sm text-foreground">
          <span className="font-semibold">What's next?</span> After creating your account,
          you'll be guided through a quick quiz to complete your health profile and receive
          your personalized meal and workout plans.
        </p>
      </div>

      <div className="flex gap-3">
        <Button onClick={onPrev} variant="outline" className="flex-1" disabled={isLoading}>
          Back
        </Button>
        <Button onClick={onSubmit} className="flex-1" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Spinner />
              Creating Account...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              Create Account
            </span>
          )}
        </Button>
      </div>
    </motion.div>
  );
};
