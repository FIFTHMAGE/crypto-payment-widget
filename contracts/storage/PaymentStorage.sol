// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IPaymentProcessor.sol";

/**
 * @title PaymentStorage
 * @notice Handles all storage for payment processing
 * @dev Separates storage concerns for upgradability and modularity
 */
abstract contract PaymentStorage {
    // Payment storage
    mapping(bytes32 => IPaymentProcessor.Payment) internal _payments;
    mapping(bytes32 => IPaymentProcessor.EscrowPayment) internal _escrowPayments;
    mapping(address => uint256) internal _totalReceived;
    mapping(address => uint256) internal _totalSent;
    bytes32[] internal _paymentIds;

    // Fee configuration
    uint256 internal _platformFee;
    uint256 internal constant FEE_DENOMINATOR = 10000;
    address internal _feeCollector;

    // Payment tracking
    uint256 internal _paymentNonce;
    uint256 internal _escrowNonce;

    /**
     * @dev Gap for future storage variables
     */
    uint256[50] private __gap;

    function _getPayment(bytes32 paymentId) internal view returns (IPaymentProcessor.Payment memory) {
        return _payments[paymentId];
    }

    function _getEscrow(bytes32 escrowId) internal view returns (IPaymentProcessor.EscrowPayment memory) {
        return _escrowPayments[escrowId];
    }

    function _getTotalReceived(address account) internal view returns (uint256) {
        return _totalReceived[account];
    }

    function _getTotalSent(address account) internal view returns (uint256) {
        return _totalSent[account];
    }

    function _getPaymentCount() internal view returns (uint256) {
        return _paymentIds.length;
    }

    function _getPlatformFee() internal view returns (uint256) {
        return _platformFee;
    }

    function _getFeeCollector() internal view returns (address) {
        return _feeCollector;
    }

    function _setPlatformFee(uint256 newFee) internal {
        _platformFee = newFee;
    }

    function _setFeeCollector(address newCollector) internal {
        _feeCollector = newCollector;
    }

    function _incrementTotalSent(address account, uint256 amount) internal {
        _totalSent[account] += amount;
    }

    function _incrementTotalReceived(address account, uint256 amount) internal {
        _totalReceived[account] += amount;
    }

    function _addPaymentId(bytes32 paymentId) internal {
        _paymentIds.push(paymentId);
    }
}

