import type {
  DaybookLocation,
  IncomingGatePassSnapshot,
  OutgoingOrderDetail,
} from '@/features/daybook/types';

export type OutgoingGatePassAuditEditor = {
  _id: string;
  name: string;
  mobileNumber?: string;
};

export type OutgoingGatePassAuditOrderDetail = OutgoingOrderDetail & {
  variety?: string;
};

export type OutgoingGatePassAuditState = {
  date?: string;
  variety?: string;
  truckNumber?: string;
  remarks?: string;
  manualParchiNumber?: string | number;
  from?: string;
  to?: string;
  orderDetails?: OutgoingGatePassAuditOrderDetail[];
  incomingGatePassSnapshots?: IncomingGatePassSnapshot[];
};

export type OutgoingGatePassAudit = {
  _id: string;
  outgoingGatePassId: string;
  createdAt: string;
  editedBy: OutgoingGatePassAuditEditor;
  ipAddress?: string;
  userAgent?: string;
  previousState?: OutgoingGatePassAuditState | null;
  modifiedState?: OutgoingGatePassAuditState | null;
};

export type OutgoingGatePassEditsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type OutgoingGatePassEditsResult = {
  audits: OutgoingGatePassAudit[];
  pagination: OutgoingGatePassEditsPagination;
};

export type OutgoingGatePassEditHistoryApiAudit = {
  _id: string;
  outgoingGatePassId: string;
  editedBy: {
    _id: string;
    name: string;
  };
  previousState?: OutgoingGatePassAuditState | null;
  modifiedState?: OutgoingGatePassAuditState | null;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
};

export type OutgoingGatePassEditHistoryApiPagination = OutgoingGatePassEditsPagination;

export type OutgoingGatePassEditHistoryApiResponse = {
  success: boolean;
  data: OutgoingGatePassEditHistoryApiAudit[];
  pagination: OutgoingGatePassEditHistoryApiPagination;
  message?: string;
};

export type { DaybookLocation };
