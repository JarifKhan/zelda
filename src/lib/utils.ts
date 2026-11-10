import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function calculateSavingsPercent(price: number, compareAtPrice?: number | null): number | null {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

/**
 * Validates a US ZIP code: standard 5-digit (12345) or 9-digit ZIP+4 (12345-6789).
 */
export function isValidZipCode(postalCode: string): boolean {
  return /^\d{5}(-\d{4})?$/.test(postalCode.trim());
}
