// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PaymentEvents
 * @dev Centralized event definitions for payment operations
 */
contract PaymentEvents {
    // Direct payment events
    event PaymentReceived(
        bytes32 indexed paymentId,
        address indexed payer,
        address indexed recipient,
        uint256 amount,
        address token,
        uint256 timestamp
    );

    event PaymentProcessed(
        bytes32 indexed paymentId,
        address indexed payer,
        address indexed recipient,
        uint256 amount,
        uint256 fee,
        uint256 timestamp
    );

    // Escrow events
    event EscrowCreated(
        bytes32 indexed escrowId,
        address indexed payer,
        address indexed payee,
        uint256 amount,
        address token,
        uint256 releaseTime
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

    event DisputeOpened(
        bytes32 indexed escrowId,
        address indexed opener,
        string reason,
        uint256 timestamp
    );

    event DisputeResolved(
        bytes32 indexed escrowId,
        address indexed resolver,
        bool payerWon,
        uint256 timestamp
    );

    // Split payment events
    event SplitPaymentCreated(
        bytes32 indexed splitId,
        address indexed payer,
        uint256 totalAmount,
        uint256 recipientCount,
        uint256 timestamp
    );

    event SharesUpdated(
        bytes32 indexed splitId,
        address indexed recipient,
        uint256 shares,
        uint256 timestamp
    );

    event PaymentSplit(
        bytes32 indexed splitId,
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );

    // Subscription events
    event SubscriptionCreated(
        bytes32 indexed subscriptionId,
        address indexed subscriber,
        address indexed merchant,
        uint256 amount,
        uint256 interval,
        uint256 timestamp
    );

    event SubscriptionCharged(
        bytes32 indexed subscriptionId,
        address indexed subscriber,
        uint256 amount,
        uint256 chargeNumber,
        uint256 timestamp
    );

    event SubscriptionCancelled(
        bytes32 indexed subscriptionId,
        address indexed subscriber,
        uint256 timestamp
    );

    event SubscriptionPaused(
        bytes32 indexed subscriptionId,
        address indexed subscriber,
        uint256 timestamp
    );

    event SubscriptionResumed(
        bytes32 indexed subscriptionId,
        address indexed subscriber,
        uint256 timestamp
    );

    // Streaming payment events
    event StreamCreated(
        bytes32 indexed streamId,
        address indexed sender,
        address indexed recipient,
        uint256 totalAmount,
        uint256 startTime,
        uint256 endTime
    );

    event StreamClaimed(
        bytes32 indexed streamId,
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );

    event StreamCancelled(
        bytes32 indexed streamId,
        address indexed canceller,
        uint256 refundAmount,
        uint256 timestamp
    );

    // Milestone payment events
    event MilestoneProjectCreated(
        bytes32 indexed projectId,
        address indexed client,
        address indexed contractor,
        uint256 totalAmount,
        uint256 milestoneCount,
        uint256 timestamp
    );

    event MilestoneCompleted(
        bytes32 indexed projectId,
        uint256 indexed milestoneIndex,
        address indexed contractor,
        uint256 timestamp
    );

    event MilestoneApproved(
        bytes32 indexed projectId,
        uint256 indexed milestoneIndex,
        address indexed approver,
        uint256 amount,
        uint256 timestamp
    );

    event MilestoneRejected(
        bytes32 indexed projectId,
        uint256 indexed milestoneIndex,
        address indexed rejector,
        string reason,
        uint256 timestamp
    );

    event MilestoneFundsReleased(
        bytes32 indexed projectId,
        uint256 indexed milestoneIndex,
        address indexed contractor,
        uint256 amount,
        uint256 timestamp
    );

    // Administrative events
    event PlatformFeeUpdated(
        uint256 oldFee,
        uint256 newFee,
        uint256 timestamp
    );

    event TreasuryUpdated(
        address indexed oldTreasury,
        address indexed newTreasury,
        uint256 timestamp
    );

    event EmergencyWithdrawal(
        address indexed token,
        address indexed to,
        uint256 amount,
        uint256 timestamp
    );

    event ContractPaused(
        address indexed pauser,
        uint256 timestamp
    );

    event ContractUnpaused(
        address indexed unpauser,
        uint256 timestamp
    );

    // Batch operation events
    event BatchPaymentExecuted(
        bytes32 indexed batchId,
        address indexed sender,
        uint256 recipientCount,
        uint256 totalAmount,
        uint256 timestamp
    );

    event BatchTransferCompleted(
        bytes32 indexed batchId,
        uint256 successCount,
        uint256 failureCount,
        uint256 timestamp
    );
}

