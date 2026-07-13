import type {
  DaybookCreatedBy,
  DaybookFarmerStorageLink,
  IncomingBagSize,
} from '@/features/daybook/types';

export type IncomingGatePassReportParams = {
  dateFrom?: string;
  dateTo?: string;
};

export type IncomingGatePassReportRecord = {
  _id: string;
  gatePassNo: number;
  manualParchiNumber?: string;
  date: string;
  type: string;
  variety: string;
  status: string;
  truckNumber?: string;
  remarks?: string;
  stockFilter?: string;
  customMarka?: string;
  bagSizes: IncomingBagSize[];
  initialTotal: number;
  currentTotal: number;
  farmerStorageLinkId: DaybookFarmerStorageLink;
  createdBy?: DaybookCreatedBy;
};

export type IncomingGatePassReportResult = {
  incomingGatePasses: IncomingGatePassReportRecord[];
};

export type GetIncomingGatePassReportResponse = {
  success: boolean;
  data: IncomingGatePassReportResult;
  message?: string;
};
