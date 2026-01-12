# PRD — App Store Ledger (Free Tool)

## Product Type

**Free, client-side utility**
(No accounts, no backend, no data storage)

---

## Product Name

**AppStore Ledger (Free)**

**Subtitle:**
*Turn Apple App Store financial reports into accountant-ready statements.*

---

## 1. Vision & Intent

Create a **simple, trustworthy, free tool** that helps developers:

* Understand Apple App Store payouts
* Produce a clean, professional PDF
* Hand it to an accountant without follow-up questions

This product is:

* a credibility builder
* a learning vehicle
* a distribution wedge
  —not a full SaaS.

---

## 2. Problem Statement

Apple Inc. provides App Store financial data as raw TXT/CSV files that:

* are hard to read
* are not suitable for bookkeeping
* do not clearly explain payouts or currency conversion

Developers struggle to reconcile Apple payouts with bank deposits and explain them to accountants.

---

## 3. Goals

### Primary Goal

Generate a **clear, accountant-friendly PDF sales statement** from an Apple financial report — entirely in the browser.

### Secondary Goals

* Build trust by keeping data local
* Demonstrate deep understanding of Apple payouts
* Create a foundation for future automation (optional, later)

---

## 4. Non-Goals (Very Important)

This tool will **not**:

* Calculate taxes (VAT, GST, Sales Tax)
* Generate invoices
* Replace accounting software
* Store user data
* Access App Store Connect APIs
* Automate payouts
* Provide analytics or dashboards

---

## 5. Target Users

* Indie iOS developers
* Small app publishers
* Developers working with accountants
* EU developers confused by VAT handling

---

## 6. Core User Flow

1. User visits the website
2. User uploads an Apple App Store financial report (TXT / CSV)
3. File is parsed **locally in the browser**
4. Parsed data is previewed
5. User generates a **PDF sales statement**
6. PDF is downloaded

No sign-up.
No uploads to a server.
No persistence by default.

---

## 7. Input Requirements

### Supported Files

* App Store Connect financial reports
* TXT / TSV / CSV formats
* Single reporting period per file

### Validation

* Detect delimiter
* Validate required columns
* Clear error messages for unsupported files

---

## 8. Output: PDF Statement (Core Deliverable)

### Mandatory Sections

#### 8.1 Statement Header

* Title: *App Store Sales Statement*
* Developer name (from report or manual input)
* Platform: Apple App Store
* Reporting period
* Generation date

---

#### 8.2 Summary Section

* Net developer proceeds (by currency)
* Total consolidated proceeds (informational)
* Currencies involved

**Important:**
Only show **net proceeds** as reported by Apple.

---

#### 8.3 Payout Reconciliation (Explanatory)

Textual explanation:

> Net proceeds were generated in multiple currencies.
> Apple converts all proceeds using internal exchange rates and remits a single consolidated payout to the developer’s bank account.

No FX rates.
No calculations beyond totals.

---

#### 8.4 Country & Currency Breakdown

Table:

* Country of sale
* Currency
* Units sold
* Net proceeds

---

#### 8.5 Product Breakdown (Optional, default ON)

* Product name
* SKU
* Units sold
* Net proceeds (by currency)

---

#### 8.6 Tax & Accounting Notice (Static Text)

Required wording:

> **Tax Handling Notice**
>
> Apple acts as Merchant of Record for App Store transactions and is responsible for the collection and remittance of applicable indirect taxes (including VAT, GST, and Sales Tax).
>
> Amounts shown represent net proceeds payable to the developer, as reported by Apple.

---

#### 8.7 Disclaimer

> This document is a sales statement generated from Apple App Store financial reports.
> It is not an invoice issued by Apple Inc.
>
> This tool does not calculate taxes.

---

## 9. UX Requirements

### Upload Screen

* Drag & drop file input
* Supported formats listed
* Trust message:

  > “Processed locally in your browser. No data is uploaded.”

---

### Preview Screen

* Parsed totals
* Currency list
* Country breakdown
* Warnings for unusual cases (e.g. multiple currencies)

---

### Generate Screen

* PDF preview thumbnail (optional)
* Download button
* Clear label: *“Accountant-ready PDF”*

---

## 10. Trust & Privacy Requirements

* All parsing and PDF generation happens client-side
* No analytics on file contents
* No file uploads
* Optional localStorage only for:

  * developer name
  * display preferences

---

## 11. Technical Constraints

* Static Astro website
* Client-side TypeScript
* Deterministic parsing logic
* Deterministic PDF layout
* No external APIs required

---

## 12. Success Criteria

### Quantitative

* File upload → PDF generation completion rate
* PDF downloads

### Qualitative

* “My accountant accepted this”
* “This finally makes sense”
* Tool shared among developers

---

## 13. Future (Explicitly Out of Scope)

* App Store Connect API integration
* Automated fetching
* Email delivery
* Cloud storage
* Subscriptions
* Tax calculations

These are **deliberately postponed**.

---

## 14. Why This PRD Is Strong

* Extremely low risk
* Extremely high trust
* Clear scope
* No legal overreach
* Builds authority quietly
* Easy to ship and maintain

---

## Final Note

This is the **perfect “build once, leave running” tool**:

* It doesn’t need growth hacks
* It doesn’t need onboarding
* It doesn’t need support
* It builds your reputation every time it’s used

If you want next, I can:

* Convert this into a **task list**
* Design the **exact PDF layout**
* Or draft **homepage copy** that explains all of this in 3 sentences

Just say the word.
