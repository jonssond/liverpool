# Liverpool Discos - Requirements Specification

This document details the core requirements and business rules for the **Liverpool Discos** e-commerce system. These requirements are adapted from the original specifications ([DRS_LES_2_2026.txt](file:///mnt/c/Users/Diogo/Downloads/DRS_LES_2_2026.txt)) with book references updated to **Vinyl Records (LPs)**.

---

## 🎯 Project Scope & Guidelines

*   **E-Commerce Name**: Liverpool Discos.
*   **Languages**:
    *   **Development Language**: Code, database definitions, API endpoints, variable names, and documentation are written in **English**.
    *   **User Interface Language**: The customer and admin-facing website interface must be in **Portuguese only**.
*   **Customer Management**:
    *   **CRITICAL RULE**: The Customer CRUD (registration, editing, deletion) is performed exclusively by the **Admin**, not by the customers themselves.

---

## 👥 1. Customer CRUD (Cadastro de Clientes - Admin Only)

### 📌 Functional Requirements
*   **Admin Management**: Only the system Administrator can create, view, edit, and deactivate customer profiles.
*   **Core Fields**: Gender, Name, Date of Birth, CPF, Phone Number (Type, DDD, Number), Email, Password, Residential Address.
*   **Multiple Addresses**: 
    *   Each customer must have at least one **Billing Address** (Endereço de Cobrança) and one **Delivery Address** (Endereço de Entrega) registered.
    *   Address details: Residence Type (House, Apartment, etc.), Street Type (Avenue, Street, etc.), Street Name, Number, Neighborhood, Zip Code, City, State, Country.
    *   Addresses can be managed separately by the Admin.
*   **Credit Cards**: 
    *   Credit cards can be associated with a customer: Card Number, Name on Card, Brand/Flag (must be a registered brand in the system), and CVV.

### 🛡️ Non-Functional Security Rules
*   **Strong Password**: Min 8 characters, upper/lowercase letters, and special characters.
*   **Password Confirmation**: Mandatory double password input during registration.
*   **Password Encryption**: Passwords must be hashed/encrypted in the database.
*   **Unique Customer ID**: Every registered customer receives a unique generated ID.

---

## 🛒 2. E-Commerce Flow & Return/Refund Lifecycle (Fluxo de Vendas e Devoluções/Trocas)

### 📌 Purchase & Order Lifecycle (Customer Interface in Portuguese)
1.  **Shopping Cart (Carrinho de Compras)**:
    *   Users add Vinyl Records to their cart.
    *   Stock levels are verified before adding to the cart and checked again at final checkout.
2.  **Checkout & Payment (Finalização e Pagamento)**:
    *   Purchases are paid via credit cards or exchange coupons (cupom de troca).
    *   Payment processing is simulated. Successful validation sets the order status to `APPROVED`. Unsuccessful sets it to `REJECTED`.
3.  **Order Statuses (Status do Pedido)**:
    *   `IN PROCESS` (Em processamento) -> `APPROVED` (Aprovado) or `REJECTED` (Reprovado) -> `IN TRANSIT` (Em trânsito) -> `DELIVERED` (Entregue).
    *   Admin can advance status to `IN TRANSIT` and `DELIVERED`.

### 🔄 Return/Refund (Exchange) Flow (Troca e Reembolso)
1.  **Client Request**:
    *   Only orders with status `DELIVERED` (Entregue) are eligible for exchange/refund requests.
    *   The customer selects specific items from their order to exchange or return and submits a request.
    *   The request status starts as `EXCHANGE REQUESTED` (Troca solicitada).
2.  **Admin Review**:
    *   The Admin views active requests and either **Approves** or **Denies** them.
    *   If **Approved** (Autorizado):
        *   The request/order status changes to `EXCHANGED` (Trocado).
        *   A notification is generated for the customer.
        *   An **Exchange Coupon (Cupom de Troca)** is generated for the customer's account containing the value of the returned item(s).
    *   If **Denied** (Negado):
        *   The request status changes to `EXCHANGE DENIED` (Troca recusada).

---

## 📊 3. Admin Dashboard & Insights (Painel de Análise)

### 📈 Sales Analytics Chart (Gráfico de Vendas)
*   **Visualization**: A line chart showing historical sales metrics for admin insights.
*   **Axes**:
    *   Horizontal Axis (X): Months/Years within the selected period.
    *   Vertical Axis (Y): Total sales value in Brazilian Real (R$).
*   **Granularity**: Grouped by month and separated into distinct colored lines per Vinyl genre/category.
*   **Data Restrictions**: Only approved, in-transit, or delivered orders are calculated. Rejected/canceled orders are excluded.
*   **Timeframe Filters**: Admin can filter data between a minimum of 1 month and a maximum of 24 months.
*   **Interactivity**: Hovering over line nodes displays tooltips with exact sales figures.

---

## 🤖 4. AI Chatbot Recommendation System (Chatbot de Recomendação)

### 🧠 Personalized Recommendations
*   **Integration**: A persistent conversational chatbot widget on the client interface.
*   **Functionality**:
    *   The chatbot interacts with the customer in Portuguese to suggest vinyl records based on their preferences, genres, or simulated active interests.
    *   The recommendation model leverages the user's purchase history and store inventory details.
