const TRANSFER_STOCK_REPORT_COLUMN_WIDTHS = {
  gatePassNo: '6.5rem',
  date: '7.5rem',
  fromName: '11rem',
  fromAccountNumber: '7.5rem',
  fromAddress: '14rem',
  fromMobile: '8rem',
  toName: '11rem',
  toAccountNumber: '7.5rem',
  toAddress: '14rem',
  toMobile: '8rem',
  sourceGatePassNos: '8rem',
  customMarka: '8rem',
  truckNumber: '8rem',
  totalBags: '5.5rem',
  createdBy: '8rem',
  remarks: '12rem',
  sizeColumn: '8.5rem',
  default: '8rem',
} as const;

export function getTransferStockReportColumnWidth(columnId: string): string {
  if (columnId.startsWith('size-')) {
    return TRANSFER_STOCK_REPORT_COLUMN_WIDTHS.sizeColumn;
  }

  if (columnId in TRANSFER_STOCK_REPORT_COLUMN_WIDTHS) {
    return TRANSFER_STOCK_REPORT_COLUMN_WIDTHS[
      columnId as keyof typeof TRANSFER_STOCK_REPORT_COLUMN_WIDTHS
    ];
  }

  return TRANSFER_STOCK_REPORT_COLUMN_WIDTHS.default;
}

export function getTransferStockReportTableMinWidth(columnIds: string[]): string {
  const totalRem = columnIds.reduce((sum, columnId) => {
    const width = getTransferStockReportColumnWidth(columnId);
    const value = Number.parseFloat(width);

    return sum + (Number.isFinite(value) ? value : 8);
  }, 0);

  return `${totalRem}rem`;
}
