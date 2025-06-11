import { useQuery } from '@tanstack/react-query';
import TopBar from '@/components/common/Topbar/Topbar';
import { storeAdminApi } from '@/lib/api/storeAdmin';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DeliveryVoucherCard from '@/components/vouchers/DeliveryVoucherCard';
import ReceiptVoucherCard from '@/components/vouchers/ReceiptVoucherCard';
import { Order } from '@/utils/types';
import { useTranslation } from 'react-i18next';

interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: number | null;
  previousPage: number | null;
}

interface ApiResponse {
  status: string;
  data: Order[];
  pagination: PaginationMeta;
}

type OrderType = 'all' | 'incoming' | 'outgoing';
type SortOrder = 'latest' | 'oldest';

interface SearchResponse {
  status: string;
  data: {
    incoming: Order[];
    outgoing: Order[];
  };
}

const DaybookScreen = () => {
  const { t } = useTranslation();
  const [sortBy, setSortBy] = useState<SortOrder>('latest');
  const [type, setType] = useState<OrderType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchReceiptNumber, setSearchReceiptNumber] = useState<string>('');
  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo);
  const navigate = useNavigate();

  const { data: searchData, isLoading: isSearchLoading, error: searchError } = useQuery({
    queryKey: ['searchReceipt', searchReceiptNumber],
    queryFn: () => storeAdminApi.searchReceipt(
      { receiptNumber: parseInt(searchReceiptNumber) },
      adminInfo?.token || ''
    ),
    enabled: searchReceiptNumber !== '',
    retry: false,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['daybookOrders', { type, sortBy, page: currentPage, limit: itemsPerPage }],
    queryFn: () => storeAdminApi.getDaybookOrders(
      { type, sortBy, page: currentPage, limit: itemsPerPage },
      adminInfo?.token || ''
    ),
    enabled: searchReceiptNumber === '',
  });

  // Handle search response data
  const searchResponse = searchData as SearchResponse;
  const apiResponse = searchReceiptNumber
    ? {
        data: [...(searchResponse?.data?.incoming || []), ...(searchResponse?.data?.outgoing || [])],
        pagination: null
      }
    : data as ApiResponse;

  const orders = apiResponse?.data || [];
  const pagination = apiResponse?.pagination;

  // Reset to first page when filters change
  const handleTypeChange = (newType: OrderType) => {
    setType(newType);
    setCurrentPage(1);
  };

  const handleSortChange = (newSort: SortOrder) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
  };

  // Pagination component
  const PaginationControls = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const getPageNumbers = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (
        let i = Math.max(2, pagination.currentPage - delta);
        i <= Math.min(pagination.totalPages - 1, pagination.currentPage + delta);
        i++
      ) {
        range.push(i);
      }

      if (pagination.currentPage - delta > 2) {
        rangeWithDots.push(1, '...');
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (pagination.currentPage + delta < pagination.totalPages - 1) {
        rangeWithDots.push('...', pagination.totalPages);
      } else if (pagination.totalPages > 1) {
        rangeWithDots.push(pagination.totalPages);
      }

      return rangeWithDots;
    };

    return (
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left side - Entries info and page size selector */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <span className="text-xs sm:text-sm text-gray-600">
              {t('daybook.showing')} <span className="font-medium">{((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}</span> {t('daybook.to')}{' '}
              <span className="font-medium">
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
              </span>{' '}
              {t('daybook.of')} <span className="font-medium">{pagination.totalItems}</span> {t('daybook.entries')}
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="w-full sm:w-auto px-3 py-1.5 border border-gray-300 rounded-lg text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value={5}>5 {t('daybook.perPage')}</option>
              <option value={10}>10 {t('daybook.perPage')}</option>
              <option value={20}>20 {t('daybook.perPage')}</option>
              <option value={50}>50 {t('daybook.perPage')}</option>
            </select>
          </div>

          {/* Right side - Pagination controls */}
          <div className="flex items-center gap-1 w-full sm:w-auto justify-center sm:justify-end">
            {/* First page button */}
            <button
              onClick={() => setCurrentPage(1)}
              disabled={!pagination.hasPreviousPage}
              className="p-1.5 sm:p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label={t('daybook.firstPage')}
            >
              <ChevronsLeft size={14} className="text-gray-600" />
            </button>

            {/* Previous page button */}
            <button
              onClick={() => setCurrentPage(pagination.previousPage!)}
              disabled={!pagination.hasPreviousPage}
              className="p-1.5 sm:p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label={t('daybook.previousPage')}
            >
              <ChevronLeft size={14} className="text-gray-600" />
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1 mx-2">
              {getPageNumbers().map((pageNum, index) => (
                <button
                  key={index}
                  onClick={() => typeof pageNum === 'number' && setCurrentPage(pageNum)}
                  disabled={pageNum === '...'}
                  className={`min-w-[28px] sm:min-w-[32px] h-7 sm:h-8 px-1.5 sm:px-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    pageNum === pagination.currentPage
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : pageNum === '...'
                      ? 'cursor-default'
                      : 'border border-gray-300 text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            {/* Next page button */}
            <button
              onClick={() => setCurrentPage(pagination.nextPage!)}
              disabled={!pagination.hasNextPage}
              className="p-1.5 sm:p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label={t('daybook.nextPage')}
            >
              <ChevronRight size={14} className="text-gray-600" />
            </button>

            {/* Last page button */}
            <button
              onClick={() => setCurrentPage(pagination.totalPages)}
              disabled={!pagination.hasNextPage}
              className="p-1.5 sm:p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label={t('daybook.lastPage')}
            >
              <ChevronsRight size={14} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading && !orders.length) {
    return (
      <>
        <TopBar title={t('daybook.title')} isSidebarOpen={false} setIsSidebarOpen={() => {}} />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <TopBar title={t('daybook.title')} isSidebarOpen={false} setIsSidebarOpen={() => {}} />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-red-500">{t('daybook.errorLoading')}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title={t('daybook.title')} isSidebarOpen={false} setIsSidebarOpen={() => {}} />
      <div className="p-4 sm:p-6">
        {/* Header with total count */}
        <div className="mb-4 sm:mb-6">
          {pagination && (
            <p className="text-sm sm:text-base font-medium text-gray-600">
              {t('daybook.totalOrders')}: {pagination.totalItems} {t('daybook.orders')}
            </p>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Search Receipt */}
          <div className="relative w-full">
            <div className="relative">
              <input
                type="number"
                value={searchReceiptNumber}
                onChange={(e) => setSearchReceiptNumber(e.target.value)}
                placeholder={t('daybook.searchPlaceholder')}
                className="w-full px-4 py-2 pl-10 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
            {searchReceiptNumber && (
              <button
                onClick={() => setSearchReceiptNumber('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>

          {/* Existing Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={type}
              onChange={(e) => handleTypeChange(e.target.value as OrderType)}
              className="w-full sm:w-auto px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base"
              disabled={searchReceiptNumber !== ''}
            >
              <option value="all">{t('daybook.allOrders')}</option>
              <option value="incoming">{t('daybook.incoming')}</option>
              <option value="outgoing">{t('daybook.outgoing')}</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortOrder)}
              className="w-full sm:w-auto px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base"
              disabled={searchReceiptNumber !== ''}
            >
              <option value="latest">{t('daybook.latestFirst')}</option>
              <option value="oldest">{t('daybook.oldestFirst')}</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/erp/incoming-order')}
                className="w-full sm:w-auto px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-colors text-sm sm:text-base font-medium"
              >
                {t('daybook.addIncoming')}
              </button>
              <button
                onClick={() => navigate('/erp/outgoing-order')}
                className="w-full sm:w-auto px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-colors text-sm sm:text-base font-medium"
              >
                {t('daybook.addOutgoing')}
              </button>
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {searchError && (
          <div className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm sm:text-base text-red-600">
              {searchError instanceof Error
                ? searchError.message
                : t('daybook.searchError')}
            </p>
          </div>
        )}

        {/* Loading indicator for search */}
        {isSearchLoading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-sm sm:text-base text-gray-600">{t('daybook.searching')}</span>
          </div>
        )}

        {/* Orders List */}
        <div className="space-y-4">
          {orders.length === 0 && !isLoading && !isSearchLoading ? (
            <div className="text-center py-8 text-sm sm:text-base text-gray-500">
              {searchReceiptNumber ? t('daybook.noReceiptFound') : t('daybook.noOrdersFound')}
            </div>
          ) : (
            orders.map((order: Order) => (
              order.voucher.type === 'DELIVERY' ? (
                <DeliveryVoucherCard key={order._id} order={order} />
              ) : (
                <ReceiptVoucherCard key={order._id} order={order} />
              )
            ))
          )}
        </div>

        {/* Pagination Controls - Only show when not searching */}
        {!searchReceiptNumber && pagination && pagination.totalPages > 1 && (
          <PaginationControls />
        )}
      </div>
    </>
  );
};

export default DaybookScreen;