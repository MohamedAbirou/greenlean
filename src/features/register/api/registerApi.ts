import { supabase } from "@/lib/supabase";
import { calculateAge, getUnitSystemForCountry } from "@/shared/utils/profileUtils";
import type { RegistrationData } from "../types";

export async function registerUser(data: RegistrationData) {
  const heightInCm =
    data.heightUnit === "cm"
      ? parseFloat(data.heightValue)
      : // assume ft*12 + inches
        parseFloat(data.heightValue) * 12 + parseFloat(data.heightInches || "0");
  const weightInKg =
    data.weightUnit === "kg"
      ? parseFloat(data.weightValue)
      : // lbs to kg
        parseFloat(data.weightValue) * 0.453592;
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
  return signUpData?.user;
}

export async function isUsernameAvailable(username: string): Promise<boolean> {
  if (!username || username.length < 3 || !/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return false;
  }
  const { data, error } = await supabase
    .from("profiles")
    .select("username")
    .eq("username", username)
    .maybeSingle();
  if (error) throw error;
  return !data;
}
