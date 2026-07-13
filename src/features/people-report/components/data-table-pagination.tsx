import { ListPaginationFooter } from '@/components/list-pagination-footer';

const PAGE_SIZE_OPTIONS = [10, 50, 100] as const;

interface DataTablePaginationProps {
  pageIndex: number;
  pageSize: number;
  totalRows: number;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  isDisabled?: boolean;
}

export function DataTablePagination({
  pageIndex,
  pageSize,
  totalRows,
  onPageChange,
  onPageSizeChange,
  isDisabled = false,
}: DataTablePaginationProps) {
  const pageCount = Math.max(Math.ceil(totalRows / pageSize), 1);
  const currentPage = pageIndex + 1;
  const rangeStart = totalRows === 0 ? 0 : Math.min(pageIndex * pageSize + 1, totalRows);
  const rangeEnd = totalRows === 0 ? 0 : Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <ListPaginationFooter
      rangeStart={rangeStart}
      rangeEnd={rangeEnd}
      totalItems={totalRows}
      itemLabel="gate passes"
      currentPage={currentPage}
      totalPages={pageCount}
      pageSize={pageSize}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      onPageSizeChange={onPageSizeChange}
      onPreviousPage={() => onPageChange(Math.max(pageIndex - 1, 0))}
      onNextPage={() => onPageChange(Math.min(pageIndex + 1, pageCount - 1))}
      onGoToPage={(page) => onPageChange(page - 1)}
      isPreviousDisabled={isDisabled || pageIndex <= 0}
      isNextDisabled={isDisabled || pageIndex >= pageCount - 1}
      isPageSizeDisabled={isDisabled}
    />
  );
}
