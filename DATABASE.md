# Database Management

This project uses PostgreSQL with TypeORM for data persistence.

## Database Setup

### Prerequisites

Make sure PostgreSQL is installed and running. The default connection settings are:

- **Host**: localhost
- **Port**: 5432
- **User**: postgres
- **Password**: postgres
- **Database**: liverpool

You can override these with environment variables:

```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_NAME=liverpool
```

### Available Commands

#### Seed Database

Seed the database with default users and coupons:

```bash
npm run db:seed
```

This command will:
- Create 2 default customers (Diogo Jonsson and John Doe)
- Create 7 default coupons (promotional and exchange)
- Automatically assign exchange coupons to Diogo Jonsson

#### Drop Database

Drop all tables from the database:

```bash
npm run db:drop
```

**Warning**: This will delete all data in the database.

#### Reset Database

Drop and immediately reseed the database with default data:

```bash
npm run db:reset
```

This is equivalent to running `db:drop` followed by `db:seed`.

## Default Users

### Diogo Jonsson
- **Email**: diogo@example.com
- **CPF**: generated at seed time (checksum-valid, fake)
- **Phone**: (11) 98765-4321
- **Addresses**: Paulista Ave (delivery) and Augusta St (billing)
- **Credit Cards**: Visa ending in 4321, Mastercard ending in 8765
- **Exchange Coupons**: TROCA_DIOGO_50, TROCA_DIOGO_40, TROCA_DIOGO_35, TROCA_DIOGO_20, TROCA_DIOGO_300

### John Doe
- **Email**: john.doe@example.com
- **CPF**: generated at seed time (checksum-valid, fake)
- **Phone**: (21) 99888-7766
- **Addresses**: Copacabana (delivery and billing)
- **Credit Cards**: Elo ending in 9911

## Default Coupons

### Promotional
- **LIVERPOOL10**: R$ 10.00 discount
- **VINYL20**: R$ 20.00 discount

### Exchange (for Diogo Jonsson)
- **TROCA_DIOGO_50**: R$ 50.00 exchange coupon
- **TROCA_DIOGO_40**: R$ 40.00 exchange coupon
- **TROCA_DIOGO_35**: R$ 35.00 exchange coupon
- **TROCA_DIOGO_20**: R$ 20.00 exchange coupon
- **TROCA_DIOGO_300**: R$ 300.00 exchange coupon

## Database Schema

The application uses the following main entities:

- **Customer**: User accounts with profile information
- **Address**: Delivery and billing addresses
- **CreditCard**: Saved credit cards for payment
- **Order**: Purchase orders
- **Coupon**: Promotional and exchange coupons
- **AuditLog**: Audit trail of system actions
