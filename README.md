# Dynamic Portfolio Dashboard

A full-stack portfolio management dashboard built with **Next.js, TypeScript, Tailwind CSS, Node.js, Express, Supabase, Yahoo Finance, and Google Finance**.

The application reads portfolio holdings from an Excel source, stores normalized portfolio data in Supabase, retrieves live market prices and financial fundamentals, calculates portfolio performance, and presents everything through a responsive dashboard.

---

## Overview

The dashboard provides a centralized view of an investment portfolio with:

* Stock-wise investment details
* Current Market Price (CMP)
* Present portfolio value
* Gain/Loss
* Portfolio allocation percentage
* P/E Ratio
* Latest Earnings
* Sector-wise aggregation
* Portfolio-level performance
* Automatic market-data refresh
* Search and filtering
* Loading, error, and empty states
* Responsive dashboard UI
* Performance-oriented caching

The application is designed as a small production-style full-stack system rather than a static Excel viewer.

---

## Features

### Portfolio Dashboard

The dashboard displays:

| Field           | Description                         |
| --------------- | ----------------------------------- |
| Particulars     | Stock name                          |
| Purchase Price  | Original purchase price             |
| Quantity        | Number of shares                    |
| Investment      | Purchase Price × Quantity           |
| Portfolio %     | Stock weight in total investment    |
| NSE/BSE         | Exchange/security code              |
| CMP             | Current Market Price                |
| Present Value   | CMP × Quantity                      |
| Gain/Loss       | Present Value − Investment          |
| Gain/Loss %     | Gain/Loss relative to investment    |
| P/E Ratio       | Latest available P/E                |
| Latest Earnings | Latest available earnings/EPS value |

---

### Sector-wise Portfolio

Stocks are grouped by sector.

Each sector provides:

* Total investment
* Total present value
* Total gain/loss
* Sector performance percentage
* Individual holdings

This makes it possible to understand both individual stock performance and sector-level exposure.

---

### Automatic Market Updates

Market prices are refreshed automatically from the backend.

The frontend polls the portfolio API approximately every **15 seconds**.

The backend additionally caches Yahoo Finance responses for 15 seconds to avoid unnecessary repeated external requests.

This separates:

```text
Frontend refresh frequency
            ↓
Backend API
            ↓
Short-lived market-data cache
            ↓
Yahoo Finance
```

---

### Financial Fundamentals

The application retrieves:

* P/E Ratio
* Latest Earnings

from Google Finance through a backend integration.

Fundamental data is cached for a longer period because these values generally change less frequently than market prices.

---

### Search

Users can search holdings by stock name.

The filtering happens in the frontend after the portfolio data has been retrieved.

---

### Portfolio Analytics

The dashboard includes visual analytics such as:

* Portfolio allocation
* Portfolio performance
* Sector-level performance

Charts are implemented using **Recharts**.

---

### Error Handling

The application handles:

* Backend API failures
* External provider failures
* Missing market prices
* Missing fundamentals
* Empty search results
* Loading states
* Invalid API routes

If a market-data provider fails for one stock, the remaining portfolio data can still be displayed.

---

## Technology Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* Recharts

Next.js provides the React application framework and App Router architecture.

### Backend

* Node.js
* Express
* TypeScript
* CORS
* Helmet
* Express Rate Limit

### Database

* Supabase
* PostgreSQL

The backend uses Supabase's JavaScript client to communicate with the database.

### Data Sources

* Excel portfolio source
* Yahoo Finance for market prices
* Google Finance for financial fundamentals

> Yahoo Finance and Google Finance integrations are treated as external/unofficial data integrations rather than official public APIs.

---

# Architecture

```text
                         ┌──────────────────────┐
                         │      Excel File      │
                         │   Portfolio Source   │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    Import Script     │
                         │     TypeScript       │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │       Supabase       │
                         │      PostgreSQL      │
                         └──────────┬───────────┘
                                    │
                                    ▼
┌─────────────────┐       ┌──────────────────────┐
│    Next.js      │◄──────►│   Express Backend   │
│    Frontend     │  HTTP  │      REST API       │
└────────┬────────┘       └──────────┬───────────┘
         │                           │
         │                           ├──────────────► Yahoo Finance
         │                           │                  CMP
         │                           │
         │                           └──────────────► Google Finance
         │                                              P/E / Earnings
         ▼
┌─────────────────────────────────────────────────┐
│              Portfolio Dashboard                │
│                                                 │
│  KPI Cards │ Charts │ Sector Tables │ Search   │
└─────────────────────────────────────────────────┘
```

