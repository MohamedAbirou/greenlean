import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  COUNTRIES,
  getUnitSystemForCountry,
  OCCUPATION_OPTIONS,
} from "@/shared/utils/profileUtils";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";
import { Briefcase, Calendar, Loader, Mail, User } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { Profile, ProfileUpdateData } from "../types/profile.types";

interface ProfileFormProps {
  profile: Profile;
  onUpdate: UseMutateAsyncFunction<Profile, Error, ProfileUpdateData, unknown>;
  isUpdating: boolean;
  calculateAge: (dob: string | Date) => number;
  calculateDOB: (age: number) => string;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  profile,
  onUpdate,
  isUpdating,
  calculateAge,
  calculateDOB,
}) => {
  const [formData, setFormData] = useState<ProfileUpdateData>({
    full_name: profile.full_name || "",
    username: profile.username || "",
    age: profile.age || undefined,
    date_of_birth: profile.date_of_birth || "",
    gender: profile.gender || "",
    country: profile.country || "",
    height_cm: profile.height_cm || undefined,
    weight_kg: profile.weight_kg || undefined,
    occupation_activity: profile.occupation_activity || "",
    unit_system: profile.unit_system || "metric",
  });

  useEffect(() => {
    setFormData({
      full_name: profile.full_name || "",
      username: profile.username || "",
      age: profile.age || undefined,
      date_of_birth: profile.date_of_birth || "",
      gender: profile.gender || "",
      country: profile.country || "",
      height_cm: profile.height_cm || undefined,
      weight_kg: profile.weight_kg || undefined,
      occupation_activity: profile.occupation_activity || "",
      unit_system: profile.unit_system || "metric",
    });
  }, [profile]);

  const validateForm = (): boolean => {
    if (formData.age && formData.age < 0) {
      toast.error("Age must be a positive number");
      return false;
    }

    if (formData.date_of_birth) {
      const dob = new Date(formData.date_of_birth);
      if (dob > new Date()) {
        toast.error("Date of birth cannot be in the future");
        return false;
      }
    }

    if (formData.height_cm && formData.height_cm <= 0) {
      toast.error("Height must be greater than 0");
      return false;
    }

    if (formData.weight_kg && formData.weight_kg <= 0) {
      toast.error("Weight must be greater than 0");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await onUpdate(formData);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const handleChange = (field: keyof ProfileUpdateData, value: any) => {
    setFormData((prev) => {
      let updated = { ...prev, [field]: value };

      // Sync DOB -> Age
      if (field === "date_of_birth" && value) {
        updated.age = calculateAge(value);
      }

      // Sync Age -> DOB
      if (field === "age" && value !== undefined && value >= 0) {
        updated.date_of_birth = calculateDOB(value);
      }

      if (field === "country" && value) {
        updated.unit_system = getUnitSystemForCountry(value);
      }

      return updated;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div>
          <Label htmlFor="full_name">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="full_name"
              type="text"
              value={formData.full_name}
              onChange={(e) => handleChange("full_name", e.target.value)}
              placeholder="Enter your full name"
              className="pl-10"
            />
          </div>
        </div>

        {/* Username */}
        <div>
          <Label htmlFor="username">Username</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => handleChange("username", e.target.value)}
              placeholder="Choose a username"
              className="pl-10"
            />
          </div>
        </div>

        {/* Email (Read-only) */}
        <div>
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="email"
              type="email"
              value={profile.email}
              disabled
              className="pl-10 bg-muted/50 cursor-not-allowed"
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Email cannot be changed</p>
        </div>

        {/* Date of Birth */}
        <div>
          <Label htmlFor="date_of_birth">Date of Birth</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => handleChange("date_of_birth", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex space-x-6">
          {/* Age */}
          <div className="w-full">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              value={formData.age || ""}
              onChange={(e) => handleChange("age", parseInt(e.target.value) || undefined)}
              placeholder="Enter your age"
              min="0"
            />
          </div>

          {/* Gender */}
          <div className="w-full">
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => handleChange("gender", value)}
            >
              <SelectTrigger id="gender" className="w-full">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
                <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex space-x-6">
          {/* Height */}
          <div className="w-full">
            <Label htmlFor="height_cm">
              Height ({formData.unit_system === "metric" ? "cm" : "inches"})
            </Label>
            <Input
              id="height_cm"
              type="number"
              value={formData.height_cm || ""}
              onChange={(e) => handleChange("height_cm", parseFloat(e.target.value) || undefined)}
              placeholder="Enter your height"
              step="0.1"
              min="0"
            />
          </div>

          {/* Weight */}
          <div className="w-full">
            <Label htmlFor="weight_kg">
              Weight ({formData.unit_system === "metric" ? "kg" : "lbs"})
            </Label>
            <Input
              id="weight_kg"
              type="number"
              value={formData.weight_kg || ""}
              onChange={(e) => handleChange("weight_kg", parseFloat(e.target.value) || undefined)}
              placeholder="Enter your weight"
              step="0.1"
              min="0"
            />
          </div>
        </div>

        <div className="flex space-x-6">
          {/* Country */}
          <div className="w-full">
            <Label htmlFor="country">Country</Label>
            <Select value={formData.country} onValueChange={(val) => handleChange("country", val)}>
              <SelectTrigger className="w-full">
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
            <p className="text-xs text-muted-foreground mt-1">
              This helps us determine the best unit system for you
            </p>
          </div>

          {/* Unit System */}
          <div className="w-full">
            <Label htmlFor="unit_system">Unit System</Label>
            <Select
              value={formData.unit_system}
              onValueChange={(value: "metric" | "imperial") => handleChange("unit_system", value)}
            >
              <SelectTrigger id="unit_system" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="metric">Metric (kg, cm)</SelectItem>
                <SelectItem value="imperial">Imperial (lbs, in)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Occupation/Activity */}
        <div>
          <Label htmlFor="occupation">Daily Activity Level</Label>
          <div className="relative mt-2">
            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 pointer-events-none z-10" />
            <Select
              value={formData.occupation_activity}
              onValueChange={(val) => handleChange("occupation_activity", val)}
            >
              <SelectTrigger className="pl-10 w-full">
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
          <p className="text-xs text-muted-foreground mt-2">
            This helps us calculate your daily calorie needs more accurately
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          className="bg-primary hover:bg-primary/90 text-white"
          disabled={isUpdating}
        >
          {isUpdating ? (
            <>
              <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Updating...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
};
