import { useMemo, type MouseEvent } from 'react';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { DEFAULT_PAGE_SIZE_OPTIONS, PageSizeSelect } from '@/components/page-size-select';
import { cn } from '@/lib/utils';

type PaginationItemValue = number | 'ellipsis';

function getPaginationItems(currentPage: number, totalPages: number): PaginationItemValue[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const visiblePages = Array.from(
    new Set([1, currentPage - 1, currentPage, currentPage + 1, totalPages]),
  )
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  return visiblePages.reduce<PaginationItemValue[]>((items, page) => {
    const previousPage = items[items.length - 1];

    if (typeof previousPage === 'number') {
      if (page - previousPage === 2) {
        items.push(previousPage + 1);
      } else if (page - previousPage > 2) {
        items.push('ellipsis');
      }
    }

    items.push(page);
    return items;
  }, []);
}

function preventNavigation(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
}

export interface ListPaginationFooterProps {
  rangeStart: number;
  rangeEnd: number;
  totalItems: number;
  itemLabel: string;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onGoToPage?: (page: number) => void;
  pageSizeOptions?: readonly number[];
  isPreviousDisabled?: boolean;
  isNextDisabled?: boolean;
  isPageSizeDisabled?: boolean;
  showPageNumbers?: boolean;
  attached?: boolean;
  className?: string;
}

export function ListPaginationFooter({
  rangeStart,
  rangeEnd,
  totalItems,
  itemLabel,
  currentPage,
  totalPages,
  pageSize,
  onPageSizeChange,
  onPreviousPage,
  onNextPage,
  onGoToPage,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  isPreviousDisabled = false,
  isNextDisabled = false,
  isPageSizeDisabled = false,
  showPageNumbers = true,
  attached = true,
  className,
}: ListPaginationFooterProps) {
  const safeTotalPages = Math.max(totalPages, 1);
  const pageItems = useMemo(
    () => getPaginationItems(currentPage, safeTotalPages),
    [currentPage, safeTotalPages],
  );

  return (
    <div
      className={cn(
        'bg-muted/20 px-4 py-3 sm:px-5 sm:py-4',
        attached ? 'border-border/60 border-t' : 'border-border/60 rounded-xl border',
        className,
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <p className="text-muted-foreground text-center text-sm sm:text-left">
          Showing{' '}
          <span className="text-foreground font-medium tabular-nums">
            {rangeStart.toLocaleString('en-IN')}–{rangeEnd.toLocaleString('en-IN')}
          </span>{' '}
          of{' '}
          <span className="text-foreground font-medium tabular-nums">
            {totalItems.toLocaleString('en-IN')}
          </span>{' '}
          {itemLabel}
        </p>

        <div className="flex items-center justify-between gap-3 sm:justify-end sm:gap-4">
          <PageSizeSelect
            value={pageSize}
            onValueChange={onPageSizeChange}
            options={pageSizeOptions}
            disabled={isPageSizeDisabled}
          />

          <Pagination className="mx-0 w-auto shrink-0">
            <PaginationContent>
              {showPageNumbers ? (
                <PaginationItem className="hidden sm:list-item">
                  <PaginationLink
                    href="#"
                    aria-label="Go to first page"
                    aria-disabled={isPreviousDisabled}
                    tabIndex={isPreviousDisabled ? -1 : undefined}
                    className={cn('size-9', isPreviousDisabled && 'pointer-events-none opacity-50')}
                    onClick={(event) => {
                      preventNavigation(event);
                      if (isPreviousDisabled) return;
                      onGoToPage?.(1);
                    }}
                  >
                    <ChevronsLeft className="size-4" aria-hidden />
                  </PaginationLink>
                </PaginationItem>
              ) : null}

              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  text="Prev"
                  aria-disabled={isPreviousDisabled}
                  tabIndex={isPreviousDisabled ? -1 : undefined}
                  className={cn(isPreviousDisabled && 'pointer-events-none opacity-50')}
                  onClick={(event) => {
                    preventNavigation(event);
                    if (isPreviousDisabled) return;
                    onPreviousPage();
                  }}
                />
              </PaginationItem>

              {showPageNumbers
                ? pageItems.map((item, itemIndex) =>
                    typeof item === 'number' ? (
                      <PaginationItem key={`page-${item}`} className="hidden sm:list-item">
                        <PaginationLink
                          href="#"
                          isActive={item === currentPage}
                          onClick={(event) => {
                            preventNavigation(event);
                            onGoToPage?.(item);
                          }}
                        >
                          {item}
                        </PaginationLink>
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={`ellipsis-${itemIndex}`} className="hidden sm:list-item">
                        <PaginationEllipsis />
                      </PaginationItem>
                    ),
                  )
                : null}

              <PaginationItem>
                <span
                  className={cn(
                    'text-foreground flex h-10 min-w-16 items-center justify-center rounded-md px-2 text-sm font-medium tabular-nums',
                    showPageNumbers && 'sm:hidden',
                  )}
                  aria-live="polite"
                >
                  {currentPage} / {safeTotalPages}
                </span>
              </PaginationItem>

              <PaginationItem>
                <PaginationNext
                  href="#"
                  aria-disabled={isNextDisabled}
                  tabIndex={isNextDisabled ? -1 : undefined}
                  className={cn(isNextDisabled && 'pointer-events-none opacity-50')}
                  onClick={(event) => {
                    preventNavigation(event);
                    if (isNextDisabled) return;
                    onNextPage();
                  }}
                />
              </PaginationItem>

              {showPageNumbers ? (
                <PaginationItem className="hidden sm:list-item">
                  <PaginationLink
                    href="#"
                    aria-label="Go to last page"
                    aria-disabled={isNextDisabled}
                    tabIndex={isNextDisabled ? -1 : undefined}
                    className={cn('size-9', isNextDisabled && 'pointer-events-none opacity-50')}
                    onClick={(event) => {
                      preventNavigation(event);
                      if (isNextDisabled) return;
                      onGoToPage?.(safeTotalPages);
                    }}
                  >
                    <ChevronsRight className="size-4" aria-hidden />
                  </PaginationLink>
                </PaginationItem>
              ) : null}
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
