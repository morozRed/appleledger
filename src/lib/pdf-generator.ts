/**
 * PDF Generator for Apple App Store Sales Statements
 * Uses jsPDF and jspdf-autotable for professional PDF output
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ParsedReport } from './types';
import { formatCurrency, formatDate } from './parser';

/** PDF generation options */
export interface PDFOptions {
  includeProductBreakdown?: boolean;
  developerNameOverride?: string;
}

/** Colors for the PDF */
const COLORS = {
  primary: [0, 102, 255] as [number, number, number],
  text: [15, 23, 42] as [number, number, number],
  textSecondary: [100, 116, 139] as [number, number, number],
  border: [226, 232, 240] as [number, number, number],
  background: [248, 250, 252] as [number, number, number],
};

/**
 * Generate a PDF sales statement from parsed report data
 */
export function generatePDF(
  report: ParsedReport,
  options: PDFOptions = {}
): jsPDF {
  const includeProductBreakdown = options.includeProductBreakdown ?? true;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPos = margin;

  const developerName =
    options.developerNameOverride || report.metadata.vendorName || 'Developer';

  // === HEADER SECTION ===
  yPos = addHeader(doc, yPos, margin, contentWidth, developerName, report);

  // === SUMMARY SECTION ===
  yPos = addSummarySection(doc, yPos, margin, report);

  // === PAYOUT RECONCILIATION ===
  yPos = addPayoutReconciliation(doc, yPos, margin, contentWidth);

  // === COUNTRY & CURRENCY BREAKDOWN ===
  yPos = addCountryBreakdown(doc, yPos, margin, report);

  // === PRODUCT BREAKDOWN (optional) ===
  if (includeProductBreakdown && report.summary.byProduct.length > 0) {
    yPos = addProductBreakdown(doc, yPos, margin, report);
  }

  // === TAX & ACCOUNTING NOTICE ===
  yPos = addTaxNotice(doc, yPos, margin, contentWidth);

  // === DISCLAIMER ===
  addDisclaimer(doc, yPos, margin, contentWidth);

  return doc;
}

/**
 * Add header section to PDF
 */
function addHeader(
  doc: jsPDF,
  yPos: number,
  margin: number,
  contentWidth: number,
  developerName: string,
  report: ParsedReport
): number {
  // Title
  doc.setFontSize(24);
  doc.setTextColor(...COLORS.primary);
  doc.setFont('helvetica', 'bold');
  doc.text('App Store Sales Statement', margin, yPos);
  yPos += 12;

  // Horizontal line
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, margin + contentWidth, yPos);
  yPos += 8;

  // Metadata grid
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.textSecondary);
  doc.setFont('helvetica', 'normal');

  const leftCol = margin;
  const rightCol = margin + contentWidth / 2;

  doc.text('Developer', leftCol, yPos);
  doc.text('Platform', rightCol, yPos);
  yPos += 5;

  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.text(developerName, leftCol, yPos);
  doc.text('Apple App Store', rightCol, yPos);
  yPos += 8;

  doc.setTextColor(...COLORS.textSecondary);
  doc.setFont('helvetica', 'normal');
  doc.text('Reporting Period', leftCol, yPos);
  doc.text('Generated', rightCol, yPos);
  yPos += 5;

  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'bold');

  const periodStart = formatDate(report.metadata.startDate);
  const periodEnd = formatDate(report.metadata.endDate);
  doc.text(`${periodStart} to ${periodEnd}`, leftCol, yPos);
  doc.text(new Date().toISOString().split('T')[0], rightCol, yPos);
  yPos += 12;

  return yPos;
}

/**
 * Add summary section with currency totals
 */
function addSummarySection(
  doc: jsPDF,
  yPos: number,
  margin: number,
  report: ParsedReport
): number {
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', margin, yPos);
  yPos += 8;

  // Currency summary table
  const summaryData = report.summary.byCurrency.map((c) => [
    c.currency,
    c.totalQuantity.toString(),
    formatCurrency(c.totalProceeds, c.currency),
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Currency', 'Units Sold', 'Net Proceeds']],
    body: summaryData,
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor: COLORS.background,
      textColor: COLORS.textSecondary,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      textColor: COLORS.text,
      fontSize: 10,
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255],
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 40, halign: 'center' },
      2: { halign: 'right', fontStyle: 'bold' },
    },
  });

  yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // Total currencies note
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textSecondary);
  doc.setFont('helvetica', 'italic');
  doc.text(
    `${report.summary.byCurrency.length} ${report.summary.byCurrency.length !== 1 ? 'currencies' : 'currency'} • ${report.summary.totalTransactions} transaction${report.summary.totalTransactions !== 1 ? 's' : ''}`,
    margin,
    yPos
  );
  yPos += 10;

  return yPos;
}

/**
 * Add payout reconciliation explanation
 */
