// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../storage/PaymentStorage.sol";

/**
 * @title PaymentModifiers
 * @notice Provides common modifiers and validation logic
 * @dev Centralizes validation to reduce code duplication
 */
abstract contract PaymentModifiers is PaymentStorage {
    error InvalidAddress(address addr);
    error InvalidAmount(uint256 amount);
    error InvalidFee(uint256 fee);
    error IncorrectETHAmount(uint256 sent, uint256 required);
    error ArrayLengthMismatch(uint256 length1, uint256 length2);
    error EmptyArray();
    error EscrowAlreadyProcessed(bytes32 escrowId);
    error EscrowNotReleasable(bytes32 escrowId, uint256 currentTime, uint256 releaseTime);
    error Unauthorized(address caller, address required);
    error TransferFailed(address recipient, uint256 amount);
    error InvalidReleaseTime(uint256 releaseTime, uint256 currentTime);

    modifier validAddress(address addr) {
        if (addr == address(0)) {
            revert InvalidAddress(addr);
        }
        _;
    }

    modifier validAmount(uint256 amount) {
        if (amount == 0) {
            revert InvalidAmount(amount);
        }
        _;
    }

    modifier validArrayLength(uint256 length1, uint256 length2) {
        if (length1 != length2) {
            revert ArrayLengthMismatch(length1, length2);
        }
        _;
    }

    modifier nonEmptyArray(uint256 length) {
        if (length == 0) {
            revert EmptyArray();
        }
        _;
    }

    modifier correctETHAmount(uint256 required) {
        if (msg.value != required) {
            revert IncorrectETHAmount(msg.value, required);
        }
        _;
    }

    modifier validFee(uint256 fee) {
        if (fee > 500) {
            revert InvalidFee(fee);
        }
        _;
    }

    modifier escrowNotProcessed(bytes32 escrowId) {
        IPaymentProcessor.EscrowPayment memory escrow = _getEscrow(escrowId);
        if (escrow.released || escrow.refunded) {
            revert EscrowAlreadyProcessed(escrowId);
        }
        _;
    }

    modifier canReleaseEscrow(bytes32 escrowId) {
        IPaymentProcessor.EscrowPayment memory escrow = _getEscrow(escrowId);
        if (msg.sender != escrow.payer && block.timestamp < escrow.releaseTime) {
            revert EscrowNotReleasable(escrowId, block.timestamp, escrow.releaseTime);
        }
        _;
    }

    modifier onlyPayer(bytes32 escrowId) {
        IPaymentProcessor.EscrowPayment memory escrow = _getEscrow(escrowId);
        if (msg.sender != escrow.payer) {
            revert Unauthorized(msg.sender, escrow.payer);
        }
        _;
    }

    modifier futureReleaseTime(uint256 releaseTime) {
        if (releaseTime <= block.timestamp) {
            revert InvalidReleaseTime(releaseTime, block.timestamp);
        }
        _;
    }

    function _validateAddresses(address[] calldata addresses) internal pure {
        for (uint256 i = 0; i < addresses.length; i++) {
            if (addresses[i] == address(0)) {
                revert InvalidAddress(addresses[i]);
            }
        }
    }

    function _calculateFee(uint256 amount) internal view returns (uint256) {
        return (amount * _platformFee) / FEE_DENOMINATOR;
    }

    function _calculateNetAmount(uint256 amount) internal view returns (uint256) {
        return amount - _calculateFee(amount);
    }
}

