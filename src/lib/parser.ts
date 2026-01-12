/**
 * Apple App Store Financial Report Parser
 * Parses TXT/TSV files from App Store Connect
 */

import type {
  ReportMetadata,
  Transaction,
  CountryBreakdown,
  ProductBreakdown,
  CurrencySummary,
  ParsedReport,
  ValidationResult,
} from './types';

/** Column headers expected in Apple financial reports */
const REQUIRED_COLUMNS = [
  'Country of Sale',
  'Partner Share Currency',
  'Quantity',
  'Extended Partner Share',
];

const COLUMN_MAP: Record<string, keyof Transaction> = {
  'Transaction Date': 'transactionDate',
  'Settlement Date': 'settlementDate',
  'Apple Identifier': 'appleIdentifier',
  'SKU': 'sku',
  'Title': 'title',
  'Developer Name': 'developerName',
  'Product Type Identifier': 'productTypeIdentifier',
  'Country of Sale': 'countryOfSale',
  'Quantity': 'quantity',
  'Partner Share': 'partnerShare',
  'Extended Partner Share': 'extendedPartnerShare',
  'Partner Share Currency': 'partnerShareCurrency',
  'Customer Price': 'customerPrice',
  'Customer Currency': 'customerCurrency',
  'Sale or Return': 'saleOrReturn',
  'Promo Code': 'promoCode',
  'Order Type': 'orderType',
  'Region': 'region',
};

/**
 * Detect the delimiter used in the file (tab or comma)
 */
export function detectDelimiter(content: string): string {
  const firstLines = content.split('\n').slice(0, 5).join('\n');
  const tabCount = (firstLines.match(/\t/g) || []).length;
  const commaCount = (firstLines.match(/,/g) || []).length;
  return tabCount > commaCount ? '\t' : ',';
}

/**
 * Parse metadata from the first lines of the report
 */
function parseMetadata(lines: string[], delimiter: string): ReportMetadata {
  const metadata: ReportMetadata = {
    vendorName: '',
    startDate: '',
    endDate: '',
  };

  for (const line of lines.slice(0, 5)) {
    const parts = line.split(delimiter);
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts[1].trim();

      if (key === 'Vendor Name') {
        metadata.vendorName = value;
      } else if (key === 'Start Date') {
        metadata.startDate = value;
      } else if (key === 'End Date') {
        metadata.endDate = value;
      }
    }
  }

  return metadata;
}

/**
 * Find the line index where the transaction data headers start
 */
function findHeaderLine(lines: string[], delimiter: string): number {
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const line = lines[i];
    if (line.includes('Transaction Date') && line.includes('Country of Sale')) {
      return i;
    }
  }
  return -1;
}

/**
 * Find the line index where the summary section starts
 */
function findSummaryLine(lines: string[], delimiter: string): number {
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (line.startsWith('Country Of Sale') || line.startsWith('Country of Sale')) {
      // Check if this is the summary header (has fewer columns)
      const parts = line.split(delimiter);
      if (parts.length <= 5) {
        return i;
      }
    }
  }
  return lines.length;
}

/**
 * Parse a single transaction row
 */
function parseTransaction(
  row: string[],
  headers: string[]
): Transaction | null {
  const transaction: Partial<Transaction> = {};

  for (let i = 0; i < headers.length; i++) {
    const header = headers[i];
    const value = row[i]?.trim() ?? '';
    const mappedKey = COLUMN_MAP[header];

    if (mappedKey) {
      if (mappedKey === 'quantity') {
        transaction[mappedKey] = parseInt(value, 10) || 0;
      } else if (
        mappedKey === 'partnerShare' ||
        mappedKey === 'extendedPartnerShare' ||
        mappedKey === 'customerPrice'
      ) {
        transaction[mappedKey] = parseFloat(value) || 0;
      } else {
        (transaction as Record<string, string>)[mappedKey] = value;
      }
    }
  }

  // Validate essential fields
  if (!transaction.countryOfSale || !transaction.partnerShareCurrency) {
    return null;
  }

  return transaction as Transaction;
}

/**
 * Validate the report structure
 */
