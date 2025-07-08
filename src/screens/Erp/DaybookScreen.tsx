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
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 space-y-4">
          {/* Entries info and page size selector */}
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4">
            <div className="flex items-center gap-2 text-center sm:text-left">
              <div className="w-2 h-2 bg-primary/20 rounded-full"></div>
              <span className="text-sm text-gray-600">
                {t('daybook.showing')} <span className="font-medium text-gray-900">{((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}</span> {t('daybook.to')}{' '}
                <span className="font-medium text-gray-900">
                  {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                </span>{' '}
                {t('daybook.of')} <span className="font-medium text-gray-900">{pagination.totalItems}</span> {t('daybook.entries')}
              </span>
            </div>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="w-full sm:w-auto px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
            >
              <option value={5}>5 {t('daybook.perPage')}</option>
              <option value={10}>10 {t('daybook.perPage')}</option>
              <option value={20}>20 {t('daybook.perPage')}</option>
              <option value={50}>50 {t('daybook.perPage')}</option>
            </select>
          </div>

          {/* Pagination controls - Mobile optimized */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {/* Navigation buttons container */}
            <div className="flex items-center justify-center gap-1">
              {/* First page button */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={!pagination.hasPreviousPage}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                aria-label={t('daybook.firstPage')}
              >
                <ChevronsLeft size={16} className="text-gray-600" />
              </button>

              {/* Previous page button */}
              <button
                onClick={() => setCurrentPage(pagination.previousPage!)}
                disabled={!pagination.hasPreviousPage}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                aria-label={t('daybook.previousPage')}
              >
                <ChevronLeft size={16} className="text-gray-600" />
              </button>
            </div>

            {/* Page numbers - Centered and scrollable on mobile */}
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-1 max-w-[200px] sm:max-w-none overflow-x-auto scrollbar-hide px-2">
                {getPageNumbers().map((pageNum, index) => (
                  <button
                    key={index}
                    onClick={() => typeof pageNum === 'number' && setCurrentPage(pageNum)}
                    disabled={pageNum === '...'}
                    className={`flex-shrink-0 min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      pageNum === pagination.currentPage
                        ? 'bg-primary text-white hover:bg-primary/90'
                        : pageNum === '...'
                        ? 'cursor-default px-1'
                        : 'border border-gray-200 text-gray-700 hover:bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation buttons container */}
            <div className="flex items-center justify-center gap-1">
              {/* Next page button */}
              <button
                onClick={() => setCurrentPage(pagination.nextPage!)}
                disabled={!pagination.hasNextPage}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                aria-label={t('daybook.nextPage')}
              >
                <ChevronRight size={16} className="text-gray-600" />
              </button>

              {/* Last page button */}
              <button
                onClick={() => setCurrentPage(pagination.totalPages)}
                disabled={!pagination.hasNextPage}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                aria-label={t('daybook.lastPage')}
              >
                <ChevronsRight size={16} className="text-gray-600" />
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
      <div className="p-2 sm:p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Header with total count */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="h-6 w-6 sm:h-8 sm:w-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm6 6H7v2h6v-2z" clipRule="evenodd"/>
              </svg>
            </div>
            {pagination && (
              <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                {pagination.totalItems} <span className="text-gray-500 font-normal">{t('daybook.orders')}</span>
              </p>
            )}
          </div>
        </div>

                    {/* Search and Filters */}
        <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100 mb-4 sm:mb-6">
          <div className="space-y-4 sm:space-y-5">
            {/* Search Receipt */}
            <div className="relative">
              <div className="relative">
                <input
                  type="number"
                  value={searchReceiptNumber}
                  onChange={(e) => setSearchReceiptNumber(e.target.value)}
                  placeholder={t('daybook.searchPlaceholder')}
                  className="w-full px-4 py-2.5 sm:py-3 pl-11 border border-gray-200 rounded-lg bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base placeholder:text-gray-400 transition-all duration-200"
                />
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
              {searchReceiptNumber && (
                <button
                  onClick={() => setSearchReceiptNumber('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-all duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="w-full sm:w-[200px]">
                <select
                  value={type}
                  onChange={(e) => handleTypeChange(e.target.value as OrderType)}
                  className="w-full px-3 sm:px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
                  disabled={searchReceiptNumber !== ''}
                >
                  <option value="all">{t('daybook.allOrders')}</option>
                  <option value="incoming">{t('daybook.incoming')}</option>
                  <option value="outgoing">{t('daybook.outgoing')}</option>
                </select>
              </div>
              <div className="w-full sm:w-[200px]">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as SortOrder)}
                  className="w-full px-3 sm:px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
                  disabled={searchReceiptNumber !== ''}
                >
                  <option value="latest">{t('daybook.latestFirst')}</option>
                  <option value="oldest">{t('daybook.oldestFirst')}</option>
                </select>
              </div>
              <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-3 sm:ml-auto mt-1 sm:mt-0">
                <button
                  onClick={() => navigate('/erp/incoming-order')}
                  className="w-full sm:w-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-xs sm:text-sm lg:text-base font-medium inline-flex items-center justify-center gap-1 sm:gap-2 shadow-sm hover:shadow"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="truncate">{t('daybook.addIncoming')}</span>
                </button>
                <button
                  onClick={() => navigate('/erp/outgoing-order')}
                  className="w-full sm:w-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-xs sm:text-sm lg:text-base font-medium inline-flex items-center justify-center gap-1 sm:gap-2 shadow-sm hover:shadow"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="truncate">{t('daybook.addOutgoing')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {searchError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-base text-red-700">
                {searchError instanceof Error ? searchError.message : t('daybook.searchError')}
              </p>
            </div>
          </div>
        )}

        {/* Loading indicator for search */}
        {isSearchLoading && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-base text-blue-700">{t('daybook.searching')}</span>
            </div>
          </div>
        )}

        {/* Orders List */}
        <div className="space-y-4 w-full">
          {orders.length === 0 && !isLoading && !isSearchLoading ? (
            <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {searchReceiptNumber ? t('daybook.noReceiptFound') : t('daybook.noOrdersFound')}
                </h3>
                <p className="text-gray-500">
                  {searchReceiptNumber ? t('daybook.tryDifferentNumber') : t('daybook.createNewOrder')}
                </p>
              </div>
            </div>
          ) : (
            <div>
              {orders.map((order: Order) => (
                <div key={order._id} className="py-2 sm:py-3">
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