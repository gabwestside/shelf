import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatYear(dateStr?: string | null): string {
  if (!dateStr) return "";
  const match = dateStr.match(/^\d{4}/);
  return match ? match[0] : dateStr;
}

export function formatRating(rating?: number | null): string {
  if (rating === null || rating === undefined) return "—";
  return Number(rating).toFixed(1);
}