export function validateReport(
  content: string,
  delimiter: string
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const lines = content.split('\n').filter((l) => l.trim());

  if (lines.length < 5) {
    errors.push('File appears to be empty or too short');
    return { valid: false, errors, warnings };
  }

  const headerLine = findHeaderLine(lines, delimiter);
  if (headerLine === -1) {
    errors.push('Could not find transaction data headers. Is this an Apple App Store financial report?');
    return { valid: false, errors, warnings };
  }

  const headers = lines[headerLine].split(delimiter).map((h) => h.trim());

  for (const required of REQUIRED_COLUMNS) {
    if (!headers.includes(required)) {
      errors.push(`Missing required column: ${required}`);
    }
  }

  const metadata = parseMetadata(lines, delimiter);
  if (!metadata.vendorName) {
    warnings.push('Vendor name not found in report');
  }
  if (!metadata.startDate || !metadata.endDate) {
    warnings.push('Reporting period dates not found');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Aggregate transactions by country
 */
function aggregateByCountry(transactions: Transaction[]): CountryBreakdown[] {
  const map = new Map<string, CountryBreakdown>();

  for (const t of transactions) {
    const key = `${t.countryOfSale}-${t.partnerShareCurrency}`;
    const existing = map.get(key);

    if (existing) {
      existing.quantity += t.quantity;
      existing.proceeds += t.extendedPartnerShare;
    } else {
      map.set(key, {
        countryOfSale: t.countryOfSale,
        currency: t.partnerShareCurrency,
        quantity: t.quantity,
        proceeds: t.extendedPartnerShare,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    a.countryOfSale.localeCompare(b.countryOfSale)
  );
}

/**
 * Aggregate transactions by product
 */
function aggregateByProduct(transactions: Transaction[]): ProductBreakdown[] {
  const map = new Map<string, ProductBreakdown>();

  for (const t of transactions) {
    const existing = map.get(t.sku);

    if (existing) {
      existing.quantity += t.quantity;
      existing.proceedsByCurrency[t.partnerShareCurrency] =
        (existing.proceedsByCurrency[t.partnerShareCurrency] || 0) +
        t.extendedPartnerShare;
    } else {
      map.set(t.sku, {
        title: t.title,
        sku: t.sku,
        quantity: t.quantity,
        proceedsByCurrency: {
          [t.partnerShareCurrency]: t.extendedPartnerShare,
        },
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => a.title.localeCompare(b.title));
}

/**
 * Aggregate transactions by currency
 */
function aggregateByCurrency(transactions: Transaction[]): CurrencySummary[] {
  const map = new Map<string, CurrencySummary>();

  for (const t of transactions) {
    const existing = map.get(t.partnerShareCurrency);

    if (existing) {
      existing.totalQuantity += t.quantity;
      existing.totalProceeds += t.extendedPartnerShare;
    } else {
      map.set(t.partnerShareCurrency, {
        currency: t.partnerShareCurrency,
        totalQuantity: t.quantity,
        totalProceeds: t.extendedPartnerShare,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    a.currency.localeCompare(b.currency)
  );
}

/**
 * Main parser function - parses an Apple App Store financial report
 */
export function parseAppleReport(content: string): ParsedReport {
  const delimiter = detectDelimiter(content);
  const lines = content.split('\n').filter((l) => l.trim());

  // Parse metadata
  const metadata = parseMetadata(lines, delimiter);

  // Find data boundaries
  const headerLineIdx = findHeaderLine(lines, delimiter);
  const summaryLineIdx = findSummaryLine(lines, delimiter);

  if (headerLineIdx === -1) {
    throw new Error('Invalid report format: could not find data headers');
  }

  // Parse headers
  const headers = lines[headerLineIdx].split(delimiter).map((h) => h.trim());

  // Parse transactions
  const transactions: Transaction[] = [];
  for (let i = headerLineIdx + 1; i < summaryLineIdx; i++) {
    const row = lines[i].split(delimiter);
    const transaction = parseTransaction(row, headers);
    if (transaction && transaction.saleOrReturn === 'S') {
      transactions.push(transaction);
    }
  }

  // Build summary
  const summary = {
    byCountry: aggregateByCountry(transactions),
    byProduct: aggregateByProduct(transactions),
    byCurrency: aggregateByCurrency(transactions),
    totalTransactions: transactions.length,
  };

  return {
    metadata,
    transactions,
    summary,
  };
}

/**
 * Format a number as currency
 */
export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date string for display
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';

  // Handle MM/DD/YYYY format
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const [month, day, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return dateStr;
}
