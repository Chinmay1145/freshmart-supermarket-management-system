# FreshMart Supermarket Management System

FreshMart is a full-stack retail management (ERP) web application for supermarkets and grocery stores. It unifies point-of-sale billing, inventory control, purchasing, customer and supplier management, staff records, expense tracking and business reporting in a single platform, and ships with a public marketing website.

The application is built with TanStack Start, React 19 and Supabase, and is designed around the needs of Indian retailers, with INR formatting, GST fields and UPI payments supported out of the box.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Application Routes](#application-routes)
- [Database Schema](#database-schema)
- [Core Workflows](#core-workflows)
- [Demo Data](#demo-data)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
- [User Roles](#user-roles)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)
- [Frequently Asked Questions](#frequently-asked-questions)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## Overview

Running a supermarket involves many connected activities: billing customers at the counter, keeping shelves stocked, paying suppliers, tracking expenses and understanding what sells. FreshMart brings these into one system so that every sale updates stock, every purchase updates supplier balances, and every action is recorded in an audit trail.

**Who it is for**

- Single-store supermarkets and grocery shops
- Store owners who need clear visibility into sales, stock and expenses
- Cashiers, inventory staff and managers who need role-appropriate tools

**What it provides**

- A secure, authenticated back-office application
- A responsive interface that works on desktop, tablet and mobile
- Exportable reports and invoices in CSV and PDF
- A public website for product information, pricing, blog and support content

## Key Features

### Store Management Modules

| Module | Description |
| --- | --- |
| Dashboard | Key store metrics, recent sales and stock alerts at a glance |
| Products | SKU, barcode, brand, unit, MRP, purchase and selling price, tax rate, expiry date, minimum and maximum stock levels |
| Stock | Real-time stock status (in stock, low stock, out of stock, overstocked) with inventory movement history |
| Categories | Hierarchical categories and sub-categories |
| Sales | Bill creation, hold, complete, refund and cancel workflows with multiple payment methods |
| Purchases | Purchase orders with draft, ordered, received, partially received and cancelled states |
| Customers | Customer profiles, purchase history and loyalty points |
| Suppliers | Supplier directory with GST number, payment terms and outstanding balances |
| Returns | Return requests with an approval workflow |
| Discounts | Percentage, fixed-amount and buy-X-get-Y promotions with validity periods and usage limits |
| Employees | Staff records, departments and role management |
| Expenses | Operating expense tracking by category and payment method |
| Reports | Revenue trends, best-selling products, payment mix, expense breakdowns and top products by quantity, with selectable date ranges |
| Notifications | In-app operational and stock alerts |
| Activity Log | Audit trail of user actions across modules |
| Settings | Store name, GST number, address, contact details, default tax rate and invoice prefix |
| Profile | Personal account details for the signed-in user |

### Platform Capabilities

- **Exports:** CSV and branded PDF export across modules. PDF documents automatically use the store name and details configured in Settings.
- **Localization:** Indian Rupee (INR) formatting, GST fields, UPI payment support and the `en-IN` locale for numbers and dates.
- **Authentication:** Email and password sign-in, Google sign-in and a password reset flow.
- **Role-based model:** Super Admin, Manager, Cashier and Inventory Staff roles.
- **Responsive interface:** Collapsible sidebar on desktop and slide-out navigation on mobile.
- **Search-friendly public site:** Page-level titles, descriptions, canonical links and social-sharing metadata.

### Public Website

Home, Features, Pricing, Integrations, Customer Stories, About, Careers, Blog (with article pages), FAQ, Contact, Security, Privacy Policy and Terms of Service.

## Technology Stack

| Layer | Technology |
| --- | --- |
| Framework | TanStack Start and TanStack Router (file-based routing, server-side rendering) |
| UI | React 19, Tailwind CSS 4, shadcn/ui (Radix UI), Lucide icons |
| Data Fetching | TanStack Query |
| Forms and Validation | React Hook Form, Zod |
| Charts | Recharts |
| Notifications (UI) | Sonner toast messages |
| Backend | Supabase (PostgreSQL, Authentication, Row Level Security) |
| Migrations | Drizzle Kit with SQL migrations |
| Document Export | jsPDF, jspdf-autotable |
| Build Tooling | Vite, Nitro |
| Code Quality | TypeScript, ESLint, Prettier |
| Package Manager | Bun |

## System Architecture

```text
                +------------------------------------------+
                |                 Browser                  |
                |  React 19 + TanStack Router + Query      |
                +--------------------+---------------------+
                                     |
                   SSR for public pages / client-side app
                                     |
                +--------------------v---------------------+
                |        TanStack Start server (Nitro)     |
                |  Public pages, SEO metadata, auth helpers|
                +--------------------+---------------------+
                                     |
                          Supabase JS client
                                     |
                +--------------------v---------------------+
                |                 Supabase                 |
                |  Auth  |  PostgreSQL + RLS  |  Functions |
                +------------------------------------------+
```

**Design notes**

- Public marketing pages are server-rendered for fast first paint and good SEO.
- The authenticated application (routes under `_authenticated`) runs client-side and verifies the Supabase session before every navigation, redirecting to `/auth` when there is no valid user.
- Data access is centralized in reusable hooks (`useRows`, `useSaveRow`) in `src/lib/db.ts`, built on TanStack Query. These handle fetching, create and update mutations, cache invalidation and user-friendly error and success toasts.
- Formatting (currency, numbers, dates, CSV download) lives in `src/lib/format.ts`, and PDF generation in `src/lib/pdf.ts`, so every module produces consistent output.

## Project Structure

```text
freshmart-supermarket-management-system/
├── drizzle/
│   ├── migrations/
│   │   ├── 0000_supermarket_core_schema.sql   # Tables, enums, RLS policies, triggers
│   │   └── 0001_seed_demo_data.sql            # Sample categories, suppliers and products
│   └── schema.ts
├── public/                                    # Static assets
├── src/
│   ├── components/
│   │   ├── ui/                                # shadcn/ui component library
│   │   ├── app-shell.tsx                      # Authenticated layout and sidebar
│   │   ├── site-layout.tsx                    # Public site header and footer
│   │   └── export-buttons.tsx                 # Reusable CSV and PDF export controls
│   ├── hooks/                                 # Authentication, responsive and PDF hooks
│   ├── integrations/supabase/                 # Supabase clients, auth middleware, generated types
│   ├── lib/                                   # Data hooks, formatting, PDF builder, blog content
│   ├── routes/
│   │   ├── _authenticated/                    # Protected application routes
│   │   ├── auth.tsx, auth.signup.tsx          # Authentication pages
│   │   └── *.tsx                              # Public marketing pages
│   ├── router.tsx
│   ├── server.ts                              # Server entry point
│   └── styles.css                             # Tailwind configuration and design tokens
├── supabase/config.toml
├── drizzle.config.ts
├── vite.config.ts
└── package.json
```

`src/routeTree.gen.ts` is generated automatically by TanStack Router and should not be edited manually. Routing follows file-based conventions: `index.tsx` maps to a folder root, `$id.tsx` creates a dynamic segment, and `_authenticated` is a pathless layout route that guards its children.

## Application Routes

### Authenticated Application

| Route | Purpose |
| --- | --- |
| `/dashboard` | Store overview |
| `/products`, `/products/:id` | Product list and product detail |
| `/stock` | Stock levels and adjustments |
| `/categories` | Category management |
| `/sales`, `/sales/new`, `/sales/:id` | Sales list, new bill and invoice detail |
| `/purchases`, `/purchases/new`, `/purchases/:id` | Purchase orders |
| `/customers`, `/customers/:id` | Customer list and profile |
| `/suppliers`, `/suppliers/:id` | Supplier list and profile |
| `/returns` | Return requests and approvals |
| `/discounts` | Promotions and coupon codes |
| `/employees` | Staff management |
| `/expenses` | Expense tracking |
| `/reports` | Analytics and exports |
| `/notifications` | Alerts inbox |
| `/activity` | Audit log |
| `/settings` | Store configuration |
| `/profile` | User profile |

### Public and Authentication Pages

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/features`, `/pricing`, `/integrations`, `/customer-stories` | Product information |
| `/about`, `/careers`, `/contact` | Company pages |
| `/blog`, `/blog/:slug` | Blog index and articles |
| `/faq` | Frequently asked questions |
| `/security`, `/privacy`, `/terms` | Trust and legal pages |
| `/auth`, `/auth/signup`, `/reset-password` | Sign in, registration and password recovery |

## Database Schema

The PostgreSQL schema is defined in `drizzle/migrations/0000_supermarket_core_schema.sql`.

**Tables**

| Area | Tables |
| --- | --- |
| Identity | `profiles`, `user_roles`, `employees` |
| Catalog | `categories`, `products`, `suppliers` |
| Sales | `sales`, `sale_items`, `customers`, `discounts` |
| Purchasing | `purchases`, `purchase_items` |
| Inventory | `inventory_movements` |
| Returns | `returns`, `return_items` |
| Finance | `expenses` |
| System | `notifications`, `audit_logs`, `store_settings` |

**Enumerated types**

| Enum | Values |
| --- | --- |
| `app_role` | `super_admin`, `manager`, `cashier`, `inventory_staff` |
| `stock_status` | `in_stock`, `low_stock`, `out_of_stock`, `overstocked` |
| `purchase_status` | `draft`, `ordered`, `received`, `partially_received`, `cancelled` |
| `payment_method` | `cash`, `card`, `upi`, `wallet`, `split`, `bank_transfer` |
| `sale_status` | `completed`, `held`, `refunded`, `cancelled` |
| `return_status` | `requested`, `approved`, `completed`, `rejected` |
| `discount_type` | `percentage`, `fixed`, `bxgy` |

**Key relationships**

- `sales` has many `sale_items`; each item references a `products` row and keeps a snapshot of the product name, SKU, price and tax rate so historical invoices remain accurate.
- `sales` optionally reference a `customers` row and the cashier's `auth.users` account.
- `purchases` have many `purchase_items` and belong to a `suppliers` row.
- `returns` have many `return_items` and reference the original `sales` record.
- `categories` support a self-referencing `parent_id` for sub-categories.
- `products` reference both a category and a supplier, and are indexed for fast lookup.

**Functions and triggers**

| Name | Purpose |
| --- | --- |
| `has_role(user_id, role)` | Checks whether a user holds a given role |
| `handle_new_user()` | Creates a profile automatically when a user signs up |
| `touch_updated_at()` | Keeps `updated_at` current on product updates |

Row Level Security is enabled on all tables, and access is granted to the `authenticated` role.

## Core Workflows

### Selling

1. A cashier opens **Sales > New Sale**, adds products and applies any discount.
2. The bill is settled with cash, card, UPI, wallet, bank transfer or a split payment.
3. An invoice number is generated using the configured prefix, and the sale is recorded with its line items.
4. The invoice can be exported as a PDF.

### Purchasing and Stocking

1. Inventory staff create a purchase order for a supplier (draft, then ordered).
2. When goods arrive, the order is marked received or partially received.
3. Stock levels and inventory movements reflect the change, and low-stock items surface on the dashboard and in notifications.

### Returns

1. A return is raised against an existing invoice with a reason and refund amount.
2. A manager reviews it (requested, approved, completed or rejected).
3. The outcome is recorded in the activity log.

### Reporting

Managers choose a date range on **Reports** to review revenue trends, best sellers, payment mix and expenses, then export the data as CSV or PDF.

## Demo Data

The optional seed migration `0001_seed_demo_data.sql` populates a working store so the application can be explored immediately. It includes:

- Product categories (Groceries, Dairy, Beverages, Snacks, Personal Care, Household, Fruits & Vegetables) with sub-categories for Groceries
- Sample suppliers with GST numbers and payment terms
- Products with barcodes, pricing, tax rates, stock levels and expiry dates
- Customers, employees, sales with line items, purchases, expenses, discounts, returns, inventory movements, notifications and audit log entries

All demo records are fictional. Skip this migration for a clean production database.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (or Node.js 20+ with npm or pnpm)
- A [Supabase](https://supabase.com/) project

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/<your-username>/freshmart-supermarket-management-system.git
   cd freshmart-supermarket-management-system
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Create a `.env` file in the project root. See [Environment Variables](#environment-variables).

4. Apply the database migrations. In the Supabase SQL Editor (or with the Supabase CLI), run the following files in order:

   1. `drizzle/migrations/0000_supermarket_core_schema.sql`
   2. `drizzle/migrations/0001_seed_demo_data.sql` (optional)

5. Start the development server:

   ```bash
   bun run dev
   ```

6. Open the local URL shown in the terminal and register an account at `/auth/signup`.

### Production Build

```bash
bun run build
bun run preview
```

## Environment Variables

```env
# Server-side
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=<your-publishable-key>
SUPABASE_PROJECT_ID=<project-ref>

# Client-side (exposed to the browser through Vite)
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-publishable-key>
VITE_SUPABASE_PROJECT_ID=<project-ref>
```

| Variable | Description |
| --- | --- |
| `SUPABASE_URL` | Supabase project URL used by server-side code |
| `SUPABASE_PUBLISHABLE_KEY` | Publishable (anon) key used by server-side code |
| `SUPABASE_PROJECT_ID` | Supabase project reference ID |
| `VITE_SUPABASE_URL` | Supabase project URL exposed to the browser |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Publishable key exposed to the browser |
| `VITE_SUPABASE_PROJECT_ID` | Project reference ID exposed to the browser |

Do not commit service-role keys or database passwords. Only publishable keys should be used in client-side variables.

## Available Scripts

| Command | Description |
| --- | --- |
| `bun run dev` | Start the development server |
| `bun run build` | Create a production build |
| `bun run build:dev` | Create a development-mode build |
| `bun run preview` | Preview the production build locally |
| `bun run lint` | Run ESLint |
| `bun run format` | Format the codebase with Prettier |

## Deployment

1. **Provision Supabase.** Create a project, run the migrations and enable the authentication providers you need (email and, optionally, Google).
2. **Configure authentication URLs.** In Supabase Auth settings, add your production site URL and redirect URLs (including `/reset-password`).
3. **Set environment variables** on your hosting platform using the variables listed above.
4. **Build and deploy** with `bun run build`. The build is produced through Nitro, which can target several hosting platforms; adjust the Nitro preset to match your provider.
5. **Verify** sign-up, sign-in, a test sale and a PDF export on the deployed site.

## User Roles

| Role | Intended Responsibility |
| --- | --- |
| Super Admin | Full administrative control of the store and its settings |
| Manager | Day-to-day operations, reporting and approvals |
| Cashier | Billing and customer-facing sales (default role for new users) |
| Inventory Staff | Stock, purchasing and supplier management |

Roles are stored in the `user_roles` table and evaluated with the `has_role()` database function.

## Security Considerations

- Authentication is provided by Supabase Auth. All routes under `/_authenticated` redirect unauthenticated visitors to the sign-in page.
- Row Level Security is enabled on every table; however, the current policies grant full access to any authenticated user. This is suitable for a single-store demonstration. For multi-user production deployments, restrict policies with `has_role()` so that, for example, cashiers cannot modify employees, expenses or store settings.
- The `user_roles` table currently allows users to insert their own role. Review and restrict this before production use so that users cannot assign themselves elevated roles.
- Keep secrets out of version control. Only publishable keys belong in client-side variables.
- Please report security vulnerabilities privately to the repository owner rather than through public issues.

## Troubleshooting

| Problem | Likely Cause and Fix |
| --- | --- |
| "Missing Supabase environment variable(s)" error | The `SUPABASE_URL` or `SUPABASE_PUBLISHABLE_KEY` variable is not set. Add them to `.env` and restart the dev server. |
| Redirected to the sign-in page repeatedly | The Supabase session is missing or expired. Sign in again and confirm the URL and key match your project. |
| Tables or data not found | Migrations have not been applied. Run both SQL files in order in the Supabase SQL Editor. |
| Empty dashboard after sign-up | The seed migration was skipped. Run `0001_seed_demo_data.sql` or add records manually. |
| Google sign-in redirect fails | The Google provider is not enabled, or the redirect URL is not allow-listed in Supabase Auth settings. |
| Password reset link does not work | Add the `/reset-password` URL to the allowed redirect URLs in Supabase. |
| Routing types out of date | Restart the dev server to regenerate `routeTree.gen.ts`. |

## Frequently Asked Questions

**Can it manage more than one store?**
Not yet. The current version is designed for a single store; multi-store support is on the roadmap.

**Does it support GST?**
Yes. Products carry a tax rate, suppliers and store settings hold GST numbers, and invoices include tax amounts. Confirm the output meets your local compliance requirements before relying on it for filings.

**Which payment methods are supported?**
Cash, card, UPI, wallet, bank transfer and split payments.

**Can I use it without the demo data?**
Yes. Skip the seed migration and add your own categories, suppliers and products.

**Can I export my data?**
Yes. Most modules offer CSV export, and key documents can be exported as PDF.

## Roadmap

- [x] Core modules: products, stock, sales, purchases, customers, suppliers
- [x] Returns, discounts, expenses, employees and audit log
- [x] Reporting with PDF and CSV export
- [x] Public marketing website
- [ ] Role-scoped Row Level Security policies
- [ ] Barcode scanner and receipt printer integration
- [ ] WhatsApp and SMS alerts
- [ ] Multi-store support
- [ ] Automated test suite

## Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit your changes: `git commit -m "Add your feature"`.
4. Push the branch: `git push origin feature/your-feature`.
5. Open a pull request.

Please run `bun run lint` and `bun run format` before submitting, and describe the change and its motivation clearly in your pull request.

## License

No license has been specified. Add a `LICENSE` file (for example, [MIT](https://choosealicense.com/licenses/mit/)) to define the terms under which this project may be used.
