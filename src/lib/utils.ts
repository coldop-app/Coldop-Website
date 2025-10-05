import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number | string): string {
  const number = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(number)) return '0';
  return number.toLocaleString('en-US');
}
