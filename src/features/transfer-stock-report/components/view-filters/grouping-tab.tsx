import type { Column, GroupingState, RowData, Table } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, Layers3, ListTree, Plus, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GroupingTabProps<TData extends RowData> {
  table: Table<TData>;
  draftGrouping: GroupingState;
  onDraftGroupingChange: (grouping: GroupingState) => void;
}

interface ActiveGroupRowProps<TData extends RowData> {
  column: Column<TData, unknown>;
  index: number;
  total: number;
  onMove: (fromIndex: number, toIndex: number) => void;
  onRemove: (columnId: string) => void;
}

function getColumnLabel<TData extends RowData>(column: Column<TData, unknown>): string {
  return column.columnDef.meta?.filterLabel ?? column.id;
}

function moveGroup(grouping: GroupingState, fromIndex: number, toIndex: number): GroupingState {
  const next = [...grouping];
  const [removed] = next.splice(fromIndex, 1);
  if (!removed) return grouping;
  next.splice(toIndex, 0, removed);
  return next;
}

function ActiveGroupRow<TData extends RowData>({
  column,
  index,
  total,
  onMove,
  onRemove,
}: ActiveGroupRowProps<TData>) {
  const columnLabel = getColumnLabel(column);

  return (
    <div className="border-border bg-card flex min-h-12 items-center gap-3 rounded-xl border px-3 py-2 text-sm">
      <span className="bg-primary/10 text-primary flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-foreground truncate text-sm font-semibold" title={columnLabel}>
          {columnLabel}
        </p>
        <p className="text-muted-foreground text-xs">Group priority {index + 1}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          disabled={index === 0}
          onClick={() => onMove(index, index - 1)}
          aria-label={`Move ${columnLabel} group up`}
        >
          <ArrowUp className="size-3.5" aria-hidden />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          disabled={index === total - 1}
          onClick={() => onMove(index, index + 1)}
          aria-label={`Move ${columnLabel} group down`}
        >
          <ArrowDown className="size-3.5" aria-hidden />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => onRemove(column.id)}
          aria-label={`Remove ${columnLabel} group`}
        >
          <X className="size-3.5" aria-hidden />
        </Button>
      </div>
    </div>
  );
}

const GroupingTab = <TData extends RowData>({
  table,
  draftGrouping,
  onDraftGroupingChange,
}: GroupingTabProps<TData>) => {
  const groupableColumns = table.getAllLeafColumns().filter((column) => column.getCanGroup());
  const columnsById = new Map(groupableColumns.map((column) => [column.id, column]));
  const activeColumns = draftGrouping
    .map((columnId) => columnsById.get(columnId))
    .filter((column): column is Column<TData, unknown> => column != null);
  const availableColumns = groupableColumns.filter((column) => !draftGrouping.includes(column.id));

  const handleAddGroup = (columnId: string) => {
    onDraftGroupingChange([...draftGrouping, columnId]);
  };

  const handleRemoveGroup = (columnId: string) => {
    onDraftGroupingChange(draftGrouping.filter((groupedColumnId) => groupedColumnId !== columnId));
  };

  const handleMoveGroup = (fromIndex: number, toIndex: number) => {
    onDraftGroupingChange(moveGroup(draftGrouping, fromIndex, toIndex));
  };

  return (
    <div className="space-y-5 pt-4">
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Active groups
          </p>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="text-primary h-auto shrink-0 px-0"
            disabled={draftGrouping.length === 0}
            onClick={() => onDraftGroupingChange([])}
          >
            Clear all
          </Button>
        </div>

        {activeColumns.length > 0 ? (
          <div className="space-y-2">
            {activeColumns.map((column, index) => (
              <ActiveGroupRow
                key={column.id}
                column={column}
                index={index}
                total={activeColumns.length}
                onMove={handleMoveGroup}
                onRemove={handleRemoveGroup}
              />
            ))}
          </div>
        ) : (
          <div className="border-border bg-muted/10 flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed px-4 py-8 text-center">
            <span className="text-muted-foreground flex size-12 items-center justify-center rounded-xl">
              <ListTree className="size-9" aria-hidden />
            </span>
            <p className="text-foreground mt-3 text-sm font-semibold">No groups yet</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Add columns from below to group transfer stock rows together.
            </p>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Available columns
          </p>
          <span className="text-muted-foreground text-xs tabular-nums">
            {availableColumns.length.toLocaleString('en-IN')} available
          </span>
        </div>

        <div className="space-y-2">
          {availableColumns.length > 0 ? (
            availableColumns.map((column) => {
              const columnLabel = getColumnLabel(column);

              return (
                <div
                  key={column.id}
                  className="border-border bg-card flex min-h-12 items-center gap-3 rounded-xl border px-4 py-2 text-sm"
                >
                  <Layers3
                    className={cn(
                      'text-muted-foreground size-4 shrink-0',
                      column.getIsVisible() && 'text-primary',
                    )}
                    aria-hidden
                  />
                  <p
                    className="text-foreground min-w-0 flex-1 truncate text-sm font-medium"
                    title={columnLabel}
                  >
                    {columnLabel}
                  </p>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="text-primary h-auto shrink-0 gap-1 px-0"
                    onClick={() => handleAddGroup(column.id)}
                  >
                    <Plus className="size-4" aria-hidden />
                    Add
                  </Button>
                </div>
              );
            })
          ) : (
            <div className="border-border bg-muted/10 rounded-xl border border-dashed px-4 py-6 text-center">
              <p className="text-foreground text-sm font-medium">All columns are grouped</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Remove an active group to make it available again.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default GroupingTab;
