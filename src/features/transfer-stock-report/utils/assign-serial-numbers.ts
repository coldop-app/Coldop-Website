type SerialNumberSource = {
  date: string;
  gatePassNo: number;
};

function parseReportDate(value: string): number | null {
  const timestamp = new Date(value).getTime();

  return Number.isNaN(timestamp) ? null : timestamp;
}

export function assignTransferStockReportSerialNumbers<T extends SerialNumberSource>(
  rows: readonly T[],
): Array<T & { serialNo: number }> {
  const ordered = rows.map((row, index) => ({
    row,
    index,
    timestamp: parseReportDate(row.date),
  }));

  ordered.sort((left, right) => {
    const leftInvalid = left.timestamp == null;
    const rightInvalid = right.timestamp == null;

    if (leftInvalid !== rightInvalid) return leftInvalid ? 1 : -1;

    if (left.timestamp != null && right.timestamp != null && left.timestamp !== right.timestamp) {
      return left.timestamp - right.timestamp;
    }

    const gatePassDiff = left.row.gatePassNo - right.row.gatePassNo;
    if (gatePassDiff !== 0) return gatePassDiff;

    return left.index - right.index;
  });

  return ordered.map(({ row }, serialIndex) => ({
    ...row,
    serialNo: serialIndex + 1,
  }));
}
