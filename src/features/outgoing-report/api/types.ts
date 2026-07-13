import type {
  DaybookCreatedBy,
  DaybookFarmerStorageLink,
  DaybookLocation,
  IncomingGatePassSnapshot,
} from '@/features/daybook/types';

export type OutgoingGatePassReportParams = {
  dateFrom?: string;
  dateTo?: string;
};

export type OutgoingReportOrderDetail = {
  size: string;
  quantityAvailable: number;
  quantityIssued: number;
  location?: DaybookLocation;
};

export type OutgoingGatePassReportRecord = {
  _id: string;
  gatePassNo: number;
  manualParchiNumber?: number;
  date: string;
  type?: string;
  variety?: string;
  /**
   * Client-only: set when the table expands a multi-variety gate pass into
   * one row per variety (people-report-style variety grouping).
   */
  varietySlice?: string;
  from?: string;
  to?: string;
  truckNumber?: string;
  stockFilter?: string;
  remarks?: string;
  orderDetails: OutgoingReportOrderDetail[];
  totalBags: number;
  incomingGatePassSnapshots?: IncomingGatePassSnapshot[] | null;
  farmerStorageLinkId: DaybookFarmerStorageLink;
  createdBy?: DaybookCreatedBy;
  isNull?: boolean;
  nulledAt?: string;
};

export type OutgoingGatePassReportResult = {
  outgoingGatePasses: OutgoingGatePassReportRecord[];
};

export type GetOutgoingGatePassReportResponse = {
  success: boolean;
  data: OutgoingGatePassReportResult;
  message?: string;
};
