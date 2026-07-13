import type { PersonDetailSearch } from '@/features/people/search';
import type { FarmerStorageLink } from '@/features/people/types';

export function personDetailSearchToFarmerLink(
  linkId: string,
  search: PersonDetailSearch,
): FarmerStorageLink | null {
  const name = search.name?.trim();
  const mobileNumber = search.mobileNumber?.trim();
  const address = search.address?.trim();

  if (!name || typeof search.accountNumber !== 'number' || !mobileNumber || !address) {
    return null;
  }

  return {
    _id: linkId,
    name,
    accountNumber: search.accountNumber,
    mobileNumber,
    address,
    costPerBag: search.costPerBag ?? 0,
    isActive: true,
  };
}

export function personDetailSearchToFarmerDisplay(search: PersonDetailSearch) {
  return {
    name: search.name?.trim() || 'Farmer',
    address: search.address?.trim() || '—',
    mobileNumber: search.mobileNumber?.trim() || '—',
    accountNumber: search.accountNumber,
  };
}
