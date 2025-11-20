// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IPaymentProcessor
 * @dev Interface for payment processing operations
 */
interface IPaymentProcessor {
    struct Payment {
        bytes32 id;
        address payer;
        address payee;
        uint256 amount;
        address token;
        uint256 timestamp;
        PaymentStatus status;
    }

    enum PaymentStatus {
        PENDING,
        PROCESSING,
        COMPLETED,
        FAILED,
        REFUNDED
    }

    /**
     * @dev Process a direct payment
     * @param payee Recipient address
     * @param amount Payment amount
     * @param token Token address (address(0) for ETH)
     * @return paymentId Unique payment identifier
     */
    function processPayment(
        address payee,
        uint256 amount,
        address token
    ) external payable returns (bytes32 paymentId);

    /**
     * @dev Process a payment with metadata
     * @param payee Recipient address
     * @param amount Payment amount
     * @param token Token address
     * @param metadata Payment metadata
     * @return paymentId Unique payment identifier
     */
    function processPaymentWithMetadata(
        address payee,
        uint256 amount,
        address token,
        bytes calldata metadata
    ) external payable returns (bytes32 paymentId);

    /**
     * @dev Get payment details
     * @param paymentId Payment identifier
     * @return payment Payment struct
     */
    function getPayment(bytes32 paymentId) external view returns (Payment memory payment);

    /**
     * @dev Get payment status
     * @param paymentId Payment identifier
     * @return status Payment status
     */
    function getPaymentStatus(bytes32 paymentId) external view returns (PaymentStatus status);

    /**
     * @dev Refund a payment
     * @param paymentId Payment identifier
     */
    function refundPayment(bytes32 paymentId) external;

    /**
     * @dev Get platform fee percentage
     * @return fee Fee in basis points (100 = 1%)
     */
    function getPlatformFee() external view returns (uint256 fee);

    /**
     * @dev Calculate fee amount
     * @param amount Payment amount
     * @return feeAmount Calculated fee
     */
    function calculateFee(uint256 amount) external view returns (uint256 feeAmount);

    // Events
    event PaymentProcessed(
        bytes32 indexed paymentId,
        address indexed payer,
        address indexed payee,
        uint256 amount,
        address token,
        uint256 fee
    );

    event PaymentRefunded(
        bytes32 indexed paymentId,
        address indexed payer,
        uint256 amount
    );

    event PaymentStatusUpdated(
        bytes32 indexed paymentId,
        PaymentStatus oldStatus,
        PaymentStatus newStatus
    );
}
