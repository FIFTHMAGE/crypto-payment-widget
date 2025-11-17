// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./PaymentModifiers.sol";

/**
 * @title BasePayment
 * @notice Base contract for payment operations
 * @dev Provides core payment functionality with proper validation and error handling
 */
abstract contract BasePayment is PaymentModifiers, ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    constructor(address feeCollector_) Ownable(msg.sender) {
        if (feeCollector_ == address(0)) {
            revert InvalidAddress(feeCollector_);
        }
        _feeCollector = feeCollector_;
        _platformFee = 25;
    }

    /**
     * @notice Transfers tokens or ETH to a recipient
     * @param token The token address (address(0) for ETH)
     * @param to The recipient address
     * @param amount The amount to transfer
     */
    function _transferAsset(
        address token,
        address to,
        uint256 amount
    ) internal validAddress(to) validAmount(amount) {
        if (token == address(0)) {
            (bool success, ) = to.call{value: amount}("");
            if (!success) {
                revert TransferFailed(to, amount);
            }
        } else {
            IERC20(token).safeTransfer(to, amount);
        }
    }

    /**
     * @notice Transfers tokens from sender to recipient
     * @param token The token address
     * @param from The sender address
     * @param to The recipient address
     * @param amount The amount to transfer
     */
    function _transferAssetFrom(
        address token,
        address from,
        address to,
        uint256 amount
    ) internal validAddress(to) validAmount(amount) {
        IERC20(token).safeTransferFrom(from, to, amount);
    }

    /**
     * @notice Receives payment in ETH or tokens
     * @param token The token address (address(0) for ETH)
     * @param from The sender address
     * @param amount The amount to receive
     */
    function _receivePayment(
        address token,
        address from,
        uint256 amount
    ) internal validAmount(amount) {
        if (token == address(0)) {
            if (msg.value != amount) {
                revert IncorrectETHAmount(msg.value, amount);
            }
        } else {
            IERC20(token).safeTransferFrom(from, address(this), amount);
        }
    }

    /**
     * @notice Processes a payment with fee deduction
     * @param token The token address (address(0) for ETH)
     * @param from The payer address
     * @param to The payee address
     * @param amount The gross amount
     * @return netAmount The amount after fee deduction
     * @return fee The fee amount
     */
    function _processPaymentWithFee(
        address token,
        address from,
        address to,
        uint256 amount
    ) internal returns (uint256 netAmount, uint256 fee) {
        fee = _calculateFee(amount);
        netAmount = amount - fee;

        if (token == address(0)) {
            if (msg.value != amount) {
                revert IncorrectETHAmount(msg.value, amount);
            }
            _transferAsset(token, to, netAmount);
            if (fee > 0) {
                _transferAsset(token, _feeCollector, fee);
            }
        } else {
            _transferAssetFrom(token, from, to, netAmount);
            if (fee > 0) {
                _transferAssetFrom(token, from, _feeCollector, fee);
            }
        }

        return (netAmount, fee);
    }

    /**
     * @notice Generates a unique payment ID
     * @param payer The payer address
     * @param payee The payee address
     * @param amount The payment amount
     * @param nonce The payment nonce
     * @return The generated payment ID
     */
    function _generatePaymentId(
        address payer,
        address payee,
        uint256 amount,
        uint256 nonce
    ) internal view returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                payer,
                payee,
                amount,
                block.timestamp,
                nonce
            )
        );
    }

    /**
     * @notice Generates a unique escrow ID
     * @param payer The payer address
     * @param payee The payee address
     * @param amount The escrow amount
     * @param nonce The escrow nonce
     * @return The generated escrow ID
     */
    function _generateEscrowId(
        address payer,
        address payee,
        uint256 amount,
        uint256 nonce
    ) internal view returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                payer,
                payee,
                amount,
                block.timestamp,
                nonce,
                "escrow"
            )
        );
    }

    receive() external payable {}
}

