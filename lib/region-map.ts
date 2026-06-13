// lib/region-map.ts

export const REGION_MAP: Record<string, string> = {
  "110": "Delhi",
  "400": "Mumbai",
  "560": "Bangalore",
  "600": "Chennai",
  "641": "Coimbatore",
  "700": "Kolkata",
  "500": "Hyderabad",
  "380": "Ahmedabad",
  "411": "Pune",
  "302": "Jaipur",
  "226": "Lucknow",
};

export function resolveRegion(pinCode: string): string | null {
  if (!pinCode || pinCode.length < 3) return null;
  const prefix = pinCode.slice(0, 3);
  return REGION_MAP[prefix] ?? null;
}
