# FreshMart SuperMarket Management System

MASTER PROMPT — SUPERMARKET MANAGEMENT SYSTEM WEB APPLICATION

Create a modern, professional, production-ready Supermarket Management System as a full-stack web application. The application should look like a real commercial supermarket ERP/POS system rather than a basic college project.

1. PROJECT OBJECTIVE

Build a centralized supermarket management platform that allows administrators and staff to efficiently manage:

Products

Categories

Inventory / Stock

Suppliers

Customers

Sales

Billing / POS

Purchases

Employees

Expenses

Discounts

Offers

Returns

Payments

Reports

Notifications

User accounts and permissions

Dashboard analytics

The application should provide a seamless workflow from purchasing stock → inventory management → customer billing → sales tracking → reporting.

The UI must be highly polished, responsive, intuitive, and suitable for real-world supermarket operations.

2. TECHNOLOGY STACK

Use a modern and scalable architecture.

Frontend

React

TypeScript

Tailwind CSS

Modern component-based architecture

Responsive design

Framer Motion for subtle animations

Lucide React icons

Reusable UI components

Backend

Use a proper RESTful/API architecture.

Preferred:

Node.js

Express.js

TypeScript

Database

Use:

PostgreSQL

ORM:

Prisma ORM

Authentication

Implement secure authentication with:

Email/username + password

Secure password hashing

Session/JWT-based authentication

Protected routes

Role-based access control

Recommended Roles

Super Admin

Full system access.

Manager

Access to:

Dashboard

Products

Inventory

Suppliers

Purchases

Sales

Customers

Employees

Reports

Cashier

Access primarily to:

POS

Customers

Sales

Returns

Personal profile

Inventory Staff

Access to:

Products

Stock

Suppliers

Purchase records

Inventory reports

3. DESIGN DIRECTION

Create a premium modern SaaS/ERP dashboard aesthetic.

The interface should feel similar in quality to professional systems such as modern retail ERP, POS, inventory management, and business analytics applications.

Visual Style

Clean

Professional

Minimal

Modern

Enterprise-grade

Data-focused

Spacious layout

Excellent typography

Consistent visual hierarchy

Rounded cards

Subtle shadows

Professional tables

Elegant charts

Smooth micro-interactions

Avoid:

Overly colorful interfaces

Excessive gradients

Cartoonish graphics

Cluttered layouts

Huge unnecessary headings

Amateur-looking forms

Excessive animations

Use a professional neutral interface with one strong primary brand color and subtle status colors.

4. APPLICATION LAYOUT

Create a responsive application shell containing:

Sidebar

Display:

Dashboard

POS / Billing

Products

Categories

Inventory

Suppliers

Purchases

Sales

Customers

Employees

Expenses

Discounts & Offers

Returns

Reports

Notifications

Settings

At the bottom:

Logged-in user profile

Role

Account settings

Logout

The sidebar should collapse on tablets/mobile.

5. TOP NAVIGATION BAR

Create a professional top navigation bar containing:

Sidebar toggle

Global search

Notification icon

Quick action button

Current date

User profile menu

Global search should allow searching:

Products

Customers

Orders

Suppliers

Invoices

6. DASHBOARD

Create a comprehensive business intelligence dashboard.

Display KPI cards:

Today's Sales

Example:
₹1,24,580

Today's Orders

Example:
342

Total Products

Example:
4,825

Low Stock Items

Example:
28

Customers

Example:
8,450

Monthly Revenue

Example:
₹32,45,800

Each KPI card should include:

Icon

Current value

Comparison with previous period

Percentage increase/decrease

Small visual trend indicator

7. DASHBOARD ANALYTICS

Create interactive charts.

Sales Overview

Line/area chart showing:

Today

Last 7 days

Last 30 days

Last 12 months

Revenue by Category

Use a donut/pie chart showing categories such as:

Groceries

Beverages

Dairy

Snacks

Personal Care

Household

Fruits & Vegetables

Top Selling Products

Create a ranked table showing:

RankProductUnits SoldRevenue1Basmati Rice 5kg245₹36,7502Milk 1L420₹25,200

Recent Transactions

Display:

Invoice number

Customer

Cashier

Amount

Payment method

Date

Status

Inventory Alerts

Show:

Low stock

