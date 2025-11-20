// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SecurityErrors
 * @notice Custom errors for gas-efficient error handling
 * @dev Using custom errors instead of require strings saves gas
 */
library SecurityErrors {
    // Access Control Errors
    error Unauthorized(address caller, bytes32 role);
    error InvalidRole(bytes32 role);
    error RoleAlreadyGranted(address account, bytes32 role);
    error RoleNotGranted(address account, bytes32 role);
    
    // Amount and Value Errors
    error InvalidAmount(uint256 provided);
    error AmountTooLow(uint256 provided, uint256 minimum);
    error AmountTooHigh(uint256 provided, uint256 maximum);
    error InsufficientBalance(uint256 requested, uint256 available);
    error InsufficientAllowance(uint256 requested, uint256 allowed);
    
    // Address Validation Errors
    error ZeroAddress();
    error InvalidAddress(address addr);
    error ContractAddress(address addr);
    error SameAddress(address addr);
    
    // State Errors
    error InvalidState(uint8 current, uint8 required);
    error AlreadyInitialized();
    error NotInitialized();
    error AlreadyExecuted();
    error AlreadyCancelled();
    
    // Time-based Errors
    error DeadlineExpired(uint256 deadline, uint256 current);
    error TooEarly(uint256 current, uint256 required);
    error TooLate(uint256 current, uint256 deadline);
    error InvalidTimeRange(uint256 start, uint256 end);
    
    // Payment Errors
    error PaymentFailed(address recipient, uint256 amount);
    error RefundFailed(address recipient, uint256 amount);
    error WithdrawalFailed(address recipient, uint256 amount);
    error TransferFailed(address from, address to, uint256 amount);
    
    // Token Errors
    error TokenNotSupported(address token);
    error TokenNotWhitelisted(address token);
    error TokenTransferFailed(address token, address from, address to, uint256 amount);
    
    // Rate Limiting Errors
    error RateLimitExceeded(address account, uint256 limit);
    error DailyLimitExceeded(uint256 amount, uint256 limit);
    error TransactionLimitExceeded(uint256 amount, uint256 limit);
    
    // Signature Errors
    error InvalidSignature();
    error SignatureExpired(uint256 deadline);
    error SignatureAlreadyUsed(bytes32 hash);
    error InvalidSigner(address expected, address actual);
    
    // Array Errors
    error ArrayLengthMismatch(uint256 length1, uint256 length2);
    error ArrayTooLong(uint256 length, uint256 maximum);
    error ArrayEmpty();
    error IndexOutOfBounds(uint256 index, uint256 length);
    
    // Circuit Breaker Errors
    error CircuitBreakerActive();
    error EmergencyPause();
    error SystemHalted();
    
    // Overflow Protection (explicit checks for critical operations)
    error ArithmeticOverflow(uint256 a, uint256 b);
    error ArithmeticUnderflow(uint256 a, uint256 b);
    error DivisionByZero();
    
    // Fee Errors
    error FeeTooHigh(uint256 fee, uint256 maximum);
    error InsufficientFeePayment(uint256 paid, uint256 required);
}

