import type ExcelJS from 'exceljs';

let cachedExcelJS: typeof ExcelJS | null = null;
let excelJSLoadPromise: Promise<typeof ExcelJS> | null = null;

export function preloadExcelJS(): Promise<typeof ExcelJS> {
  return loadExcelJS();
}

export async function loadExcelJS(): Promise<typeof ExcelJS> {
  if (cachedExcelJS) return cachedExcelJS;

  excelJSLoadPromise ??= import('exceljs').then((module) => {
    cachedExcelJS = module.default;
    return cachedExcelJS;
  });

  return excelJSLoadPromise;
}
