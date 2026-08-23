# Frontend Architecture Structure

This document outlines the React frontend directory structure, routing system, and component architecture for the **Liverpool Discos** client.

---

## 🏛️ Directory Layout

The `client/src` directory is organized into modules to enforce separation of concerns, screen-level isolation, and component reuse:

```
client/src/
├── assets/             # Images, SVGs, and other local static media
├── components/         # Reusable presentation components
│   ├── Button.tsx      # Standard buttons (Portuguese labels, stylized with Tailwind)
│   ├── Card.tsx        # Vinyl record item cards
│   ├── Input.tsx       # Text inputs, validation containers
│   ├── Modal.tsx       # Popups and forms (e.g. Return request confirmation)
│   └── Chatbot.tsx     # The floating AI recommendation widget
├── screens/            # Screens representing full application pages
│   ├── admin/          # Admin-facing pages
│   │   ├── CustomerCrud.tsx     # Customer CRUD management screen
│   │   ├── Dashboard.tsx        # Insights & Sales history chart screen
│   │   └── ReturnRequests.tsx   # Exchange/Refund requests management screen
│   ├── customer/       # Customer-facing pages
│   │   ├── Storefront.tsx       # Browse catalog screen
│   │   ├── Cart.tsx             # Shopping cart screen
│   │   ├── Checkout.tsx         # Payment validation and order creation screen
│   │   └── OrderHistory.tsx     # Order history and exchange trigger screen
│   ├── Login.tsx       # Core login screen
│   └── Register.tsx    # Customer registration screen (Double password validation)
├── routes/             # Navigation and routing setup
│   └── AppRoutes.tsx   # Route mappings (using react-router-dom)
├── App.tsx             # Main entry container wrapping routing providers
├── index.css           # Global CSS, `@import "tailwindcss"`, font and color definitions
└── main.tsx            # React DOM mounting entry point
```

---

## 🚦 Routing Strategy

The application uses `react-router-dom` to manage screen transitions.

*   **Public Route**: `/login` and `/register`.
*   **Customer Routes** (Accessible after sign-in):
    *   `/`: Shop catalog list
    *   `/cart`: Review selected vinyl records
    *   `/checkout`: Payment processing and order confirmation
    *   `/orders`: List of previous purchases and return forms
*   **Admin Routes**:
    *   `/admin/dashboard`: Sales analysis line chart
    *   `/admin/customers`: Customer CRUD operations
    *   `/admin/returns`: Return and exchange review center

---

## 🔄 Reusable Component Guidelines

All files under `client/src/components/` must be:
1.  **Purely Presentational**: They receive data and actions via React Props.
2.  **Fully Stylized**: Styled inline using Tailwind CSS v4 variables aligned with the [UI Guidelines](file:///home/diogo/projects/liverpool/client/docs/ui-guidelines.md).
3.  **Flexible**: Reuse CSS spacing and classes by accepting an optional `className` prop.
