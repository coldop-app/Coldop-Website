export type Ledger = {
  id: string;
  name: string;
  type: string;
  subType: string;
  category: string;
  openingBalance: number;
  balance: number;
  closingBalance: number | null;
  kind: 'System' | 'Custom';
  transactionCount: number;
  createdAt: string;
};
