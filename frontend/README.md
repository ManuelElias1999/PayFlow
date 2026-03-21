# PayFlow Frontend

## Overview

The PayFlow frontend is the user-facing application of the project. It provides the complete product experience for companies that want to manage employees and run payroll in **USDC on Injective**.

Through the frontend, a company can connect its wallet with MetaMask, register its company profile, approve USDC for payroll operations, add and manage employees, run payroll onchain, and view generated payment invoices.

This frontend is designed as an MVP, focused on a simple and clean user experience while demonstrating the core value of the product: **onchain payroll settlement on Injective**.

---

## What the Frontend Does

The frontend is responsible for:

- Connecting the company wallet through **MetaMask**
- Guiding the onboarding flow:
  - wallet connection
  - company registration
  - USDC approval
- Displaying the company dashboard
- Managing employees:
  - add employee
  - edit employee
  - activate / deactivate employee
- Running payroll directly through the payroll smart contract
- Displaying invoice details for each payment
- Showing pricing / business model information
- Calling the backend when needed to:
  - save employee emails
  - trigger invoice email delivery after payroll

---

## Main Pages

The frontend includes the following MVP pages:

- **Landing Page**
  - product introduction
  - wallet connection
  - pricing access

- **Onboarding**
  - company registration form

- **Approve**
  - USDC approval for payroll contract

- **Dashboard**
  - overview of company payroll activity

- **Employees**
  - employee management page

- **Payroll**
  - payroll execution and recent payment history

- **Invoice**
  - detailed invoice view for each payment

- **Pricing**
  - business model and subscription plans

---

## Tech Stack

The frontend is built with:

- **React**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **shadcn/ui**
- **Lucide Icons**
- **React Router**
- **ethers.js**

---

## Why These Technologies

### React
Used to build a modular and component-based UI for the payroll product.

### TypeScript
Used for better type safety, cleaner development, and more maintainable code.

### Vite
Used for a fast local development experience and lightweight frontend setup.

### Tailwind CSS
Used to build a modern, clean, and scalable UI quickly.

### shadcn/ui
Used for reusable UI primitives such as cards, dialogs, buttons, inputs, tables, and badges.

### React Router
Used for page navigation across the MVP flow.

### ethers.js
Used to connect the frontend with MetaMask and interact with the deployed smart contracts.

---

## Smart Contract Integration

The frontend connects directly to two deployed contracts:

- **USDC Mock Contract**
  - used for approving token spending in the MVP

- **PayFlowPayroll Contract**
  - used for:
    - company registration
    - employee registration
    - employee status updates
    - payroll execution
    - reading payment and invoice data

The frontend reads and writes onchain data using `ethers.js` and MetaMask.

---

## Backend Integration

Although the main payroll logic is onchain, the frontend also communicates with the backend for offchain features.

The frontend uses the backend to:

- save employee email addresses in Supabase
- retrieve employee email addresses
- trigger invoice email delivery after payroll execution

This separation allows the core payroll logic to remain onchain while keeping email delivery and auxiliary data offchain.

---

## Product Flow

The frontend follows this flow:

1. User opens PayFlow
2. User connects MetaMask
3. User is switched to Injective EVM Testnet
4. If the company is not registered, the user completes onboarding
5. If the company is registered but USDC is not approved, the user completes approval
6. Once ready, the user enters the dashboard
7. The company adds employees
8. The company runs payroll
9. Payments are created onchain
10. Invoices can be viewed in the frontend
11. Invoice emails are triggered through the backend

---

## Design Goal

The frontend is designed to feel like a real fintech SaaS product, while still being simple enough for a hackathon MVP.

The main design principles are:

- clarity
- trust
- simplicity
- modern dashboard UX
- professional Web3-fintech feel

---

## Future Improvements

Possible future upgrades for the frontend include:

- automatic payroll scheduling
- employee portal
- analytics and reporting
- better invoice explorer links
- transaction hash tracking
- multi-chain funding support
- production-ready notifications and activity logs

---

## Summary

The frontend is the main product layer of PayFlow. It combines a clean user experience with direct smart contract interaction, allowing companies to manage employees and execute payroll on Injective in a simple and transparent way.