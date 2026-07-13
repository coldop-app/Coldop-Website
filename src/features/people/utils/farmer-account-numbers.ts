import type { FarmerStorageLink } from '@/features/people/types';

export function getUsedAccountNumbers(links: FarmerStorageLink[]): number[] {
  return [...links.map((link) => link.accountNumber)].sort((a, b) => a - b);
}

export function getUsedMobileNumbers(links: FarmerStorageLink[]): string[] {
  return links.map((link) => link.mobileNumber);
}

export function getNextAccountNumber(usedAccountNumbers: number[]): number {
  if (usedAccountNumbers.length === 0) {
    return 1;
  }

  return Math.max(...usedAccountNumbers) + 1;
}
