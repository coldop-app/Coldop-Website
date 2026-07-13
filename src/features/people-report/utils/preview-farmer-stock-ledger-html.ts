import { format } from 'date-fns';

import type { FarmerStockLedgerPreviewData } from '@/features/people-report/utils/build-farmer-stock-ledger-excel';
import { COLDOP_BRANDING, EXPORT_THEME_CSS } from '@/lib/export-report-theme';
import type { ExcelPreviewRow } from '@/lib/excel-preview-tab';
import { EXCEL_PREVIEW_MAX_ROWS } from '@/lib/excel-preview-tab';

export const FARMER_STOCK_LEDGER_DOWNLOAD_EXCEL_MESSAGE =
  'kf-farmer-stock-ledger-download-excel' as const;

export const FARMER_STOCK_LEDGER_DOWNLOAD_EXCEL_DONE_MESSAGE =
  'kf-farmer-stock-ledger-download-excel-done' as const;

export type PreviewFarmerStockLedgerOptions = {
  preview: FarmerStockLedgerPreviewData;
  coldStorageName: string;
  reportTitle?: string;
  dateFrom?: string;
  dateTo?: string;
  generatedAt?: Date;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatCellValue(value: string | number | undefined): string {
  if (value == null || value === '') return '';
  if (typeof value === 'number') {
    return value.toLocaleString('en-IN');
  }
  return String(value);
}

function buildPreviewStyles(): string {
  const theme = EXPORT_THEME_CSS;

  return `
    :root {
      color-scheme: light;
      --primary: ${theme.primary};
      --foreground: ${theme.foreground};
      --muted: ${theme.mutedForeground};
      --border: ${theme.border};
      --muted-fill: ${theme.mutedFill};
      --primary-muted: ${theme.primaryMutedFill};
      --primary-soft: ${theme.primarySoftFill};
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 1.5rem;
      font-family: Inter, system-ui, -apple-system, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: var(--foreground);
      background: ${theme.background};
    }
    .report-header { margin-bottom: 1rem; }
    .report-header h1 {
      margin: 0 0 0.25rem;
      font-family: Outfit, Inter, sans-serif;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--primary);
      letter-spacing: -0.02em;
    }
    .report-header h2 {
      margin: 0 0 0.5rem;
      font-family: Outfit, Inter, sans-serif;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--primary);
    }
    .meta, .filters, .branding, .meta-line {
      margin: 0.25rem 0;
      color: var(--muted);
      font-size: 0.875rem;
    }
    .farmer-details {
      margin: 0.5rem 0 0.25rem;
      font-size: 0.9375rem;
      line-height: 1.45;
      color: var(--muted);
    }
    .farmer-details .farmer-name {
      font-weight: 600;
      color: var(--foreground);
    }
    .farmer-details .farmer-address {
      font-weight: 600;
      color: var(--foreground);
    }
    .branding { margin-top: 0.5rem; }
    .branding strong { color: var(--primary); font-weight: 600; }
    .toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
      margin: 1rem 0;
    }
    .toolbar button {
      font: inherit;
      font-size: 0.875rem;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      border: 1px solid var(--border);
      background: ${theme.background};
      color: var(--foreground);
      cursor: pointer;
    }
    .toolbar button.primary {
      background: var(--primary);
      border-color: var(--primary);
      color: ${theme.primaryForeground};
    }
    .toolbar button:hover:not(:disabled) { opacity: 0.92; }
    .toolbar button:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    .summary-block { margin-bottom: 1.5rem; }
    .summary-block h3 {
      margin: 0 0 0.5rem;
      font-family: Outfit, Inter, sans-serif;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--primary);
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }
    .ledger-block { margin-bottom: 1.5rem; }
    .ledger-block:last-child { margin-bottom: 0; }
    .table-wrap {
      overflow: auto;
      border: 1px solid var(--border);
      border-radius: 0.75rem;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
      font-variant-numeric: tabular-nums;
    }
    thead th {
      position: sticky;
      top: 0;
      z-index: 1;
      padding: 0.625rem 0.75rem;
      text-align: center;
      vertical-align: middle;
      font-weight: 600;
      color: var(--primary);
      background: var(--muted-fill);
      border-bottom: 2px solid var(--border);
      white-space: nowrap;
    }
    tbody td {
      padding: 0.5rem 0.75rem;
      border-bottom: 1px solid var(--border);
      text-align: center;
      vertical-align: middle;
      white-space: pre-line;
    }
    tbody td.numeric { font-weight: 500; }
    tbody td.empty { color: var(--muted); }
    tbody tr.group-row { background: var(--primary-muted); font-weight: 600; }
    tbody tr.group-row td { color: var(--primary); }
    tbody tr.section-row td {
      background: var(--primary-soft);
      font-weight: 600;
      color: var(--primary);
      font-size: 0.75rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      text-align: center;
    }
    tbody tr.total-row td {
      font-weight: 600;
      color: var(--primary);
      background: var(--primary-soft);
      border-top: 2px solid var(--border);
      text-align: center;
    }
    @media print {
      body { padding: 0.5rem; }
      .toolbar { display: none; }
      thead th { position: static; }
    }
  `;
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
        .map((value) => {
          const isNumeric = typeof value === 'number';
          const formatted = formatCellValue(value);
          const cellHtml =
            typeof value === 'string' && value.includes('\n')
              ? escapeHtml(formatted).replace(/\n/g, '<br />')
              : escapeHtml(formatted);
          const classNames = [
            isNumeric ? 'numeric' : '',
            value === '' || value === '—' ? 'empty' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return `<td class="${classNames}">${cellHtml}</td>`;
        })
        .join('');

      return `<tr class="${rowClass}">${cells}</tr>`;
    })
    .join('');
}

