import type { IncomingBagSize } from '@/features/daybook/types';

export type IncomingGatePassAuditEditor = {
  _id: string;
  name: string;
  mobileNumber?: string;
};

export type IncomingGatePassAuditState = {
  date?: string;
  variety?: string;
  truckNumber?: string;
  remarks?: string;
  manualParchiNumber?: string;
  stockFilter?: string;
  customMarka?: string;
  amount?: number;
  bagSizes?: IncomingBagSize[];
};

export type IncomingGatePassAudit = {
  _id: string;
  incomingGatePassId: string;
  createdAt: string;
  editedBy: IncomingGatePassAuditEditor;
  ipAddress?: string;
  userAgent?: string;
  previousState?: IncomingGatePassAuditState | null;
  modifiedState?: IncomingGatePassAuditState | null;
};

export type IncomingGatePassEditsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type IncomingGatePassEditsResult = {
  audits: IncomingGatePassAudit[];
  pagination: IncomingGatePassEditsPagination;
};

export type IncomingGatePassEditHistoryApiAudit = {
  _id: string;
  incomingGatePassId: string;
  editedBy: {
    _id: string;
    name: string;
  };
  previousState?: IncomingGatePassAuditState | null;
  modifiedState?: IncomingGatePassAuditState | null;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
};

export type IncomingGatePassEditHistoryApiPagination = IncomingGatePassEditsPagination;

export type IncomingGatePassEditHistoryApiResponse = {
  success: boolean;
  data: IncomingGatePassEditHistoryApiAudit[];
  pagination: IncomingGatePassEditHistoryApiPagination;
  message?: string;
};
