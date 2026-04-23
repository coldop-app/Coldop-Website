import { Image, Text, View } from '@react-pdf/renderer';
import type {
  DeliveryRow,
  FarmerReportComputedData,
  ReceiptRow,
} from './farmerReportCalculations';
import type { FarmerReportPdfStyles } from './FarmerReportPdf';

type PdfStyles = FarmerReportPdfStyles;

interface FarmerInfo {
  accountNumber: number | string;
  name: string;
  address: string;
  mobileNumber: string;
}

interface HeaderSectionProps {
  companyName: string;
  styles: PdfStyles;
}

interface FarmerInfoSectionProps {
  farmer: FarmerInfo;
  reportDate: string;
  styles: PdfStyles;
}

interface SummarySectionProps {
  data: FarmerReportComputedData;
  styles: PdfStyles;
}

interface ReceiptLedgerSectionProps {
  data: FarmerReportComputedData;
  groupByVariety: boolean;
  styles: PdfStyles;
}

interface DeliveryLedgerSectionProps {
  data: FarmerReportComputedData;
  groupByVariety: boolean;
  styles: PdfStyles;
}

interface FooterSectionProps {
  styles: PdfStyles;
}

function getReceiptColWidth(col: string): string {
  if (col === 'VARIETY') return '14%';
  if (col === 'DATE') return '10%';
  if (col === 'VOUCHER') return '8%';
  if (col === 'CUSTOM MARKA') return '10%';
  if (col === 'TOTAL' || col === 'G.TOTAL') return '8%';
  if (col === 'REMARKS') return '8%';
  return '8%';
}

function getDeliveryColWidth(col: string): string {
  if (col === 'VARIETY') return '14%';
  if (col === 'DATE') return '10%';
  if (col === 'VOUCHER') return '8%';
  if (col === 'CUSTOM MARKA') return '10%';
  if (col === 'TOTAL' || col === 'G.TOTAL') return '8%';
  return '8%';
}

function ReceiptTableHeader({
  cols,
  styles,
}: {
  cols: string[];
  styles: PdfStyles;
}) {
  return (
    <View style={styles.tableHeaderRow} minPresenceAhead={28}>
      {cols.map((col, i) => (
        <Text
          key={col}
          style={[
            styles.cell,
            ...(col === 'VARIETY' ? [styles.cellLeft] : []),
            ...(i === cols.length - 1 ? [styles.cellLast] : []),
            ...(col === 'TOTAL' ? [styles.cellTotal] : []),
            ...(col === 'G.TOTAL' ? [styles.cellGTotal] : []),
            ...(col === 'REMARKS' ? [styles.cellRemarks] : []),
            ...(col === 'CUSTOM MARKA' ? [styles.cellLeft] : []),
            { width: getReceiptColWidth(col) },
          ]}
        >
          {col}
        </Text>
      ))}
    </View>
  );
}

function DeliveryTableHeader({
  cols,
  styles,
}: {
  cols: string[];
  styles: PdfStyles;
}) {
  return (
    <View style={styles.tableHeaderRow}>
      {cols.map((col, i) => (
        <Text
          key={col}
          style={[
            styles.cell,
            ...(col === 'VARIETY' ? [styles.cellLeft] : []),
            ...(i === cols.length - 1 ? [styles.cellLast] : []),
            ...(col === 'TOTAL' ? [styles.cellTotal] : []),
            ...(col === 'G.TOTAL' ? [styles.cellGTotal] : []),
            ...(col === 'CUSTOM MARKA' ? [styles.cellLeft] : []),
            { width: getDeliveryColWidth(col) },
          ]}
        >
          {col}
        </Text>
      ))}
    </View>
  );
}

function ReceiptDataRow({
  row,
  orderedSizeColumns,
  showSpecialFields,
  styles,
  rowKey,
}: {
  row: ReceiptRow;
  orderedSizeColumns: string[];
  showSpecialFields: boolean;
  styles: PdfStyles;
  rowKey: string;
}) {
  return (
    <View key={rowKey} style={styles.tableRow} wrap={false}>
      <Text style={[styles.cell, { width: '10%' }]}>{row.date}</Text>
      <Text style={[styles.cell, { width: '8%' }]}>{row.voucher}</Text>
      <Text style={[styles.cellLeft, { width: '14%' }]}>{row.variety}</Text>
      {showSpecialFields && (
        <Text style={[styles.cellLeft, { width: '10%' }]}>{row.customMarka}</Text>
      )}
      {orderedSizeColumns.map((col) => {
        const list = row.sizeQtys[col] ?? [];
        return (
          <View key={col} style={[styles.cell, styles.cellQtyLoc, { width: '8%' }]}>
            {list.length === 0 ? (
              <Text>-</Text>
            ) : (
              list.map((item, i) => (
                <View
                  key={i}
                  style={[styles.cellQtyLocBlock, i === list.length - 1 ? { marginBottom: 0 } : {}]}
                >
                  <Text>{item.qty}</Text>
                  {item.loc ? <Text style={styles.cellLocText}>{item.loc}</Text> : null}
                </View>
              ))
            )}
          </View>
        );
      })}
      <Text style={[styles.cell, styles.cellTotal, { width: '8%' }]}>{row.rowTotal}</Text>
      {!showSpecialFields && (
        <Text style={[styles.cell, styles.cellGTotal, { width: '8%' }]}>{row.runningTotal}</Text>
      )}
      <Text style={[styles.cell, styles.cellRemarks, styles.cellLast, { width: '8%' }]}>
        {row.remarks}
      </Text>
    </View>
  );
}