Out of stock

Expiring soon

Overstocked products

8. POS / BILLING SYSTEM

Create a dedicated professional POS interface.

The POS should be optimized for fast supermarket billing.

Layout

Left/main section:

Product search

Barcode search

Category filters

Product grid/list

Right section:

Current cart

Quantity controls

Remove item

Discount

Tax

Subtotal

Grand total

Product Search

Support:

Product name

SKU

Barcode

Cart

Each item should show:

Product name

SKU

Unit price

Quantity

Discount

Total

Allow:

Increase quantity

Decrease quantity

Manual quantity entry

Remove item

Apply item discount

Checkout

Provide:

Cash

Card

UPI

Digital Wallet

Split payment

Show:

Subtotal

Discount

Tax

Total

Amount received

Change due

Buttons:

Hold Bill

Clear Cart

Print Invoice

Complete Payment

9. PRODUCTS MANAGEMENT

Create a complete product management module.

Display a professional data table with:

Product image

Product name

SKU

Barcode

Category

Brand

Purchase price

Selling price

Current stock

Minimum stock

Expiry date

Status

Actions

Actions:

View

Edit

Duplicate

Delete

Adjust stock

Add Product Form

Fields:

Product name

SKU

Barcode

Category

Brand

Supplier

Description

Purchase price

Selling price

MRP

Tax rate

Discount

Minimum stock

Maximum stock

Current stock

Unit

Expiry date

Product image

Status

Support units such as:

Piece

Kg

Gram

Liter

Milliliter

Pack

Box

10. CATEGORY MANAGEMENT

Create category management with:

Category name

Description

Product count

Status

Created date

Allow:

Add category

Edit category

Delete category

Search

Filter

Support subcategories.

Example:

Groceries
→ Rice
→ Pulses
→ Flour
→ Spices

11. INVENTORY MANAGEMENT

Create a powerful inventory dashboard.

Show:

Total inventory value

Total stock units

Low-stock products

Out-of-stock products

Expiring products

Inventory table:

Product

SKU

Category

Stock

Minimum stock

Maximum stock

Warehouse/location

Stock status

Last updated

Status:

In Stock

Low Stock

Out of Stock

Overstocked

Expiring Soon

Implement stock adjustment.

Record:

Previous quantity

New quantity

Difference

Reason

Employee

Timestamp

Maintain an inventory movement history.

12. SUPPLIER MANAGEMENT

Create supplier management.

Fields:

Supplier name

Company

Phone

Email

Address

GST number

Payment terms

Products supplied

Outstanding amount

Status

Supplier details page should show:

Purchase history

Total purchases

Outstanding payments

Recent transactions

Supplied products

13. PURCHASE MANAGEMENT

Create purchase order functionality.

Purchase fields:

Purchase ID

Supplier

Purchase date

Invoice number

Products

Quantity

Purchase price

Tax

Discount

Total amount

Payment status

Statuses:

Draft

Ordered

Received

Partially Received

Cancelled

When a purchase is marked as received:

Automatically increase inventory stock.

14. SALES MANAGEMENT

Create a complete sales management module.

Display:

Invoice number

Customer

Cashier

Items

Subtotal

Discount

Tax

Total

Payment method

Date

Status

Allow:

View invoice

Print invoice

Download invoice

Refund

Cancel transaction

15. CUSTOMER MANAGEMENT

Create a CRM-style customer module.

Customer fields:

Customer name

Phone

Email

Address

Date of birth

Loyalty points

Total purchases

Last purchase

Customer status

Customer profile should display:

Purchase history

Total spending

Average order value

Loyalty points

Returns

Outstanding balance

Support guest checkout.

16. EMPLOYEE MANAGEMENT

Create employee management.

Fields:

Employee ID

Name

Email

Phone

Role

Department

Joining date

Salary

Status

Roles:

Admin

Manager

Cashier

Inventory Staff

Include:

Employee activity

Login history

Sales performed

Attendance summary

17. EXPENSE MANAGEMENT

Create an expense management module.

Expense fields:

Expense title

Category

Amount

Payment method

Description

Date

Added by

Receipt

Expense categories:

Electricity

Rent

Salary

Transportation

Maintenance

Marketing

Miscellaneous

Dashboard should calculate:

