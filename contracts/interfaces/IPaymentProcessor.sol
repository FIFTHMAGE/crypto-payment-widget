// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IPaymentProcessor
 * @author Crypto Payment Widget Team
 * @notice Interface for decentralized payment processing operations
 * @dev Defines the core payment processing functionality including direct payments,
 * escrow services, and split payments. All implementations must adhere to this interface
 * to ensure compatibility across different payment processor versions.
 * 
 * This interface supports:
 * - Direct ETH and ERC20 payments
 * - Time-locked escrow payments with release/refund mechanisms
 * - Multi-recipient split payments
 * - Comprehensive event logging for off-chain indexing
 * 
 * Security considerations:
 * - All monetary operations should implement reentrancy guards
 * - Address validation must be performed on all external addresses
 * - Amount validation should prevent zero-value transactions
 * - Proper access control for sensitive operations
 */
interface IPaymentProcessor {
    /**
     * @notice Payment status enumeration
     * @dev Tracks the lifecycle state of a payment
     */
    enum PaymentStatus {
        Pending,    // Payment initiated but not yet completed
        Completed,  // Payment successfully processed
        Refunded,   // Payment was refunded to payer
        Failed      // Payment failed during processing
    }

    /**
     * @notice Direct payment structure
     * @dev Contains all information about a direct payment transaction
     * @param payer Address that initiated and funded the payment
     * @param payee Address that receives the payment
     * @param amount Total payment amount (including fees)
     * @param token Token address (address(0) for native ETH)
     * @param timestamp Block timestamp when payment was created
     * @param status Current status of the payment
     * @param metadata Optional metadata string (order ID, invoice number, etc.)
     */
    struct Payment {
        address payer;
        address payee;
        uint256 amount;
        address token;
        uint256 timestamp;
        PaymentStatus status;
        string metadata;
    }

    /**
     * @notice Escrow payment structure
     * @dev Contains all information about an escrowed payment with time-lock
     * @param payer Address that initiated and funded the escrow
     * @param payee Address that will receive funds upon release
     * @param amount Total escrowed amount (fees deducted on release)
     * @param token Token address (address(0) for native ETH)
     * @param releaseTime Earliest timestamp when escrow can be released
     * @param released Whether escrow has been released to payee
     * @param refunded Whether escrow has been refunded to payer
     * @param metadata Optional metadata string
     */
    struct EscrowPayment {
        address payer;
        address payee;
        uint256 amount;
        address token;
        uint256 releaseTime;
        bool released;
        bool refunded;
        string metadata;
    }

    /**
     * @notice Emitted when a payment is successfully processed
     * @param paymentId Unique identifier for the payment
     * @param payer Address that sent the payment
     * @param payee Address that received the payment
     * @param amount Total payment amount
     * @param token Token address used (address(0) for ETH)
     * @param fee Platform fee deducted
     * @param timestamp Block timestamp of the payment
     */
    event PaymentProcessed(
        bytes32 indexed paymentId,
        address indexed payer,
        address indexed payee,
        uint256 amount,
        address token,
        uint256 fee,
        uint256 timestamp
    );

    /**
     * @notice Emitted when an escrow payment is created
     * @param escrowId Unique identifier for the escrow
     * @param payer Address that funded the escrow
     * @param payee Address that will receive funds upon release
     * @param amount Total escrowed amount
     * @param releaseTime Earliest time when escrow can be released
     * @param token Token address used (address(0) for ETH)
     */
    event EscrowCreated(
        bytes32 indexed escrowId,
        address indexed payer,
        address indexed payee,
        uint256 amount,
        uint256 releaseTime,
        address token
    );

    /**
     * @notice Emitted when an escrow payment is released to payee
     * @param escrowId Unique identifier for the escrow
     * @param payee Address receiving the funds
     * @param amount Net amount transferred (after fees)
     * @param fee Platform fee deducted
     */
    event EscrowReleased(
        bytes32 indexed escrowId,
        address indexed payee,
        uint256 amount,
        uint256 fee
    );

