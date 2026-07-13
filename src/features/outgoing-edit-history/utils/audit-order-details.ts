import type { IncomingGatePassSnapshot } from '@/features/daybook/types';
import { locationKey } from '@/features/daybook/utils/format';
import type { OutgoingGatePassAuditOrderDetail } from '@/features/outgoing-edit-history/types';

export type AlignedOrderDetailRow = {
  key: string;
  beforeLine: OutgoingGatePassAuditOrderDetail | null;
  afterLine: OutgoingGatePassAuditOrderDetail | null;
};

export function orderDetailLineKey(line: OutgoingGatePassAuditOrderDetail): string {
  return `${line.size}\u001f${locationKey(line.location)}`;
}

export function mergeOrderDetailKeys(
  beforeLines: readonly OutgoingGatePassAuditOrderDetail[],
  afterLines: readonly OutgoingGatePassAuditOrderDetail[],
): string[] {
  const seen = new Set<string>();
  const keys: string[] = [];

  for (const line of beforeLines) {
    const key = orderDetailLineKey(line);
    if (!seen.has(key)) {
      seen.add(key);
      keys.push(key);
    }
  }

  for (const line of afterLines) {
    const key = orderDetailLineKey(line);
    if (!seen.has(key)) {
      seen.add(key);
      keys.push(key);
    }
  }

  return keys;
}

export function buildAlignedOrderDetailRows(
  beforeLines: readonly OutgoingGatePassAuditOrderDetail[],
  afterLines: readonly OutgoingGatePassAuditOrderDetail[],
): AlignedOrderDetailRow[] {
  const beforeByKey = new Map(beforeLines.map((line) => [orderDetailLineKey(line), line]));
  const afterByKey = new Map(afterLines.map((line) => [orderDetailLineKey(line), line]));

  return mergeOrderDetailKeys(beforeLines, afterLines).map((key) => ({
    key,
    beforeLine: beforeByKey.get(key) ?? null,
    afterLine: afterByKey.get(key) ?? null,
  }));
}

export function findSnapshotForOrderLine(
  snapshots: readonly IncomingGatePassSnapshot[],
  orderLine: OutgoingGatePassAuditOrderDetail,
): IncomingGatePassSnapshot | undefined {
  const key = orderDetailLineKey(orderLine);

  return snapshots.find((snapshot) =>
    snapshot.bagSizes.some((bag) => `${bag.name}\u001f${locationKey(bag.location)}` === key),
  );
}

export function resolveRefGatePassNo(
  snapshots: readonly IncomingGatePassSnapshot[],
  orderLine: OutgoingGatePassAuditOrderDetail | null,
): number | null {
  if (!orderLine) return null;
  return findSnapshotForOrderLine(snapshots, orderLine)?.gatePassNo ?? null;
}
