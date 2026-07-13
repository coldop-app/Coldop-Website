import { describe, expect, it } from 'vitest';

import type { OutgoingDaybookEntry } from '@/features/daybook/types';
import { outgoingDaybookEntryToEditFormValues } from '@/features/outgoing/utils/outgoing-daybook-entry-to-edit-form-values';
import { FARMER_LINK_ID, makeOutgoingDaybookEntry } from '@/test/fixtures';

describe('outgoingDaybookEntryToEditFormValues', () => {
  it('maps stockFilter from the daybook entry', () => {
    const entry = makeOutgoingDaybookEntry({
      stockFilter: 'Owned',
    });

    expect(
      outgoingDaybookEntryToEditFormValues(entry, {}, [
        { _id: FARMER_LINK_ID, accountNumber: 101 } as never,
      ]).stockFilter,
    ).toBe('Owned');
  });

  it('defaults stockFilter to an empty string when absent', () => {
    const entry = makeOutgoingDaybookEntry();
    delete (entry as Partial<OutgoingDaybookEntry>).stockFilter;

    expect(outgoingDaybookEntryToEditFormValues(entry).stockFilter).toBe('');
  });
});