    /**
     * @notice Emitted when an escrow payment is refunded to payer
     * @param escrowId Unique identifier for the escrow
     * @param payer Address receiving the refund
     * @param amount Total amount refunded (no fees on refund)
     */
    event EscrowRefunded(
        bytes32 indexed escrowId,
        address indexed payer,
        uint256 amount
    );

    /**
     * @notice Emitted when platform fee is updated
     * @param oldFee Previous fee in basis points
     * @param newFee New fee in basis points
     */
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);

    /**
     * @notice Emitted when fee collector address is updated
     * @param oldCollector Previous fee collector address
     * @param newCollector New fee collector address
     */
    event FeeCollectorUpdated(address indexed oldCollector, address indexed newCollector);

    /**
     * @notice Process a direct payment to a single recipient
     * @dev Transfers tokens/ETH from sender to recipient with platform fee deduction
     * Emits PaymentProcessed event upon success
     * @param payee Recipient address (must not be zero address)
     * @param token Token contract address (use address(0) for native ETH)
     * @param amount Total payment amount including fees
     * @param metadata Optional metadata string for payment tracking
     * @return paymentId Unique identifier for this payment
     */
    function processPayment(
        address payee,
        address token,
        uint256 amount,
        string calldata metadata
    ) external payable returns (bytes32);

    /**
     * @notice Create a time-locked escrow payment
     * @dev Holds funds in contract until releaseTime or manual release by payer
     * Emits EscrowCreated event upon success
     * @param payee Recipient address who will receive funds upon release
     * @param token Token contract address (use address(0) for native ETH)
     * @param amount Total amount to escrow
     * @param releaseTime Unix timestamp when funds can be auto-released
     * @param metadata Optional metadata string for escrow tracking
     * @return escrowId Unique identifier for this escrow
     */
    function createEscrow(
        address payee,
        address token,
        uint256 amount,
        uint256 releaseTime,
        string calldata metadata
    ) external payable returns (bytes32);

    /**
     * @notice Release escrowed funds to the payee
     * @dev Can be called by payer anytime or by anyone after releaseTime
     * Platform fee is deducted upon release. Emits EscrowReleased event
     * @param escrowId Unique identifier of the escrow to release
     */
    function releaseEscrow(bytes32 escrowId) external;

    /**
     * @notice Refund escrowed funds back to the payer
     * @dev Can only be called by the original payer. No fees charged on refund
     * Emits EscrowRefunded event upon success
     * @param escrowId Unique identifier of the escrow to refund
     */
    function refundEscrow(bytes32 escrowId) external;

    /**
     * @notice Split a payment among multiple recipients
     * @dev Distributes specified amounts to multiple addresses in a single transaction
     * Platform fee is deducted from each recipient's amount. Emits PaymentProcessed event
     * @param recipients Array of recipient addresses (must all be non-zero)
     * @param amounts Array of amounts corresponding to each recipient
     * @param token Token contract address (use address(0) for native ETH)
     * @param metadata Optional metadata string for payment tracking
     * @return paymentId Unique identifier for this split payment
     */
    function splitPayment(
        address[] calldata recipients,
        uint256[] calldata amounts,
        address token,
        string calldata metadata
    ) external payable returns (bytes32);

    /**
     * @notice Retrieve details of a specific payment
     * @param paymentId Unique identifier of the payment
     * @return Payment struct containing all payment details
     */
    function getPayment(bytes32 paymentId) external view returns (Payment memory);

    /**
     * @notice Retrieve details of a specific escrow
     * @param escrowId Unique identifier of the escrow
     * @return EscrowPayment struct containing all escrow details
     */
    function getEscrow(bytes32 escrowId) external view returns (EscrowPayment memory);

    /**
     * @notice Get the total number of processed payments
     * @return Total count of payment transactions
     */
    function getPaymentCount() external view returns (uint256);
}

