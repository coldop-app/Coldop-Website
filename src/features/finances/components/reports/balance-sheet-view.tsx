import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { BalanceSheetReport } from '@/features/finances/domain/types';
import { BalanceSheetSummary } from '@/features/finances/components/reports/balance-sheet-summary';
import { TwoColumnAmountTable } from '@/features/finances/components/reports/two-column-amount-table';

type BalanceSheetViewProps = {
  report: BalanceSheetReport;
};

export function BalanceSheetView({ report }: BalanceSheetViewProps) {
  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden">
        <CardHeader className="border-border border-b pb-4">
          <CardTitle className="font-heading text-xl font-semibold tracking-tight">
            Balance Sheet
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <TwoColumnAmountTable
            leftTitle="Liabilities"
            rightTitle="Assets"
            leftRows={report.liabilityRows}
            rightRows={report.assetRows}
            leftTotal={report.totalLiabilitiesAndEquity}
            rightTotal={report.totalAssets}
          />
        </CardContent>
      </Card>

      <BalanceSheetSummary
        totalAssets={report.totalAssets}
        totalLiabilitiesAndEquity={report.totalLiabilitiesAndEquity}
        isBalanced={report.isBalanced}
      />
    </div>
  );
}
