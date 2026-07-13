import type { DaybookFarmerStorageLink } from '@/features/daybook/types';
import type { FarmerStorageLink } from '@/features/people/types';

export function resolveFarmerStorageLinkId(
  daybookLink: DaybookFarmerStorageLink,
  farmerStorageLinks: FarmerStorageLink[],
): string {
  if (daybookLink._id) {
    return daybookLink._id;
  }

  const match = farmerStorageLinks.find((link) => link.accountNumber === daybookLink.accountNumber);

  return match?._id ?? '';
}