function DeliveryDataRow({
  row,
  orderedSizeColumns,
  showSpecialFields,
  styles,
  rowKey,
}: {
  row: DeliveryRow;
  orderedSizeColumns: string[];
  showSpecialFields: boolean;
  styles: PdfStyles;
  rowKey: string;
}) {
  return (
    <View key={rowKey} style={styles.tableRow}>
      <Text style={[styles.cell, { width: '10%' }]}>{row.date}</Text>
      <Text style={[styles.cell, { width: '8%' }]}>{row.voucher}</Text>
      <Text style={[styles.cellLeft, { width: '14%' }]}>{row.variety}</Text>
      {showSpecialFields && (
        <Text style={[styles.cellLeft, { width: '10%' }]}>{row.customMarka}</Text>
      )}
      {orderedSizeColumns.map((col) => {
        const list = row.sizeQtys[col] ?? [];
        return (
          <View key={col} style={[styles.cell, styles.cellQtyLoc, { width: '8%' }]}>
            {list.length === 0 ? (
              <Text>-</Text>
            ) : (
              list.map((item, i) => (
                <View
                  key={i}
                  style={[styles.cellQtyLocBlock, i === list.length - 1 ? { marginBottom: 0 } : {}]}
                >
                  <Text>{item.qty}</Text>
                  {item.loc ? <Text style={styles.cellLocText}>{item.loc}</Text> : null}
                </View>
              ))
            )}
          </View>
        );
      })}
      <Text style={[styles.cell, styles.cellTotal, showSpecialFields ? styles.cellLast : {}, { width: '8%' }]}>
        {row.rowTotal}
      </Text>
      {!showSpecialFields && (
        <Text style={[styles.cell, styles.cellGTotal, styles.cellLast, { width: '8%' }]}>
          {row.runningTotal}
        </Text>
      )}
    </View>
  );
}

function renderReceiptRows({
  rows,
  keyPrefix,
  groupByVariety,
  orderedSizeColumns,
  showSpecialFields,
  styles,
}: {
  rows: ReceiptRow[];
  keyPrefix: string;
  groupByVariety: boolean;
  orderedSizeColumns: string[];
  showSpecialFields: boolean;
  styles: PdfStyles;
}) {
  if (!groupByVariety) {
    return rows.map((row, idx) => (
      <ReceiptDataRow
        key={`${keyPrefix}-${row.date}-${row.voucher}-${idx}`}
        row={row}
        orderedSizeColumns={orderedSizeColumns}
        showSpecialFields={showSpecialFields}
        styles={styles}
        rowKey={`${keyPrefix}-${row.date}-${row.voucher}-${idx}`}
      />
    ));
  }

  const grouped = Object.entries(Object.groupBy(rows, (row) => String(row.variety ?? '-'))).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  return grouped.map(([variety, varietyRows], groupIdx) => (
    <View key={`${keyPrefix}-group-${variety}-${groupIdx}`}>
      <View style={styles.tableRow}>
        <Text style={[styles.cellLeft, styles.cellLast, styles.varietyGroupCell]}>Variety: {variety}</Text>
      </View>
      {(varietyRows ?? []).map((row, idx) => (
        <ReceiptDataRow
          key={`${keyPrefix}-${variety}-${row.date}-${row.voucher}-${idx}`}
          row={row}
          orderedSizeColumns={orderedSizeColumns}
          showSpecialFields={showSpecialFields}
          styles={styles}
          rowKey={`${keyPrefix}-${variety}-${row.date}-${row.voucher}-${idx}`}
        />
      ))}
    </View>
  ));
}

function buildVarietySectionsFromRows(rows: ReceiptRow[], orderedSizeColumns: string[]) {
  const grouped = Object.entries(Object.groupBy(rows, (row) => String(row.variety ?? '-'))).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  return grouped.map(([varietyName, groupedRows]) => {
    const safeRows = groupedRows ?? [];
    const totalsBySize = Object.fromEntries(orderedSizeColumns.map((col) => [col, 0])) as Record<string, number>;
    for (const row of safeRows) {
      for (const col of orderedSizeColumns) {
        totalsBySize[col] += (row.sizeQtys[col] ?? []).reduce((sum, x) => sum + x.qty, 0);
      }
    }
    const varietyTotal = safeRows.reduce((sum, row) => sum + row.rowTotal, 0);

    return { varietyName, rows: safeRows, totalsBySize, varietyTotal };
  });
}

