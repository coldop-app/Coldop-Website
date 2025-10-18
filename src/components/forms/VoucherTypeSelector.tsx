import React from 'react';
import { useTranslation } from 'react-i18next';

interface VoucherTypeSelectorProps {
  selectedType: 'receipt' | 'shed' | null;
  onTypeSelect: (type: 'receipt' | 'shed') => void;
}

const VoucherTypeSelector: React.FC<VoucherTypeSelectorProps> = ({
  selectedType,
  onTypeSelect
}) => {
  const { t } = useTranslation();

  return (
    <div className="w-full bg-background rounded-lg shadow-lg border border-border overflow-hidden">
      <div className="px-4 py-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Create Outgoing Order</h1>
          <p className="text-gray-600">Choose the type of voucher to create outgoing order from</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Receipt Voucher Option */}
          <button
            type="button"
            onClick={() => onTypeSelect('receipt')}
            className={`p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
              selectedType === 'receipt'
                ? 'border-primary bg-primary/5 shadow-lg'
                : 'border-gray-200 bg-white hover:border-primary/50'
            }`}
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Receipt Vouchers</h3>
              <p className="text-sm text-gray-600 mb-4">
                Create outgoing orders from incoming receipt vouchers. Select specific quantities from stored inventory.
              </p>
              <div className="text-xs text-gray-500 space-y-1">
                <div>• Select from existing inventory</div>
                <div>• Choose specific quantities</div>
                <div>• Filter by variety, generation, etc.</div>
              </div>
            </div>
          </button>

          {/* Shed Voucher Option */}
          <button
            type="button"
            onClick={() => onTypeSelect('shed')}
            className={`p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
              selectedType === 'shed'
                ? 'border-primary bg-primary/5 shadow-lg'
                : 'border-gray-200 bg-white hover:border-primary/50'
            }`}
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Shed Vouchers</h3>
              <p className="text-sm text-gray-600 mb-4">
                Create delivery orders from shed vouchers. Process items that have been moved to shed for sorting and cleaning.
              </p>
              <div className="text-xs text-gray-500 space-y-1">
                <div>• Process shed-sorted items</div>
                <div>• Create delivery vouchers</div>
                <div>• Direct from shed to delivery</div>
              </div>
            </div>
          </button>
        </div>

        {selectedType && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">
                Selected: {selectedType === 'receipt' ? 'Receipt Vouchers' : 'Shed Vouchers'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoucherTypeSelector;
