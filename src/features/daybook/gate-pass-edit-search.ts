import type { useNavigate } from '@tanstack/react-router';
import { z } from 'zod';

import { DEFAULT_DAYBOOK_SEARCH, type DaybookSearch } from '@/features/daybook/search';
import type { PersonDetailSearch } from '@/features/people/search';

export const gatePassEditSearchSchema = z.object({
  from: z.literal('people').optional().catch(undefined),
  farmerId: z.string().optional().catch(undefined),
  name: z.string().optional().catch(undefined),
  mobileNumber: z.string().optional().catch(undefined),
  accountNumber: z.coerce.number().optional().catch(undefined),
  address: z.string().optional().catch(undefined),
  costPerBag: z.coerce.number().optional().catch(undefined),
});

export type GatePassEditSearch = z.infer<typeof gatePassEditSearchSchema>;

type GatePassEditPeopleBackTarget = {
  kind: 'people';
  to: '/people/$id';
  params: { id: string };
  search: {
    name?: string;
    mobileNumber?: string;
    accountNumber?: number;
    address?: string;
    costPerBag?: number;
    tab: 'incoming';
  };
  label: 'Back to Farmer';
};

type GatePassEditDaybookBackTarget = {
  kind: 'daybook';
  to: '/daybook';
  search: DaybookSearch;
  label: 'Back to Daybook';
};

export type GatePassEditBackTarget = GatePassEditPeopleBackTarget | GatePassEditDaybookBackTarget;

export function buildPeopleGatePassEditSearch(
  farmerId: string,
  personSearch: Pick<
    PersonDetailSearch,
    'name' | 'mobileNumber' | 'accountNumber' | 'address' | 'costPerBag'
  >,
): GatePassEditSearch {
  return {
    from: 'people',
    farmerId,
    name: personSearch.name,
    mobileNumber: personSearch.mobileNumber,
    accountNumber: personSearch.accountNumber,
    address: personSearch.address,
    costPerBag: personSearch.costPerBag,
  };
}

export function buildGatePassEditBackTarget(search: GatePassEditSearch): GatePassEditBackTarget {
  if (search.from === 'people' && search.farmerId) {
    return {
      kind: 'people',
      to: '/people/$id',
      params: { id: search.farmerId },
      search: {
        name: search.name,
        mobileNumber: search.mobileNumber,
        accountNumber: search.accountNumber,
        address: search.address,
        costPerBag: search.costPerBag,
        tab: 'incoming',
      },
      label: 'Back to Farmer',
    };
  }

  return {
    kind: 'daybook',
    to: '/daybook',
    search: DEFAULT_DAYBOOK_SEARCH,
    label: 'Back to Daybook',
  };
}

type AppNavigate = ReturnType<typeof useNavigate>;

export function navigateToGatePassEditBackTarget(
  navigate: AppNavigate,
  search: GatePassEditSearch,
) {
  const target = buildGatePassEditBackTarget(search);

  if (target.kind === 'people') {
    void navigate({
      to: target.to,
      params: target.params,
      search: target.search,
    });
    return;
  }

  void navigate({
    to: target.to,
    search: target.search,
  });
}
