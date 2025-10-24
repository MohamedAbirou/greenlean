export const parseWeight = (weight: { kg?: string; lbs?: string } | string | number | undefined): number | null => {
  if (!weight) return null;
  if (typeof weight === "number") return weight;
  if (typeof weight === "string") return Number(weight) || null;
  if ("kg" in weight && weight.kg) return Number(weight.kg) || null;
  if ("lbs" in weight && weight.lbs) return Number(weight.lbs) * 0.453592 || null;
  return null;
}

export const parseHeight = (height: { cm?: string; ft?: string; in?: string } | string | number | undefined): number | null => {
  if (!height) return null;
  if (typeof height === "number") return height;
  if (typeof height === "string") return Number(height) || null;
  if ("cm" in height && height.cm) return Number(height.cm) || null;
  const ft = Number(height?.ft || 0);
  const inch = Number(height?.in || 0);
  return ft * 30.48 + inch * 2.54 || null;
}

export const toCSV = (value: any): string => {
  if (Array.isArray(value)) return value.join(", ");
  return value ? String(value) : "";
}
