import { payloadDateSchema } from '@/lib/helpers';
import type { CreateOutgoingGatePassBody } from '@/services/outgoing-gate-pass/useCreateOutgoingGatePass';
import type { UpdateOutgoingGatePassBody } from '@/services/outgoing-gate-pass/useUpdateOutgoingGatePass';
import type { IncomingGatePassItem } from '@/services/incoming-gate-pass/useGetIncomingGatePassesOfSingleFarmer';
import {
  getBagDetailsForSize,
  parseAllocationKey,
} from '@/components/forms/outgoing/outgoing-form-utils';
import { manualParchiNumberToString } from '@/components/forms/outgoing/outgoing-form-shared';

export interface OutgoingFormValues {
  farmerStorageLinkId: string;
  orderDate: string;
  remarks: string;
  from?: string;
  to?: string;
  truckNumber?: string;
  manualParchiNumber?: string;
}

function parseManualParchiNumber(
  manualParchiNumber?: string | number | null
): number | undefined {
  const manualParchiNum = manualParchiNumberToString(manualParchiNumber);
  if (
    manualParchiNum == null ||
    manualParchiNum === '' ||
    !/^\d+$/.test(manualParchiNum)
  ) {
    return undefined;
  }
  const n = Number.parseInt(manualParchiNum, 10);
  return n > 0 ? n : undefined;
}

function buildIncomingGatePassesFromAllocations(
  cellRemovedQuantities: Record<string, number>,
  incomingPasses: IncomingGatePassItem[]
) {
  const entries = Object.entries(cellRemovedQuantities).filter(
    ([, qty]) => qty != null && qty > 0
  );
  if (entries.length === 0) return null;

  const passById = new Map(incomingPasses.map((p) => [p._id, p]));

  const byPassAllocations = new Map<
    string,
    Array<{
      size: string;
      quantityToAllocate: number;
      location: { chamber: string; floor: string; row: string };
    }>
  >();

  for (const [key, qty] of entries) {
    const parsed = parseAllocationKey(key);
    if (!parsed) continue;
    const { passId, sizeName, bagIndex } = parsed;
    const pass = passById.get(passId);
    if (!pass) continue;
    const details = getBagDetailsForSize(pass, sizeName);
    const detail = details[bagIndex];
    const location = detail?.location
      ? {
          chamber: detail.location.chamber ?? '',
          floor: detail.location.floor ?? '',
          row: detail.location.row ?? '',
        }
      : { chamber: '', floor: '', row: '' };
    if (!byPassAllocations.has(passId)) byPassAllocations.set(passId, []);
    byPassAllocations.get(passId)!.push({
      size: sizeName,
      quantityToAllocate: qty,
      location,
    });
  }

  const incomingGatePasses = [...byPassAllocations.entries()]
    .map(([incomingGatePassId, allocations]) => {
      const pass = passById.get(incomingGatePassId);
      const variety = pass?.variety?.trim() ?? '';
      return { incomingGatePassId, variety, allocations };
    })
    .filter((e) => e.allocations.length > 0);

  if (incomingGatePasses.length === 0) return null;
  return incomingGatePasses;
}

function buildSharedHeaderFields(formValues: OutgoingFormValues) {
  const date = payloadDateSchema.parse(formValues.orderDate);
  const manualParchiNumber = parseManualParchiNumber(formValues.manualParchiNumber);
  const manualParchiPayload =
    manualParchiNumber != null ? { manualParchiNumber } : {};

  return {
    farmerStorageLinkId: formValues.farmerStorageLinkId,
    date,
    ...(formValues.from?.trim() && { from: formValues.from.trim() }),
    ...(formValues.to?.trim() && { to: formValues.to.trim() }),
    ...(formValues.truckNumber?.trim() && {
      truckNumber: formValues.truckNumber.trim(),
    }),
    ...manualParchiPayload,
    remarks: formValues.remarks?.trim() ?? '',
  };
}

/** Build API payload for POST create. Returns null if no allocations. */
export function buildOutgoingPayload(
  formValues: OutgoingFormValues,
  gatePassNo: number,
  cellRemovedQuantities: Record<string, number>,
  incomingPasses: IncomingGatePassItem[] = []
): CreateOutgoingGatePassBody | null {
  const incomingGatePasses = buildIncomingGatePassesFromAllocations(
    cellRemovedQuantities,
    incomingPasses
  );
  if (!incomingGatePasses) return null;

  return {
    ...buildSharedHeaderFields(formValues),
    gatePassNo,
    incomingGatePasses,
  };
}

/**
 * Build PATCH payload for outgoing gate pass edit.
 *
 * - `cellIssuedQuantities` values are **absolute** totals to issue per line after save
 *   (not deltas from the previous issuance).
 * - `incomingGatePasses` is the **full** desired set: only passes with at least one
 *   line > 0 are included; omitted passes are dropped from the outgoing order.
 */
export function buildEditOutgoingGatePassPayload(
  formValues: OutgoingFormValues,
  cellIssuedQuantities: Record<string, number>,
  incomingPasses: IncomingGatePassItem[] = []
): UpdateOutgoingGatePassBody | null {
  const incomingGatePasses = buildIncomingGatePassesFromAllocations(
    cellIssuedQuantities,
    incomingPasses
  );
  if (!incomingGatePasses) return null;

  return {
    ...buildSharedHeaderFields(formValues),
    incomingGatePasses,
  };
}

/** @deprecated Prefer `buildEditOutgoingGatePassPayload` for edit flows. */
export function buildUpdateOutgoingGatePassPayload(
  formValues: OutgoingFormValues,
  cellRemovedQuantities: Record<string, number>,
  incomingPasses: IncomingGatePassItem[] = []
): UpdateOutgoingGatePassBody | null {
  return buildEditOutgoingGatePassPayload(
    formValues,
    cellRemovedQuantities,
    incomingPasses
  );
}
