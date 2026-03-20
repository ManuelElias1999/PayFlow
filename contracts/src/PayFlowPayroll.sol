// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


// This contract has been deployed and can be verified at:
// https://testnet.blockscout.injective.network/address/0x9D2d828559B4Ba8Af37dcA28593FB9E14E1FE4A4


// Main contract for payroll management using USDC
contract PayFlowPayroll {
    // Address of the USDC token contract (ERC20)
    IERC20 public immutable usdc;
    // Global payment counter
    uint256 public paymentCount;

    // Structure representing a company
    struct Company {
        string name;                  // Company name
        string country;               // Company country
        string defaultFundingChain;   // Default funding chain name
        bool isRegistered;            // Whether the company is registered
    }

    // Structure representing an employee
    struct Employee {
        uint256 id;           // Employee ID
        string name;          // Employee name
        string role;          // Employee job title/role
        address wallet;       // Employee wallet address
        uint256 salary;       // Employee salary (in USDC)
        bool active;          // Employee status: active or not
    }

    // Structure representing a payroll payment for a single employee
    struct Payment {
        uint256 id;              // Payment ID
        address employer;        // Employer address
        uint256 employeeId;      // Employee ID
        address employeeWallet;  // Employee wallet address
        uint256 amount;          // Payment amount
        uint256 timestamp;       // Blockchain timestamp when paid
        uint256 period;          // Payroll period (for grouping)
    }

    // Mappings for working with company and employee data
    mapping(address => Company) public companies;                       // Employer address => Company details
    mapping(address => uint256) public employeeCount;                   // Employer => number of employees
    mapping(address => mapping(uint256 => Employee)) public employees;  // Employer => employee ID => Employee
    mapping(address => uint256[]) private companyEmployeeIds;           // Employer => list of employee IDs
    mapping(uint256 => Payment) public payments;                        // Payment ID => Payment details

    // Events for tracking contract activity
    event CompanyRegistered(
        address indexed employer,
        string name,
        string country,
        string defaultFundingChain
    );

    event EmployeeAdded(
        address indexed employer,
        uint256 indexed employeeId,
        address employeeWallet,
        uint256 salary
    );

    event EmployeeUpdated(
        address indexed employer,
        uint256 indexed employeeId,
        address employeeWallet,
        uint256 salary
    );

    event EmployeeStatusChanged(
        address indexed employer,
        uint256 indexed employeeId,
        bool active
    );

    event PaymentCreated(
        uint256 indexed paymentId,
        address indexed employer,
        uint256 indexed employeeId,
        address employeeWallet,
        uint256 amount,
        uint256 period
    );

    event PayrollExecuted(
        address indexed employer,
        uint256 period,
        uint256 employeeCountPaid,
        uint256 totalAmount
    );

    // Modifier to restrict function access to registered companies only
    modifier onlyRegisteredCompany() {
        require(companies[msg.sender].isRegistered, "Company not registered");
        _;
    }

    // Constructor to set the USDC token contract address
    constructor(address _usdc) {
        require(_usdc != address(0), "Invalid USDC address");
        usdc = IERC20(_usdc);
    }

    // Function for company registration; only non-registered addresses may call
    function registerCompany(
        string calldata name,
        string calldata country,
        string calldata defaultFundingChain
    ) external {
        require(!companies[msg.sender].isRegistered, "Company already registered");
        require(bytes(name).length > 0, "Name required");
        require(bytes(country).length > 0, "Country required");
        require(bytes(defaultFundingChain).length > 0, "Funding chain required");

        companies[msg.sender] = Company({
            name: name,
            country: country,
            defaultFundingChain: defaultFundingChain,
            isRegistered: true
        });

        emit CompanyRegistered(msg.sender, name, country, defaultFundingChain);
    }

    // Function to add an employee to the sender's (company's) records
    function addEmployee(
        string calldata name,
        string calldata role,
        address wallet,
        uint256 salary
    ) external onlyRegisteredCompany {
        require(bytes(name).length > 0, "Name required");
        require(bytes(role).length > 0, "Role required");
        require(wallet != address(0), "Invalid wallet");
        require(salary > 0, "Salary must be > 0");

        uint256 newEmployeeId = employeeCount[msg.sender] + 1;
        employeeCount[msg.sender] = newEmployeeId;

        employees[msg.sender][newEmployeeId] = Employee({
            id: newEmployeeId,
            name: name,
            role: role,
            wallet: wallet,
            salary: salary,
            active: true
        });

        companyEmployeeIds[msg.sender].push(newEmployeeId);

        emit EmployeeAdded(msg.sender, newEmployeeId, wallet, salary);
    }

    // Function to update information about an existing employee
    function updateEmployee(
        uint256 employeeId,
        string calldata name,
        string calldata role,
        address wallet,
        uint256 salary
    ) external onlyRegisteredCompany {
        require(employeeId > 0 && employeeId <= employeeCount[msg.sender], "Employee does not exist");
        require(bytes(name).length > 0, "Name required");
        require(bytes(role).length > 0, "Role required");
        require(wallet != address(0), "Invalid wallet");
        require(salary > 0, "Salary must be > 0");

        Employee storage employee = employees[msg.sender][employeeId];

        employee.name = name;
        employee.role = role;
        employee.wallet = wallet;
        employee.salary = salary;

        emit EmployeeUpdated(msg.sender, employeeId, wallet, salary);
    }

    // Set active or inactive status for an employee (does not delete employee)
    function setEmployeeStatus(
        uint256 employeeId,
        bool active
    ) external onlyRegisteredCompany {
        require(employeeId > 0 && employeeId <= employeeCount[msg.sender], "Employee does not exist");

        employees[msg.sender][employeeId].active = active;

        emit EmployeeStatusChanged(msg.sender, employeeId, active);
    }

    // Main function to run payroll for all active employees for a given period
    function runPayroll(uint256 period) external onlyRegisteredCompany {
        require(period > 0, "Invalid period");

        uint256[] memory ids = companyEmployeeIds[msg.sender];
        uint256 employeesPaid = 0;
        uint256 totalAmount = 0;

        for (uint256 i = 0; i < ids.length; i++) {
            Employee storage employee = employees[msg.sender][ids[i]];

            // Only pay active employees
            if (employee.active) {
                // Transfer salary from employer to employee in USDC
                bool success = usdc.transferFrom(
                    msg.sender,
                    employee.wallet,
                    employee.salary
                );
                require(success, "USDC transfer failed");

                paymentCount++;

                // Record the payment
                payments[paymentCount] = Payment({
                    id: paymentCount,
                    employer: msg.sender,
                    employeeId: employee.id,
                    employeeWallet: employee.wallet,
                    amount: employee.salary,
                    timestamp: block.timestamp,
                    period: period
                });

                emit PaymentCreated(
                    paymentCount,
                    msg.sender,
                    employee.id,
                    employee.wallet,
                    employee.salary,
                    period
                );

                employeesPaid++;
                totalAmount += employee.salary;
            }
        }

        emit PayrollExecuted(msg.sender, period, employeesPaid, totalAmount);
    }

    // View function to get all employee IDs for a specific company
    function getEmployeeIdsByCompany(
        address employer
    ) external view returns (uint256[] memory) {
        return companyEmployeeIds[employer];
    }

    // View function to get details of a single employee by employer and employee ID
    function getEmployee(
        address employer,
        uint256 employeeId
    ) external view returns (Employee memory) {
        require(employeeId > 0 && employeeId <= employeeCount[employer], "Employee does not exist");
        return employees[employer][employeeId];
    }

    // View function to get details of a single payment by payment ID
    function getPayment(
        uint256 paymentId
    ) external view returns (Payment memory) {
        require(paymentId > 0 && paymentId <= paymentCount, "Payment does not exist");
        return payments[paymentId];
    }
}