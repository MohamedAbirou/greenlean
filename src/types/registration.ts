export interface RegistrationData {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  gender: string;
  country: string;
  heightValue: string;
  heightUnit: "cm" | "ft";
  heightInches?: string;
  weightValue: string;
  weightUnit: "kg" | "lbs";
  occupationActivity: string;
}

export interface RegistrationStepProps {
  data: RegistrationData;
  onChange: (field: keyof RegistrationData, value: string) => void;
  errors: Partial<Record<keyof RegistrationData, string>>;
  onNext: () => void;
  onPrev: () => void;
}
