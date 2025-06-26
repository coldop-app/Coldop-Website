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
        <div className="px-3 sm:px-6 py-4 flex flex-col gap-4">
          {/* Top row - Entries info and page size selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <span className="text-xs text-gray-600 whitespace-nowrap">
              {t('daybook.showing')} <span className="font-medium">{((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}</span> {t('daybook.to')}{' '}
              <span className="font-medium">
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
              </span>{' '}
              {t('daybook.of')} <span className="font-medium">{pagination.totalItems}</span> {t('daybook.entries')}
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="w-auto px-2 py-1 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value={5}>5 {t('daybook.perPage')}</option>
              <option value={10}>10 {t('daybook.perPage')}</option>
              <option value={20}>20 {t('daybook.perPage')}</option>
              <option value={50}>50 {t('daybook.perPage')}</option>
            </select>
          </div>

          {/* Bottom row - Pagination controls */}
          <div className="flex items-center justify-between gap-2">
            {/* Navigation buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={!pagination.hasPreviousPage}
                className="p-1.5 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label={t('daybook.firstPage')}
              >
                <ChevronsLeft size={12} className="text-gray-600" />
              </button>
              <button
                onClick={() => setCurrentPage(pagination.previousPage!)}
                disabled={!pagination.hasPreviousPage}
                className="p-1.5 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label={t('daybook.previousPage')}
              >
                <ChevronLeft size={12} className="text-gray-600" />
              </button>
            </div>

            {/* Page numbers - mobile optimized */}
            <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] sm:max-w-none">
              {getPageNumbers().slice(0, 5).map((pageNum, index) => (
                <button
                  key={index}
                  onClick={() => typeof pageNum === 'number' && setCurrentPage(pageNum)}
                  disabled={pageNum === '...'}
                  className={`min-w-[24px] h-6 px-1 rounded text-xs font-medium transition-colors flex-shrink-0 ${
                    pageNum === pagination.currentPage
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : pageNum === '...'
                      ? 'cursor-default text-gray-400'
                      : 'border border-gray-300 text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(pagination.nextPage!)}
                disabled={!pagination.hasNextPage}
                className="p-1.5 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label={t('daybook.nextPage')}
              >
                <ChevronRight size={12} className="text-gray-600" />
              </button>
              <button
                onClick={() => setCurrentPage(pagination.totalPages)}
                disabled={!pagination.hasNextPage}
                className="p-1.5 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label={t('daybook.lastPage')}
              >
                <ChevronsRight size={12} className="text-gray-600" />
              </button>
            </div>
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
      <div className="p-2 sm:p-4 lg:p-6 w-full max-w-full overflow-x-hidden min-h-0">
        {/* Header with total count */}
        <div className="mb-3 sm:mb-4">
          {pagination && (
            <p className="text-sm font-medium text-gray-600">
              Total: {pagination.totalItems} orders
            </p>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-3 mb-4">
          {/* Search Receipt */}
          <div className="relative w-full">
            <div className="relative">
              <input
                type="number"
                value={searchReceiptNumber}
                onChange={(e) => setSearchReceiptNumber(e.target.value)}
                placeholder="Search by receipt number..."
                className="w-full px-3 py-2 pl-8 pr-8 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              />
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            </div>
            {searchReceiptNumber && (
              <button
                onClick={() => setSearchReceiptNumber('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg w-6 h-6 flex items-center justify-center"
              >
                ×
              </button>
            )}
          </div>

          {/* Existing Filters */}
          <div className="flex flex-col gap-3">
            {/* Filter Selects */}
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:gap-3">
              <select
                value={type}
                onChange={(e) => handleTypeChange(e.target.value as OrderType)}
                className="px-2 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs sm:text-sm truncate"
                disabled={searchReceiptNumber !== ''}
              >
                <option value="all">All Orders</option>
                <option value="incoming">Incoming</option>
                <option value="outgoing">Outgoing</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as SortOrder)}
                className="px-2 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs sm:text-sm truncate"
                disabled={searchReceiptNumber !== ''}
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
            
            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row">
              <button
                onClick={() => navigate('/erp/incoming-order')}
                className="px-2 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-colors text-xs font-medium whitespace-nowrap overflow-hidden text-ellipsis"
              >
                + Incoming
              </button>
              <button
                onClick={() => navigate('/erp/outgoing-order')}
                className="px-2 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-colors text-xs font-medium whitespace-nowrap overflow-hidden text-ellipsis"
              >
                + Outgoing
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
        <div className="space-y-4 w-full">
          {orders.length === 0 && !isLoading && !isSearchLoading ? (
            <div className="text-center py-8 text-sm text-gray-500">
              {searchReceiptNumber ? t('daybook.noReceiptFound') : t('daybook.noOrdersFound')}
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order: Order) => (
                <div key={order._id} className="w-full">
                  {order.voucher.type === 'DELIVERY' ? (
                    <DeliveryVoucherCard order={order} />
                  ) : (
                    <ReceiptVoucherCard order={order} />
                  )}
                </div>
              ))}
            </div>
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