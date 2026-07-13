export type ExcelPreviewRow = {
  values: Array<string | number>;
  boldByColumn?: boolean[];
  isGroupedOrAggregatedRow?: boolean;
  isSectionTitle?: boolean;
  isTotalsRow?: boolean;
};

export type ExcelPreviewStockSummary = {
  headers: string[];
  rows: Array<Array<string | number>>;
  footer: Array<string | number>;
};

export type ExcelPreviewData = {
  title: string;
  subtitle: string;
  dateLabel: string;
  exportedRowCount: number;
  headers: string[];
  rows: ExcelPreviewRow[];
  totals?: Array<string | number>;
  metaLines?: string[];
  stockSummary?: ExcelPreviewStockSummary;
};

export type ExcelPreviewUrls = {
  blobUrl: string;
};

/** Cap HTML preview rows so large ledgers stay responsive in the browser tab. */
export const EXCEL_PREVIEW_MAX_ROWS = 400;

const PREVIEW_LOADING_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Generating Excel preview…</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      font-family: Inter, Calibri, system-ui, sans-serif;
      color: #1f2937;
      background: #fff;
    }
    .status {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      color: #6b7280;
    }
    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid #b8dec9;
      border-top-color: #2d7a50;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="status">
    <div class="spinner" aria-hidden="true"></div>
    <span>Generating Excel preview…</span>
  </div>
