export type GatePassReportPdfAlign = 'left' | 'right';

export type GatePassReportPdfDisplayAlign = 'left' | 'right' | 'center';

export type GatePassReportPdfStackedLine = {
  main: string;
  sub?: string;
};

export type GatePassReportPdfCell = {
  text: string;
  align: GatePassReportPdfAlign;
  isEmpty?: boolean;
  stack?: GatePassReportPdfStackedLine | GatePassReportPdfStackedLine[];
};

export type GatePassReportPdfColumn = {
  label: string;
  align: GatePassReportPdfAlign;
  columnId?: string;
  displayAlign?: GatePassReportPdfDisplayAlign;
};

export type GatePassReportPdfTableVariant = 'default' | 'ledger';

export type GatePassReportPdfRow = {
  cells: GatePassReportPdfCell[];
  isGroupRow?: boolean;
};

export type GatePassReportPdfData = {
  reportTitle: string;
  generatedAt: Date;
  periodLabel: string;
  entryCountLabel: string;
  filterSummaryLines: string[];
  columns: GatePassReportPdfColumn[];
  rows: GatePassReportPdfRow[];
  footerCells: GatePassReportPdfCell[];
  tableVariant?: GatePassReportPdfTableVariant;
  rowsPerPage?: number;
  /** When true, table body/footer rows are unbreakable (no mid-row page splits). */
  keepRowsTogether?: boolean;
  /**
   * When true, render all rows in one wrapping Page and let react-pdf
   * create continuation pages. Letterhead + table headers use `fixed`
   * so they repeat on every generated page (no manual row chunking).
   */
  continuousPages?: boolean;
};

export type GenerateGatePassReportPdfInput = GatePassReportPdfData & {
  coldStorageName: string;
  coldStorageAddress?: string;
  coldStorageLogo?: string;
};
