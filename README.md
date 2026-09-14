# Dynamic Portfolio Dashboard

A responsive portfolio dashboard built with **Next.js, React, TypeScript, Tailwind CSS, Node.js, Express.js and Excel data processing**.

The application reads portfolio holdings from an Excel workbook and enriches the portfolio with market data from Yahoo Finance and fundamental data from Google Finance.

## Features

* Excel-based portfolio data ingestion
* Dynamic portfolio calculations
* Current Market Price (CMP)
* Present Value
* Gain/Loss
* Gain/Loss percentage
* Portfolio allocation percentage
* P/E Ratio
* Latest Earnings
* Sector-wise grouping
* Sector-level investment and performance
* Portfolio allocation chart
* Portfolio performance chart
* Stock search
* Automatic refresh every 15 seconds
* In-memory caching
* Loading, error and empty states
* Responsive dashboard UI
* Environment-based configuration
* Backend health-check endpoint

## Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* Recharts

### Backend

* Node.js
* Express.js
* TypeScript
* xlsx
* yahoo-finance2
* Cheerio
* CORS
* dotenv

## Architecture

```text
                    portfolio.xlsx
                          |
                          v
                   Excel Service
                          |
                          v
                Portfolio Service
                   /          \
                  /            \
                 v              v
          Yahoo Finance    Google Finance
             (CMP)         (Fundamentals)
                 \            /
                  \          /
                   v        v
                    Cache
                      |
                      v
                Express API
                      |
                      v
                Next.js Frontend
                      |
             +--------+--------+
             |                 |
             v                 v
        Portfolio Table      Charts
```

## Project Structure

```text
portfolio-dashboard/
│
├── frontend/
│   ├── app/
│   │   ├── components/
│   │   │   ├── PortfolioAllocationChart.tsx
│   │   │   └── PortfolioPerformanceChart.tsx
│   │   └── page.tsx
│   ├── .env.local
│   └── package.json
│
├── backend/
│   ├── data/
│   │   └── portfolio.xlsx
│   ├── src/
│   │   ├── routes/
│   │   │   └── portfolio.routes.ts
│   │   ├── services/
│   │   │   ├── cache.service.ts
│   │   │   ├── excel.service.ts
│   │   │   ├── google-finance.service.ts
│   │   │   ├── google-symbol.service.ts
│   │   │   ├── portfolio.service.ts
│   │   │   ├── symbol.service.ts
│   │   │   └── yahoo.service.ts
│   │   ├── types/
│   │   │   └── portfolio.ts
│   │   └── server.ts
│   ├── .env
│   └── package.json
│
└── README.md
```

## Data Flow

The Excel workbook is treated as the source of portfolio holdings.

The backend parses the workbook using the `xlsx` library and normalizes the required fields.

Market data is then retrieved using the corresponding stock symbol.

For example:

```text
Excel Exchange Code
        |
        v
Symbol Mapping
        |
        +----> Yahoo Finance
        |          |
        |          v
        |         CMP
        |
        +----> Google Finance
                   |
                   v
             P/E + Earnings
```

The backend calculates:

```text
Investment = Purchase Price × Quantity

Present Value = CMP × Quantity

Gain/Loss = Present Value - Investment

Gain/Loss % =
(Gain/Loss / Investment) × 100
```

## API

### Health Check

```http
GET /api/health
```

Example response:

```json
{
  "success": true,
  "message": "Portfolio backend is running",
  "timestamp": "2026-09-14T10:00:00.000Z"
}
```

### Portfolio

```http
GET /api/portfolio
```

The endpoint returns:

* Portfolio holdings
* Portfolio summary
* Sector summaries
* Timestamp
* Holding count

## Caching Strategy

The application uses an in-memory cache to reduce unnecessary external API requests.

### Yahoo Finance

Market prices are cached for approximately 15 seconds.

This matches the dashboard refresh interval.

```text
Frontend
   |
15 sec
   |
Backend
   |
Cache available?
  / \
Yes  No
 |    |
Return Fetch Yahoo
       |
       v
     Cache
```

### Google Finance

Fundamental data is cached for approximately one hour because P/E and earnings generally do not need to be refreshed every few seconds.

## Error Handling

External data providers may fail or return incomplete data.

The application handles this by:

* Catching external request errors
* Logging backend errors
* Returning `null` for unavailable financial values
* Keeping the rest of the portfolio available
* Showing `—` in the UI for unavailable values
* Providing a frontend error state when the backend is unavailable

## Security Considerations

* Environment variables are used for configuration
* `.env` and `.env.local` are excluded from Git
* CORS is restricted to the configured frontend origin
* The Excel file is processed server-side
* External provider requests are not exposed directly to the browser

## Performance Considerations

The application uses several performance techniques:

1. Batch Yahoo Finance quote requests
2. Remove duplicate symbols before external requests
3. Cache external financial data
4. Fetch Google Finance fundamentals concurrently
5. Calculate portfolio summaries on the backend
6. Keep frontend rendering focused on presentation

## Running Locally

### Backend

```bash
cd backend
npm install
npm run dev
```

Backend:

```text
http://localhost:5000
```

### Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:3000
```

## Environment Variables

### Backend

```env
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### Frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Production Build

### Backend

```bash
npm run build
npm start
```

### Frontend

```bash
npm run build
npm start
```

## Data Provider Notes

Yahoo Finance does not provide an official public developer API for this use case, so the application uses the `yahoo-finance2` package as an unofficial integration.

Google Finance also does not provide a standard public API for these fields. The implementation therefore treats Google Finance data retrieval as an external/scraping-based integration and includes caching and error handling.

Because these providers can change their website structure or availability, the integration should be treated as a replaceable service layer rather than tightly coupling provider logic to the frontend.

## Future Improvements

Possible production improvements include:

* Redis-based distributed caching
* Database-backed portfolio storage
* Background market-data refresh jobs
* Historical price tracking
* Historical performance charts
* Authentication
* Rate limiting
* Structured logging
* Automated tests
* Provider fallback strategies
* Deployment with Docker
* Monitoring and alerting
