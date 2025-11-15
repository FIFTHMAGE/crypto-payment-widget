// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Events
 * @dev Centralized event definitions for payment system
 */
library Events {
    // Payment events
    event PaymentProcessed(
        bytes32 indexed paymentId,
        address indexed payer,
        address indexed payee,
        uint256 amount,
        address token,
        uint256 timestamp
    );

    event PaymentRefunded(
        bytes32 indexed paymentId,
        address indexed payer,
        uint256 amount,
        uint256 timestamp
    );

    event PaymentFailed(
        bytes32 indexed paymentId,
        address indexed payer,
        string reason,
        uint256 timestamp
    );

    // Escrow events
    event EscrowCreated(
        bytes32 indexed escrowId,
        address indexed payer,
        address indexed payee,
        uint256 amount,
        uint256 releaseTime,
        uint256 timestamp
    );

    event EscrowReleased(
        bytes32 indexed escrowId,
        address indexed payee,
        uint256 amount,
        uint256 timestamp
    );

    event EscrowRefunded(
        bytes32 indexed escrowId,
        address indexed payer,
        uint256 amount,
        uint256 timestamp
    );

    event EscrowDisputed(
        bytes32 indexed escrowId,
        address indexed disputer,
        string reason,
        uint256 timestamp
    );

    // Split payment events
    event SplitCreated(
        bytes32 indexed splitId,
        address indexed creator,
        uint256 recipientCount,
        uint256 timestamp
    );

    event SplitExecuted(
        bytes32 indexed splitId,
        address indexed payer,
        uint256 totalAmount,
        uint256 timestamp
    );

    // Fee events
    event FeeCollected(
        bytes32 indexed paymentId,
        address indexed feeCollector,
        uint256 amount,
        uint256 timestamp
    );

    event FeeUpdated(
        uint256 oldFee,
        uint256 newFee,
        uint256 timestamp
    );

    // Admin events
    event ConfigUpdated(
        string indexed configKey,
        string configValue,
        uint256 timestamp
    );

    event EmergencyWithdrawal(
        address indexed token,
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );
}

