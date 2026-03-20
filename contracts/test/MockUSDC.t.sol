// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {MockUSDC} from "../src/MockUSDC.sol";

contract MockUSDCTest is Test {
    MockUSDC public mockUSDC;
    address public owner;
    address public user1 = address(0x1111);
    address public user2 = address(0x2222);

    function setUp() public {
        // Set the admin as the test contract itself
        owner = address(this);
        mockUSDC = new MockUSDC();
    }

    function test_Decimals_Is6() public {
        assertEq(mockUSDC.decimals(), 6, "USDC decimals should be 6");
    }

    function test_OwnerCanMint() public {
        uint256 amount = 1_000_000; // 1 USDC (since 6 decimals)
        mockUSDC.mint(user1, amount);
        assertEq(mockUSDC.balanceOf(user1), amount, "Minted balance incorrect");
    }

    function test_NonOwnerCannotMint() public {
        uint256 amount = 1_000_000;
        vm.prank(user1);
        vm.expectRevert("Ownable: caller is not the owner");
        mockUSDC.mint(user1, amount);
    }

    function test_Transfers() public {
        uint256 amount = 500_000;
        mockUSDC.mint(owner, amount);
        mockUSDC.transfer(user2, amount);
        assertEq(mockUSDC.balanceOf(user2), amount, "Transfer failed");
        assertEq(mockUSDC.balanceOf(owner), 0, "Sender balance should be zero after transfer");
    }

    function test_ApproveAndTransferFrom() public {
        uint256 amount = 250_000;
        mockUSDC.mint(owner, amount);
        mockUSDC.approve(user1, amount);

        // Simulate user1 calling transferFrom
        vm.prank(user1);
        mockUSDC.transferFrom(owner, user2, amount);

        assertEq(mockUSDC.balanceOf(user2), amount, "TransferFrom failed");
        assertEq(mockUSDC.allowance(owner, user1), 0, "Allowance not reset");
    }
}
