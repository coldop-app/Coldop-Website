import type { FarmerStorageLink } from '@/features/people/types';

export function getLinkDisplayName(link: FarmerStorageLink): string {
  return link.name;
}

export function getLinkDisplayAddress(link: FarmerStorageLink): string {
  return link.address;
}

export function getLinkDisplayMobileNumber(link: FarmerStorageLink): string {
  return link.mobileNumber;
}
