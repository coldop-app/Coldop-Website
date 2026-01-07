import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { storeAdminApi } from '@/lib/api/storeAdmin';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '../constants';

const ClosingBalances = () => {
  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo);

  const { data, isLoading } = useQuery({
    queryKey: ['closingBalances'],
    queryFn: () => storeAdminApi.getClosingBalances(adminInfo?.token || ''),
    enabled: !!adminInfo?.token
  });

  if (isLoading) {
    return (
      <Card className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="text-center py-8 text-gray-500">Loading closing balances...</div>
      </Card>
    );
  }

  const closingBalances = data?.data;
  if (!closingBalances) {
    return (
      <Card className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="text-center py-8 text-gray-500">No data available</div>
      </Card>
    );
  }

  // Group by category and sub-type
  const groupedData: { [key: string]: { [key: string]: any[] } } = {};
  const totals: { [key: string]: number } = {};

  Object.keys(closingBalances).forEach((type) => {
    if (!groupedData[type]) {
      groupedData[type] = {};
      totals[type] = 0;
    }

    closingBalances[type].forEach((ledger: any) => {
      const category = ledger.category;
      if (!groupedData[type][category]) {
        groupedData[type][category] = [];
      }
      groupedData[type][category].push(ledger);
      totals[type] += ledger.closingBalance || 0;
    });
  });

  return (
    <Card className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold mb-2 text-gray-900">Closing Balances Report</h2>
      <p className="text-sm text-gray-600 mb-6">
        Closing balances of all ledgers that form the basis of financial statements.
      </p>

      {Object.keys(groupedData).map((type) => {
        if (closingBalances[type].length === 0) return null;

        return (
          <div key={type} className="mb-6">
            <div className="bg-primary text-white rounded-lg p-3 mb-3 flex justify-between items-center">
              <span className="font-semibold">{type}</span>
              <span className="font-bold">Total: {formatCurrency(totals[type])}</span>
            </div>

            <div className="space-y-4">
              {Object.keys(groupedData[type]).map((category) => {
                const categoryTotal = groupedData[type][category].reduce(
                  (sum, ledger) => sum + (ledger.closingBalance || 0),
                  0
                );
                const subType = groupedData[type][category][0]?.subType;

                return (
                  <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-semibold text-gray-900">{category}</span>
                          <span className="text-sm text-gray-600 ml-2">({subType})</span>
                        </div>
                        <span className="font-medium text-gray-900">{formatCurrency(categoryTotal)}</span>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {groupedData[type][category].map((ledger: any) => (
                        <div key={ledger._id} className="px-4 py-2 hover:bg-gray-50">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700 ml-4">{ledger.name}</span>
                            <span className="text-gray-900 font-medium">
                              {formatCurrency(ledger.closingBalance || 0)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </Card>
  );
};

export default ClosingBalances;
