# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AppStore Ledger is a privacy-first web app that transforms Apple App Store Connect financial reports into professional PDF statements. All processing happens client-side in the browser.

## Commands

```bash
pnpm dev      # Start development server (localhost:4321)
pnpm build    # Production build to dist/
pnpm preview  # Preview production build
```

## Architecture

**Tech Stack:** Astro 5.x (static site), Tailwind CSS v4 (via Vite plugin), jsPDF + jspdf-autotable, TypeScript

**Data Flow:**
1. User uploads `.txt` file from App Store Connect
2. `parser.ts` validates and parses the TSV/CSV report into `ParsedReport`
3. `pdf-generator.ts` creates professional PDF using jsPDF
4. `csv-exporter.ts` provides alternative CSV export

**Core Types (`src/lib/types.ts`):**
- `ParsedReport` — Complete parsed report with metadata, transactions, and aggregated summaries
- `Transaction` — Single row from Apple's report (country, currency, proceeds, etc.)
- `CurrencySummary`, `CountryBreakdown`, `ProductBreakdown` — Aggregated views

**Parser Logic (`src/lib/parser.ts`):**
- Auto-detects delimiter (tab vs comma)
- Extracts metadata from header rows (Vendor Name, Start/End Date)
- Finds transaction data between header row and summary section
- Filters to only `saleOrReturn === 'S'` (sales, not returns)
- Aggregates by country, product, and currency

**Single Page App:**
- `src/pages/index.astro` contains all UI and client-side JavaScript
- Three states: upload, preview, error (toggled via CSS `hidden` class)
- Developer name preference persisted to localStorage
