// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./base/BasePayment.sol";
import "./interfaces/IPaymentProcessor.sol";

/**
 * @title PaymentProcessorV2
 * @notice Modular payment processor with enhanced features
 * @dev Refactored to use base contracts for better maintainability
 */
contract PaymentProcessorV2 is BasePayment, IPaymentProcessor {
    constructor(address feeCollector_) BasePayment(feeCollector_) {}

    /**
     * @notice Process a direct payment (ETH or ERC20)
     * @param payee The recipient address
     * @param token The token address (address(0) for ETH)
     * @param amount The payment amount
     * @param metadata Optional payment metadata
     * @return paymentId The unique payment identifier
     */
    function processPayment(
        address payee,
        address token,
        uint256 amount,
        string calldata metadata
    )
        external
        payable
        override
        nonReentrant
        validAddress(payee)
        validAmount(amount)
        returns (bytes32)
    {
        bytes32 paymentId = _generatePaymentId(msg.sender, payee, amount, _paymentNonce++);

        (uint256 netAmount, uint256 fee) = _processPaymentWithFee(token, msg.sender, payee, amount);

        _payments[paymentId] = Payment({
            payer: msg.sender,
            payee: payee,
            amount: amount,
            token: token,
            timestamp: block.timestamp,
            status: PaymentStatus.Completed,
            metadata: metadata
        });

        _addPaymentId(paymentId);
        _incrementTotalSent(msg.sender, amount);
        _incrementTotalReceived(payee, amount);

        emit PaymentProcessed(paymentId, msg.sender, payee, amount, token, fee, block.timestamp);
        return paymentId;
    }

    /**
     * @notice Create an escrow payment
     * @param payee The recipient address
     * @param token The token address (address(0) for ETH)
     * @param amount The escrow amount
     * @param releaseTime The time when escrow can be released
     * @param metadata Optional escrow metadata
     * @return escrowId The unique escrow identifier
     */
    function createEscrow(
        address payee,
        address token,
        uint256 amount,
        uint256 releaseTime,
        string calldata metadata
    )
        external
        payable
        override
        nonReentrant
        validAddress(payee)
        validAmount(amount)
        futureReleaseTime(releaseTime)
        returns (bytes32)
    {
        bytes32 escrowId = _generateEscrowId(msg.sender, payee, amount, _escrowNonce++);

        _receivePayment(token, msg.sender, amount);

        _escrowPayments[escrowId] = EscrowPayment({
            payer: msg.sender,
            payee: payee,
            amount: amount,
            token: token,
            releaseTime: releaseTime,
            released: false,
            refunded: false,
            metadata: metadata
        });

        emit EscrowCreated(escrowId, msg.sender, payee, amount, releaseTime, token);
        return escrowId;
    }

    /**
     * @notice Release escrow payment to payee
     * @param escrowId The escrow identifier
     */
    function releaseEscrow(bytes32 escrowId)
        external
        override
        nonReentrant
        escrowNotProcessed(escrowId)
        canReleaseEscrow(escrowId)
    {
        EscrowPayment storage escrow = _escrowPayments[escrowId];
        escrow.released = true;

        uint256 fee = _calculateFee(escrow.amount);
        uint256 netAmount = escrow.amount - fee;

        _transferAsset(escrow.token, escrow.payee, netAmount);
        if (fee > 0) {
            _transferAsset(escrow.token, _feeCollector, fee);
        }

        emit EscrowReleased(escrowId, escrow.payee, netAmount, fee);
    }

    /**
     * @notice Refund escrow payment to payer
     * @param escrowId The escrow identifier
     */
    function refundEscrow(bytes32 escrowId)
        external
        override
        nonReentrant
        escrowNotProcessed(escrowId)
        onlyPayer(escrowId)
    {
        EscrowPayment storage escrow = _escrowPayments[escrowId];
        escrow.refunded = true;

        _transferAsset(escrow.token, escrow.payer, escrow.amount);

        emit EscrowRefunded(escrowId, escrow.payer, escrow.amount);
    }

    /**
     * @notice Split payment among multiple recipients
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts for each recipient
     * @param token The token address (address(0) for ETH)
     * @param metadata Optional payment metadata
     * @return paymentId The unique payment identifier
     */
    function splitPayment(
        address[] calldata recipients,
        uint256[] calldata amounts,
        address token,
        string calldata metadata
    )
        external
        payable
        override
        nonReentrant
        validArrayLength(recipients.length, amounts.length)
        nonEmptyArray(recipients.length)
        returns (bytes32)
    {
        _validateAddresses(recipients);

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            if (amounts[i] == 0) {
                revert InvalidAmount(amounts[i]);
            }
            totalAmount += amounts[i];
        }

        if (token == address(0)) {
            if (msg.value != totalAmount) {
                revert IncorrectETHAmount(msg.value, totalAmount);
            }
        }

        bytes32 paymentId = keccak256(
            abi.encodePacked(msg.sender, recipients, amounts, block.timestamp, _paymentNonce++)
        );

        uint256 totalFees = 0;
        for (uint256 i = 0; i < recipients.length; i++) {
            uint256 fee = _calculateFee(amounts[i]);
            uint256 netAmount = amounts[i] - fee;
            totalFees += fee;

            if (token == address(0)) {
                _transferAsset(token, recipients[i], netAmount);
            } else {
                _transferAssetFrom(token, msg.sender, recipients[i], netAmount);
            }

            _incrementTotalReceived(recipients[i], amounts[i]);
        }

        if (totalFees > 0) {
            if (token == address(0)) {
                _transferAsset(token, _feeCollector, totalFees);
            } else {
                _transferAssetFrom(token, msg.sender, _feeCollector, totalFees);
            }
        }

        _incrementTotalSent(msg.sender, totalAmount);
        emit PaymentProcessed(paymentId, msg.sender, address(0), totalAmount, token, totalFees, block.timestamp);
        return paymentId;
    }

    /**
     * @notice Update platform fee
     * @param newFee The new fee in basis points (max 500 = 5%)
     */
    function updatePlatformFee(uint256 newFee) external onlyOwner validFee(newFee) {
        uint256 oldFee = _platformFee;
        _setPlatformFee(newFee);
        emit PlatformFeeUpdated(oldFee, newFee);
    }

    /**
     * @notice Update fee collector address
     * @param newCollector The new fee collector address
     */
    function updateFeeCollector(address newCollector) external onlyOwner validAddress(newCollector) {
        address oldCollector = _feeCollector;
        _setFeeCollector(newCollector);
        emit FeeCollectorUpdated(oldCollector, newCollector);
    }

    /**
     * @notice Get payment details
     * @param paymentId The payment identifier
     * @return The payment details
     */
    function getPayment(bytes32 paymentId) external view override returns (Payment memory) {
        return _getPayment(paymentId);
    }

    /**
     * @notice Get escrow details
     * @param escrowId The escrow identifier
     * @return The escrow details
     */
    function getEscrow(bytes32 escrowId) external view override returns (EscrowPayment memory) {
        return _getEscrow(escrowId);
    }

    /**
     * @notice Get total number of payments
     * @return The payment count
     */
    function getPaymentCount() external view override returns (uint256) {
        return _getPaymentCount();
    }

    /**
     * @notice Get total received by address
     * @param account The address to query
     * @return The total received amount
     */
    function getTotalReceived(address account) external view returns (uint256) {
        return _getTotalReceived(account);
    }

    /**
     * @notice Get total sent by address
     * @param account The address to query
     * @return The total sent amount
     */
    function getTotalSent(address account) external view returns (uint256) {
        return _getTotalSent(account);
    }

    /**
     * @notice Get platform fee
     * @return The current platform fee in basis points
     */
    function getPlatformFee() external view returns (uint256) {
        return _getPlatformFee();
    }

    /**
     * @notice Get fee collector address
     * @return The current fee collector address
     */
    function getFeeCollector() external view returns (address) {
        return _getFeeCollector();
    }
}
