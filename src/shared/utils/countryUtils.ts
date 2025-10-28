export const COUNTRIES = [
  { name: "United States", code: "US", flag: "🇺🇸", imperial: true },
  { name: "United Kingdom", code: "GB", flag: "🇬🇧", imperial: true },
  { name: "Canada", code: "CA", flag: "🇨🇦", imperial: false },
  { name: "Australia", code: "AU", flag: "🇦🇺", imperial: false },
  { name: "Germany", code: "DE", flag: "🇩🇪", imperial: false },
  { name: "France", code: "FR", flag: "🇫🇷", imperial: false },
  { name: "Spain", code: "ES", flag: "🇪🇸", imperial: false },
  { name: "Italy", code: "IT", flag: "🇮🇹", imperial: false },
  { name: "Netherlands", code: "NL", flag: "🇳🇱", imperial: false },
  { name: "Belgium", code: "BE", flag: "🇧🇪", imperial: false },
  { name: "Sweden", code: "SE", flag: "🇸🇪", imperial: false },
  { name: "Norway", code: "NO", flag: "🇳🇴", imperial: false },
  { name: "Denmark", code: "DK", flag: "🇩🇰", imperial: false },
  { name: "Finland", code: "FI", flag: "🇫🇮", imperial: false },
  { name: "Poland", code: "PL", flag: "🇵🇱", imperial: false },
  { name: "Czech Republic", code: "CZ", flag: "🇨🇿", imperial: false },
  { name: "Austria", code: "AT", flag: "🇦🇹", imperial: false },
  { name: "Switzerland", code: "CH", flag: "🇨🇭", imperial: false },
  { name: "Portugal", code: "PT", flag: "🇵🇹", imperial: false },
  { name: "Greece", code: "GR", flag: "🇬🇷", imperial: false },
  { name: "Ireland", code: "IE", flag: "🇮🇪", imperial: false },
  { name: "New Zealand", code: "NZ", flag: "🇳🇿", imperial: false },
  { name: "Japan", code: "JP", flag: "🇯🇵", imperial: false },
  { name: "South Korea", code: "KR", flag: "🇰🇷", imperial: false },
  { name: "Singapore", code: "SG", flag: "🇸🇬", imperial: false },
  { name: "Malaysia", code: "MY", flag: "🇲🇾", imperial: false },
  { name: "Thailand", code: "TH", flag: "🇹🇭", imperial: false },
  { name: "India", code: "IN", flag: "🇮🇳", imperial: false },
  { name: "United Arab Emirates", code: "AE", flag: "🇦🇪", imperial: false },
  { name: "Saudi Arabia", code: "SA", flag: "🇸🇦", imperial: false },
  { name: "Egypt", code: "EG", flag: "🇪🇬", imperial: false },
  { name: "South Africa", code: "ZA", flag: "🇿🇦", imperial: false },
  { name: "Morocco", code: "MA", flag: "🇲🇦", imperial: false },
  { name: "Brazil", code: "BR", flag: "🇧🇷", imperial: false },
  { name: "Argentina", code: "AR", flag: "🇦🇷", imperial: false },
  { name: "Chile", code: "CL", flag: "🇨🇱", imperial: false },
  { name: "Mexico", code: "MX", flag: "🇲🇽", imperial: false },
  { name: "Colombia", code: "CO", flag: "🇨🇴", imperial: false },
].sort((a, b) => a.name.localeCompare(b.name));

export const getUnitSystemForCountry = (countryName: string): "metric" | "imperial" => {
  const country = COUNTRIES.find(c => c.name === countryName);
  return country?.imperial ? "imperial" : "metric";
};

export const convertHeightToCm = (value: number, unit: "cm" | "ft"): number => {
  if (unit === "cm") return value;
  return value * 30.48;
};

export const convertWeightToKg = (value: number, unit: "kg" | "lbs"): number => {
  if (unit === "kg") return value;
  return value * 0.453592;
};

export const calculateAge = (dateOfBirth: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }

  return age;
};
