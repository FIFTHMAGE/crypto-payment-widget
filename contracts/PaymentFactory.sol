// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Escrow.sol";
import "./PaymentSplitter.sol";
import "./AccessControl.sol";

/**
 * @title PaymentFactory
 * @dev Factory for deploying payment contracts
 */
contract PaymentFactory is AccessControl {
    address public feeCollector;
    uint256 public platformFee;

    address[] public deployedEscrows;
    address[] public deployedSplitters;

    mapping(address => address[]) public userEscrows;
    mapping(address => address[]) public userSplitters;

    event EscrowDeployed(address indexed escrow, address indexed creator);
    event SplitterDeployed(address indexed splitter, address indexed creator);

    constructor(address _feeCollector, uint256 _platformFee) {
        feeCollector = _feeCollector;
        platformFee = _platformFee;
    }

    /**
     * @dev Deploy a new escrow contract
     */
    function deployEscrow() external returns (address) {
        Escrow escrow = new Escrow(feeCollector, platformFee);
        address escrowAddress = address(escrow);

        deployedEscrows.push(escrowAddress);
        userEscrows[msg.sender].push(escrowAddress);

        emit EscrowDeployed(escrowAddress, msg.sender);
        return escrowAddress;
    }

    /**
     * @dev Deploy a new payment splitter contract
     */
    function deploySplitter() external returns (address) {
        PaymentSplitter splitter = new PaymentSplitter(feeCollector, platformFee);
        address splitterAddress = address(splitter);

        deployedSplitters.push(splitterAddress);
        userSplitters[msg.sender].push(splitterAddress);

        emit SplitterDeployed(splitterAddress, msg.sender);
        return splitterAddress;
    }

    /**
     * @dev Get all deployed escrows
     */
    function getDeployedEscrows() external view returns (address[] memory) {
        return deployedEscrows;
    }

    /**
     * @dev Get all deployed splitters
     */
    function getDeployedSplitters() external view returns (address[] memory) {
        return deployedSplitters;
    }

    /**
     * @dev Get user's escrows
     */
    function getUserEscrows(address user) external view returns (address[] memory) {
        return userEscrows[user];
    }

    /**
     * @dev Get user's splitters
     */
    function getUserSplitters(address user) external view returns (address[] memory) {
        return userSplitters[user];
    }

    /**
     * @dev Update platform fee (admin only)
     */
    function updatePlatformFee(uint256 newFee) external onlyRole(ADMIN_ROLE) {
        require(newFee <= 500, "Fee too high");
        platformFee = newFee;
    }

    /**
     * @dev Update fee collector (admin only)
     */
    function updateFeeCollector(address newCollector) external onlyRole(ADMIN_ROLE) {
        require(newCollector != address(0), "Invalid address");
        feeCollector = newCollector;
    }
}

