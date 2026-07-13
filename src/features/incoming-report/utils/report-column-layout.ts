const INCOMING_REPORT_COLUMN_WIDTHS = {
  name: '11rem',
  address: '14rem',
  accountNumber: '7.5rem',
  gatePassNo: '6.5rem',
  manualParchiNumber: '8rem',
  date: '7.5rem',
  variety: '8rem',
  stockFilter: '7.5rem',
  customMarka: '7.5rem',
  totalBags: '5.5rem',
  createdBy: '8rem',
  remarks: '12rem',
  sizeColumn: '8.5rem',
  default: '8rem',
} as const;

export function getIncomingReportColumnWidth(columnId: string): string {
  if (columnId.startsWith('size-')) {
    return INCOMING_REPORT_COLUMN_WIDTHS.sizeColumn;
  }

  if (columnId in INCOMING_REPORT_COLUMN_WIDTHS) {
    return INCOMING_REPORT_COLUMN_WIDTHS[columnId as keyof typeof INCOMING_REPORT_COLUMN_WIDTHS];
  }

  return INCOMING_REPORT_COLUMN_WIDTHS.default;
}

export function getIncomingReportTableMinWidth(columnIds: string[]): string {
  const totalRem = columnIds.reduce((sum, columnId) => {
    const width = getIncomingReportColumnWidth(columnId);
    const value = Number.parseFloat(width);

    return sum + (Number.isFinite(value) ? value : 8);
  }, 0);

  return `${totalRem}rem`;
}
