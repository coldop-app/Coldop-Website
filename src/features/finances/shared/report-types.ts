export type DateRange = {
  from: string | null;
  to: string | null;
};

export type ReportRow = {
  label: string;
  amount: number | null;
  isHeader?: boolean;
  isTotal?: boolean;
  isProfit?: boolean;
};
