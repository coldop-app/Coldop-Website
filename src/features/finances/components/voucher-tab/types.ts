export type Voucher = {
  id: string;
  voucherNo: string;
  date: string;
  debit: string;
  credit: string;
  debitLedgerId?: string;
  creditLedgerId?: string;
  amount: number;
  narration: string;
};
