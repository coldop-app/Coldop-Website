import { useCallback, useMemo, useState } from 'react';
import { getRouteApi, Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { usePreferencesStore } from '@/features/auth/store/use-preferences-store';
import { useLedgers } from '@/features/finances/api/use-ledgers';
import { DEFAULT_FINANCES_PERIOD } from '@/features/finances/shared/constants';
import { EditFarmerDialog } from '@/features/people/components/edit-farmer-dialog';
import { FarmerFinancesDialog } from '@/features/people/components/farmer-finances/farmer-finances-dialog';
import { FarmerGatePassesSection } from '@/features/people/components/farmer-gate-passes-section';
import {
  FarmerProfileCard,
  type FarmerBagTotals,
} from '@/features/people/components/farmer-profile-card';
import type { PersonDetailSearch } from '@/features/people/search';
import type { FarmerStorageLink } from '@/features/people/types';
import { personDetailSearchToFarmerLink } from '@/features/people/utils/person-detail-search';

const peopleDetailRouteApi = getRouteApi('/_authenticated/people/$id');

const EMPTY_BAG_TOTALS: FarmerBagTotals = {
  incomingGatePasses: 0,
  outgoingGatePasses: 0,
  incomingBags: 0,
  outgoingBags: 0,
  transferIncomingBags: 0,
  transferOutgoingBags: 0,
};

type FarmerProfilePageProps = {
  linkId: string;
  search: PersonDetailSearch;
};

export function FarmerProfilePage({ linkId, search }: FarmerProfilePageProps) {
  const navigate = peopleDetailRouteApi.useNavigate();
  const appNavigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [financesOpen, setFinancesOpen] = useState(false);
  const [bagTotals, setBagTotals] = useState(EMPTY_BAG_TOTALS);
  const [isLoadingTotals, setIsLoadingTotals] = useState(true);

  const showFinances = usePreferencesStore((s) => s.preferences?.showFinances ?? true);

  const editLink = useMemo(() => personDetailSearchToFarmerLink(linkId, search), [linkId, search]);

  const displayName = search.name?.trim() || 'Farmer';
  const accountLabel =
    typeof search.accountNumber === 'number' ? `Account #${search.accountNumber}` : 'Account';

  const { ledgers: farmerLedgers, isLoading: isLoadingFarmerLedger } = useLedgers({
    farmerStorageLinkId: linkId,
  });
  const farmerLedger = farmerLedgers[0] ?? null;

  const handleSummariesChange = useCallback((totals: FarmerBagTotals, isLoading: boolean) => {
    setBagTotals(totals);
    setIsLoadingTotals(isLoading);
  }, []);

  const handleEditSuccess = (updatedLink: FarmerStorageLink) => {
    navigate({
      search: (current) => ({
        ...current,
        name: updatedLink.name,
        mobileNumber: updatedLink.mobileNumber,
        accountNumber: updatedLink.accountNumber,
        address: updatedLink.address,
        costPerBag: updatedLink.costPerBag,
      }),
    });
  };

  const handleStockLedgerClick = () => {
    void navigate({
      to: './report',
      search,
    });
  };

  const handleFinancialLedgerClick = () => {
    if (!farmerLedger) {
      toast.error('No financial ledger found for this farmer.');
      return;
    }

    void appNavigate({
      to: '/finances/ledgers/$id',
      params: { id: farmerLedger.id },
      search: {
        period: DEFAULT_FINANCES_PERIOD,
        from: 'people',
        farmerId: linkId,
        name: search.name,
        mobileNumber: search.mobileNumber,
        accountNumber: search.accountNumber,
        address: search.address,
        costPerBag: search.costPerBag,
      },
    });
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link to="/people">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <FarmerProfileCard
        displayName={displayName}
        accountLabel={accountLabel}
        costPerBag={search.costPerBag}
        mobileNumber={search.mobileNumber}
        address={search.address}
        bagTotals={bagTotals}
        isLoadingTotals={isLoadingTotals}
        showFinances={showFinances}
        onEditClick={editLink ? () => setEditOpen(true) : undefined}
        onFinancesClick={() => setFinancesOpen(true)}
        onStockLedgerClick={handleStockLedgerClick}
        onFinancialLedgerClick={handleFinancialLedgerClick}
        isFinancialLedgerDisabled={isLoadingFarmerLedger || !farmerLedger}
      />

      {editLink ? (
        <EditFarmerDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          link={editLink}
          onSuccess={handleEditSuccess}
        />
      ) : null}

      {showFinances ? (
        <FarmerFinancesDialog
          open={financesOpen}
          onOpenChange={setFinancesOpen}
          farmerName={displayName}
          linkId={linkId}
        />
      ) : null}

      <FarmerGatePassesSection linkId={linkId} onSummariesChange={handleSummariesChange} />
    </div>
  );
}
