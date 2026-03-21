# PayFlow Backend

## Overview

The PayFlow backend is the offchain service layer of the project. Its purpose is to support features that do not belong directly onchain, especially **email storage** and **invoice email delivery**.

The payroll logic itself is handled by smart contracts on Injective, but the backend is required for product features such as saving employee email addresses and sending invoice notifications after payroll is executed.

This backend is intentionally minimal, because the MVP is designed to keep the core business logic onchain and use the backend only where necessary.

---

## Why the Backend Exists

The backend exists because some product features cannot or should not live entirely onchain.

In particular:

- smart contracts cannot send emails
- employee email addresses should not be stored publicly onchain
- invoice notifications need an offchain delivery service
- a small database is needed to map employees to email addresses

So while payroll settlement is onchain, the backend supports the communication layer of the product.

---

## What the Backend Does

The backend is responsible for:

- storing employee emails
- retrieving employee email information
- sending invoice notification emails
- serving lightweight API endpoints for the frontend

The backend does **not** handle payroll logic, payroll calculations, or payroll settlement. Those remain onchain.

---

## Core Responsibilities

### 1. Store Employee Emails
When a company adds or updates an employee in the frontend, the employee’s payroll information is saved onchain, while the employee’s email is sent to the backend and stored offchain.

### 2. Retrieve Employee Emails
When payroll is executed, the frontend can query the backend to retrieve the email address associated with a given employee.

### 3. Send Invoice Emails
After payroll is run and onchain payment records are created, the frontend can call the backend to send invoice emails containing the employee payment details and the invoice page URL.

---

## Tech Stack

The backend is built with:

- **Node.js**
- **Express**
- **TypeScript**
- **Supabase**
- **Resend**
- **dotenv**
- **cors**

---

## Why These Technologies

### Node.js
Used as the backend runtime for a lightweight and simple MVP server.

### Express
Used to expose small REST endpoints quickly and clearly.

### TypeScript
Used for safer development and cleaner code structure.

### Supabase
Used as the offchain database layer for storing employee email data.

### Resend
Used to send invoice notification emails.

### dotenv
Used to manage environment variables securely.

### cors
Used so the frontend can communicate with the backend during development.

---

## Database

The backend uses **Supabase** as its database.

### Current Table

#### `employee_emails`
This table stores the offchain email mapping for employees.

Fields include:

- `company_wallet`
- `employee_id`
- `employee_wallet`
- `employee_name`
- `email`
- timestamps

This allows the backend to associate a company and employee ID with an email address.

---

## API Endpoints

### `POST /employees/email`
Saves or updates an employee email record.

Used when:
- a company adds an employee
- a company edits an employee email

### `GET /employees/email`
Fetches the email record for a given employee.

Used when:
- the frontend needs to retrieve the employee email before sending an invoice

### `POST /emails/send-invoice`
Triggers an invoice email.

Used after:
- payroll execution
- invoice creation
- payment confirmation

### `GET /health`
Simple health check endpoint.

Used to confirm:
- the backend is running

---

## Email Delivery Flow

The invoice email flow works like this:

1. Payroll is executed onchain
2. Payment records are created by the smart contract
3. The frontend reads the newly created payments
4. The frontend asks the backend for the corresponding employee email
5. The frontend calls the backend email endpoint
6. The backend sends the invoice email through Resend

This approach keeps invoice delivery simple and easy to demo in the MVP.

---

## Relationship with the Frontend

The frontend and backend work together as follows:

- **Frontend**
  - handles wallet connection
  - interacts with smart contracts
  - manages the product UI
  - triggers backend calls

- **Backend**
  - stores employee email addresses
  - sends invoice emails
  - provides lightweight API endpoints

---

## Relationship with the Smart Contracts

The backend does not replace the contracts.  
It complements them.

### Onchain
The contracts handle:
- company registration
- employee payroll data
- salary data
- active / inactive status
- payment creation
- payroll execution
- invoice/payment records

### Offchain
The backend handles:
- employee emails
- email delivery
- auxiliary communication data

This architecture keeps the most important payroll logic transparent and verifiable on Injective, while keeping communication features offchain.

---

## Design Goal

The backend was built to stay minimal and practical.

Its goal is not to become a large business server, but to support the product experience around the onchain payroll flow.

The design priorities are:

- simplicity
- reliability
- clear separation between onchain and offchain logic
- easy local testing for hackathon/demo purposes

---

## Future Improvements

Possible future upgrades for the backend include:

- event listeners for onchain payroll events
- automatic email sending triggered by blockchain events
- invoice delivery status storage
- audit logs
- employee profile storage
- admin authentication
- production deployment and monitoring

---

## Summary

The PayFlow backend is a lightweight support layer for the product. It stores employee email data and sends invoice emails, while the core payroll logic remains onchain. This makes the system both practical for a real product and aligned with the goal of keeping payroll settlement on Injective.