---

# Project Structure

```text
portfolio-dashboard/
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── StatCard.tsx
│   │   ├── PortfolioAllocationChart.tsx
│   │   └── PortfolioPerformanceChart.tsx
│   │
│   ├── .env.local
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── data/
│   │   └── portfolio.xlsx
│   │
│   ├── src/
│   │   ├── config/
│   │   │   └── supabase.ts
│   │   │
│   │   ├── middleware/
│   │   │   └── error.middleware.ts
│   │   │
│   │   ├── routes/
│   │   │   └── portfolio.routes.ts
│   │   │
│   │   ├── scripts/
│   │   │   └── importExcel.ts
│   │   │
│   │   ├── services/
│   │   │   ├── cache.service.ts
│   │   │   ├── excel.service.ts
│   │   │   ├── google-finance.service.ts
│   │   │   ├── google-symbol.service.ts
│   │   │   ├── portfolio.service.ts
│   │   │   ├── yahoo.service.ts
│   │   │   └── yahoo-symbol.service.ts
│   │   │
│   │   ├── types/
│   │   │   └── portfolio.ts
│   │   │
│   │   └── server.ts
│   │
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
├── docs/
│   └── TECHNICAL_DOCUMENTATION.md
│
└── README.md
```

---

# Database Design

The portfolio data is normalized into two primary tables.

## `sectors`

```text
sectors
├── id
├── name
└── created_at
```

Each sector has a unique name.

---

## `holdings`

```text
holdings
├── id
├── sector_id
├── stock_name
├── purchase_price
├── quantity
├── exchange_code
├── created_at
└── updated_at
```

Relationship:

```text
sectors
   │
   └──────< holdings
```

A sector can contain multiple holdings.

---

# Data Import

The original portfolio is provided through an Excel workbook.

The workbook contains sector rows followed by individual stock rows.

The import script:

1. Reads the Excel workbook.
2. Identifies the correct header row.
3. Detects sector rows.
4. Creates/updates sectors.
5. Extracts valid stock holdings.
6. Stores normalized holdings in Supabase.
7. Ignores unrelated or invalid spreadsheet rows.

Run:

```bash
npm run import:excel
```

from the `backend` directory.

---

# Portfolio Calculations

The backend calculates portfolio metrics instead of relying on pre-calculated spreadsheet values.

### Investment

```text
Investment = Purchase Price × Quantity
```

### Portfolio Percentage

```text
Portfolio % =
Investment / Total Investment × 100
```

### Present Value

```text
Present Value = CMP × Quantity
```

### Gain/Loss

```text
Gain/Loss =
Present Value − Investment
```

### Gain/Loss Percentage

```text
Gain/Loss % =
Gain/Loss / Investment × 100
```

This ensures that the dashboard always calculates performance from the latest available CMP.

---

# Market Data Flow

## CMP

```text
Stock
  ↓
Yahoo symbol resolver
  ↓
Yahoo Finance
  ↓
Current Market Price
  ↓
Backend cache
  ↓
Portfolio calculations
  ↓
Frontend
```

Yahoo symbols are resolved using exchange/security information and explicit mappings where provider symbols differ from the source workbook.

For example, provider symbol changes or legacy exchange codes can be handled independently from the original portfolio data.

---

## Financial Fundamentals

```text
Stock
  ↓
Google Finance symbol
  ↓
Google Finance
  ↓
P/E Ratio + Earnings
  ↓
1-hour cache
  ↓
Frontend
```

Because P/E and earnings do not need to update every few seconds, these values use a longer cache duration.

---

# Caching Strategy

Caching is implemented in the backend.

## Market Prices

TTL:

```text
15 seconds
```

This matches the dashboard's automatic refresh interval.

