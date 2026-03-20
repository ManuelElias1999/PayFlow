// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {PayFlowPayroll} from "../src/PayFlowPayroll.sol";
import {MockUSDC} from "../src/MockUSDC.sol";

contract PayFlowPayrollTest is Test {
    PayFlowPayroll public payroll;
    MockUSDC public mockUSDC;

    address public company = address(0xABC);
    address public employee1 = address(0x1234);
    address public employee2 = address(0x5678);

    function setUp() public {
        // Deploy mock USDC
        mockUSDC = new MockUSDC();
        // Deploy payroll with mockUSDC address
        payroll = new PayFlowPayroll(address(mockUSDC));

        // Mint initial USDC for company
        mockUSDC.mint(company, 10_000_000 * 10 ** 6); // 10 million USDC to company

        // Register company
        vm.prank(company);
        payroll.registerCompany("Acme", "USA", "Ethereum");

        // Give payroll approval to transfer on behalf of company
        vm.prank(company);
        mockUSDC.approve(address(payroll), type(uint256).max);
    }

    function test_CompanyRegistration() public {
        address anotherCompany = address(0xBEEF);
        vm.prank(anotherCompany);
        payroll.registerCompany("MegaCorp", "UK", "Polygon");

        (string memory name,, string memory chain, bool registered) = payroll.companies(anotherCompany);
        assertEq(name, "MegaCorp");
        assertEq(chain, "Polygon");
        assertTrue(registered);
    }

    function test_AddAndGetEmployee() public {
        vm.prank(company);
        payroll.addEmployee("Alice", "Engineer", employee1, 1000 * 10 ** 6);

        uint256[] memory ids = payroll.getEmployeeIdsByCompany(company);
        assertEq(ids.length, 1);

        (uint256 id, string memory name, string memory role, address wallet, uint256 salary, bool active) =
            payroll.getEmployee(company, ids[0]);
        assertEq(name, "Alice");
        assertEq(role, "Engineer");
        assertEq(wallet, employee1);
        assertEq(salary, 1000 * 10 ** 6);
        assertTrue(active);
    }

    function test_UpdateEmployee() public {
        vm.prank(company);
        payroll.addEmployee("Bob", "Analyst", employee1, 300 * 10 ** 6);

        uint256 eid = payroll.employeeCount(company);

        vm.prank(company);
        payroll.updateEmployee(eid, "Bob Jr", "Senior Analyst", employee1, 500 * 10 ** 6);

        (, string memory updatedName, string memory updatedRole,, uint256 updatedSalary,) =
            payroll.getEmployee(company, eid);

        assertEq(updatedName, "Bob Jr");
        assertEq(updatedRole, "Senior Analyst");
        assertEq(updatedSalary, 500 * 10 ** 6);
    }

    function test_SetEmployeeStatus() public {
        vm.prank(company);
        payroll.addEmployee("Charlie", "Sales", employee2, 700 * 10 ** 6);
        uint256 eid = payroll.employeeCount(company);

        vm.prank(company);
        payroll.setEmployeeStatus(eid, false);

        (, , , , , bool active) = payroll.getEmployee(company, eid);
        assertFalse(active);
    }

    function test_RunPayroll_SingleEmployee() public {
        vm.prank(company);
        payroll.addEmployee("Dana", "Designer", employee1, 900 * 10 ** 6);

        // Check balances before
        uint256 beforeCompany = mockUSDC.balanceOf(company);
        uint256 beforeEmployee = mockUSDC.balanceOf(employee1);

        vm.prank(company);
        payroll.runPayroll(1);

        // Check balances after
        uint256 afterCompany = mockUSDC.balanceOf(company);
        uint256 afterEmployee = mockUSDC.balanceOf(employee1);
        assertEq(afterCompany, beforeCompany - 900 * 10 ** 6);
        assertEq(afterEmployee, beforeEmployee + 900 * 10 ** 6);

        // Check Payment struct
        uint256 lastPmtId = payroll.paymentCount();
        (
            uint256 id,
            address employer,
            uint256 eid,
            address empWallet,
            uint256 amount,
            uint256 ts,
            uint256 period
        ) = payroll.getPayment(lastPmtId);

        assertEq(id, lastPmtId);
        assertEq(employer, company);
        assertEq(empWallet, employee1);
        assertEq(amount, 900 * 10 ** 6);
        assertEq(period, 1);
        assertGt(ts, 0);
    }

    function test_RunPayroll_MultipleEmployees_And_Inactive() public {
        vm.prank(company);
        payroll.addEmployee("Eve", "Dev", employee1, 100 * 10 ** 6);
        vm.prank(company);
        payroll.addEmployee("Frank", "Ops", employee2, 200 * 10 ** 6);

        // Deactivate Frank
        vm.prank(company);
        payroll.setEmployeeStatus(2, false);

        // Run payroll
        uint256 balEmp1Before = mockUSDC.balanceOf(employee1);
        uint256 balEmp2Before = mockUSDC.balanceOf(employee2);

        vm.prank(company);
        payroll.runPayroll(2);

        assertEq(mockUSDC.balanceOf(employee1), balEmp1Before + 100 * 10 ** 6);
        assertEq(mockUSDC.balanceOf(employee2), balEmp2Before); // No change, inactive
    }

    function testCannot_RunPayroll_WithoutApproval() public {
        address badCompany = address(0xcafebabE);

        // Register bad company
        vm.prank(badCompany);
        payroll.registerCompany("NoApprove", "FR", "Avalanche");

        vm.prank(badCompany);
        payroll.addEmployee("Jim", "Intern", employee1, 50 * 10 ** 6);

        // Mint to bad company
        mockUSDC.mint(badCompany, 100 * 10 ** 6);

        // No approve
        vm.prank(badCompany);
        vm.expectRevert();
        payroll.runPayroll(99);
    }

    function testCannot_AddEmployee_NonRegistered() public {
        address unreg = address(0xDEAD);
        vm.prank(unreg);
        vm.expectRevert("Company not registered");
        payroll.addEmployee("X", "Y", employee1, 1 * 10 ** 6);
    }
}