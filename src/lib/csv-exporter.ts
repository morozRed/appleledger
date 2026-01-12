/**
 * CSV Exporter for Apple App Store Sales Reports
 * Generates CSV files compatible with Google Sheets and Excel
 */

import type { ParsedReport } from './types';
import { formatDate } from './parser';

/**
 * Generate CSV content from parsed report data
 */
export function generateCSV(report: ParsedReport): string {
  const lines: string[] = [];

  // Header section
  lines.push('App Store Sales Report');
  lines.push(`Vendor,${escapeCSV(report.metadata.vendorName)}`);
  lines.push(`Period Start,${formatDate(report.metadata.startDate)}`);
  lines.push(`Period End,${formatDate(report.metadata.endDate)}`);
  lines.push(`Generated,${new Date().toISOString().split('T')[0]}`);
  lines.push('');

  // Summary by Currency
  lines.push('SUMMARY BY CURRENCY');
  lines.push('Currency,Units Sold,Net Proceeds');
  for (const c of report.summary.byCurrency) {
    lines.push(`${c.currency},${c.totalQuantity},${c.totalProceeds.toFixed(2)}`);
  }
  lines.push('');

  // Country & Currency Breakdown
  lines.push('COUNTRY & CURRENCY BREAKDOWN');
  lines.push('Country,Currency,Units,Net Proceeds');
  for (const c of report.summary.byCountry) {
    lines.push(
      `${escapeCSV(c.countryOfSale)},${c.currency},${c.quantity},${c.proceeds.toFixed(2)}`
    );
  }
  lines.push('');

  // Product Breakdown
  if (report.summary.byProduct.length > 0) {
    lines.push('PRODUCT BREAKDOWN');
    lines.push('Product,SKU,Units,Net Proceeds');
    for (const p of report.summary.byProduct) {
      const proceedsStr = Object.entries(p.proceedsByCurrency)
        .map(([currency, amount]) => `${amount.toFixed(2)} ${currency}`)
        .join(' | ');
      lines.push(`${escapeCSV(p.title)},${escapeCSV(p.sku)},${p.quantity},${escapeCSV(proceedsStr)}`);
    }
    lines.push('');
  }

  // Transaction Details
  lines.push('TRANSACTION DETAILS');
  lines.push('Date,Country,Product,SKU,Type,Quantity,Proceeds,Currency');
  for (const t of report.transactions) {
    lines.push(
      `${formatDate(t.transactionDate)},${escapeCSV(t.countryOfSale)},${escapeCSV(t.title)},${escapeCSV(t.sku)},${t.saleOrReturn === 'S' ? 'Sale' : 'Return'},${t.quantity},${t.partnerShare.toFixed(2)},${t.partnerShareCurrency}`
    );
  }

  return lines.join('\n');
}

/**
 * Escape a value for CSV (handle commas, quotes, newlines)
 */
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Download CSV file
 */
export function downloadCSV(report: ParsedReport): void {
  const csv = generateCSV(report);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const periodStart = formatDate(report.metadata.startDate);
  const periodEnd = formatDate(report.metadata.endDate);
  const filename = `AppStore_Report_${periodStart}_${periodEnd}.csv`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
