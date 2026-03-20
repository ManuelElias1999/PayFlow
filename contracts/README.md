# PayFlowPayroll.sol

## Overview

**PayFlowPayroll** is a smart contract designed to streamline automated payroll management for companies using the ERC20-compatible USDC token on EVM-compatible blockchains. The contract is deployed and verified on the Injective Testnet, and you can explore the deployed contract here:

🔗 [Injective Testnet Contract Explorer](https://testnet.blockscout.injective.network/address/0x9D2d828559B4Ba8Af37dcA28593FB9E14E1FE4A4)

## Technology Stack

- **Solidity 0.8.20**: The smart contract is written in Solidity.
- **ERC20 & OpenZeppelin**: Utilizes industry-standard OpenZeppelin contracts for token interactions and security.
- **MockUSDC**: For local and test purposes, a MockUSDC contract is available (with 6 decimals, like real USDC).
- **Foundry**: Testing and scripting is powered by Foundry.
- **Deployable on EVM-Compatible Chains**: Initially deployed on Injective Testnet.

## Features

- **Company Registration**: Companies can register with basic information (name, country, default chain).
- **Employee Management**: Employers can add/remove or deactivate employees; each employee can have individual salary settings.
- **Automated Payroll**: Companies can execute payroll for all active employees in a single function call, sending out batch token transfers.
- **History & Event Tracking**: All transactions are timestamped, and data is queryable for payment history, employees, and companies.
- **Access Controls**: Employer-only execution for sensitive functions; leverages OpenZeppelin’s security patterns.
- **Payroll Auditability**: Supports structured off-chain accounting and integration with company back-office systems.
- **USDC Payments**: All payroll is denominated and paid in USDC for maximum stability.
- **Test Coverage**: The contract is fully tested with Foundry and integrates with MockUSDC.

## How It Works

1. **Register a Company**: Any address can register as a new company.
2. **Add Employees**: Registered companies can add employees specifying names, roles, wallet addresses, and fixed salaries.
3. **Run Payroll**: Once funded with USDC and after approving the smart contract, employers call `runPayroll()` to instantaneously distribute salaries to all active employees.
4. **Deactivate/Remove Employees**: Companies can deactivate or remove employees if needed.
5. **View Payment History**: Both employers and employees can inspect payroll history and details via public mappings and events.

## Key Functions

- `registerCompany(string name, string country, string defaultFundingChain)`
- `addEmployee(string name, string role, address employee, uint256 salary)`
- `setEmployeeStatus(uint256 employeeId, bool active)`
- `runPayroll(uint256 period)`
- `getCompanyEmployees(address employer)` 
- `getPayment(uint256 paymentId)`

## Security & Testing

- Uses [OpenZeppelin’s ERC20 and Ownable](https://docs.openzeppelin.com/contracts/4.x/) for reliable token interaction and access control.
- All sensitive actions require appropriate permissions (e.g., only the registered company can manage its team and payroll).
- Fully tested with Foundry; see the `test/` directory for test coverage and usage.

## Deployment & Usage

- **Deployed on Injective Testnet**:  
  `0x9D2d828559B4Ba8Af37dcA28593FB9E14E1FE4A4`
- To interact, use cast/foundry scripts or any EVM-compatible dapp wallet, making sure to switch to Injective Testnet.

## Resources

- [MockUSDC.sol](./src/MockUSDC.sol) (for local testing)
- [PayFlowPayroll.sol](./src/PayFlowPayroll.sol)
- [Test Scripts](./test/)
- [Injective Testnet Faucet](https://faucet.injective.network/) (for test ETH/INJ)

---

*For questions or support, please open an issue or contact the project maintainers.*
