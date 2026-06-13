// lib/validation.ts

export function validatePinCode(s: string): { valid: boolean; error?: string } {
  if (!s || s.trim() === "") return { valid: false, error: "Pin code is required" };
  if (!/^\d+$/.test(s)) return { valid: false, error: "Pin code must contain only numbers" };
  if (s.length !== 6) return { valid: false, error: "Pin code must be exactly 6 digits" };
  return { valid: true };
}

export function validateServingCount(n: number): { valid: boolean; error?: string } {
  if (n < 1) return { valid: false, error: "Serving count must be at least 1" };
  if (n > 50) return { valid: false, error: "Serving count cannot exceed 50" };
  return { valid: true };
}

export function validateBudget(n: number | null): { valid: boolean; error?: string } {
  if (n === null) return { valid: true };
  if (!Number.isInteger(n) || n < 1)
    return { valid: false, error: "Budget must be an integer ≥ 1" };
  return { valid: true };
}
