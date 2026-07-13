import type ExcelJS from 'exceljs';

export const EXCEL_DATA_ROW_HEIGHT = 18;
export const EXCEL_HEADER_ROW_HEIGHT = 22;
export const EXCEL_TITLE_ROW_HEIGHT = 40;
export const EXCEL_SUBTITLE_ROW_HEIGHT = 26;

export function applyExcelRowHeight(row: ExcelJS.Row, height: number) {
  row.height = height;
}

export function configureWorksheetForMicrosoftExcel(worksheet: ExcelJS.Worksheet) {
  worksheet.views = [{ showGridLines: false }];
  worksheet.pageSetup = {
    paperSize: 9,
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: {
      left: 0.4,
      right: 0.4,
      top: 0.5,
      bottom: 0.5,
      header: 0.2,
      footer: 0.2,
    },
  };
}

export function enforceExcelTableRowHeights(worksheet: ExcelJS.Worksheet, headerRowNumber: number) {
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber < headerRowNumber) return;
    if (row.height == null || row.height < EXCEL_DATA_ROW_HEIGHT) {
      row.height = EXCEL_DATA_ROW_HEIGHT;
    }
  });
}
