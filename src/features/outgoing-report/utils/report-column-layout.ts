const OUTGOING_REPORT_COLUMN_WIDTHS = {
  name: '11rem',
  address: '14rem',
  accountNumber: '7.5rem',
  gatePassNo: '6.5rem',
  manualParchiNumber: '8rem',
  date: '7.5rem',
  type: '7rem',
  variety: '8rem',
  stockFilter: '7.5rem',
  from: '8rem',
  to: '8rem',
  truckNumber: '8rem',
  totalBags: '5.5rem',
  createdBy: '8rem',
  remarks: '12rem',
  sizeColumn: '8.5rem',
  default: '8rem',
} as const;

export function getOutgoingReportColumnWidth(columnId: string): string {
  if (columnId.startsWith('size-')) {
    return OUTGOING_REPORT_COLUMN_WIDTHS.sizeColumn;
  }

  if (columnId in OUTGOING_REPORT_COLUMN_WIDTHS) {
    return OUTGOING_REPORT_COLUMN_WIDTHS[columnId as keyof typeof OUTGOING_REPORT_COLUMN_WIDTHS];
  }

  return OUTGOING_REPORT_COLUMN_WIDTHS.default;
}

export function getOutgoingReportTableMinWidth(columnIds: string[]): string {
  const totalRem = columnIds.reduce((sum, columnId) => {
    const width = getOutgoingReportColumnWidth(columnId);
    const value = Number.parseFloat(width);

    return sum + (Number.isFinite(value) ? value : 8);
  }, 0);

  return `${totalRem}rem`;
}