</body>
</html>`;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeHtmlWithLineBreaks(value: string): string {
  return escapeHtml(value).replace(/\n/g, '<br />');
}

function formatCellValue(value: string | number | undefined): string {
  if (value == null || value === '') return '';
  if (typeof value === 'number') {
    return value.toLocaleString('en-IN');
  }
  return String(value);
}

function renderLedgerTableBodyRows(rows: ExcelPreviewRow[], columnCount: number): string {
  return rows
    .map((row) => {
      if (row.isSectionTitle) {
        return `<tr class="section-row"><td colspan="${columnCount}">${escapeHtml(String(row.values[0] ?? ''))}</td></tr>`;
      }

      const rowClass = row.isTotalsRow
        ? 'total-row'
        : row.isGroupedOrAggregatedRow
          ? 'group-row'
          : '';

      const cells = row.values
        .map((value, index) => {
          const isNumeric = typeof value === 'number';
          const bold = row.boldByColumn?.[index] ? ' strong' : '';
          const align = isNumeric ? ' num' : '';
          const formatted = formatCellValue(value);
          const cellHtml =
            typeof value === 'string' && value.includes('\n')
              ? escapeHtmlWithLineBreaks(formatted)
              : escapeHtml(formatted);
          return `<td class="${bold}${align}">${cellHtml}</td>`;
        })
        .join('');

      return `<tr class="${rowClass}">${cells}</tr>`;
    })
    .join('');
}

function buildLedgerTableHtml(
  rows: ExcelPreviewRow[],
  headerCells: string,
  columnCount: number,
): string {
  if (rows.length === 0) return '';

  return `<div class="table-wrap">
      <table>
        <thead><tr>${headerCells}</tr></thead>
        <tbody>${renderLedgerTableBodyRows(rows, columnCount)}</tbody>
      </table>
    </div>`;
}

function buildPreviewHtml(preview: ExcelPreviewData, downloadFileName: string): string {
  const metaLines = preview.metaLines ?? [];
  const columnCount = preview.headers.length;
  const headerCells = preview.headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('');

  const totalRows = preview.rows.length;
  const rowsForPreview =
    totalRows > EXCEL_PREVIEW_MAX_ROWS
      ? preview.rows.slice(0, EXCEL_PREVIEW_MAX_ROWS)
      : preview.rows;

  const outgoingSectionIndex = rowsForPreview.findIndex(
    (row) => row.isSectionTitle && String(row.values[0] ?? '').startsWith('Outgoing'),
  );

  const incomingRows =
    outgoingSectionIndex === -1 ? rowsForPreview : rowsForPreview.slice(0, outgoingSectionIndex);
  const outgoingRows =
    outgoingSectionIndex === -1 ? [] : rowsForPreview.slice(outgoingSectionIndex);

  const incomingTableHtml = buildLedgerTableHtml(incomingRows, headerCells, columnCount);
  const outgoingTableHtml = buildLedgerTableHtml(outgoingRows, headerCells, columnCount);

  const ledgerTablesHtml =
    outgoingTableHtml.length > 0
      ? `<section class="ledger-block">${incomingTableHtml}</section>
    <section class="ledger-block">${outgoingTableHtml}</section>`
      : incomingTableHtml;

  const previewTruncationNotice =
    totalRows > EXCEL_PREVIEW_MAX_ROWS
      ? `<p class="meta-line">Showing first ${EXCEL_PREVIEW_MAX_ROWS.toLocaleString('en-IN')} of ${totalRows.toLocaleString('en-IN')} ledger rows. Download the Excel file for the full report.</p>`
      : '';

  const stockSummaryHtml = preview.stockSummary
    ? `<section class="summary-block">
        <h3>Stock Summary</h3>
        <div class="table-wrap">
          <table>
            <thead><tr>${preview.stockSummary.headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead>
            <tbody>
              ${preview.stockSummary.rows
                .map(
                  (row) =>
                    `<tr>${row.map((cell) => `<td>${escapeHtml(formatCellValue(cell))}</td>`).join('')}</tr>`,
                )
                .join('')}
              <tr class="total-row">${preview.stockSummary.footer
                .map((cell) => `<td>${escapeHtml(formatCellValue(cell))}</td>`)
                .join('')}</tr>
            </tbody>
          </table>
        </div>
      </section>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(preview.title)} — ${escapeHtml(preview.subtitle)}</title>
  <style>
    :root {
      --title: #1a4731;
      --header: #2d7a50;
      --border: #b8dec9;
      --row-even: #eff8f3;
      --total: #dcefe4;
      --muted: #6b7280;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, Calibri, system-ui, sans-serif;
      font-size: 13px;
      color: #1f2937;
      background: #fff;
    }
    .toolbar {
      position: sticky;
      top: 0;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 20px;
      border-bottom: 1px solid var(--border);
      background: rgba(255,255,255,0.96);
      backdrop-filter: blur(8px);
    }
    .toolbar-title { font-size: 13px; font-weight: 600; color: var(--muted); }
    .download-btn {
      border: 0;
      border-radius: 8px;
      padding: 8px 14px;
      font-size: 13px;
      font-weight: 600;
      color: #fff;
      background: var(--header);
      cursor: pointer;
    }
    .page { max-width: 1280px; margin: 0 auto; padding: 24px 20px 40px; }
    h1 {
      margin: 0 0 4px;
      font-size: 24px;
      font-weight: 700;
      color: var(--title);
    }
    h2 {
      margin: 0 0 8px;
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
    }
    .meta {
      margin: 0 0 4px;
      font-size: 12px;
      color: var(--muted);
      font-style: italic;
    }
    .meta-line {
      margin: 0 0 4px;
      font-size: 12px;
      color: var(--muted);
    }
    .powered {
      margin: 0 0 20px;
      font-size: 11px;
      font-style: italic;
      color: #9ca3af;
    }
    .table-wrap {
      overflow-x: auto;
      border: 1px solid var(--border);
      border-radius: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    th, td {
      padding: 8px 10px;
      border: 1px solid var(--border);
      text-align: left;
      vertical-align: middle;
    }
    th {
      background: var(--header);
      color: #fff;
      font-weight: 700;
      white-space: nowrap;
    }
    tr.group-row td { background: var(--row-even); font-weight: 700; color: var(--title); }
    tr.section-row td {
      background: var(--row-even);
      font-weight: 700;
      color: var(--title);
      font-size: 11px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    tr.total-row td { background: var(--total); font-weight: 700; color: var(--title); }
    .strong { font-weight: 700; }
    .num { font-variant-numeric: tabular-nums; text-align: right; }
    h3 {
      margin: 0 0 8px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--title);
    }
    .summary-block { margin-bottom: 24px; }
    .ledger-block { margin-bottom: 24px; }
    .ledger-block:last-child { margin-bottom: 0; }
    @media print { .toolbar { display: none; } }
  </style>
</head>
<body>
  <div class="toolbar">
    <div class="toolbar-title">Excel Preview</div>
    <a class="download-btn" id="download-excel" download="${escapeHtml(downloadFileName)}">Download Excel</a>
  </div>
  <main class="page">
    <h1>${escapeHtml(preview.title)}</h1>
    <h2>${escapeHtml(preview.subtitle)}</h2>
    <p class="meta">Generated on: ${escapeHtml(preview.dateLabel)}</p>
    ${metaLines.map((line) => `<p class="meta-line">${escapeHtml(line)}</p>`).join('')}
    <p class="powered">Powered by Coldop</p>
    ${previewTruncationNotice}
    ${stockSummaryHtml}
    ${ledgerTablesHtml}
  </main>
  <script>
    const downloadLink = document.getElementById("download-excel");
  </script>
</body>
</html>`;
}

export function revokeExcelPreviewUrls(urls: ExcelPreviewUrls | null) {
  if (!urls?.blobUrl) return;
  URL.revokeObjectURL(urls.blobUrl);
}

export async function openExcelPreviewInNewTab(
  urlsRef: { current: ExcelPreviewUrls | null },
  buildExport: () => Promise<{
    buffer: ArrayBuffer;
    fileName: string;
    preview: ExcelPreviewData;
  }>,
): Promise<void> {
  const previewWindow = window.open('', '_blank');
  if (!previewWindow) {
    window.alert('Pop-up blocked. Allow pop-ups to preview the Excel report.');
    return;
  }

  previewWindow.document.open();
  previewWindow.document.write(PREVIEW_LOADING_HTML);
  previewWindow.document.close();

  try {
    const { buffer, fileName, preview } = await buildExport();

    revokeExcelPreviewUrls(urlsRef.current);

    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const blobUrl = URL.createObjectURL(blob);
    urlsRef.current = { blobUrl };

    const html = buildPreviewHtml(preview, fileName);
    previewWindow.document.open();
    previewWindow.document.write(html);
    previewWindow.document.close();

    const link = previewWindow.document.getElementById(
      'download-excel',
    ) as HTMLAnchorElement | null;
    if (link) {
      link.href = blobUrl;
    }
  } catch (error) {
    console.error('Failed to open Excel preview:', error);
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to generate Excel preview. Please try again.';

    previewWindow.document.open();
    previewWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><title>Excel preview failed</title></head>
<body style="font-family: Inter, system-ui, sans-serif; padding: 24px; color: #1f2937;">
  <h1 style="font-size: 18px; margin: 0 0 8px;">Could not generate Excel preview</h1>
  <p style="margin: 0; color: #6b7280;">${escapeHtml(message)}</p>
</body>
</html>`);
    previewWindow.document.close();

    window.alert(message);
    throw error;
  }
}
