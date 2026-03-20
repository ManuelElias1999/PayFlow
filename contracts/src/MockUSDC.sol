// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// This contract has been deployed and can be verified at:
// https://testnet.blockscout.injective.network/address/0x380a3Af810aEC334c5CcDFa7Faa9c42Ba9559B8e

// MockUSDC contract is a mock version of the USDC token for testing purposes.
// It inherits from ERC20 for the token standard and Ownable for access control.
contract MockUSDC is ERC20, Ownable {
    // Constructor initializes the ERC20 token with name and symbol, and sets the deployer as owner.
    constructor() ERC20("Mock USD Coin", "mUSDC") Ownable(msg.sender) {}

    // Override the decimals function to return 6 decimals, matching real USDC.
    function decimals() public pure override returns (uint8) {
        return 6;
    }

    // Mint function lets the owner mint tokens to a specified address.
    // Only the contract owner can call this function.
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}