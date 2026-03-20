// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {PayFlowPayroll} from "../src/PayFlowPayroll.sol";
import {MockUSDC} from "../src/MockUSDC.sol";

contract PayFlowPayrollScript is Script {
    PayFlowPayroll public payroll;
    MockUSDC public mockUSDC;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        // Deploy mock USDC
        mockUSDC = new MockUSDC();

        // Deploy PayFlowPayroll contract with mockUSDC address
        payroll = new PayFlowPayroll(address(mockUSDC));

        vm.stopBroadcast();
    }
}