## Fundamentals

TTL:

```text
1 hour
```

This avoids repeatedly scraping relatively stable financial metrics.

## Symbol Resolution

Resolved symbols are cached for a much longer period because stock symbols generally do not change frequently.

The cache is currently an in-memory cache:

```text
Map<string, CacheEntry>
```

For a larger production deployment, this could be replaced with Redis.

---

# API

## Health Check

```http
GET /api/health
```

Example:

```json
{
  "success": true,
  "message": "Portfolio backend is running",
  "timestamp": "2026-09-14T00:00:00.000Z"
}
```

---

## Portfolio

```http
GET /api/portfolio
```

Returns:

* Portfolio holdings
* Portfolio summary
* Sector summaries
* Timestamp
* Number of holdings

Example structure:

```json
{
  "success": true,
  "timestamp": "...",
  "count": 13,
  "summary": {
    "totalInvestment": 0,
    "totalPresentValue": 0,
    "totalGainLoss": 0,
    "totalGainLossPercentage": 0
  },
  "sectors": [],
  "data": []
}
```

---

# Frontend Data Refresh

The frontend requests portfolio data approximately every 15 seconds.

```text
Initial page load
       ↓
GET /api/portfolio
       ↓
Display dashboard
       ↓
Wait 15 seconds
       ↓
GET /api/portfolio
       ↓
Update dashboard
       ↓
Repeat
```

The frontend also displays the latest successful update time.

---

# Security

Several basic security measures are implemented.

### Helmet

HTTP security headers are enabled through Helmet.

### CORS

The backend restricts requests to the configured frontend origin.

### Rate Limiting

API requests are rate-limited to reduce accidental or abusive request bursts.

### Environment Variables

Secrets are stored in environment variables rather than committed to Git.

Example:

```env
PORT=5000
FRONTEND_URL=http://localhost:3000

SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

The Supabase service-role credential must remain server-side and must never be exposed through the Next.js client. Supabase recommends keeping credentials in environment variables rather than committing them to source control.

---

# Environment Variables

## Backend

Create:

```text
backend/.env
```

```env
PORT=5000
FRONTEND_URL=http://localhost:3000

SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## Frontend

Create:

```text
frontend/.env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

The `NEXT_PUBLIC_` prefix is used because this value is intentionally consumed by the browser.

Do **not** put private database credentials in the frontend environment file.

---

# Local Setup

## Requirements

* Node.js
* npm
* Supabase project
* Git

---

## 1. Clone the repository

```bash
git clone <your-repository-url>
cd portfolio-dashboard
```

---

## 2. Install frontend dependencies

```bash
cd frontend
npm install
```

---

## 3. Install backend dependencies

Open another terminal:

```bash
cd backend
npm install
```

---

## 4. Configure Supabase

Create the required database tables:

```sql
create table sectors (
  id bigint generated by default as identity primary key,
  name text not null unique,
  created_at timestamptz default now()
);

create table holdings (
  id bigint generated by default as identity primary key,
  sector_id bigint not null references sectors(id) on delete restrict,
  stock_name text not null,
  purchase_price numeric(15,2) not null check (purchase_price > 0),
  quantity integer not null check (quantity > 0),
  exchange_code text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (stock_name, exchange_code)
);
```

Configure the backend `.env`.

---

## 5. Import portfolio data

Copy the Excel file into:

```text
backend/data/portfolio.xlsx
```

Then:

```bash
cd backend
npm run import:excel
```

---

## 6. Start backend

```bash
npm run dev
```

Backend:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

---

## 7. Start frontend

In another terminal:

```bash
cd frontend
npm run dev
```

Frontend:

```text
http://localhost:3000
```

---

# Production Build

## Frontend

```bash
cd frontend
npm run build
npm start
```

## Backend

```bash
cd backend
npm run build
npm start
```

---

# Performance Considerations

The project includes several performance-oriented decisions.

### Batch market-price requests

Yahoo Finance prices are requested in batches instead of making a separate request for every stock.

### Caching

External provider calls are cached according to their update frequency.

### Database normalization

Portfolio data is stored in structured relational tables instead of repeatedly parsing the Excel file for every API request.

### Frontend filtering

Search filtering is performed locally after the portfolio has been loaded.

### Graceful provider failure

Failure to retrieve data for one provider or stock does not unnecessarily prevent the entire dashboard from rendering.

---

# Error Handling Strategy

The backend uses centralized Express error middleware.

External integrations are wrapped with error handling so that provider failures can result in missing values rather than a complete dashboard failure.

For example:

```text
Yahoo Finance unavailable
        ↓