Revenue - Expenses = Net Profit

18. DISCOUNTS & OFFERS

Create a promotional management system.

Allow managers to create:

Percentage discount

Fixed amount discount

Buy X Get Y

Product-specific discount

Category discount

Customer-specific discount

Festival offer

Coupon code

Fields:

Offer name

Discount type

Discount value

Start date

End date

Applicable products/categories

Minimum purchase amount

Maximum discount

Usage limit

Status

19. RETURNS & REFUNDS

Create a complete returns system.

Allow staff to:

Search invoice

Select products

Select return quantity

Specify return reason

Calculate refund

Process refund

Return statuses:

Requested

Approved

Completed

Rejected

Returned inventory should automatically update according to the configured return policy.

20. REPORTS

Create a powerful reports section.

Reports:

Sales Report

Daily

Weekly

Monthly

Yearly

Custom date range

Purchase Report

Inventory Report

Product Performance Report

Customer Report

Supplier Report

Expense Report

Profit & Loss Report

Tax Report

Employee Sales Report

Allow:

Date filters

Category filters

Employee filters

Supplier filters

Export CSV

Export PDF

Print report

21. NOTIFICATION SYSTEM

Create notifications for:

Low stock

Out of stock

Expiring products

New purchase orders

Pending supplier payments

High-value sales

Returns

System alerts

Use a notification dropdown in the navbar.

22. SETTINGS

Create a professional settings section.

Store Settings

Store name

Logo

Address

Phone

Email

GST number

Tax settings

Currency

Invoice prefix

User Settings

Name

Email

Password

Profile image

Preferences

POS Settings

Default tax

Receipt format

Auto-print receipt

Barcode settings

Payment methods

Security

Password change

Session management

Login history

Role permissions

23. DATABASE DESIGN

Create a normalized PostgreSQL database.

Suggested entities:

users

roles

permissions

products

categories

subcategories

suppliers

customers

employees

inventory

inventory_movements

purchases

purchase_items

sales

sale_items

payments

returns

return_items

expenses

discounts

coupons

notifications

audit_logs

store_settings

Create appropriate:

Primary keys

Foreign keys

Indexes

Unique constraints

Created timestamps

Updated timestamps

Soft-delete fields where appropriate

Ensure database relationships are properly implemented.

24. SECURITY

Implement professional security practices.

Include:

Password hashing

Authentication middleware

Authorization middleware

Role-based permissions

Protected API endpoints

Input validation

Server-side validation

SQL injection protection

XSS protection

Secure session handling

Audit logging

Never expose sensitive credentials in frontend code.

Use environment variables for:

Database URL

JWT secret

API keys

Application secrets

25. RESPONSIVE DESIGN

The application must work perfectly on:

Desktop

Laptop

Tablet

Mobile

Desktop should prioritize data density and productivity.

Mobile should transform tables into:

Responsive cards

Horizontal scrolling where appropriate

Bottom sheets

Mobile-friendly forms

The POS interface must remain usable on tablets.

26. UX REQUIREMENTS

Every page should include:

Loading state

Empty state

Error state

Success feedback

Confirmation dialogs

Form validation

Search

Filters

Sorting

Pagination where appropriate

Use toast notifications for successful operations.

Example:

"Product successfully added."

"Sale completed successfully."

"Inventory updated successfully."

27. DATA VISUALIZATION

Use professional charts.

Recommended:

Line charts

Bar charts

Donut charts

Area charts

KPI cards

Progress indicators

Charts should have:

Tooltips

Legends

Responsive sizing

Date filters

Clean labels

28. INVOICE DESIGN

Create a professional supermarket invoice.

Include:

Store logo

Store name

Store address

GST number

Invoice number

Date/time

Cashier

Customer

Product list

Quantity

Unit price

Discount

Tax

Subtotal

Grand total

Payment method

Amount paid

Change

Thank-you message

Make the invoice printer-friendly.

29. BARCODE SUPPORT

Implement barcode-ready functionality.

Allow:

Barcode search

SKU search

Barcode generation

Barcode scanning integration-ready architecture

The product database should support unique barcode values.

30. AUDIT LOG

Maintain an audit trail for important operations.

Record:

User

Action

Module

Entity

Previous value

New value

Timestamp

IP/device information where appropriate

