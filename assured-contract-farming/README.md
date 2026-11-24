# Assured Contract Farming for Stable Market Access

A reconstructed full-stack MVP for connecting farmers and buyers through agricultural contracts, market information, and trackable transactions.

## Stack
- Frontend: React 18, TypeScript, Vite, React Router, Axios, Lucide React
- Backend: Node.js, Express, TypeScript, JWT, bcryptjs, Zod
- Development storage: JSON file (`server/data/database.json`)

The supplied project PDF describes both PostgreSQL/Prisma production storage and JSON-file development storage. This reconstruction implements the JSON-file option to keep local setup simple. It is a new implementation, not recovered original source code. It does not claim to reproduce the original PostgreSQL/Prisma implementation.

## Features in this reconstruction
- Farmer, Buyer, and Admin roles
- Registration and JWT login
- Product listing and admin product creation
- Farmer contract creation and contract status management
- Buyer contract requests; farmers can accept/reject
- Market-price listing and admin price entry
- Contract transactions and payment-status tracking
- Automatic contract completion when all associated transactions are completed
- Buyer ratings for farmers after completed contracts
- Basic English/Kannada language toggle
- Role-aware dashboard and API authorization

## Requirements
- Node.js 18+
- npm

## Run locally
1. Copy `server/.env.example` to `server/.env`.
2. Install dependencies from the project root:
   ```bash
   npm run install:all
   ```
3. Start frontend and backend:
   ```bash
   npm run dev
   ```
4. Open http://localhost:3000. API runs at http://localhost:5000.

The server creates and seeds `server/data/database.json` on first start.

## Development demo accounts
The server seeds these accounts on first run:
- Admin: `admin@contractfarming.com` / `password123`
- Farmer: `farmer@example.com` / `password123`
- Buyer: `buyer@example.com` / `password123`

Change these credentials and `JWT_SECRET` before any shared or deployed use. Demo accounts are for local development only.

## Important implementation notes
- JSON-file storage is intended for local development and demonstration, not concurrent production workloads.
- The supplied PDF describes PostgreSQL/Prisma as a production option; that adapter and migrations are not included in this reconstructed MVP.
- Payment handling records transaction status only. It does not connect to a real payment gateway or move money.
- Market prices are entered as sample/admin-managed data; no external live market feed is connected.
- Add production-grade validation, rate limiting, audit logs, backups, tests, and deployment secrets before public deployment.

## Repository layout
```text
client/                 React + TypeScript frontend
server/                 Express + TypeScript REST API
  src/
    middleware/         JWT and role authorization
    routes/             API route handlers
    services/            JSON persistence and business logic
  data/                  Created automatically at runtime
```

## Main API routes
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET/POST /api/products`
- `GET/POST /api/contracts`, `GET/PATCH /api/contracts/:id`
- `GET/POST /api/contract-requests`, `PATCH /api/contract-requests/:id`
- `GET/POST /api/market-prices`
- `GET/POST /api/transactions`, `PATCH /api/transactions/:id/status`
- `GET/POST /api/ratings`

## Resume alignment
The project highlights a React frontend, Axios API integration, and data management. The PDF documentation additionally lists Node.js/Express, TypeScript, JWT, and optional PostgreSQL/Prisma or JSON-file storage. Confirm which technologies you personally used before representing this reconstruction as historical work.

## Author
S Aiman Zuha — B.Tech, Computer Science and Information Technology
