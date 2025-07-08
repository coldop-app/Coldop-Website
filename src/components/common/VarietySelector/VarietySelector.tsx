import { useQuery } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useCallback } from "react";
import { storeAdminApi } from "@/lib/api/storeAdmin";
import debounce from "lodash/debounce";

interface VarietySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  token: string;
}

const VarietySelector = ({ value, onValueChange, token }: VarietySelectorProps) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState(value);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredVarieties, setFilteredVarieties] = useState<string[]>([]);

  // Fetch varieties
  const { data: varietiesData, isLoading: isLoadingVarieties } = useQuery({
    queryKey: ['varieties'],
    queryFn: () => storeAdminApi.getVarieties(token),
    enabled: !!token,
  });

  // Create a debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (varietiesData?.varieties) {
        const filtered = varietiesData.varieties.filter((variety: string) =>
          variety.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredVarieties(filtered);
      }
    }, 300),
    [varietiesData?.varieties]
  );

  // Update filtered varieties when data changes or search query changes
  useEffect(() => {
    if (varietiesData?.varieties) {
      if (searchQuery.trim() === '') {
        setFilteredVarieties(varietiesData.varieties);
      } else {
        debouncedSearch(searchQuery);
      }
    }
  }, [searchQuery, varietiesData?.varieties, debouncedSearch]);

  // Update search query when value changes externally
  useEffect(() => {
    setSearchQuery(value);
  }, [value]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    setShowDropdown(true);

    // If the input is cleared, also clear the selected value
    if (newValue === '') {
      onValueChange('');
    }
  };

  const handleSelectVariety = (selectedVariety: string) => {
    setSearchQuery(selectedVariety);
    onValueChange(selectedVariety);
    setShowDropdown(false);
  };

  const clearSelection = () => {
    setSearchQuery('');
    onValueChange('');
    setShowDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('variety-search-dropdown');
      const input = document.getElementById('variety-search-input');
      if (dropdown && input && !dropdown.contains(event.target as Node) && !input.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="border border-green-200 rounded-lg p-4 bg-green-50/50">
      <h3 className="text-lg font-medium mb-2">{t('incomingOrder.variety.title')}</h3>
      <p className="text-sm text-muted-foreground mb-4">{t('incomingOrder.variety.description')}</p>

      <div className="relative">
        <div className="relative">
          <input
            id="variety-search-input"
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setShowDropdown(true)}
            placeholder={t('incomingOrder.variety.selectPlaceholder')}
            disabled={isLoadingVarieties}
            className="w-full p-3 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-primary transition disabled:cursor-not-allowed disabled:opacity-50"
          />

          {isLoadingVarieties && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          )}

          {value && !isLoadingVarieties && (
            <button
              type="button"
              onClick={clearSelection}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              title="Clear selection"
            >
              <X size={16} className="text-gray-500" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showDropdown && (filteredVarieties.length > 0 || isLoadingVarieties) && (
          <div
            id="variety-search-dropdown"
            className="absolute left-0 right-0 top-full mt-1 max-h-60 overflow-auto z-50 bg-white rounded-md shadow-lg border border-gray-200"
          >
            {isLoadingVarieties ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2">{t('incomingOrder.variety.loading')}</span>
              </div>
            ) : (
              <div className="py-1">
                {filteredVarieties.length > 0 ? (
                  filteredVarieties.map((variety: string) => (
                    <button
                      key={variety}
                      type="button"
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors"
                      onClick={() => handleSelectVariety(variety)}
                    >
                      <div className="font-medium">{variety}</div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    {t('incomingOrder.variety.noResults')}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VarietySelector;