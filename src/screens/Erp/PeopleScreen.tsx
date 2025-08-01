import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RootState } from '@/store';
import { storeAdminApi } from '@/lib/api/storeAdmin';
import TopBar from '@/components/common/Topbar/Topbar';
import { Search, ChevronDown, Plus, Users2, MapPin, Phone } from 'lucide-react';
import NewFarmerModal, { NewFarmerFormData } from '@/components/modals/NewFarmerModal';
import toast from 'react-hot-toast';

interface Farmer {
  _id: string;
  name: string;
  address: string;
  mobileNumber: string;
  farmerId: string;
  createdAt: string;
  imageUrl?: string;
}

interface ApiResponse {
  status: string;
  populatedFarmers: Farmer[];
}

interface ApiError extends Error {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const PeopleScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'farmerId'>('farmerId');
  const [sortOpen, setSortOpen] = useState(false);
  const [isNewFarmerModalOpen, setIsNewFarmerModalOpen] = useState(false);
  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo);

  useEffect(() => {
    console.log("translation",t('people.title'));
  }, [t]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['farmers', adminInfo?.token],
    queryFn: () => storeAdminApi.getFarmers(adminInfo?.token || ''),
  });

  // Create farmer mutation
  const createFarmerMutation = useMutation({
    mutationFn: async (farmerData: NewFarmerFormData) => {
      if (!adminInfo?.token) {
        throw new Error("No authentication token found");
      }
      return storeAdminApi.quickRegister({
        name: farmerData.name,
        address: farmerData.address,
        mobileNumber: farmerData.contact,
        password: "123456", // Hardcoded default password
        imageUrl: "",
        farmerId: farmerData.accNo
      }, adminInfo.token);
    },
    onSuccess: () => {
      toast.success(t('people.success.farmerCreated'));
      setIsNewFarmerModalOpen(false);
      refetch(); // Refresh the farmers list
    },
    onError: (error: unknown) => {
      console.error("Error creating farmer:", error);
      if (error instanceof Error) {
        const apiError = error as ApiError;
        toast.error(apiError.response?.data?.message || t('people.errors.failedToCreateFarmer'));
      } else {
        toast.error(t('people.errors.failedToCreateFarmer'));
      }
    }
  });

  const handleNewFarmerSubmit = async (farmerData: NewFarmerFormData) => {
    createFarmerMutation.mutate(farmerData);
  };

  const apiResponse = data as ApiResponse;
  let farmers = apiResponse?.populatedFarmers || [];

  // Filter
  if (searchQuery) {
    farmers = farmers.filter(farmer =>
      farmer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.mobileNumber.includes(searchQuery) ||
      farmer.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Sort
  farmers = [...farmers].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'farmerId') {
      return parseInt(a.farmerId) - parseInt(b.farmerId);
    } else {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  // Check if running in webview
  const isWebView = () => {
    return window.ReactNativeWebView !== undefined;
  };

  if (isLoading && !farmers.length) {
    return (
      <>
        <TopBar title={t('people.title')} isSidebarOpen={false} setIsSidebarOpen={() => {}} />
        {!isWebView() && (
          <div className="flex items-center justify-center h-[calc(100vh-64px)]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}
      </>
    );
  }

  if (error) {
    return (
      <>
        <TopBar title={t('people.title')} isSidebarOpen={false} setIsSidebarOpen={() => {}} />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-red-500">{t('people.errorLoading')}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title={t('people.title')} isSidebarOpen={false} setIsSidebarOpen={() => {}} />
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header with total count */}
        <div className="flex items-center justify-between mb-6 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users2 className="h-5 w-5 text-primary" />
            </div>
            <p className="text-base font-semibold text-gray-900">
              {farmers.length} <span className="text-gray-500 font-normal">{t('people.people')}</span>
            </p>
          </div>
        </div>

        {/* Add NewFarmerModal */}
        <NewFarmerModal
          isOpen={isNewFarmerModalOpen}
          onClose={() => setIsNewFarmerModalOpen(false)}
          onSubmit={handleNewFarmerSubmit}
          isLoading={createFarmerMutation.isPending}
          token={adminInfo?.token || ''}
        />

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-6">
          <div className="space-y-4 sm:space-y-5">
            {/* Search Bar */}
            <div className="relative">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('people.searchPlaceholder')}
                  className="w-full px-4 py-2.5 sm:py-3 pl-11 border border-gray-200 rounded-lg bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base placeholder:text-gray-400 transition-all duration-200"
                />
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
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
                <button
                  onClick={() => setSortOpen((v) => !v)}
                  className="w-full px-3 sm:px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base transition-all duration-200 flex items-center justify-between"
                >
                  <span className="text-gray-700">
                    {sortBy === 'name' 
                      ? t('people.name') 
                      : sortBy === 'farmerId'
                      ? 'Account Number'
                      : t('people.recentlyAdded')}
                  </span>
                  <ChevronDown size={18} className="text-gray-400" />
                </button>
                {sortOpen && (
                  <div className="absolute z-10 mt-1 w-[200px] bg-white border border-gray-200 rounded-lg shadow-lg">
                    <button
                      className={`block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50/50 transition-colors ${sortBy === 'name' ? 'text-primary font-medium bg-primary/5' : 'text-gray-700'}`}
                      onClick={() => { setSortBy('name'); setSortOpen(false); }}
                    >
                      {t('people.name')}
                    </button>
                    <button
                      className={`block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50/50 transition-colors ${sortBy === 'farmerId' ? 'text-primary font-medium bg-primary/5' : 'text-gray-700'}`}
                      onClick={() => { setSortBy('farmerId'); setSortOpen(false); }}
                    >
                      Account Number
                    </button>
                    <button
                      className={`block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50/50 transition-colors ${sortBy === 'createdAt' ? 'text-primary font-medium bg-primary/5' : 'text-gray-700'}`}
                      onClick={() => { setSortBy('createdAt'); setSortOpen(false); }}
                    >
                      {t('people.recentlyAdded')}
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsNewFarmerModalOpen(true)}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-sm sm:text-base font-medium inline-flex items-center justify-center gap-2 shadow-sm hover:shadow"
              >
                <Plus size={18} />
                {t('people.addFarmer')}
              </button>
            </div>
          </div>
        </div>

        {/* People List */}
        <div className="space-y-4">
          {farmers.length === 0 ? (
            <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Users2 className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {t('people.noPeopleFound')}
                </h3>
                <p className="text-gray-500">
                  {t('people.addNewFarmer')}
                </p>
              </div>
            </div>
          ) : (
            farmers.map((farmer) => (
              <div
                key={farmer._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 cursor-pointer hover:shadow-md transition-all duration-200"
                onClick={() => navigate(`/erp/people/${farmer._id}`, {
                  state: {
                    farmer: {
                      _id: farmer._id,
                      name: farmer.name,
                      address: farmer.address,
                      mobileNumber: farmer.mobileNumber,
                      farmerId: farmer.farmerId,
                      createdAt: farmer.createdAt,
                      imageUrl: farmer.imageUrl
                    }
                  }
                })}
              >
                <div className="flex items-start gap-4 sm:gap-6">
                  {/* Avatar */}
                  <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary overflow-hidden border-2 border-white shadow-sm">
                    {farmer.imageUrl ? (
                      <img src={farmer.imageUrl} alt={farmer.name} className="w-full h-full object-cover" />
                    ) : (
                      getInitials(farmer.name)
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">{farmer.name}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="16" rx="2" />
                          <path d="M8 8h8M8 12h8M8 16h4" />
                        </svg>
                        <span>Account Number: {farmer.farmerId}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={16} className="text-gray-400" />
                        <span>{farmer.mobileNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={16} className="text-gray-400" />
                        <span>{farmer.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Arrow indicator */}
                  <div className="hidden sm:flex items-center self-center">
                    <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default PeopleScreen;