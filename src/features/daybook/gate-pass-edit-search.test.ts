import { describe, expect, it } from 'vitest';

import { DEFAULT_DAYBOOK_SEARCH } from '@/features/daybook/search';
import {
  buildGatePassEditBackTarget,
  buildPeopleGatePassEditSearch,
  gatePassEditSearchSchema,
} from '@/features/daybook/gate-pass-edit-search';
import { FARMER_LINK_ID } from '@/test/fixtures';

describe('gatePassEditSearchSchema', () => {
  it('accepts an empty search object as the daybook default', () => {
    expect(gatePassEditSearchSchema.parse({})).toEqual({
      from: undefined,
      farmerId: undefined,
      name: undefined,
      mobileNumber: undefined,
      accountNumber: undefined,
      address: undefined,
      costPerBag: undefined,
    });
  });

  it('parses a people origin search', () => {
    expect(
      gatePassEditSearchSchema.parse({
        from: 'people',
        farmerId: FARMER_LINK_ID,
        name: 'Rajesh Kumar',
        accountNumber: '101',
      }),
    ).toEqual({
      from: 'people',
      farmerId: FARMER_LINK_ID,
      name: 'Rajesh Kumar',
      mobileNumber: undefined,
      accountNumber: 101,
      address: undefined,
      costPerBag: undefined,
    });
  });
});

describe('buildGatePassEditBackTarget', () => {
  it('returns daybook when origin is missing', () => {
    expect(buildGatePassEditBackTarget({})).toEqual({
      kind: 'daybook',
      to: '/daybook',
      search: DEFAULT_DAYBOOK_SEARCH,
      label: 'Back to Daybook',
    });
  });

  it('returns the farmer profile when origin is people', () => {
    const search = buildPeopleGatePassEditSearch(FARMER_LINK_ID, {
      name: 'Rajesh Kumar',
      mobileNumber: '9876543210',
      accountNumber: 101,
      address: 'Village Rampur',
      costPerBag: 12,
    });

    expect(buildGatePassEditBackTarget(search)).toEqual({
      kind: 'people',
      to: '/people/$id',
      params: { id: FARMER_LINK_ID },
      search: {
        name: 'Rajesh Kumar',
        mobileNumber: '9876543210',
        accountNumber: 101,
        address: 'Village Rampur',
        costPerBag: 12,
        tab: 'incoming',
      },
      label: 'Back to Farmer',
    });
  });

  it('returns daybook when from is people but farmerId is missing', () => {
    expect(buildGatePassEditBackTarget({ from: 'people' })).toEqual({
      kind: 'daybook',
      to: '/daybook',
      search: DEFAULT_DAYBOOK_SEARCH,
      label: 'Back to Daybook',
    });
  });
});
