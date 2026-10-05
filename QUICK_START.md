# Quick Start Guide

## Database Commands

All database commands are run from the `server` directory:

```bash
cd server
```

### 1. Seed Database (Add Default Users)

```bash
npm run db:seed
```

Creates:
- 2 default customers (Diogo Jonsson, John Doe)
- 7 coupons (2 promotional + 5 exchange)
- All addresses and credit cards

### 2. Drop Database (Delete All Data)

```bash
npm run db:drop
```

⚠️ **Warning**: This permanently deletes all data.

### 3. Reset Database (Drop + Reseed)

```bash
npm run db:reset
```

Fast way to clean and restore default data.

## Development Workflow

### 1. Start Everything

From root directory:
```bash
npm run dev
```

This starts:
- Frontend on http://localhost:5173
- Backend on http://localhost:3000

### 2. Run Tests

From client directory:
```bash
cd client
npm run cypress:run
```

### 3. Database Operations

From server directory:
```bash
cd server
npm run db:seed    # Add default data
npm run db:reset   # Clear and reseed
```

## Default Test Users

| Email | Password | Type |
|-------|----------|------|
| diogo@example.com | (password required) | Customer |
| john.doe@example.com | (password required) | Customer |

**Admin**: Access http://localhost:5173/admin for order and customer management

## Database Configuration

Default settings (in `.env` file):
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=liverpool
```

## File Structure

```
server/
├── src/
│   ├── index.ts              # Entry point
│   ├── database/
│   │   ├── data-source.ts    # Database config
│   │   └── scripts.ts        # Drop/seed commands
│   ├── entities/             # Database models
│   ├── controllers/          # Route handlers
│   ├── services/             # Business logic
│   └── repositories/         # Data access
```

## Troubleshooting

### Database connection error

Make sure PostgreSQL is running:
```bash
# macOS (if using Homebrew)
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Docker
docker run -d -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres
```

### Clear TypeScript cache

```bash
cd server
npm run build
```

### Reinstall dependencies

```bash
cd server
rm -rf node_modules package-lock.json
npm install
```

## Resources

- See [DATABASE.md](./DATABASE.md) for detailed database information
- See [README.md](./README.md) for full project documentation
- See [client/cypress/e2e](./client/cypress/e2e) for test examples
