// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title EmergencyWithdraw
 * @notice Emergency withdrawal mechanisms
 */
contract EmergencyWithdraw {
    address public owner;
    bool public emergencyMode;

    event EmergencyModeActivated();
    event EmergencyWithdrawal(address indexed token, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function activateEmergencyMode() external onlyOwner {
        emergencyMode = true;
        emit EmergencyModeActivated();
    }

    function emergencyWithdrawETH() external onlyOwner {
        require(emergencyMode, "Not in emergency mode");
        uint256 balance = address(this).balance;
        payable(owner).transfer(balance);
        emit EmergencyWithdrawal(address(0), balance);
    }

    function emergencyWithdrawToken(address token) external onlyOwner {
        require(emergencyMode, "Not in emergency mode");
        uint256 balance = IERC20(token).balanceOf(address(this));
        IERC20(token).transfer(owner, balance);
        emit EmergencyWithdrawal(token, balance);
    }
}