function addPayoutReconciliation(
  doc: jsPDF,
  yPos: number,
  margin: number,
  contentWidth: number
): number {
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.text('Payout Reconciliation', margin, yPos);
  yPos += 8;

  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textSecondary);
  doc.setFont('helvetica', 'normal');

  const reconciliationText =
    'Net proceeds were generated in multiple currencies. Apple converts all proceeds using internal exchange rates and remits a single consolidated payout to the developer\'s bank account. Exchange rates used by Apple are not disclosed in this report.';

  const lines = doc.splitTextToSize(reconciliationText, contentWidth);
  doc.text(lines, margin, yPos);
  yPos += lines.length * 4 + 10;

  return yPos;
}

/**
 * Add country and currency breakdown table
 */
function addCountryBreakdown(
  doc: jsPDF,
  yPos: number,
  margin: number,
  report: ParsedReport
): number {
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.text('Country & Currency Breakdown', margin, yPos);
  yPos += 8;

  const countryData = report.summary.byCountry.map((c) => [
    c.countryOfSale,
    c.currency,
    c.quantity.toString(),
    formatCurrency(c.proceeds, c.currency),
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Country', 'Currency', 'Units', 'Net Proceeds']],
    body: countryData,
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor: COLORS.background,
      textColor: COLORS.textSecondary,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      textColor: COLORS.text,
      fontSize: 10,
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 30 },
      2: { cellWidth: 25, halign: 'center' },
      3: { halign: 'right' },
    },
  });

  yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  return yPos;
}

/**
 * Add product breakdown table with product headers and currency rows
 */
function addProductBreakdown(
  doc: jsPDF,
  yPos: number,
  margin: number,
  report: ParsedReport
): number {
  // Check if we need a new page
  if (yPos > 230) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(14);
  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.text('Product Breakdown', margin, yPos);
  yPos += 8;

  // Build table data with product headers and currency rows
  const tableData: { content: string; isHeader: boolean }[][] = [];

  for (const product of report.summary.byProduct) {
    const unitLabel = product.quantity === 1 ? 'unit' : 'units';
    // Product header row (spans both columns conceptually)
    tableData.push([
      { content: `${product.title} (${product.sku}) — ${product.quantity} ${unitLabel}`, isHeader: true },
      { content: '', isHeader: true },
    ]);
    // Currency rows
    for (const [currency, amount] of Object.entries(product.proceedsByCurrency)) {
      tableData.push([
        { content: `  • ${currency}`, isHeader: false },
        { content: formatCurrency(amount, currency), isHeader: false },
      ]);
    }
  }

  autoTable(doc, {
    startY: yPos,
    head: [['Product / Currency', 'Net Proceeds']],
    body: tableData.map((row) => [row[0].content, row[1].content]),
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor: COLORS.background,
      textColor: COLORS.textSecondary,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      textColor: COLORS.text,
      fontSize: 10,
    },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { halign: 'right' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && tableData[data.row.index]?.[0]?.isHeader) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = COLORS.background;
      }
    },
  });

  yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  return yPos;
}

/**
 * Add tax and accounting notice
 */
function addTaxNotice(
  doc: jsPDF,
  yPos: number,
  margin: number,
  contentWidth: number
): number {
  // Check if we need a new page
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(12);
  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.text('Tax Handling Notice', margin, yPos);
  yPos += 6;

  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textSecondary);
  doc.setFont('helvetica', 'normal');

  const taxText =
    'Apple acts as Merchant of Record for App Store transactions and is responsible for the collection and remittance of applicable indirect taxes (including VAT, GST, and Sales Tax). Amounts shown represent net proceeds payable to the developer, as reported by Apple.';

  const lines = doc.splitTextToSize(taxText, contentWidth);
  doc.text(lines, margin, yPos);
  yPos += lines.length * 4 + 10;

  return yPos;
}

/**
 * Add disclaimer section
 */
function addDisclaimer(
  doc: jsPDF,
  yPos: number,
  margin: number,
  contentWidth: number
): void {
  // Check if we need a new page
  if (yPos > 260) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textSecondary);
  doc.setFont('helvetica', 'italic');

  const disclaimerText =
    'This document is a sales statement generated from Apple App Store financial reports. It is not an invoice issued by Apple Inc. This tool does not calculate taxes. Generated by AppStore Ledger (appstoreledger.dev).';

  const lines = doc.splitTextToSize(disclaimerText, contentWidth);
  doc.text(lines, margin, yPos);
}

/**
 * Generate and download the PDF
 */
export function downloadPDF(
  report: ParsedReport,
  options: PDFOptions = {}
): void {
  const doc = generatePDF(report, options);

  const periodStart = formatDate(report.metadata.startDate);
  const periodEnd = formatDate(report.metadata.endDate);
  const filename = `AppStore_Statement_${periodStart}_${periodEnd}.pdf`;

  doc.save(filename);
}