function renderGroupedReceiptVarietyTables({
  rows,
  keyPrefix,
  orderedSizeColumns,
  showSpecialFields,
  styles,
  tableCols,
}: {
  rows: ReceiptRow[];
  keyPrefix: string;
  orderedSizeColumns: string[];
  showSpecialFields: boolean;
  styles: PdfStyles;
  tableCols: string[];
}) {
  const sections = buildVarietySectionsFromRows(rows, orderedSizeColumns);

  return sections.map(({ varietyName, rows: varietyRows, totalsBySize, varietyTotal }) => (
    <View key={`${keyPrefix}-${varietyName}`} style={styles.varietySectionBlock}>
      <Text style={styles.varietySubtitle} minPresenceAhead={60}>
        Variety: {varietyName}
      </Text>
      <View style={styles.table}>
        <ReceiptTableHeader cols={tableCols} styles={styles} />
        {varietyRows.map((row, idx) => (
          <ReceiptDataRow
            key={`${keyPrefix}-${varietyName}-${row.date}-${row.voucher}-${idx}`}
            row={row}
            orderedSizeColumns={orderedSizeColumns}
            showSpecialFields={showSpecialFields}
            styles={styles}
            rowKey={`${keyPrefix}-${varietyName}-${row.date}-${row.voucher}-${idx}`}
          />
        ))}
        <View style={[styles.tableRow, styles.rowTotals]} wrap={false}>
          <Text style={[styles.cell, { width: '10%' }]}>Subtotal</Text>
          <Text style={[styles.cell, { width: '8%' }]}>-</Text>
          <Text style={[styles.cellLeft, { width: '14%' }]}>-</Text>
          {showSpecialFields && <Text style={[styles.cellLeft, { width: '10%' }]}>-</Text>}
          {orderedSizeColumns.map((col) => (
            <Text key={`${keyPrefix}-${varietyName}-${col}`} style={[styles.cell, { width: '8%' }]}>
              {totalsBySize[col] ?? 0}
            </Text>
          ))}
          <Text style={[styles.cell, styles.cellTotal, { width: '8%' }]}>{varietyTotal}</Text>
          {!showSpecialFields && (
            <Text style={[styles.cell, styles.cellGTotal, { width: '8%' }]}>
              {varietyRows.length > 0 ? varietyRows[varietyRows.length - 1].runningTotal : 0}
            </Text>
          )}
          <Text style={[styles.cell, styles.cellRemarks, styles.cellLast, { width: '8%' }]}>-</Text>
        </View>
      </View>
    </View>
  ));
}

export function HeaderSection({ companyName, styles }: HeaderSectionProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.companyName}>{companyName}</Text>
      <Text style={styles.reportTitle}>FARMER ACCOUNT LEDGER</Text>
    </View>
  );
}

export function FarmerInfoSection({ farmer, reportDate, styles }: FarmerInfoSectionProps) {
  return (
    <View style={styles.farmerInfoStrip}>
      <View style={styles.farmerInfoItem}>
        <Text style={styles.farmerInfoLabel}>A/c No</Text>
        <Text style={styles.farmerInfoValue}>{String(farmer.accountNumber)}</Text>
      </View>
      <View style={styles.farmerInfoItem}>
        <Text style={styles.farmerInfoLabel}>Farmer</Text>
        <Text style={styles.farmerInfoValue}>{farmer.name}</Text>
      </View>
      <View style={styles.farmerInfoItem}>
        <Text style={styles.farmerInfoLabel}>Address</Text>
        <Text style={styles.farmerInfoValue}>{farmer.address}</Text>
      </View>
      <View style={styles.farmerInfoItem}>
        <Text style={styles.farmerInfoLabel}>Mobile</Text>
        <Text style={styles.farmerInfoValue}>{farmer.mobileNumber}</Text>
      </View>
      <View style={[styles.farmerInfoItem, styles.farmerInfoItemLast]}>
        <Text style={styles.farmerInfoLabel}>Report Date</Text>
        <Text style={styles.farmerInfoValue}>{reportDate}</Text>
      </View>
    </View>
  );
}