function buildLedgerTableHtml(rows: ExcelPreviewRow[], headers: string[]): string {
  if (rows.length === 0) return '';

  const headerCells = headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('');

  return `<div class="table-wrap">
    <table>
      <thead><tr>${headerCells}</tr></thead>
      <tbody>${renderLedgerTableBodyRows(rows, headers.length)}</tbody>
    </table>
  </div>`;
}

export function buildFarmerStockLedgerPreviewHtml({
  preview,
  coldStorageName,
  reportTitle = 'Farmer Stock Ledger',
  generatedAt = new Date(),
}: PreviewFarmerStockLedgerOptions): string {
  const metadataText = [
    `Generated: ${format(generatedAt, 'do MMM yyyy, h:mm a')}`,
    `${preview.exportedRowCount.toLocaleString('en-IN')} ${
      preview.exportedRowCount === 1 ? 'ledger row' : 'ledger rows'
    }`,
    ...(preview.metaLines ?? []),
  ].join('  |  ');

  const filterText =
    preview.filterSummaryLines.length > 0
      ? preview.filterSummaryLines.join('\n')
      : 'Filters: none applied';

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

  const stockSummaryHtml = preview.stockSummary
    ? `<section class="summary-block">
        <h3>Stock Summary</h3>
        <div class="table-wrap">
          <table>
            <thead><tr>${preview.stockSummary.headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead>
            <tbody>
              ${preview.stockSummary.rows
                .map(
                  (row) =>
                    `<tr>${row
                      .map((cell) => {
                        const isNumeric = typeof cell === 'number';
                        return `<td class="${isNumeric ? 'numeric' : ''}">${escapeHtml(formatCellValue(cell))}</td>`;
                      })
                      .join('')}</tr>`,
                )
                .join('')}
              <tr class="total-row">${preview.stockSummary.footer
                .map((cell) => {
                  const isNumeric = typeof cell === 'number';
                  return `<td class="${isNumeric ? 'numeric' : ''}">${escapeHtml(formatCellValue(cell))}</td>`;
                })
                .join('')}</tr>
            </tbody>
          </table>
        </div>
      </section>`
    : '';

  const incomingTableHtml = buildLedgerTableHtml(incomingRows, preview.headers);
  const outgoingTableHtml = buildLedgerTableHtml(outgoingRows, preview.headers);

  const ledgerTablesHtml =
    outgoingTableHtml.length > 0
      ? `<section class="ledger-block">${incomingTableHtml}</section>
         <section class="ledger-block">${outgoingTableHtml}</section>`
      : incomingTableHtml;

  const previewTruncationNotice =
    totalRows > EXCEL_PREVIEW_MAX_ROWS
      ? `<p class="meta-line">Showing first ${EXCEL_PREVIEW_MAX_ROWS.toLocaleString('en-IN')} of ${totalRows.toLocaleString('en-IN')} ledger rows. Download the Excel file for the full report.</p>`
      : '';

  const farmerDetailsHtml = `<p class="farmer-details"><span class="label">Farmer: </span><span class="farmer-name">${escapeHtml(preview.farmerName)}</span>${
    preview.farmerAddress
      ? `  |  <span class="label">Address: </span><span class="farmer-address">${escapeHtml(preview.farmerAddress)}</span>`
      : ''
  }</p>`;

  const pageTitle = escapeHtml(`${reportTitle} — ${coldStorageName}`);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${pageTitle}</title>
    <style>${buildPreviewStyles()}</style>
  </head>
  <body>
    <header class="report-header">
      <h1>${escapeHtml(coldStorageName)}</h1>
      <h2>${escapeHtml(reportTitle)}</h2>
      ${farmerDetailsHtml}
      <p class="meta">${escapeHtml(metadataText)}</p>
      <p class="filters">${escapeHtml(filterText).replace(/\n/g, '<br />')}</p>
      <p class="branding">${escapeHtml(COLDOP_BRANDING.label)}<strong>${escapeHtml(COLDOP_BRANDING.name)}</strong></p>
    </header>
    <div class="toolbar">
      <button
        type="button"
        id="download-excel-btn"
        class="primary"
        onclick="downloadFarmerStockLedgerExcel()"
      >
        Download Excel
      </button>
    </div>
    <script>
      (function () {
        var DOWNLOAD_TYPE = ${JSON.stringify(FARMER_STOCK_LEDGER_DOWNLOAD_EXCEL_MESSAGE)};
        var DONE_TYPE = ${JSON.stringify(FARMER_STOCK_LEDGER_DOWNLOAD_EXCEL_DONE_MESSAGE)};

        function setDownloadButtonState(isLoading) {
          var button = document.getElementById("download-excel-btn");
          if (!button) return;
          button.disabled = isLoading;
          button.textContent = isLoading ? "Downloading…" : "Download Excel";
        }

        window.downloadFarmerStockLedgerExcel = function () {
          if (!window.opener) {
            alert("Return to the report page to download Excel.");
            return;
          }
          setDownloadButtonState(true);
          window.opener.postMessage(
            { type: DOWNLOAD_TYPE },
            window.location.origin,
          );
        };

        window.addEventListener("message", function (event) {
          if (event.origin !== window.location.origin) return;
          if (!event.data || event.data.type !== DONE_TYPE) return;
          setDownloadButtonState(false);
        });
      })();
    </script>
    ${previewTruncationNotice}
    ${stockSummaryHtml}
    ${ledgerTablesHtml}
  </body>
</html>`;
}

export function openFarmerStockLedgerPreview(options: PreviewFarmerStockLedgerOptions): Window {
  const html = buildFarmerStockLedgerPreviewHtml(options);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const previewWindow = window.open(url, '_blank');

  if (!previewWindow) {
    URL.revokeObjectURL(url);
    throw new Error('Pop-up blocked. Allow pop-ups for this site to preview the report.');
  }

  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return previewWindow;
}
