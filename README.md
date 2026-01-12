# AppStore Ledger

**Turn Apple App Store financial reports into accountant-ready statements.**

A free, privacy-first tool that transforms raw Apple financial reports into clean, professional PDF statements — entirely in your browser.

[Live Demo](https://appstoreledger.dev) | [Report Issue](https://github.com/morozRed/appleledger/issues)

---

## Features

- **100% Client-Side** — Your financial data never leaves your browser. No uploads, no tracking.
- **Instant Processing** — Parse reports and generate PDFs in milliseconds.
- **Accountant-Ready Output** — Professional PDF with all the breakdowns your accountant needs.
- **CSV Export** — Export data to CSV for use in Google Sheets, Excel, or other tools.

## How It Works

1. **Upload** — Drag and drop your App Store Connect financial report (.txt)
2. **Preview** — Review parsed data with currency and country breakdowns
3. **Download** — Generate a professional PDF or export to CSV

## PDF Statement Includes

- **Header** — Developer name, platform, reporting period, generation date
- **Summary** — Net proceeds by currency with transaction counts
- **Payout Reconciliation** — Explanation of Apple's currency conversion
- **Country Breakdown** — Sales by country with currency and units
- **Product Breakdown** — Per-product sales with multi-currency support
- **Tax Notice** — Apple's Merchant of Record explanation
- **Disclaimer** — Clear statement that this is not an invoice

## Privacy

This tool is designed with privacy as a core principle:

- All parsing happens in your browser
- No data is sent to any server
- No analytics on file contents
- Only your developer name preference is saved locally (optional)

## Development

### Prerequisites

- Node.js 18+
- pnpm

### Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Tech Stack

- [Astro](https://astro.build/) — Static site framework
- [Tailwind CSS v4](https://tailwindcss.com/) — Styling
- [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable) — PDF generation
- TypeScript — Type safety

## What This Tool Does NOT Do

- Calculate taxes (VAT, GST, Sales Tax)
- Generate invoices
- Replace accounting software
- Access App Store Connect APIs

## License

MIT

---

Made with care by [morozRed](https://github.com/morozRed)
