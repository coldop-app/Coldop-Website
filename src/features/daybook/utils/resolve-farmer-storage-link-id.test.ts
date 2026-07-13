import { describe, expect, it } from 'vitest';

import { resolveFarmerStorageLinkId } from '@/features/daybook/utils/resolve-farmer-storage-link-id';
import { FARMER_LINK_ID, makeFarmerStorageLink } from '@/test/fixtures';

describe('resolveFarmerStorageLinkId', () => {
  it('returns the daybook link _id when present', () => {
    expect(
      resolveFarmerStorageLinkId(
        {
          _id: FARMER_LINK_ID,
          name: 'Rajesh Kumar',
          accountNumber: 101,
          address: 'Village Rampur',
          mobileNumber: '9876543210',
        },
        [],
      ),
    ).toBe(FARMER_LINK_ID);
  });

  it('falls back to account number match when daybook _id is missing', () => {
    expect(
      resolveFarmerStorageLinkId(
        {
          name: 'Rajesh Kumar',
          accountNumber: 101,
          address: 'Village Rampur',
          mobileNumber: '9876543210',
        },
        [makeFarmerStorageLink()],
      ),
    ).toBe(FARMER_LINK_ID);
  });

  it('returns empty string when no match is found', () => {
    expect(
      resolveFarmerStorageLinkId(
        {
          name: 'Unknown',
          accountNumber: 999,
          address: '',
          mobileNumber: '',
        },
        [makeFarmerStorageLink()],
      ),
    ).toBe('');
  });
});
