import { memo, useMemo } from 'react';
import type { Ledger } from '@/services/accounting/ledgers/useGetAllLedgers';
import type { UpdateLedgerBody } from '@/services/accounting/ledgers/useUpdateLedger';
import { LEDGER_OPTIONS } from '@/types/ledger';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  SearchSelector,
  type Option,
} from '@/components/forms/search-selector';

const LEDGER_TYPES: UpdateLedgerBody['type'][] = [
  'Asset',
  'Liability',
  'Income',
  'Expense',
  'Equity',
];

const LEDGER_TYPE_OPTIONS: Option<UpdateLedgerBody['type']>[] =
  LEDGER_TYPES.map((t) => ({ value: t, label: t, searchableText: t }));

function toOption(s: string): Option<string> {
  return { value: s, label: s, searchableText: s };
}

export interface LedgerEditFormProps {
  ledger: Ledger | null;
  form: UpdateLedgerBody;
  setForm: React.Dispatch<React.SetStateAction<UpdateLedgerBody>>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isPending: boolean;
}

const LedgerEditForm = memo(function LedgerEditForm({
  ledger,
  form,
  setForm,
  onSubmit,
  onCancel,
  isPending,
}: LedgerEditFormProps) {
  const disabled = ledger?.isSystemLedger ?? false;

  const subTypeOptions = useMemo(() => {
    const typeOptions = LEDGER_OPTIONS[form.type];
    return Object.keys(typeOptions).map(toOption);
  }, [form.type]);

  const categoryOptions = useMemo(() => {
    const typeOptions = LEDGER_OPTIONS[form.type] as Record<
      string,
      readonly string[]
    >;
    const list = form.subType ? typeOptions[form.subType] ?? [] : [];
    return list.map(toOption);
  }, [form.type, form.subType]);

  return (
    <form onSubmit={onSubmit} className="font-custom flex flex-col gap-4 pt-2">
      <div className="space-y-2">
        <Label htmlFor="edit-ledger-name">Name</Label>
        <Input
          id="edit-ledger-name"
          placeholder="e.g. Bank, Cash"
          value={form.name}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, name: e.target.value }))
          }
          className="font-custom focus-visible:ring-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          required
          disabled={disabled}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-ledger-type">Type</Label>
        <SearchSelector<UpdateLedgerBody['type']>
          id="edit-ledger-type"
          options={LEDGER_TYPE_OPTIONS}
          placeholder="Select type..."
          searchPlaceholder="Search type..."
          value={form.type}
          onSelect={(v) =>
            setForm((prev) => ({
              ...prev,
              type: (v || 'Asset') as UpdateLedgerBody['type'],
              subType: '',
              category: '',
            }))
          }
          buttonClassName="font-custom focus-visible:ring-primary w-full justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-ledger-subType">Sub type</Label>
        <SearchSelector<string>
          id="edit-ledger-subType"
          options={subTypeOptions}
          placeholder="Select sub type..."
          searchPlaceholder="Search sub type..."
          value={form.subType}
          onSelect={(v) =>
            setForm((prev) => ({
              ...prev,
              subType: v ?? '',
              category: '',
            }))
          }
          buttonClassName="font-custom focus-visible:ring-primary w-full justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-ledger-category">Category</Label>
        <SearchSelector<string>
          id="edit-ledger-category"
          options={categoryOptions}
          placeholder="Select category..."
          searchPlaceholder="Search category..."
          value={form.category}
          onSelect={(v) =>
            setForm((prev) => ({ ...prev, category: v ?? '' }))
          }
          buttonClassName="font-custom focus-visible:ring-primary w-full justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-ledger-openingBalance">
          Opening balance (optional)
        </Label>
        <Input
          id="edit-ledger-openingBalance"
          type="number"
          step="any"
          placeholder="0"
          value={form.openingBalance ?? ''}
          onChange={(e) => {
            const v = e.target.value;
            setForm((prev) => ({
              ...prev,
              openingBalance:
                v === ''
                  ? undefined
                  : (() => {
                      const n = parseFloat(v);
                      return Number.isNaN(n) ? undefined : n;
                    })(),
            }));
          }}
          className="font-custom focus-visible:ring-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          className="font-custom focus-visible:ring-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="font-custom focus-visible:ring-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          disabled={isPending || !form.subType || !form.category}
        >
          {isPending ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  );
});

export default LedgerEditForm;
