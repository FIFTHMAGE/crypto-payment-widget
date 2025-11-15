// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./Pausable.sol";

/**
 * @title BatchOperations
 * @dev Efficient batch operations for payments
 */
contract BatchOperations is Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct BatchPayment {
        address recipient;
        uint256 amount;
    }

    event BatchPaymentExecuted(address indexed sender, uint256 totalAmount, uint256 recipientCount);
    event BatchTokenTransfer(address indexed token, uint256 totalAmount, uint256 recipientCount);

    uint256 public platformFee;
    address public feeCollector;

    constructor(address _feeCollector, uint256 _platformFee) {
        feeCollector = _feeCollector;
        platformFee = _platformFee;
    }

    /**
     * @dev Execute batch ETH payments
     */
    function batchPayETH(BatchPayment[] calldata payments) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
    {
        require(payments.length > 0, "No payments");
        require(payments.length <= 100, "Too many payments");

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < payments.length; i++) {
            totalAmount += payments[i].amount;
        }

        uint256 totalFee = (totalAmount * platformFee) / 10000;
        require(msg.value == totalAmount, "Incorrect ETH amount");

        for (uint256 i = 0; i < payments.length; i++) {
            require(payments[i].recipient != address(0), "Invalid recipient");
            require(payments[i].amount > 0, "Invalid amount");

            uint256 fee = (payments[i].amount * platformFee) / 10000;
            uint256 netAmount = payments[i].amount - fee;

            (bool success, ) = payments[i].recipient.call{value: netAmount}("");
            require(success, "ETH transfer failed");
        }

        if (totalFee > 0) {
            (bool feeSuccess, ) = feeCollector.call{value: totalFee}("");
            require(feeSuccess, "Fee transfer failed");
        }

        emit BatchPaymentExecuted(msg.sender, totalAmount, payments.length);
    }

    /**
     * @dev Execute batch ERC20 token payments
     */
    function batchPayToken(
        address token,
        BatchPayment[] calldata payments
    ) external nonReentrant whenNotPaused {
        require(token != address(0), "Invalid token");
        require(payments.length > 0, "No payments");
        require(payments.length <= 100, "Too many payments");

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < payments.length; i++) {
            require(payments[i].recipient != address(0), "Invalid recipient");
            require(payments[i].amount > 0, "Invalid amount");
            totalAmount += payments[i].amount;
        }

        uint256 totalFee = (totalAmount * platformFee) / 10000;
        uint256 totalRequired = totalAmount;

        // Transfer total amount to contract first
        IERC20(token).safeTransferFrom(msg.sender, address(this), totalRequired);

        // Distribute to recipients
        for (uint256 i = 0; i < payments.length; i++) {
            uint256 fee = (payments[i].amount * platformFee) / 10000;
            uint256 netAmount = payments[i].amount - fee;
            IERC20(token).safeTransfer(payments[i].recipient, netAmount);
        }

        // Transfer fees
        if (totalFee > 0) {
            IERC20(token).safeTransfer(feeCollector, totalFee);
        }

        emit BatchTokenTransfer(token, totalAmount, payments.length);
    }

    /**
     * @dev Equal split batch payment (ETH)
     */
    function batchPayEqualETH(address[] calldata recipients) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
    {
        require(recipients.length > 0, "No recipients");
        require(recipients.length <= 100, "Too many recipients");
        require(msg.value > 0, "No ETH sent");

        uint256 totalFee = (msg.value * platformFee) / 10000;
        uint256 netAmount = msg.value - totalFee;
        uint256 amountPerRecipient = netAmount / recipients.length;

        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient");
            (bool success, ) = recipients[i].call{value: amountPerRecipient}("");
            require(success, "ETH transfer failed");
        }

        if (totalFee > 0) {
            (bool feeSuccess, ) = feeCollector.call{value: totalFee}("");
            require(feeSuccess, "Fee transfer failed");
        }

        emit BatchPaymentExecuted(msg.sender, msg.value, recipients.length);
    }

    /**
     * @dev Update platform fee (admin only)
     */
    function updatePlatformFee(uint256 newFee) external onlyRole(ADMIN_ROLE) {
        require(newFee <= 500, "Fee too high");
        platformFee = newFee;
    }

    /**
     * @dev Update fee collector (admin only)
     */
    function updateFeeCollector(address newCollector) external onlyRole(ADMIN_ROLE) {
        require(newCollector != address(0), "Invalid address");
        feeCollector = newCollector;
    }

    receive() external payable {}
}

