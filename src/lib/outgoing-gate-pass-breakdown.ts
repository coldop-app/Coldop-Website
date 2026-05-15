import type {
  DaybookIncomingGatePassSnapshot,
  DaybookOrderDetail,
} from '@/services/store-admin/functions/useGetDaybook';

export interface LegacyBreakdownRow {
  size: string;
  variety: string;
  location: string;
  refNo: number;
  initialQty: number;
  issuedQty: number;
  availableQty: number;
}

export function formatOutgoingLocation(loc?: {
  chamber?: string;
  floor?: string;
  row?: string;
}): string {
  if (!loc) return '—';
  const str = `${loc.chamber ?? ''}-${loc.floor ?? ''}-${loc.row ?? ''}`.replace(
    /^-+$/,
    ''
  );
  return str || '—';
}

function orderDetailLocationKey(
  size: string,
  location?: { chamber?: string; floor?: string; row?: string }
): string {
  return `${size.trim()}|${formatOutgoingLocation(location)}`;
}

/** Build per-location rows from snapshots; quantities from orderDetails when matched. */
export function buildLegacyBreakdownRows(
  snapshots: DaybookIncomingGatePassSnapshot[],
  orderDetails: DaybookOrderDetail[]
): LegacyBreakdownRow[] {
  const quantitiesByLocation = new Map<
    string,
    { issued: number; available: number }
  >();
  for (const od of orderDetails) {
    const size = (od.size ?? '').trim();
    if (!size) continue;
    quantitiesByLocation.set(orderDetailLocationKey(size, od.location), {
      issued: od.quantityIssued ?? 0,
      available: od.quantityAvailable ?? 0,
    });
  }

  const rows: LegacyBreakdownRow[] = [];
  for (const snap of snapshots) {
    const variety = snap.variety?.trim() ?? '—';
    for (const bs of snap.bagSizes ?? []) {
      const size = (bs.name ?? '').trim();
      if (!size) continue;
      const locationStr = formatOutgoingLocation(bs.location);
      const snapshotInitial = bs.initialQuantity ?? 0;
      const snapshotCurrent = bs.currentQuantity ?? 0;
      const matched = quantitiesByLocation.get(
        orderDetailLocationKey(size, bs.location)
      );
      if (matched) {
        rows.push({
          size,
          variety,
          location: locationStr,
          refNo: snap.gatePassNo ?? 0,
          initialQty: matched.issued + matched.available,
          issuedQty: matched.issued,
          availableQty: matched.available,
        });
      } else {
        rows.push({
          size,
          variety,
          location: locationStr,
          refNo: snap.gatePassNo ?? 0,
          initialQty: snapshotInitial,
          issuedQty: Math.max(0, snapshotInitial - snapshotCurrent),
          availableQty: snapshotCurrent,
        });
      }
    }
  }
  return rows;
}

export function sumOrderDetailQuantities(
  orderDetails: DaybookOrderDetail[]
): { totalIssued: number; totalAvailable: number } {
  let totalIssued = 0;
  let totalAvailable = 0;
  for (const od of orderDetails) {
    totalIssued += od.quantityIssued ?? 0;
    totalAvailable += od.quantityAvailable ?? 0;
  }
  return { totalIssued, totalAvailable };
}