export function SummarySection({
  data,
  styles,
}: SummarySectionProps) {
  const sizeColumns = data.orderedSizeColumns;
  const sizeColWidth = sizeColumns.length > 0 ? `${Math.max(8, Math.floor(62 / sizeColumns.length))}%` : '12%';

  const buildSummaryMatrix = (rows: ReceiptRow[]) => {
    const varietyMap = new Map<string, Record<string, number>>();
    for (const row of rows) {
      const variety = row.variety?.trim() || '-';
      const totals =
        varietyMap.get(variety) ??
        (Object.fromEntries(sizeColumns.map((col) => [col, 0])) as Record<string, number>);
      for (const col of sizeColumns) {
        totals[col] += (row.sizeQtys[col] ?? []).reduce((sum, item) => sum + item.qty, 0);
      }
      varietyMap.set(variety, totals);
    }

    const varietyRows = [...varietyMap.entries()]
      .map(([variety, totalsBySize]) => ({
        variety,
        totalsBySize,
        rowTotal: sizeColumns.reduce((sum, col) => sum + (totalsBySize[col] ?? 0), 0),
      }))
      .sort((a, b) => a.variety.localeCompare(b.variety));

    const grandTotalsBySize = Object.fromEntries(sizeColumns.map((col) => [col, 0])) as Record<string, number>;
    for (const row of varietyRows) {
      for (const col of sizeColumns) {
        grandTotalsBySize[col] += row.totalsBySize[col] ?? 0;
      }
    }

    return {
      varietyRows,
      grandTotalsBySize,
      grandTotal: sizeColumns.reduce((sum, col) => sum + (grandTotalsBySize[col] ?? 0), 0),
    };
  };

  const summaryGroups = data.useOwnershipFilter
    ? [
        {
          key: 'owned',
          title: 'Owned Stock Summary',
          rows: [...data.ownedReceiptRows, ...data.ownedTransferRows],
          visible: data.showOwnedSection,
        },
        {
          key: 'farmer',
          title: 'Farmer Stock Summary',
          rows: [...data.farmerReceiptRows, ...data.farmerTransferRows],
          visible: data.showFarmerSection,
        },
      ].filter((group) => group.visible)
    : [
        {
          key: 'all',
          title: 'Stock Summary',
          rows: [...data.receiptRows, ...data.incomingTransferRows],
          visible: true,
        },
      ];

  return (
    <View style={styles.summary}>
      {summaryGroups.map((group, groupIdx) => {
        const { varietyRows, grandTotalsBySize, grandTotal } = buildSummaryMatrix(group.rows);
        return (
          <View
            key={group.key}
            style={[
              styles.summaryGroupContainer,
              groupIdx === summaryGroups.length - 1 ? styles.summaryGroupContainerLast : {},
            ]}
          >
            {data.useOwnershipFilter && <Text style={styles.summaryOwnershipTitle}>{group.title}</Text>}
            <View style={styles.summaryTable}>
              <View style={[styles.summaryTableRow, styles.tableHeaderRow]}>
                <Text style={[styles.cellLeft, { width: '26%', fontWeight: 'bold' }]}>Varieties</Text>
                {sizeColumns.map((col) => (
                  <Text key={`${group.key}-${col}`} style={[styles.cell, { width: sizeColWidth, fontWeight: 'bold' }]}>
                    {col}
                  </Text>
                ))}
                <Text style={[styles.cell, styles.cellTotal, styles.cellLast, { width: '12%', fontWeight: 'bold' }]}>
                  Total
                </Text>
              </View>
              {varietyRows.map((row, idx) => (
                <View
                  key={`${group.key}-${row.variety}-${idx}`}
                  style={[styles.summaryTableRow, idx === varietyRows.length - 1 ? styles.summaryTableRowLast : {}]}
                >
                  <Text style={[styles.cellLeft, { width: '26%' }]}>{row.variety}</Text>
                  {sizeColumns.map((col) => (
                    <Text key={`${group.key}-${row.variety}-${col}`} style={[styles.cell, { width: sizeColWidth }]}>
                      {row.totalsBySize[col] ?? 0}
                    </Text>
                  ))}
                  <Text style={[styles.cell, styles.cellTotal, styles.cellLast, { width: '12%' }]}>{row.rowTotal}</Text>
                </View>
              ))}
              <View style={[styles.summaryTableRow, styles.rowTotals, styles.summaryTableRowLast]} wrap={false}>
                <Text style={[styles.cellLeft, { width: '26%', fontWeight: 'bold' }]}>Bag Total</Text>
                {sizeColumns.map((col) => (
                  <Text key={`${group.key}-grand-${col}`} style={[styles.cell, { width: sizeColWidth, fontWeight: 'bold' }]}>
                    {grandTotalsBySize[col] ?? 0}
                  </Text>
                ))}
                <Text style={[styles.cell, styles.cellTotal, styles.cellLast, { width: '12%', fontWeight: 'bold' }]}>
                  {grandTotal}
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

export function ReceiptLedgerSection({ data, groupByVariety, styles }: ReceiptLedgerSectionProps) {
  return (
    <View style={styles.ledgerContainer}>
      {data.useOwnershipFilter ? (
        <>
          {data.showOwnedSection && (
            <>
              <Text style={styles.ledgerTitle} minPresenceAhead={70}>
                Receipt Details (OWNED)
              </Text>
              {groupByVariety
                ? renderGroupedReceiptVarietyTables({
                    rows: data.ownedReceiptRows,
                    keyPrefix: 'owned',
                    orderedSizeColumns: data.orderedSizeColumns,
                    showSpecialFields: data.showSpecialFields,
                    styles,
                    tableCols: data.receiptTableCols,
                  })
                : (
                    <View style={styles.table}>
                      <ReceiptTableHeader cols={data.receiptTableCols} styles={styles} />
                      {renderReceiptRows({
                        rows: data.ownedReceiptRows,
                        keyPrefix: 'owned',
                        groupByVariety,
                        orderedSizeColumns: data.orderedSizeColumns,
                        showSpecialFields: data.showSpecialFields,
                        styles,
                      })}
                      {data.ownedReceiptRows.length > 0 && (
                        <View style={[styles.tableRow, styles.rowTotals]} wrap={false}>
                          <Text style={[styles.cell, { width: '10%' }]}>TOTAL</Text>
                          <Text style={[styles.cell, { width: '8%' }]}>-</Text>
                          <Text style={[styles.cellLeft, { width: '14%' }]}>-</Text>
                          {data.showSpecialFields && <Text style={[styles.cellLeft, { width: '10%' }]}>-</Text>}
                          {data.orderedSizeColumns.map((col) => (
                            <Text key={col} style={[styles.cell, { width: '8%' }]}>
                              {data.ownedTotalsBySize[col] ?? 0}
                            </Text>
                          ))}
                          <Text style={[styles.cell, styles.cellTotal, { width: '8%' }]}>{data.totalOwned}</Text>
                          {!data.showSpecialFields && (
                            <Text style={[styles.cell, styles.cellGTotal, { width: '8%' }]}>{data.totalOwned}</Text>
                          )}
                          <Text style={[styles.cell, styles.cellRemarks, styles.cellLast, { width: '8%' }]}>-</Text>
                        </View>
                      )}
                    </View>
                  )}
              {data.ownedTransferRows.length > 0 && (
                <>
                  <Text style={styles.ledgerSubsectionTitle} minPresenceAhead={70}>
                    Purchases from other farmers (incoming transfer) — OWNED
                  </Text>
                  {groupByVariety
                    ? renderGroupedReceiptVarietyTables({
                        rows: data.ownedTransferRows,
                        keyPrefix: 'owned-it',
                        orderedSizeColumns: data.orderedSizeColumns,
                        showSpecialFields: data.showSpecialFields,
                        styles,
                        tableCols: data.receiptTableCols,
                      })
                    : (
                        <View style={styles.table}>
                          <ReceiptTableHeader cols={data.receiptTableCols} styles={styles} />
                          {renderReceiptRows({
                            rows: data.ownedTransferRows,
                            keyPrefix: 'owned-it',
                            groupByVariety,
                            orderedSizeColumns: data.orderedSizeColumns,
                            showSpecialFields: data.showSpecialFields,
                            styles,
                          })}
                          <View style={[styles.tableRow, styles.rowTotals]} wrap={false}>
                            <Text style={[styles.cell, { width: '10%' }]}>TOTAL</Text>
                            <Text style={[styles.cell, { width: '8%' }]}>-</Text>
                            <Text style={[styles.cellLeft, { width: '14%' }]}>-</Text>
                            {data.showSpecialFields && <Text style={[styles.cellLeft, { width: '10%' }]}>-</Text>}
                            {data.orderedSizeColumns.map((col) => (
                              <Text key={col} style={[styles.cell, { width: '8%' }]}>
                                {data.ownedTransferTotalsBySize[col] ?? 0}
                              </Text>
                            ))}
                            <Text style={[styles.cell, styles.cellTotal, { width: '8%' }]}>
                              {data.totalOwnedTransferBags}
                            </Text>
                            {!data.showSpecialFields && (
                              <Text style={[styles.cell, styles.cellGTotal, { width: '8%' }]}>
                                {data.totalOwned + data.totalOwnedTransferBags}
                              </Text>
                            )}
                            <Text style={[styles.cell, styles.cellRemarks, styles.cellLast, { width: '8%' }]}>-</Text>
                          </View>
                        </View>
                      )}
                </>
              )}
            </>
          )}
          {data.showFarmerSection && (
            <>
              <Text style={styles.ledgerTitle} minPresenceAhead={70}>
                Receipt Details (FARMER)
              </Text>
              {groupByVariety
                ? renderGroupedReceiptVarietyTables({
                    rows: data.farmerReceiptRows,
                    keyPrefix: 'farmer',
                    orderedSizeColumns: data.orderedSizeColumns,
                    showSpecialFields: data.showSpecialFields,
                    styles,
                    tableCols: data.receiptTableCols,
                  })
                : (
                    <View style={styles.table}>
                      <ReceiptTableHeader cols={data.receiptTableCols} styles={styles} />
                      {renderReceiptRows({
                        rows: data.farmerReceiptRows,
                        keyPrefix: 'farmer',
                        groupByVariety,
                        orderedSizeColumns: data.orderedSizeColumns,
                        showSpecialFields: data.showSpecialFields,
                        styles,
                      })}
                      {data.farmerReceiptRows.length > 0 && (
                        <View style={[styles.tableRow, styles.rowTotals]} wrap={false}>
                          <Text style={[styles.cell, { width: '10%' }]}>TOTAL</Text>
                          <Text style={[styles.cell, { width: '8%' }]}>-</Text>
                          <Text style={[styles.cellLeft, { width: '14%' }]}>-</Text>
                          {data.showSpecialFields && <Text style={[styles.cellLeft, { width: '10%' }]}>-</Text>}
                          {data.orderedSizeColumns.map((col) => (
                            <Text key={col} style={[styles.cell, { width: '8%' }]}>
                              {data.farmerTotalsBySize[col] ?? 0}
                            </Text>
                          ))}
                          <Text style={[styles.cell, styles.cellTotal, { width: '8%' }]}>{data.totalFarmer}</Text>
                          {!data.showSpecialFields && (
                            <Text style={[styles.cell, styles.cellGTotal, { width: '8%' }]}>{data.totalFarmer}</Text>
                          )}
                          <Text style={[styles.cell, styles.cellRemarks, styles.cellLast, { width: '8%' }]}>-</Text>
                        </View>
                      )}
                    </View>
                  )}
              {data.farmerTransferRows.length > 0 && (
                <>
                  <Text style={styles.ledgerSubsectionTitle} minPresenceAhead={70}>
                    Purchases from other farmers (incoming transfer) — FARMER
                  </Text>
                  {groupByVariety
                    ? renderGroupedReceiptVarietyTables({
                        rows: data.farmerTransferRows,
                        keyPrefix: 'farmer-it',
                        orderedSizeColumns: data.orderedSizeColumns,
                        showSpecialFields: data.showSpecialFields,
                        styles,
                        tableCols: data.receiptTableCols,
                      })
                    : (
                        <View style={styles.table}>
                          <ReceiptTableHeader cols={data.receiptTableCols} styles={styles} />
                          {renderReceiptRows({
                            rows: data.farmerTransferRows,
                            keyPrefix: 'farmer-it',
                            groupByVariety,
                            orderedSizeColumns: data.orderedSizeColumns,
                            showSpecialFields: data.showSpecialFields,
                            styles,
                          })}
                          <View style={[styles.tableRow, styles.rowTotals]} wrap={false}>
                            <Text style={[styles.cell, { width: '10%' }]}>TOTAL</Text>
                            <Text style={[styles.cell, { width: '8%' }]}>-</Text>
                            <Text style={[styles.cellLeft, { width: '14%' }]}>-</Text>
                            {data.showSpecialFields && <Text style={[styles.cellLeft, { width: '10%' }]}>-</Text>}
                            {data.orderedSizeColumns.map((col) => (
                              <Text key={col} style={[styles.cell, { width: '8%' }]}>
                                {data.farmerTransferTotalsBySize[col] ?? 0}
                              </Text>
                            ))}
                            <Text style={[styles.cell, styles.cellTotal, { width: '8%' }]}>
                              {data.totalFarmerTransferBags}
                            </Text>
                            {!data.showSpecialFields && (
                              <Text style={[styles.cell, styles.cellGTotal, { width: '8%' }]}>
                                {data.totalFarmer + data.totalFarmerTransferBags}
                              </Text>
                            )}
                            <Text style={[styles.cell, styles.cellRemarks, styles.cellLast, { width: '8%' }]}>-</Text>
                          </View>
                        </View>
                      )}
                </>
              )}
            </>
          )}
        </>
      ) : (
        <>
          <Text style={styles.ledgerTitle} minPresenceAhead={70}>
            Receipt Details
          </Text>
          {groupByVariety && data.varietyKeys.length > 0 ? (
            <>
              {data.receiptVarietySections.map(({ varietyName, rows, varietyTotal, totalsBySize }) => (
                <View key={varietyName} style={styles.varietySectionBlock}>
                  <Text style={styles.varietySubtitle} minPresenceAhead={60}>
                    Variety: {varietyName}
                  </Text>
                  <View style={styles.table}>
                    <ReceiptTableHeader cols={data.receiptTableCols} styles={styles} />
                    {rows.map((row, idx) => (
                      <ReceiptDataRow
                        key={`${varietyName}-${row.date}-${row.voucher}-${idx}`}
                        row={row}
                        orderedSizeColumns={data.orderedSizeColumns}
                        showSpecialFields={data.showSpecialFields}
                        styles={styles}
                        rowKey={`${varietyName}-${row.date}-${row.voucher}-${idx}`}
                      />
                    ))}
                    <View style={[styles.tableRow, styles.rowTotals]} wrap={false}>
                      <Text style={[styles.cell, { width: '10%' }]}>Subtotal</Text>
                      <Text style={[styles.cell, { width: '8%' }]}>-</Text>
                      <Text style={[styles.cellLeft, { width: '14%' }]}>-</Text>
                      {data.showSpecialFields && <Text style={[styles.cellLeft, { width: '10%' }]}>-</Text>}
                      {data.orderedSizeColumns.map((col) => (
                        <Text key={col} style={[styles.cell, { width: '8%' }]}>
                          {totalsBySize[col] ?? 0}
                        </Text>
                      ))}
                      <Text style={[styles.cell, styles.cellTotal, { width: '8%' }]}>{varietyTotal}</Text>
                      {!data.showSpecialFields && (
                        <Text style={[styles.cell, styles.cellGTotal, { width: '8%' }]}>
                          {rows.length > 0 ? rows[rows.length - 1].runningTotal : 0}
                        </Text>
                      )}
                      <Text style={[styles.cell, styles.cellRemarks, styles.cellLast, { width: '8%' }]}>-</Text>
                    </View>
                  </View>
                </View>
              ))}
              {data.incomingTransferTxCount > 0 && (
                <>
                  <Text style={styles.ledgerSubsectionTitle} minPresenceAhead={70}>
                    Purchases from other farmers (incoming transfer)
                  </Text>
                  {data.transferVarietySections.map(({ varietyName, rows, varietyTotal, totalsBySize }) => (
                    <View key={`transfer-${varietyName}`} style={styles.varietySectionBlock}>
                      <Text style={styles.varietySubtitle} minPresenceAhead={60}>
                        Variety: {varietyName}
                      </Text>
                      <View style={styles.table}>
                        <ReceiptTableHeader cols={data.receiptTableCols} styles={styles} />
                        {rows.map((row, idx) => (
                          <ReceiptDataRow
                            key={`transfer-${varietyName}-${row.date}-${row.voucher}-${idx}`}
                            row={row}
                            orderedSizeColumns={data.orderedSizeColumns}
                            showSpecialFields={data.showSpecialFields}
                            styles={styles}
                            rowKey={`transfer-${varietyName}-${row.date}-${row.voucher}-${idx}`}
                          />
                        ))}
                        <View style={[styles.tableRow, styles.rowTotals]} wrap={false}>
                          <Text style={[styles.cell, { width: '10%' }]}>Subtotal</Text>
                          <Text style={[styles.cell, { width: '8%' }]}>-</Text>
                          <Text style={[styles.cellLeft, { width: '14%' }]}>-</Text>
                          {data.showSpecialFields && <Text style={[styles.cellLeft, { width: '10%' }]}>-</Text>}
                          {data.orderedSizeColumns.map((col) => (
                            <Text key={col} style={[styles.cell, { width: '8%' }]}>
                              {totalsBySize[col] ?? 0}
                            </Text>
                          ))}
                          <Text style={[styles.cell, styles.cellTotal, { width: '8%' }]}>{varietyTotal}</Text>
                          {!data.showSpecialFields && (
                            <Text style={[styles.cell, styles.cellGTotal, { width: '8%' }]}>
                              {rows.length > 0 ? rows[rows.length - 1].runningTotal : 0}
                            </Text>
                          )}
                          <Text style={[styles.cell, styles.cellRemarks, styles.cellLast, { width: '8%' }]}>-</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </>
              )}
            </>
          ) : (
            <>
              <View style={styles.table}>
                <ReceiptTableHeader cols={data.receiptTableCols} styles={styles} />
                {data.receiptRows.map((row, idx) => (
                  <ReceiptDataRow
                    key={`${row.date}-${row.voucher}-${idx}`}
                    row={row}
                    orderedSizeColumns={data.orderedSizeColumns}
                    showSpecialFields={data.showSpecialFields}
                    styles={styles}
                    rowKey={`${row.date}-${row.voucher}-${idx}`}
                  />
                ))}
                {data.receiptRows.length > 0 && (
                  <View style={[styles.tableRow, styles.rowTotals]} wrap={false}>
                    <Text style={[styles.cell, { width: '10%' }]}>TOTAL</Text>
                    <Text style={[styles.cell, { width: '8%' }]}>-</Text>
                    <Text style={[styles.cellLeft, { width: '14%' }]}>-</Text>
                    {data.showSpecialFields && <Text style={[styles.cellLeft, { width: '10%' }]}>-</Text>}
                    {data.orderedSizeColumns.map((col) => (
                      <Text key={col} style={[styles.cell, { width: '8%' }]}>
                        {data.farmReceiptTotalsBySize[col] ?? 0}
                      </Text>
                    ))}
                    <Text style={[styles.cell, styles.cellTotal, { width: '8%' }]}>{data.totalFarmReceived}</Text>
                    {!data.showSpecialFields && (
                      <Text style={[styles.cell, styles.cellGTotal, { width: '8%' }]}>
                        {data.totalFarmReceived}
                      </Text>
                    )}
                    <Text style={[styles.cell, styles.cellRemarks, styles.cellLast, { width: '8%' }]}>-</Text>
                  </View>
                )}
              </View>
              {data.incomingTransferTxCount > 0 && (
                <>
                  <Text style={styles.ledgerSubsectionTitle} minPresenceAhead={70}>
                    Purchases from other farmers (incoming transfer)
                  </Text>
                  <View style={styles.table}>
                    <ReceiptTableHeader cols={data.receiptTableCols} styles={styles} />
                    {data.incomingTransferRows.map((row, idx) => (
                      <ReceiptDataRow
                        key={`it-${row.date}-${row.voucher}-${idx}`}
                        row={row}
                        orderedSizeColumns={data.orderedSizeColumns}
                        showSpecialFields={data.showSpecialFields}
                        styles={styles}
                        rowKey={`it-${row.date}-${row.voucher}-${idx}`}
                      />
                    ))}
                    <View style={[styles.tableRow, styles.rowTotals]} wrap={false}>
                      <Text style={[styles.cell, { width: '10%' }]}>TOTAL</Text>
                      <Text style={[styles.cell, { width: '8%' }]}>-</Text>
                      <Text style={[styles.cellLeft, { width: '14%' }]}>-</Text>
                      {data.showSpecialFields && <Text style={[styles.cellLeft, { width: '10%' }]}>-</Text>}
                      {data.orderedSizeColumns.map((col) => (
                        <Text key={col} style={[styles.cell, { width: '8%' }]}>
                          {data.incomingTransferTotalsBySize[col] ?? 0}
                        </Text>
                      ))}
                      <Text style={[styles.cell, styles.cellTotal, { width: '8%' }]}>
                        {data.totalIncomingTransferBags}
                      </Text>
                      {!data.showSpecialFields && (
                        <Text style={[styles.cell, styles.cellGTotal, { width: '8%' }]}>
                          {data.totalReceived}
                        </Text>
                      )}
                      <Text style={[styles.cell, styles.cellRemarks, styles.cellLast, { width: '8%' }]}>-</Text>
                    </View>
                  </View>
                </>
              )}
            </>
          )}
        </>
      )}
    </View>
  );
}

export function DeliveryLedgerSection({ data, groupByVariety, styles }: DeliveryLedgerSectionProps) {
  if (!data.hasNonZeroDeliveryVoucher) {
    return null;
  }

  return (
    <View style={styles.ledgerContainer}>
      <Text style={styles.ledgerTitle}>Delivery Details</Text>
      {groupByVariety && data.varietyKeys.length > 0 ? (
        <>
          {data.openingTotal > 0 && (
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.rowBalance]}>
                <Text style={[styles.cell, { width: '10%' }]}>OPENING</Text>
                <Text style={[styles.cell, { width: '8%' }]}>BALANCE</Text>
                <Text style={[styles.cellLeft, { width: '14%' }]}>-</Text>
                {data.showSpecialFields && <Text style={[styles.cellLeft, { width: '10%' }]}>-</Text>}
                {data.orderedSizeColumns.map((col) => (
                  <Text key={col} style={[styles.cell, { width: '8%' }]}>
                    {data.receiptTotalsBySize[col] ?? 0}
                  </Text>
                ))}
                <Text
                  style={[
                    styles.cell,
                    styles.cellTotal,
                    data.showSpecialFields ? styles.cellLast : {},
                    { width: '8%' },
                  ]}
                >
                  {data.openingTotal}
                </Text>
                {!data.showSpecialFields && (
                  <Text style={[styles.cell, styles.cellGTotal, styles.cellLast, { width: '8%' }]}>
                    {data.openingTotal}
                  </Text>
                )}
              </View>
            </View>
          )}
          {data.deliveryVarietySections.map(
            ({ varietyName, rows, varietyDelivered, totalsBySize, runningTotalAfter }) => (
              <View key={varietyName} style={styles.varietySectionBlock}>
                <Text style={styles.varietySubtitle}>Variety: {varietyName}</Text>
                <View style={styles.table}>
                  <DeliveryTableHeader cols={data.deliveryTableCols} styles={styles} />
                  {rows.map((row, idx) => (
                    <DeliveryDataRow
                      key={`${varietyName}-${row.date}-${row.voucher}-${idx}`}
                      row={row}
                      orderedSizeColumns={data.orderedSizeColumns}
                      showSpecialFields={data.showSpecialFields}
                      styles={styles}
                      rowKey={`${varietyName}-${row.date}-${row.voucher}-${idx}`}
                    />
                  ))}
                  <View style={[styles.tableRow, styles.rowTotals]} wrap={false}>
                    <Text style={[styles.cell, { width: '10%' }]}>Subtotal</Text>
                    <Text style={[styles.cell, { width: '8%' }]}>-</Text>
                    <Text style={[styles.cellLeft, { width: '14%' }]}>-</Text>
                    {data.showSpecialFields && <Text style={[styles.cellLeft, { width: '10%' }]}>-</Text>}
                    {data.orderedSizeColumns.map((col) => (
                      <Text key={col} style={[styles.cell, { width: '8%' }]}>
                        {totalsBySize[col] ?? 0}
                      </Text>
                    ))}
                    <Text
                      style={[
                        styles.cell,
                        styles.cellTotal,
                        data.showSpecialFields ? styles.cellLast : {},
                        { width: '8%' },
                      ]}
                    >
                      {varietyDelivered}
                    </Text>
                    {!data.showSpecialFields && (
                      <Text style={[styles.cell, styles.cellGTotal, styles.cellLast, { width: '8%' }]}>
                        {rows.length > 0 ? rows[rows.length - 1].runningTotal : runningTotalAfter}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            )
          )}
        </>
      ) : (
        <View style={styles.table}>
          <DeliveryTableHeader cols={data.deliveryTableCols} styles={styles} />
          {data.openingTotal > 0 && (
            <View style={[styles.tableRow, styles.rowBalance]}>
              <Text style={[styles.cell, { width: '10%' }]}>OPENING</Text>
              <Text style={[styles.cell, { width: '8%' }]}>BALANCE</Text>
              <Text style={[styles.cellLeft, { width: '14%' }]}>-</Text>
              {data.showSpecialFields && <Text style={[styles.cellLeft, { width: '10%' }]}>-</Text>}
              {data.orderedSizeColumns.map((col) => (
                <Text key={col} style={[styles.cell, { width: '8%' }]}>
                  {data.receiptTotalsBySize[col] ?? 0}
                </Text>
              ))}
              <Text
                style={[
                  styles.cell,
                  styles.cellTotal,
                  data.showSpecialFields ? styles.cellLast : {},
                  { width: '8%' },
                ]}
              >
                {data.openingTotal}
              </Text>
              {!data.showSpecialFields && (
                <Text style={[styles.cell, styles.cellGTotal, styles.cellLast, { width: '8%' }]}>
                  {data.openingTotal}
                </Text>
              )}
            </View>
          )}
          {data.deliveryRows.map((row, idx) => (
            <DeliveryDataRow
              key={`${row.date}-${row.voucher}-${idx}`}
              row={row}
              orderedSizeColumns={data.orderedSizeColumns}
              showSpecialFields={data.showSpecialFields}
              styles={styles}
              rowKey={`${row.date}-${row.voucher}-${idx}`}
            />
          ))}
        </View>
      )}
    </View>
  );
}

export function FooterSection({ styles }: FooterSectionProps) {
  return (
    <View style={styles.footer}>
      <View style={styles.footerBrandWrap}>
        <Image
          src="https://res.cloudinary.com/dakh64xhy/image/upload/v1753172868/profile_pictures/lhdlzskpe2gj8dq8jvzl.png"
          style={styles.footerLogo}
        />
        <Text style={styles.poweredBy}>Powered by Coldop</Text>
      </View>
    </View>
  );
}