Examples:

"Admin updated product price."

"Cashier completed sale."

"Manager approved refund."

31. PERFORMANCE

Optimize the application for real-world usage.

Implement:

Pagination

Lazy loading

Efficient database queries

Indexed database fields

Debounced search

Optimized API calls

Component reuse

Proper caching where appropriate

Avoid unnecessary API requests and unnecessary re-renders.

32. SAMPLE DATA

Populate the application with realistic demo data.

Products:

Basmati Rice 5kg

Wheat Flour 5kg

Tata Salt 1kg

Milk 1L

Bread 400g

Cooking Oil 1L

Tea 250g

Coffee 200g

Biscuits

Potato Chips

Soft Drinks

Shampoo

Soap

Toothpaste

Detergent

Dishwash Liquid

Categories:

Groceries

Dairy

Beverages

Snacks

Personal Care

Household

Fruits & Vegetables

Create realistic customers, suppliers, sales, purchases, and inventory records.

Use Indian Rupees (₹) throughout the application.

33. SEARCH & FILTERING

Implement global search and module-specific search.

Products:

Name

SKU

Barcode

Sales:

Invoice number

Customer

Customers:

Name

Phone

Suppliers:

Name

Company

Support:

Search

Category filter

Status filter

Date filter

Price filter

Stock filter

34. ERROR HANDLING

Provide professional error handling.

Examples:

Product not found

Insufficient stock

Invalid payment

Duplicate barcode

Invalid discount

Expired offer

Unauthorized action

Database error

Never expose raw backend errors to users.

Show friendly messages.

35. ACCESSIBILITY

Follow accessibility best practices.

Include:

Semantic HTML

Keyboard navigation

Proper labels

Accessible dialogs

Accessible buttons

Focus states

Sufficient contrast

Screen-reader-friendly elements

The POS should support keyboard-first operation for cashiers.

36. CODE QUALITY

Use:

TypeScript throughout

Strong typing

Reusable components

Clean folder structure

Modular services

API abstraction

Proper error handling

Environment configuration

Meaningful variable names

Comments only where useful

Avoid:

Duplicate code

Huge monolithic components

Hardcoded business logic

Hardcoded API responses

Unnecessary dependencies

37. PROJECT STRUCTURE

Use a professional structure similar to:

frontend/
├── components/
├── pages/
├── layouts/
├── hooks/
├── services/
├── api/
├── types/
├── utils/
├── context/
├── routes/
└── assets/

backend/
├── controllers/
├── routes/
├── services/
├── middleware/
├── models/
├── validators/
├── utils/
└── config/

database/
├── schema/
├── migrations/
└── seed/

38. IMPORTANT BUSINESS LOGIC

Implement these workflows correctly.

Sale Workflow

Product selected
→ Check stock
→ Add to cart
→ Apply discount
→ Calculate tax
→ Payment
→ Create sale
→ Create sale items
→ Reduce inventory
→ Record payment
→ Generate invoice
→ Update customer statistics

Purchase Workflow

Create purchase
→ Select supplier
→ Add products
→ Confirm purchase
→ Receive inventory
→ Increase stock
→ Record supplier transaction

Return Workflow

Find sale
→ Select item
→ Validate return quantity
→ Calculate refund
→ Process refund
→ Update inventory
→ Record return

39. DASHBOARD QUICK ACTIONS

Add quick action buttons:

New Sale

Add Product

Add Customer

Create Purchase

Adjust Inventory

Generate Report

These should open the relevant workflow immediately.

40. FINAL UI QUALITY REQUIREMENT

The final application should look like a commercial supermarket ERP/POS product that could realistically be demonstrated to a business owner.

Prioritize:

Professional UI

Excellent UX

Functional workflows

Accurate inventory calculations

Reliable sales processing

Clean database architecture

Responsive design

Security

Performance

Maintainable code

Do not create a static mockup.

Build a fully functional application with connected frontend, backend, database, authentication, CRUD operations, business logic, validation, and realistic sample data.

Every major button should perform a meaningful action.

Every form should validate input.

Every important operation should provide feedback.

The final result should feel like a polished real-world Supermarket Management & Point-of-Sale System rather than a simple academic CRUD application.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f4a9c2aa-62be-41e2-85aa-8394de54d16c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
