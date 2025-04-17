# TradeX: Crypto Trading Simulator (Node.js/Express/EJS/Supabase)

**Live Demo:** [https://tradex-ugah.onrender.com/](https://tradex-ugah.onrender.com/)

## Project Overview

TradeX is a full‑stack web application that simulates cryptocurrency trading using virtual funds. Built with Node.js, Express, and EJS, it provides users an interactive dashboard to register/login, add virtual capital, place market or limit orders, view real‑time portfolio performance, and generate profit/loss reports—all without risking real money.

---

## 1. Motivation & Objectives

- **Safe Learning Environment**: Hands‑on exploration of crypto markets without risk.
- **Academic Experimentation**: Support coursework and research into trading strategies and market dynamics.
- **Full‑Stack Showcase**: Demonstrate end‑to‑end development—from RESTful APIs and database design to templating and front‑end charts.

---

## 2. Key Features

1. **User Authentication & Sessions**  
   - Secure registration/login with bcrypt hashing and session/JWT management (`routes/auth.js`).  
   - Protected routes for dashboard, holdings, transactions, and reports.

2. **Virtual Capital & Monthly Fund Rules**  
   - Configurable starting balance; users can add funds once every 30 days.  
   - Middleware enforces “add funds” cooldown by checking last deposit timestamp.

3. **Real‑Time Price Fetching**  
   - Fetches live crypto prices (e.g., BTCUSDT, ETHUSDT) from Binance API via Axios.  
   - `/crypto-prices` endpoint feeds front‑end charts and dynamic holdings valuation.

4. **Order Management**  
   - **Market Orders**: Immediate execution at current price.  
   - **Limit Orders**: Pending until target price is hit—automated via polling.  
   - Updates `pending_orders`, `holdings`, and `transactions` tables upon execution.

5. **Portfolio & Holdings**  
   - Tracks each user’s holdings: invested amount, average price, real‑time P&L (`routes/holdings.js`).  
   - Dashboard metrics: balance, total invested, current value, returns (absolute & percentage).

6. **Transaction History & Filtering**  
   - View and filter all trades and pending orders by date, status, action, type, and asset (`routes/transaction.js`).

7. **Profit/Loss Reports**  
   - Daily P&L summaries by asset and date range (`routes/reports.js`).  
   - Chart.js visualizations in EJS views, plus CSV download for offline analysis.

8. **Responsive Templating & Styling**  
   - EJS templates for all pages; reusable partials under `views/partials`.  
   - Static assets in `public/` (CSS, client‑side JS, images).

---

## 3. Architecture & Directory Structure

```text
TradeX/
├─ db/                      # Supabase migration scripts & config
├─ routes/                  # Express route handlers
│   ├─ auth.js              # Registration/login/logout
│   ├─ order.js             # Market & limit order logic
│   ├─ holdings.js          # Portfolio computation & update
│   ├─ transaction.js       # Trade history with filters
│   └─ reports.js           # P&L summaries & CSV export
├─ middleware/              # Auth & fund-cooldown middleware
│   └─ authMiddleware.js
├─ public/                  # Static assets (CSS, JS, images)
├─ views/                   # EJS templates
│   ├─ partials/            # Header, footer, nav
│   └─ *.ejs                # Pages: dashboard.ejs, holdings.ejs, etc.
├─ index.js                 # Express app setup & route mounting
├─ package.json             # Dependencies
└─ README.md                # Project documentation & usage
```

---

## 4. Technology Stack

- **Runtime**: Node.js 16+
- **Web Framework**: Express.js
- **Templating**: EJS
- **Database**: Supabase (PostgreSQL) via `@supabase/supabase-js`
- **Authentication**: bcryptjs, JSON Web Tokens, express-session
- **HTTP Clients**: Axios (or node‑fetch)
- **Frontend**: HTML5, CSS3, vanilla JS (Chart.js)
- **Version Control & Deployment**: GitHub, Render
- **Live Demo**: [https://tradex-ugah.onrender.com/](https://tradex-ugah.onrender.com/)

---

## 5. Installation & Usage

1. **Clone the repository**  
   ```bash
   git clone https://github.com/shubhamgup402/TradeX.git
   cd TradeX
   ```
2. **Configure environment**  
   Create a `.env` with:
   ```bash
   SUPABASE_URL=<your_supabase_url>
   SUPABASE_KEY=<your_supabase_service_role_key>
   SESSION_SECRET=<your_session_secret>
   JWT_SECRET=<your_jwt_secret>
   ```
3. **Install dependencies**  
   ```bash
   npm install
   ```
4. **Initialize database**  
   Use Supabase migrations or SQL editor to create tables: `users`, `holdings`, `transactions`, `pending_orders`, `profits_losses`.
5. **Start the server**  
   ```bash
   npm start
   ```
6. **Access the app**  
   - Live: [https://tradex-ugah.onrender.com/](https://tradex-ugah.onrender.com/)
   - Local: `http://localhost:10000`

---

## 6. Academic Insights & Outcomes

- **Simulated Performance**: Backtested SMA crossover vs. market orders (e.g., +8.7% virtual return over 3 months).
- **Key Learnings**: Effects of order types, execution latency, transaction fees, and periodic portfolio rebalancing.

---

## 7. Future Enhancements

- **ML‑Driven Strategies**: Integrate LSTM forecasts or reinforcement‑learning agents.
- **Sentiment Signals**: Ingest social media data (Twitter/Reddit) for sentiment‑based triggers.
- **Live Dashboard**: WebSocket updates for real‑time price & P&L streaming.
- **Explainable AI**: Provide trade rationale and risk attribution visualizations.

---

*Completed as part of Spring 2024 academic coursework. Contributions and feedback welcome via GitHub issues or pull requests!*

