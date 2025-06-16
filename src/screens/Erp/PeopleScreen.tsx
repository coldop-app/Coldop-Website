import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RootState } from '@/store';
import { storeAdminApi } from '@/lib/api/storeAdmin';
import TopBar from '@/components/common/Topbar/Topbar';
import { Search, ChevronDown, Plus } from 'lucide-react';

interface Farmer {
  _id: string;
  name: string;
  address: string;
  mobileNumber: string;
  createdAt: string;
  imageUrl?: string;
}

interface ApiResponse {
  status: string;
  populatedFarmers: Farmer[];
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
  const [sortBy, setSortBy] = useState<'name' | 'createdAt'>('name');
  const [sortOpen, setSortOpen] = useState(false);
  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo);

  useEffect(() => {
    console.log("translation",t('people.title'));
  }, [t]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['farmers', adminInfo?.token],
    queryFn: () => storeAdminApi.getFarmers(adminInfo?.token || ''),
  });

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
    } else {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  if (isLoading && !farmers.length) {
    return (
      <>
        <TopBar title={t('people.title')} isSidebarOpen={false} setIsSidebarOpen={() => {}} />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
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
      <div className="p-4 sm:p-6">
        {/* Header with total count */}
        <div className="mb-4 sm:mb-6">
          <p className="text-sm sm:text-base font-medium text-gray-600">
            {t('people.total')}: {farmers.length} {t('people.people')}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Search Bar */}
          <div className="relative w-full">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('people.searchPlaceholder')}
                className="w-full px-4 py-2 pl-10 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>

          {/* Filters and Add Button */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative w-full sm:w-40">
              <button
                onClick={() => setSortOpen((v) => !v)}
                className="flex items-center w-full px-4 py-2 border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base justify-between"
              >
                {t('people.sortBy')}
                <ChevronDown size={18} className="ml-2 text-gray-400" />
              </button>
              {sortOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${sortBy === 'name' ? 'font-semibold' : ''}`}
                    onClick={() => { setSortBy('name'); setSortOpen(false); }}
                  >
                    {t('people.name')}
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${sortBy === 'createdAt' ? 'font-semibold' : ''}`}
                    onClick={() => { setSortBy('createdAt'); setSortOpen(false); }}
                  >
                    {t('people.recentlyAdded')}
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => alert(t('people.addNewPerson'))}
              className="w-full sm:w-auto px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors text-sm sm:text-base font-medium flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              {t('people.addFarmer')}
            </button>
          </div>
        </div>

        {/* People List */}
        <div className="space-y-4">
          {farmers.length === 0 ? (
            <div className="text-center py-8 text-sm sm:text-base text-gray-500">
              {t('people.noPeopleFound')}
            </div>
          ) : (
            farmers.map((farmer) => (
              <div
                key={farmer._id}
                className="bg-white rounded-lg shadow-md p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/erp/people/${farmer._id}`, {
                  state: {
                    farmer: {
                      _id: farmer._id,
                      name: farmer.name,
                      address: farmer.address,
                      mobileNumber: farmer.mobileNumber,
                      createdAt: farmer.createdAt,
                      imageUrl: farmer.imageUrl
                    }
                  }
                })}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary overflow-hidden">
                    {getInitials(farmer.name)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">{farmer.name}</h3>
                    <div className="mt-1 space-y-1">
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="font-medium">{t('people.mobile')}:</span> {farmer.mobileNumber}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="font-medium">{t('people.address')}:</span> {farmer.address}
                      </p>
                    </div>
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