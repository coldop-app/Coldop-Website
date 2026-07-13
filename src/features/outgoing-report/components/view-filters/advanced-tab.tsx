import type { Column, Table } from '@tanstack/react-table';
import { Plus, RotateCcw, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { OutgoingGatePassReportRecord } from '@/features/outgoing-report/api/types';
import type {
  AdvancedFilterCondition,
  AdvancedFilterOperator,
  AdvancedReportGlobalFilter,
  OutgoingReportColumnId,
} from '@/features/outgoing-report/utils/report-filter-fns';
import { isAdvancedNumericColumn } from '@/features/outgoing-report/utils/report-filter-fns';
import { cn } from '@/lib/utils';

interface AdvancedTabProps {
  table: Table<OutgoingGatePassReportRecord>;
  draftGlobalFilter: AdvancedReportGlobalFilter;
  onDraftGlobalFilterChange: (filter: AdvancedReportGlobalFilter) => void;
}

type OperatorOption = {
  value: AdvancedFilterOperator;
  label: string;
  requiresValue?: boolean;
};

const STRING_OPERATOR_OPTIONS: OperatorOption[] = [
  { value: 'contains', label: 'contains', requiresValue: true },
  { value: 'notContains', label: 'does not contain', requiresValue: true },
  { value: 'equals', label: 'equals', requiresValue: true },
  { value: 'notEquals', label: 'does not equal', requiresValue: true },
  { value: 'startsWith', label: 'starts with', requiresValue: true },
  { value: 'endsWith', label: 'ends with', requiresValue: true },
  { value: 'isEmpty', label: 'is blank' },
  { value: 'isNotEmpty', label: 'is not blank' },
];

const NUMERIC_OPERATOR_OPTIONS: OperatorOption[] = [
  { value: 'equals', label: '=', requiresValue: true },
  { value: 'notEquals', label: '!=', requiresValue: true },
  { value: 'greaterThan', label: '>', requiresValue: true },
  {
    value: 'greaterThanOrEqual',
    label: '>=',
    requiresValue: true,
  },
  { value: 'lessThan', label: '<', requiresValue: true },
  {
    value: 'lessThanOrEqual',
    label: '<=',
    requiresValue: true,
  },
  { value: 'isEmpty', label: 'is blank' },
  { value: 'isNotEmpty', label: 'is not blank' },
];

const OPERATOR_OPTIONS = [...STRING_OPERATOR_OPTIONS, ...NUMERIC_OPERATOR_OPTIONS];

function getColumnLabel(column: Column<OutgoingGatePassReportRecord, unknown>) {
  return column.columnDef.meta?.filterLabel ?? column.id;
}

function getDefaultOperator(column: Column<OutgoingGatePassReportRecord, unknown>) {
  return isAdvancedNumericColumn(column.id) ? 'greaterThan' : 'contains';
}

function getOperatorOptions(column: Column<OutgoingGatePassReportRecord, unknown> | undefined) {
  return column && isAdvancedNumericColumn(column.id)
    ? NUMERIC_OPERATOR_OPTIONS
    : STRING_OPERATOR_OPTIONS;
}

function getColumnValueOptions(column: Column<OutgoingGatePassReportRecord, unknown> | undefined) {
  if (!column) return [];

  return Array.from(column.getFacetedUniqueValues().keys())
    .map((value) => String(value ?? '').trim())
    .filter((value) => value.length > 0)
    .sort((a, b) =>
      a.localeCompare(b, 'en-IN', {
        numeric: true,
        sensitivity: 'base',
      }),
    );
}

function createCondition(
  column: Column<OutgoingGatePassReportRecord, unknown>,
): AdvancedFilterCondition {
  return {
    id: `condition-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    columnId: column.id as OutgoingReportColumnId,
    operator: getDefaultOperator(column),
    value: '',
  };
}

function isValueRequired(operator: AdvancedFilterOperator) {
  return OPERATOR_OPTIONS.find((option) => option.value === operator)?.requiresValue;
}

const AdvancedTab = ({ table, draftGlobalFilter, onDraftGlobalFilterChange }: AdvancedTabProps) => {
  const columns = table.getAllLeafColumns();
  const columnsById = new Map(columns.map((column) => [column.id, column]));
  const conditions = draftGlobalFilter.conditions;
  const firstColumn = columns[0];

  const updateFilter = (next: Partial<AdvancedReportGlobalFilter>) => {
    onDraftGlobalFilterChange({
      ...draftGlobalFilter,
      ...next,
    });
  };

  const updateCondition = (conditionId: string, patch: Partial<AdvancedFilterCondition>) => {
    updateFilter({
      conditions: conditions.map((condition) =>
        condition.id === conditionId ? { ...condition, ...patch } : condition,
      ),
    });
  };

  const handleAddCondition = () => {
    if (!firstColumn) return;
    updateFilter({ conditions: [...conditions, createCondition(firstColumn)] });
  };

  const handleRemoveCondition = (conditionId: string) => {
    updateFilter({
      conditions: conditions.filter((condition) => condition.id !== conditionId),
    });
  };

  const handleColumnChange = (conditionId: string, columnId: string) => {
    const column = columnsById.get(columnId);
    if (!column) return;

    updateCondition(conditionId, {
      columnId: column.id as OutgoingReportColumnId,
      operator: getDefaultOperator(column),
      value: '',
    });
  };

  const handleReset = () => {
    onDraftGlobalFilterChange({
      logic: 'AND',
      conditions: [],
    });
  };

  const activeConditionCount = conditions.filter(
    (condition) => !isValueRequired(condition.operator) || condition.value.trim().length > 0,
  ).length;

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              Logic builder
            </p>
            <p className="text-muted-foreground text-sm">
              Combine conditions with AND / OR logic. For example, storage category equals Seed AND
              a bag size quantity &gt; 100.
            </p>
          </div>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="text-muted-foreground h-auto shrink-0 gap-1 px-0"
            disabled={conditions.length === 0 && draftGlobalFilter.logic === 'AND'}
            onClick={handleReset}
          >
            <RotateCcw className="size-3.5" aria-hidden />
            Reset
          </Button>
        </div>
      </div>

      <section className="border-border bg-card space-y-3 rounded-xl border p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-muted-foreground flex min-w-0 items-center gap-2 text-sm">
            <span>Match</span>
            <div className="bg-muted inline-flex rounded-full p-0.5">
              {(['AND', 'OR'] as const).map((logic) => (
                <button
                  key={logic}
                  type="button"
                  className={cn(
                    'rounded-full px-3 py-1 text-sm font-semibold transition-colors',
                    draftGlobalFilter.logic === logic
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                  onClick={() => updateFilter({ logic })}
                  aria-pressed={draftGlobalFilter.logic === logic}
                >
                  {logic}
                </button>
              ))}
            </div>
            <span>conditions</span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={!firstColumn}
            onClick={handleAddCondition}
          >
            <Plus className="size-4" aria-hidden />
            Condition
          </Button>
        </div>

        {conditions.length > 0 ? (
          <div className="space-y-2">
            {conditions.map((condition) => {
              const selectedColumn = columnsById.get(String(condition.columnId));
              const operatorOptions = getOperatorOptions(selectedColumn);
              const effectiveOperator = operatorOptions.some(
                (option) => option.value === condition.operator,
              )
                ? condition.operator
                : selectedColumn
                  ? getDefaultOperator(selectedColumn)
                  : condition.operator;
              const needsValue = isValueRequired(effectiveOperator);
              const isNumericColumn =
                selectedColumn != null && isAdvancedNumericColumn(selectedColumn.id);
              const valueOptions = getColumnValueOptions(selectedColumn);
              const valueListId = `advanced-filter-values-${condition.id}`;

              return (
                <div
                  key={condition.id}
                  className="border-border bg-background grid gap-2 rounded-xl border p-2 sm:grid-cols-[minmax(0,1fr)_minmax(8rem,0.9fr)_minmax(0,1.4fr)_auto] sm:items-center"
                >
                  <Select
                    value={String(condition.columnId)}
                    onValueChange={(value) => handleColumnChange(condition.id, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Column" />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((column) => (
                        <SelectItem key={column.id} value={column.id}>
                          {getColumnLabel(column)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={effectiveOperator}
                    onValueChange={(value) =>
                      updateCondition(condition.id, {
                        operator: value as AdvancedFilterOperator,
                        value: value === 'isEmpty' || value === 'isNotEmpty' ? '' : condition.value,
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Operator" />
                    </SelectTrigger>
                    <SelectContent>
                      {operatorOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="text"
                    value={condition.value}
                    disabled={!needsValue}
                    list={needsValue ? valueListId : undefined}
                    inputMode={isNumericColumn ? 'decimal' : 'text'}
                    placeholder={
                      needsValue
                        ? isNumericColumn
                          ? 'Enter number...'
                          : 'Select or type value...'
                        : 'No value needed'
                    }
                    onChange={(event) =>
                      updateCondition(condition.id, {
                        value: event.target.value,
                      })
                    }
                    className="h-10"
                  />
                  {needsValue ? (
                    <datalist id={valueListId}>
                      {valueOptions.map((value) => (
                        <option key={value} value={value} />
                      ))}
                    </datalist>
                  ) : null}

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="justify-self-end"
                    onClick={() => handleRemoveCondition(condition.id)}
                    aria-label="Remove condition"
                  >
                    <X className="size-4" aria-hidden />
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="border-border bg-muted/10 rounded-xl border border-dashed px-4 py-8 text-center">
            <p className="text-foreground text-sm font-semibold">No advanced logic yet</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Add a condition to filter rows with AND / OR rules.
            </p>
          </div>
        )}

        <p className="text-muted-foreground text-xs tabular-nums">
          {activeConditionCount.toLocaleString('en-IN')} active condition
          {activeConditionCount === 1 ? '' : 's'}
        </p>
      </section>
    </div>
  );
};

export default AdvancedTab;
