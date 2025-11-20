// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../security/SecurityErrors.sol";

/**
 * @title PaymentValidator
 * @notice Comprehensive payment validation utility
 * @dev Validates all aspects of payment transactions
 */
library PaymentValidator {
    uint256 private constant MAX_BATCH_SIZE = 100;
    uint256 private constant MIN_PAYMENT_AMOUNT = 1000; // Minimum wei/token units
    uint256 private constant MAX_FEE_RATE = 1000; // 10% maximum fee

    struct PaymentParams {
        address payer;
        address payee;
        uint256 amount;
        address token;
        uint256 deadline;
    }

    struct BatchPaymentParams {
        address[] recipients;
        uint256[] amounts;
        address token;
    }

    /**
     * @notice Validate basic payment parameters
     * @param params Payment parameters to validate
     */
    function validatePayment(PaymentParams memory params) internal view {
        // Validate addresses
        if (params.payer == address(0)) revert SecurityErrors.ZeroAddress();
        if (params.payee == address(0)) revert SecurityErrors.ZeroAddress();
        if (params.payer == params.payee) revert SecurityErrors.SameAddress(params.payer);

        // Validate amount
        if (params.amount == 0) revert SecurityErrors.InvalidAmount(0);
        if (params.amount < MIN_PAYMENT_AMOUNT) {
            revert SecurityErrors.AmountTooLow(params.amount, MIN_PAYMENT_AMOUNT);
        }

        // Validate deadline if provided
        if (params.deadline > 0 && block.timestamp > params.deadline) {
            revert SecurityErrors.DeadlineExpired(params.deadline, block.timestamp);
        }

        // Validate token contract if not ETH
        if (params.token != address(0)) {
            validateTokenContract(params.token);
        }
    }

    /**
     * @notice Validate batch payment parameters
     * @param params Batch payment parameters
     */
    function validateBatchPayment(BatchPaymentParams memory params) internal view {
        // Validate array lengths
        if (params.recipients.length == 0) revert SecurityErrors.ArrayEmpty();
        if (params.recipients.length != params.amounts.length) {
            revert SecurityErrors.ArrayLengthMismatch(
                params.recipients.length,
                params.amounts.length
            );
        }
        if (params.recipients.length > MAX_BATCH_SIZE) {
            revert SecurityErrors.ArrayTooLong(params.recipients.length, MAX_BATCH_SIZE);
        }

        // Validate each recipient and amount
        for (uint256 i = 0; i < params.recipients.length; i++) {
            if (params.recipients[i] == address(0)) revert SecurityErrors.ZeroAddress();
            if (params.amounts[i] == 0) revert SecurityErrors.InvalidAmount(0);
            if (params.amounts[i] < MIN_PAYMENT_AMOUNT) {
                revert SecurityErrors.AmountTooLow(params.amounts[i], MIN_PAYMENT_AMOUNT);
            }
        }

        // Check for duplicate recipients
        for (uint256 i = 0; i < params.recipients.length; i++) {
            for (uint256 j = i + 1; j < params.recipients.length; j++) {
                if (params.recipients[i] == params.recipients[j]) {
                    revert SecurityErrors.SameAddress(params.recipients[i]);
                }
            }
        }

        // Validate token if not ETH
        if (params.token != address(0)) {
            validateTokenContract(params.token);
        }
    }

    /**
     * @notice Validate token contract
     * @param token Token address to validate
     */
    function validateTokenContract(address token) internal view {
        if (token == address(0)) revert SecurityErrors.ZeroAddress();
        
        // Check if address is a contract
        uint256 size;
        assembly {
            size := extcodesize(token)
        }
        if (size == 0) revert SecurityErrors.InvalidAddress(token);

        // Try to call totalSupply() to verify it's a token
        try IERC20(token).totalSupply() returns (uint256) {
            // Token contract is valid
        } catch {
            revert SecurityErrors.TokenNotSupported(token);
        }
    }

    /**
     * @notice Validate token balance
     * @param token Token address (address(0) for ETH)
     * @param account Account to check
     * @param requiredAmount Required amount
     */
    function validateBalance(
        address token,
        address account,
        uint256 requiredAmount
    ) internal view {
        uint256 balance;
        
        if (token == address(0)) {
            balance = account.balance;
        } else {
            balance = IERC20(token).balanceOf(account);
        }

        if (balance < requiredAmount) {
            revert SecurityErrors.InsufficientBalance(requiredAmount, balance);
        }
    }

    /**
     * @notice Validate token allowance
     * @param token Token address
     * @param owner Token owner
     * @param spender Spender address
     * @param requiredAmount Required allowance
     */
    function validateAllowance(
        address token,
        address owner,
        address spender,
        uint256 requiredAmount
    ) internal view {
        if (token == address(0)) return; // No allowance needed for ETH

        uint256 allowance = IERC20(token).allowance(owner, spender);
        if (allowance < requiredAmount) {
            revert SecurityErrors.InsufficientAllowance(requiredAmount, allowance);
        }
    }

    /**
     * @notice Validate fee parameters
     * @param feeRate Fee rate in basis points
     * @param feeDenominator Fee denominator
     */
    function validateFee(uint256 feeRate, uint256 feeDenominator) internal pure {
        if (feeDenominator == 0) revert SecurityErrors.DivisionByZero();
        if (feeRate > feeDenominator) {
            revert SecurityErrors.FeeTooHigh(feeRate, feeDenominator);
        }
        
        // Check if fee rate exceeds maximum
        uint256 feePercentage = (feeRate * 10000) / feeDenominator;
        if (feePercentage > MAX_FEE_RATE) {
            revert SecurityErrors.FeeTooHigh(feePercentage, MAX_FEE_RATE);
        }
    }

    /**
     * @notice Validate time range
     * @param startTime Start timestamp
     * @param endTime End timestamp
     */
    function validateTimeRange(uint256 startTime, uint256 endTime) internal view {
        if (startTime >= endTime) {
            revert SecurityErrors.InvalidTimeRange(startTime, endTime);
        }
        if (startTime < block.timestamp) {
            revert SecurityErrors.TooEarly(startTime, block.timestamp);
        }
    }

    /**
     * @notice Validate escrow parameters
     * @param payer Payer address
     * @param payee Payee address
     * @param amount Escrow amount
     * @param releaseTime Release timestamp
     */
    function validateEscrow(
        address payer,
        address payee,
        uint256 amount,
        uint256 releaseTime
    ) internal view {
        if (payer == address(0)) revert SecurityErrors.ZeroAddress();
        if (payee == address(0)) revert SecurityErrors.ZeroAddress();
        if (payer == payee) revert SecurityErrors.SameAddress(payer);
        if (amount == 0) revert SecurityErrors.InvalidAmount(0);
        if (releaseTime <= block.timestamp) {
            revert SecurityErrors.TooEarly(releaseTime, block.timestamp);
        }
    }

    /**
     * @notice Validate split payment shares
     * @param recipients Recipients array
     * @param shares Shares array
     */
    function validateSplitShares(
        address[] memory recipients,
        uint256[] memory shares
    ) internal pure {
        if (recipients.length == 0) revert SecurityErrors.ArrayEmpty();
        if (recipients.length != shares.length) {
            revert SecurityErrors.ArrayLengthMismatch(recipients.length, shares.length);
        }

        uint256 totalShares = 0;
        for (uint256 i = 0; i < shares.length; i++) {
            if (recipients[i] == address(0)) revert SecurityErrors.ZeroAddress();
            if (shares[i] == 0) revert SecurityErrors.InvalidAmount(0);
            totalShares += shares[i];
        }

        if (totalShares == 0) revert SecurityErrors.InvalidAmount(0);
    }

    /**
     * @notice Validate subscription parameters
     * @param subscriber Subscriber address
     * @param amount Subscription amount
     * @param interval Billing interval
     */
    function validateSubscription(
        address subscriber,
        uint256 amount,
        uint256 interval
    ) internal pure {
        if (subscriber == address(0)) revert SecurityErrors.ZeroAddress();
        if (amount == 0) revert SecurityErrors.InvalidAmount(0);
        if (interval == 0) revert SecurityErrors.InvalidAmount(interval);
        if (interval < 1 days) {
            revert SecurityErrors.InvalidAmount(interval);
        }
    }

    /**
     * @notice Validate milestone parameters
     * @param amounts Milestone amounts
     * @param dueDates Milestone due dates
     */
    function validateMilestones(
        uint256[] memory amounts,
        uint256[] memory dueDates
    ) internal view {
        if (amounts.length == 0) revert SecurityErrors.ArrayEmpty();
        if (amounts.length != dueDates.length) {
            revert SecurityErrors.ArrayLengthMismatch(amounts.length, dueDates.length);
        }

        uint256 previousDueDate = block.timestamp;
        for (uint256 i = 0; i < amounts.length; i++) {
            if (amounts[i] == 0) revert SecurityErrors.InvalidAmount(0);
            if (dueDates[i] <= previousDueDate) {
                revert SecurityErrors.InvalidTimeRange(previousDueDate, dueDates[i]);
            }
            previousDueDate = dueDates[i];
        }
    }

    /**
     * @notice Check if address is contract
     * @param addr Address to check
     * @return bool True if contract
     */
    function isContract(address addr) internal view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(addr)
        }
        return size > 0;
    }

    /**
     * @notice Calculate total amount for batch payment
     * @param amounts Array of amounts
     * @return total Total amount
     */
    function calculateTotalAmount(uint256[] memory amounts) internal pure returns (uint256 total) {
        for (uint256 i = 0; i < amounts.length; i++) {
            total += amounts[i];
        }
    }

    /**
     * @notice Validate payment signature parameters
     * @param signer Expected signer address
     * @param deadline Signature deadline
     * @param nonce Signature nonce
     */
    function validateSignature(
        address signer,
        uint256 deadline,
        uint256 nonce
    ) internal view {
        if (signer == address(0)) revert SecurityErrors.ZeroAddress();
        if (block.timestamp > deadline) {
            revert SecurityErrors.DeadlineExpired(deadline, block.timestamp);
        }
        // Nonce validation would be done by the signature verification contract
    }

    /**
     * @notice Validate stream parameters
     * @param recipient Stream recipient
     * @param amount Stream amount
     * @param startTime Stream start time
     * @param stopTime Stream stop time
     */
    function validateStream(
        address recipient,
        uint256 amount,
        uint256 startTime,
        uint256 stopTime
    ) internal view {
        if (recipient == address(0)) revert SecurityErrors.ZeroAddress();
        if (amount == 0) revert SecurityErrors.InvalidAmount(0);
        if (startTime < block.timestamp) {
            revert SecurityErrors.TooEarly(startTime, block.timestamp);
        }
        if (stopTime <= startTime) {
            revert SecurityErrors.InvalidTimeRange(startTime, stopTime);
        }
        
        uint256 duration = stopTime - startTime;
        if (duration < 1 hours) {
            revert SecurityErrors.InvalidAmount(duration);
        }
    }
}

