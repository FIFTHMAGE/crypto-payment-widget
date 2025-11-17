// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IPaymentProcessor
 * @notice Interface for payment processing operations
 * @dev Defines the core payment processing functionality
 */
interface IPaymentProcessor {
    enum PaymentStatus {
        Pending,
        Completed,
        Refunded,
        Failed
    }

    struct Payment {
        address payer;
        address payee;
        uint256 amount;
        address token;
        uint256 timestamp;
        PaymentStatus status;
        string metadata;
    }

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

    event PaymentProcessed(
        bytes32 indexed paymentId,
        address indexed payer,
        address indexed payee,
        uint256 amount,
        address token,
        uint256 fee,
        uint256 timestamp
    );

    event EscrowCreated(
        bytes32 indexed escrowId,
        address indexed payer,
        address indexed payee,
        uint256 amount,
        uint256 releaseTime,
        address token
    );

    event EscrowReleased(
        bytes32 indexed escrowId,
        address indexed payee,
        uint256 amount,
        uint256 fee
    );

    event EscrowRefunded(
        bytes32 indexed escrowId,
        address indexed payer,
        uint256 amount
    );

    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeCollectorUpdated(address indexed oldCollector, address indexed newCollector);

    function processPayment(
        address payee,
        address token,
        uint256 amount,
        string calldata metadata
    ) external payable returns (bytes32);

    function createEscrow(
        address payee,
        address token,
        uint256 amount,
        uint256 releaseTime,
        string calldata metadata
    ) external payable returns (bytes32);

    function releaseEscrow(bytes32 escrowId) external;

    function refundEscrow(bytes32 escrowId) external;

    function splitPayment(
        address[] calldata recipients,
        uint256[] calldata amounts,
        address token,
        string calldata metadata
    ) external payable returns (bytes32);

    function getPayment(bytes32 paymentId) external view returns (Payment memory);

    function getEscrow(bytes32 escrowId) external view returns (EscrowPayment memory);

    function getPaymentCount() external view returns (uint256);
}

