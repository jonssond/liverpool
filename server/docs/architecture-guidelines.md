# Server Architecture Guidelines

This document details the backend architectural pattern, directory structure, layering, database integration, and dependency injection strategy for the **Liverpool Discos** server.

---

## 🏛️ Architectural Layers (MVC + Service-Repository)

To keep implementation simple and prevent folder sprawl, the server is structured around four primary layers. Custom middleware functions (like authentication checks) are declared directly inside the **Routes** files to keep code localized.

```
[Client Request]
       │
       ▼
 1. Routes (Endpoints, local validation, inline route checks)
       │
       ▼
 2. Controllers (Parses input, returns HTTP status codes)
       │
       ▼
 3. Services (Core Business Logic)
       │
       ▼
 4. Repositories (Database access & queries)
       │
       ▼
[TypeORM / PostgreSQL Database]
```

### 1. Routes (with inline route checks)
*   Defines HTTP endpoints (`GET`, `POST`, `PUT`, `DELETE`).
*   Serves as the **Composition Root** where Controllers, Services, and Repositories are instantiated and linked (Manual Dependency Injection).
*   Declares or applies route-specific checks (e.g., verifying if the user is an Admin before executing Customer CRUD) directly in the route declaration.

### 2. Controllers
*   **Role**: Adapts HTTP requests to the application layer and formats HTTP responses.
*   Extracts path parameters, query parameters, and body payloads.
*   Delegates processing to Services and returns appropriate HTTP status codes (e.g., `200 OK`, `201 Created`, `400 Bad Request`).
*   Does not contain database calls or core business logic.

### 3. Services
*   **Role**: House of business rules.
*   Performs domain validations, calculates totals, checks eligibility (e.g., verifying if an order is `DELIVERED` before approving an exchange).
*   Coordinates multiple repository operations.
*   Independent of Express and HTTP concepts (can be easily unit tested).

### 4. Repositories
*   **Role**: Database access abstraction.
*   Uses **TypeORM** entity managers and repositories to perform CRUD and complex SQL queries.
*   Shields the service layer from direct SQL/ORM syntax.

---

## 🔌 Database & ORM Configuration

*   **Database**: **PostgreSQL** (using `pg` driver).
*   **ORM**: **TypeORM** (using `reflect-metadata` for decorator support).
*   **Connection**: Managed via a central data source file (`src/database/data-source.ts`).

---

## 💉 Dependency Injection Strategy

*   **Approach**: **Manual Dependency Injection**.
*   **Rationale**: Simplifies the compilation pipeline and avoids configuration bugs often associated with heavy DI frameworks.
*   **Implementation Example (Including route-level admin check)**:
    ```typescript
    // src/routes/customer.routes.ts
    import { Router, Request, Response, NextFunction } from "express";
    import { AppDataSource } from "../database/data-source";
    import { Customer } from "../entities/Customer.entity";
    import { CustomerRepository } from "../repositories/Customer.repository";
    import { CustomerService } from "../services/Customer.service";
    import { CustomerController } from "../controllers/Customer.controller";

    const customerRouter = Router();

    // 1. Resolve dependencies
    const ormRepo = AppDataSource.getRepository(Customer);
    const customerRepository = new CustomerRepository(ormRepo);
    const customerService = new CustomerService(customerRepository);
    const customerController = new CustomerController(customerService);

    // 2. Inline Route Check (Admin validation)
    const isAdmin = (req: Request, res: Response, next: NextFunction) => {
      const authHeader = req.headers.authorization;
      if (authHeader === "admin-secret-token") { // Example mock validation
        return next();
      }
      return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
    };

    // 3. Bind Endpoints with checks
    customerRouter.post("/", isAdmin, (req, res) => customerController.create(req, res));
    customerRouter.get("/", isAdmin, (req, res) => customerController.findAll(req, res));

    export { customerRouter };
    ```

---

## 📂 Backend Directory Structure

```
server/src/
├── controllers/          # HTTP controllers
├── database/             # Data Source setup and migration scripts
├── entities/             # TypeORM Database entities
├── repositories/         # Custom database query repositories
├── routes/               # API route definitions & route-level checks
├── services/             # Core business rules
├── index.ts              # Entrypoint file loading Express, dotenv, and global error handling
└── tsconfig.json         # TS compiler flags
```
