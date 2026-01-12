/**
 * Types for Apple App Store Financial Report parsing
 */

/** Metadata extracted from the report header */
export interface ReportMetadata {
  vendorName: string;
  startDate: string;
  endDate: string;
}

/** A single transaction row from the report */
export interface Transaction {
  transactionDate: string;
  settlementDate: string;
  appleIdentifier: string;
  sku: string;
  title: string;
  developerName: string;
  productTypeIdentifier: string;
  countryOfSale: string;
  quantity: number;
  partnerShare: number;
  extendedPartnerShare: number;
  partnerShareCurrency: string;
  customerPrice: number;
  customerCurrency: string;
  saleOrReturn: string;
  promoCode: string;
  orderType: string;
  region: string;
}

/** Aggregated data by country */
export interface CountryBreakdown {
  countryOfSale: string;
  currency: string;
  quantity: number;
  proceeds: number;
}

/** Aggregated data by product */
export interface ProductBreakdown {
  title: string;
  sku: string;
  quantity: number;
  proceedsByCurrency: Record<string, number>;
}

/** Aggregated data by currency */
export interface CurrencySummary {
  currency: string;
  totalProceeds: number;
  totalQuantity: number;
}

/** Complete parsed report structure */
export interface ParsedReport {
  metadata: ReportMetadata;
  transactions: Transaction[];
  summary: {
    byCountry: CountryBreakdown[];
    byProduct: ProductBreakdown[];
    byCurrency: CurrencySummary[];
    totalTransactions: number;
  };
}

/** Validation result for report parsing */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/** Parser error with context */
export interface ParseError {
  message: string;
  line?: number;
  column?: string;
}

/** Application state for the UI */
export type AppState = 'upload' | 'preview' | 'generating' | 'complete' | 'error';

/** Error state for the UI */
export interface AppError {
  title: string;
  message: string;
  recoverable: boolean;
}
