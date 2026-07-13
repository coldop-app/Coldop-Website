import { useState } from 'react';
import type {
  ColumnFiltersState,
  ColumnOrderState,
  GroupingState,
  Table,
  VisibilityState,
} from '@tanstack/react-table';
import { CheckCircle2, RotateCcw, SlidersHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { FarmerReportTableRow } from '@/features/people-report/utils/build-farmer-report-sections';
import { getStoredFarmerReportColumnState } from '@/features/people-report/utils/report-column-preferences';
import type { AdvancedReportGlobalFilter } from '@/features/people-report/utils/report-filter-fns';

import AdvancedTab from './advanced-tab';
import ColumnsTab from './columns-tab';
import FiltersTab from './filters-tab';
import GroupingTab from './grouping-tab';

interface ViewFiltersSheetProps {
  table: Table<FarmerReportTableRow>;
}

export function ViewFiltersSheet({ table }: ViewFiltersSheetProps) {
  const [open, setOpen] = useState(false);
  const [draftColumnFilters, setDraftColumnFilters] = useState<ColumnFiltersState>(
    () => table.getState().columnFilters,
  );
  const [draftColumnVisibility, setDraftColumnVisibility] = useState<VisibilityState>(
    () => table.getState().columnVisibility,
  );
  const [draftColumnOrder, setDraftColumnOrder] = useState<ColumnOrderState>(
    () => table.getState().columnOrder,
  );
  const [draftGrouping, setDraftGrouping] = useState<GroupingState>(
    () => table.getState().grouping,
  );
  const [draftGlobalFilter, setDraftGlobalFilter] = useState<AdvancedReportGlobalFilter>(() => ({
    logic: 'AND',
    conditions: [],
    ...table.getState().globalFilter,
  }));
  const activeFilterCount = table.getState().columnFilters.length;
  const activeGroupingCount = table.getState().grouping.length;
  const activeAdvancedCount =
    table
      .getState()
      .globalFilter?.conditions?.filter(
        (condition: { operator: string; value: string }) =>
          condition.operator === 'isEmpty' ||
          condition.operator === 'isNotEmpty' ||
          condition.value.trim().length > 0,
      ).length ?? 0;
  const hiddenColumnCount = table
    .getAllLeafColumns()
    .filter((column) => table.getState().columnVisibility[column.id] === false).length;
  const defaultColumnState = getStoredFarmerReportColumnState(
    table.getAllLeafColumns().map((column) => column.id),
  );
  const hasDraftViewChanges =
    draftColumnFilters.length > 0 ||
    !areVisibilityStatesEqual(draftColumnVisibility, defaultColumnState.columnVisibility) ||
    !areColumnOrdersEqual(draftColumnOrder, defaultColumnState.columnOrder) ||
    draftGrouping.length > 0 ||
    draftGlobalFilter.logic !== 'AND' ||
    draftGlobalFilter.conditions.length > 0;

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      const tableState = table.getState();

      setDraftColumnFilters(tableState.columnFilters);
      setDraftColumnVisibility(tableState.columnVisibility);
      setDraftColumnOrder(tableState.columnOrder);
      setDraftGrouping(tableState.grouping);
      setDraftGlobalFilter({
        logic: 'AND',
        conditions: [],
        ...tableState.globalFilter,
      });
    }

    setOpen(nextOpen);
  };

  const handleApplyChanges = () => {
    table.setColumnFilters(draftColumnFilters);
    table.setColumnVisibility(draftColumnVisibility);
    table.setColumnOrder(draftColumnOrder);
    table.setGrouping(draftGrouping);
    table.setExpanded(draftGrouping.length > 0 ? true : {});
    table.setGlobalFilter(draftGlobalFilter);
    table.setPageIndex(0);
    setOpen(false);
  };

  const handleResetChanges = () => {
    const nextColumnState = getStoredFarmerReportColumnState(
      table.getAllLeafColumns().map((column) => column.id),
    );

    setDraftColumnFilters([]);
    setDraftColumnVisibility(nextColumnState.columnVisibility);
    setDraftColumnOrder(nextColumnState.columnOrder);
    setDraftGrouping([]);
    setDraftGlobalFilter({ logic: 'AND', conditions: [] });

    table.setColumnFilters([]);
    table.setColumnVisibility(nextColumnState.columnVisibility);
    table.setColumnOrder(nextColumnState.columnOrder);
    table.setGrouping([]);
    table.setExpanded({});
    table.setGlobalFilter({ logic: 'AND', conditions: [] });
    table.setPageIndex(0);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="border-primary text-primary hover:bg-primary/10 hover:text-primary dark:border-border dark:bg-muted/20 dark:text-foreground dark:hover:bg-muted/40 dark:hover:text-foreground min-w-0 flex-1 gap-1.5 lg:flex-none"
          aria-label="View stock ledger filters"
        >
          <SlidersHorizontal className="size-4 shrink-0" aria-hidden />
          <span className="truncate">
            View filters
            {activeFilterCount > 0 ? ` (${activeFilterCount.toLocaleString('en-IN')})` : ''}
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex flex-col gap-0 p-0 data-[side=right]:w-full data-[side=right]:max-w-full sm:data-[side=right]:max-w-2xl lg:data-[side=right]:max-w-3xl"
      >
        <SheetHeader className="border-border/40 border-b py-4 pr-14 pl-5">
          <div className="flex items-center gap-3">
            <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
              <SlidersHorizontal className="size-4" aria-hidden />
            </span>
            <div className="min-w-0 space-y-0.5 text-left">
              <SheetTitle className="text-base leading-none font-semibold">
                View Settings
              </SheetTitle>
              <SheetDescription className="text-muted-foreground text-xs leading-snug">
                Manage stock ledger filters, columns, grouping, and default view.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <Tabs defaultValue="filters" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="filters">Filters</TabsTrigger>
              <TabsTrigger value="columns">
                Columns
                {hiddenColumnCount > 0 ? (
                  <span className="bg-primary/10 text-primary ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
                    {hiddenColumnCount.toLocaleString('en-IN')} hidden
                  </span>
                ) : null}
              </TabsTrigger>
              <TabsTrigger value="grouping">
                Grouping
                {activeGroupingCount > 0 ? (
                  <span className="bg-primary/10 text-primary ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
                    {activeGroupingCount.toLocaleString('en-IN')}
                  </span>
                ) : null}
              </TabsTrigger>
              <TabsTrigger value="advanced">
                Advanced
                {activeAdvancedCount > 0 ? (
                  <span className="bg-primary/10 text-primary ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
                    {activeAdvancedCount.toLocaleString('en-IN')}
                  </span>
                ) : null}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="filters">
              <FiltersTab
                key={open ? 'filters-open' : 'filters-closed'}
                table={table}
                draftColumnFilters={draftColumnFilters}
                onDraftColumnFiltersChange={setDraftColumnFilters}
              />
            </TabsContent>

            <TabsContent value="columns">
              <ColumnsTab
                table={table}
                draftColumnVisibility={draftColumnVisibility}
                draftColumnOrder={draftColumnOrder}
                onDraftColumnVisibilityChange={setDraftColumnVisibility}
                onDraftColumnOrderChange={setDraftColumnOrder}
              />
            </TabsContent>

            <TabsContent value="grouping">
              <GroupingTab
                table={table}
                draftGrouping={draftGrouping}
                onDraftGroupingChange={setDraftGrouping}
              />
            </TabsContent>

            <TabsContent value="advanced">
              <AdvancedTab
                table={table}
                draftGlobalFilter={draftGlobalFilter}
                onDraftGlobalFilterChange={setDraftGlobalFilter}
              />
            </TabsContent>
          </Tabs>
        </div>

        <SheetFooter className="border-border/40 grid grid-cols-1 gap-2 border-t px-5 py-4 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full gap-1.5"
            disabled={!hasDraftViewChanges}
            onClick={handleResetChanges}
          >
            <RotateCcw className="size-3.5" aria-hidden />
            Reset
          </Button>
          <Button type="button" size="sm" className="w-full gap-1.5" onClick={handleApplyChanges}>
            <CheckCircle2 className="size-3.5" aria-hidden />
            Apply changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function areVisibilityStatesEqual(a: VisibilityState, b: VisibilityState) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);

  for (const key of keys) {
    if (a[key] !== b[key]) return false;
  }

  return true;
}

function areColumnOrdersEqual(a: ColumnOrderState, b: ColumnOrderState) {
  return a.length === b.length && a.every((columnId, index) => columnId === b[index]);
}
