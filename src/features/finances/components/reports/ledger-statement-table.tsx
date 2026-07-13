import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { isDebitNatureType } from '@/features/finances/domain/ledger-classification';
import type { LedgerStatementReport } from '@/features/finances/domain/types';
import { formatCurrency } from '@/features/finances/shared/format-currency';

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

type LedgerStatementTableProps = {
  statement: LedgerStatementReport;
};

export function LedgerStatementTable({ statement }: LedgerStatementTableProps) {
  const { ledger, openingBalance, hasOpeningBalance, entries, hasNoData } = statement;
  const isDebitNature = isDebitNatureType(ledger.type);

  return (
    <div className="border-border relative w-full overflow-auto rounded-lg border">
      <Table className="w-full text-sm">
        <TableHeader className="border-border bg-muted/50 border-b">
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-muted-foreground h-10 px-3 font-medium">Date</TableHead>
            <TableHead className="text-muted-foreground h-10 w-10 px-3 text-center font-medium">
              B
            </TableHead>
            <TableHead className="text-muted-foreground h-10 px-3 font-medium">Narration</TableHead>
            <TableHead className="text-muted-foreground h-10 px-3 text-right font-medium">
              Debit
            </TableHead>
            <TableHead className="text-muted-foreground h-10 px-3 text-right font-medium">
              Credit
            </TableHead>
            <TableHead className="text-muted-foreground h-10 px-3 text-right font-medium">
              Balance
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hasOpeningBalance ? (
            <TableRow className="border-border hover:bg-muted/50 border-b">
              <TableCell className="px-3 py-2.5">{dateFormatter.format(new Date())}</TableCell>
              <TableCell className="px-3 py-2.5 text-center">OB</TableCell>
              <TableCell className="px-3 py-2.5">Opening Balance</TableCell>
              <TableCell className="px-3 py-2.5 text-right tabular-nums">
                {openingBalance > 0 && isDebitNature ? formatCurrency(openingBalance) : ''}
              </TableCell>
              <TableCell className="px-3 py-2.5 text-right tabular-nums">
                {openingBalance > 0 && !isDebitNature
                  ? formatCurrency(openingBalance)
                  : openingBalance < 0 && isDebitNature
                    ? formatCurrency(Math.abs(openingBalance))
                    : ''}
              </TableCell>
              <TableCell className="px-3 py-2.5 text-right font-medium tabular-nums">
                {formatCurrency(Math.abs(openingBalance))} {openingBalance >= 0 ? 'Dr' : 'Cr'}
              </TableCell>
            </TableRow>
          ) : null}

          {entries.map((entry) => {
            const entryIsDebit = isDebitNature
              ? entry.runningBalance >= 0
              : entry.runningBalance < 0;

            return (
              <TableRow key={entry.id} className="border-border hover:bg-muted/50 border-b">
                <TableCell className="px-3 py-2.5">
                  {dateFormatter.format(new Date(entry.date))}
                </TableCell>
                <TableCell className="px-3 py-2.5 text-center">{entry.entryType}</TableCell>
                <TableCell className="px-3 py-2.5">
                  {entry.narration || `${entry.isDebit ? 'To' : 'By'} ${entry.counterpartyName}`}
                </TableCell>
                <TableCell className="px-3 py-2.5 text-right tabular-nums">
                  {entry.isDebit ? formatCurrency(entry.amount) : ''}
                </TableCell>
                <TableCell className="px-3 py-2.5 text-right tabular-nums">
                  {!entry.isDebit ? formatCurrency(entry.amount) : ''}
                </TableCell>
                <TableCell className="px-3 py-2.5 text-right font-medium tabular-nums">
                  {formatCurrency(Math.abs(entry.runningBalance))} {entryIsDebit ? 'Dr' : 'Cr'}
                </TableCell>
              </TableRow>
            );
          })}

          {hasNoData ? (
            <TableRow>
              <TableCell colSpan={6} className="text-muted-foreground px-3 py-8 text-center">
                No transactions found
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