CMP = null
        ↓
Present Value = null
Gain/Loss = null
        ↓
Dashboard still renders
```

The UI displays:

```text
—
```

when a value is unavailable.

---

# Design Decisions

## Why Express?

Express provides a lightweight REST API layer and keeps external market-data integrations away from the frontend.

## Why Supabase?

Supabase provides a managed PostgreSQL database with a straightforward TypeScript/JavaScript client, allowing portfolio data to be persisted independently of the Excel source.

## Why keep Excel?

The Excel workbook represents the provided portfolio source. It is used for initial data ingestion rather than being queried directly by every dashboard request.

## Why calculate metrics in the backend?

Keeping financial calculations in one place prevents duplicated calculation logic between frontend components.

## Why cache market data?

The dashboard refreshes frequently, but repeatedly calling external providers for the same data is inefficient and can cause unnecessary rate-limit pressure.

## Why cache fundamentals longer?

P/E ratio and earnings do not require the same refresh frequency as CMP.

---

# Known Limitations

1. Yahoo Finance does not provide a conventional official public developer API for this use case.
2. Google Finance data is retrieved through a web-based integration rather than a dedicated public API.
3. Provider HTML/page structures can change.
4. The current cache is in-memory and therefore resets when the backend restarts.
5. External provider availability can affect individual market-data fields.
6. Symbol mappings may require maintenance when exchanges or providers change ticker symbols.

---

# Future Improvements

Potential production improvements include:

* Redis-based distributed caching
* Background market-data workers
* WebSocket/SSE live price updates
* Persistent market-data snapshots
* Authentication and user-specific portfolios
* Portfolio CRUD operations
* Historical performance charts
* Transaction history
* Dividend tracking
* More robust market-data provider abstraction
* Automated provider health monitoring
* Unit and integration test coverage
* Docker deployment
* CI/CD pipeline
* Automated database migrations

---

# Testing

Recommended test coverage:

### Backend

* Portfolio calculations
* Sector calculations
* Symbol resolution
* Cache expiration
* Provider failure handling
* API responses

### Frontend

* Loading state
* Error state
* Search
* Empty results
* Gain/loss styling
* Chart rendering
* Responsive layout

---

# Interview Explanation

A simple way to explain the project:

> "I built a full-stack portfolio dashboard where the original Excel portfolio is imported into a PostgreSQL database through Supabase. The Express backend retrieves the stored holdings, fetches current market prices from Yahoo Finance and financial fundamentals from Google Finance, calculates present value and gain/loss, and exposes everything through a REST API. The Next.js frontend consumes that API and automatically refreshes the market data every 15 seconds. I also added caching so frequent refreshes don't repeatedly hit the external providers."

### If asked why the Excel file isn't directly used:

> "I treated Excel as an ingestion source rather than the application's database. Parsing the spreadsheet on every request would be inefficient and would make the application harder to maintain. I normalized the data into sectors and holdings in PostgreSQL."

### If asked about caching:

> "Market prices are cached for 15 seconds because the UI refreshes at the same interval. Fundamentals use a longer one-hour cache because P/E and earnings don't need to be requested every few seconds."

### If asked about provider failures:

> "External market-data providers are unreliable compared with our own database, so the backend handles provider errors independently. If one stock's CMP isn't available, that holding can still be returned with the unavailable values represented as null."

---

# License

This project was created as a technical case-study/application project.

---

# Author

**Vraj Solanki**

Full Stack Developer
Computer Science Student

Built with:

```text
Next.js
TypeScript
React
Tailwind CSS
Node.js
Express
Supabase
PostgreSQL
Yahoo Finance
Google Finance
Recharts
```
