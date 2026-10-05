# Liverpool - E-Commerce Platform

A full-stack e-commerce application for selling vinyl records with features including shopping cart, checkout flow, order management, and customer administration.

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + TypeORM
- **Testing**: Cypress (E2E tests)

## Project Structure

```
liverpool/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── screens/       # Page components
│   │   ├── services/      # API client services
│   │   └── utils/         # Utility functions
│   └── cypress/           # E2E tests
├── server/                # Express backend
│   └── src/
│       ├── controllers/   # Route handlers
│       ├── services/      # Business logic
│       ├── entities/      # Database models
│       ├── repositories/  # Data access layer
│       └── database/      # Database configuration
└── DATABASE.md            # Database setup guide
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Installation

1. Install root dependencies:
```bash
npm install
```

2. Install client dependencies:
```bash
cd client
npm install
cd ..
```

3. Install server dependencies:
```bash
cd server
npm install
cd ..
```

### Database Setup

See [DATABASE.md](./DATABASE.md) for detailed database setup instructions.

Quick start:

```bash
# From the server directory
cd server

# Seed database with default users and coupons
npm run db:seed

# Or reset database (drop and reseed)
npm run db:reset
```

### Development

Start both frontend and backend in development mode:

```bash
npm run dev
```

This will start:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000

### Testing

Run E2E tests:

```bash
cd client
npm run cypress:run
```

Open Cypress test runner (interactive):

```bash
cd client
npm run cypress:open
```

## Available NPM Commands

### Root Level

```bash
npm run dev          # Start both server and client in dev mode
```

### Client (`cd client`)

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run cypress:run  # Run Cypress tests
npm run cypress:open # Open Cypress test runner
npm run test:e2e     # Run E2E tests
```

### Server (`cd server`)

```bash
npm run dev          # Start server with hot reload
npm run build        # Compile TypeScript
npm run start        # Start compiled server
npm run db:seed      # Seed database with default data
npm run db:drop      # Drop all database tables
npm run db:reset     # Drop and reseed database
```

## Features

### E-Commerce
- Product catalog with vinyl records
- Shopping cart management
- Checkout flow with delivery and billing addresses
- Multiple payment methods (credit cards)
- Coupon/discount system

### Order Management
- Order placement and tracking
- Order status management
- Payment processing
- Exchange coupon generation

### Customer Management
- Customer registration and profiles
- Address management
- Credit card storage
- Customer status (active/inactive)

### Admin Panel
- Customer administration (CRUD)
- Order management dashboard
- Coupon management

## Test Coverage

The application includes comprehensive E2E tests for:
- Shopping cart operations
- Checkout flow validation
- Order creation and tracking
- Business rule enforcement (coupon rules, payment validation)
- Customer CRUD operations
- Admin functions

**Test Results**: 14/14 tests passing (100%)

See [cypress/e2e](./client/cypress/e2e) for test files.

## Business Rules

### RN0031: Add items to cart
- Items are added to cart with quantity selection
- Cart updates in real-time

### RN0032: Adjust quantity before adding to cart
- Quantity can be modified before adding to cart
- Minimum quantity is 1

### RN0033: Multiple payment methods
- Multiple credit cards can be used for a single order
- Only one promotional coupon per order

### RN0034: Minimum card payment
- Each credit card must have minimum R$ 10.00 when no coupons are applied

### RN0035: Coupon exception to minimum
- With applied coupons, card payment can be less than R$ 10.00

### RN0036: Surplus exchange coupon
- When coupons exceed purchase value, excess is generated as exchange coupon
- No additional coupons allowed when surplus is already covered

## Environment Variables

Create a `.env` file in the server directory:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=liverpool
```

## Contributing

1. Create a feature branch from the main branch
2. Make your changes and run tests
3. Ensure all tests pass
4. Create a pull request with clear description of changes

## License

ISC
