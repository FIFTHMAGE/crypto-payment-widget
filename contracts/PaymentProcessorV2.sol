// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./Pausable.sol";
import "./PaymentRegistry.sol";

/**
 * @title PaymentProcessorV2
 * @dev Improved payment processor with registry integration
 */
contract PaymentProcessorV2 is Pausable {
    using SafeERC20 for IERC20;

    PaymentRegistry public registry;
    uint256 public platformFee;
    address public feeCollector;

    event DirectPayment(
        bytes32 indexed paymentId,
        address indexed payer,
        address indexed payee,
        uint256 amount,
        address token
    );

    constructor(
        address _registry,
        address _feeCollector,
        uint256 _platformFee
    ) {
        registry = PaymentRegistry(_registry);
        feeCollector = _feeCollector;
        platformFee = _platformFee;
    }

    /**
     * @dev Process a direct payment with registry
     */
    function processPayment(
        address payee,
        address token,
        uint256 amount,
        string calldata metadata
    ) external payable whenNotPaused returns (bytes32) {
        require(payee != address(0), "Invalid payee");
        require(amount > 0, "Amount must be greater than 0");

        bytes32 paymentId = keccak256(
            abi.encodePacked(msg.sender, payee, amount, block.timestamp)
        );

        uint256 fee = (amount * platformFee) / 10000;
        uint256 netAmount = amount - fee;

        if (token == address(0)) {
            require(msg.value == amount, "Incorrect ETH amount");
            (bool success, ) = payee.call{value: netAmount}("");
            require(success, "ETH transfer failed");
            
            if (fee > 0) {
                (bool feeSuccess, ) = feeCollector.call{value: fee}("");
                require(feeSuccess, "Fee transfer failed");
            }
        } else {
            IERC20(token).safeTransferFrom(msg.sender, payee, netAmount);
            if (fee > 0) {
                IERC20(token).safeTransferFrom(msg.sender, feeCollector, fee);
            }
        }

        // Register payment
        registry.registerPayment(
            paymentId,
            msg.sender,
            payee,
            amount,
            token,
            PaymentRegistry.PaymentType.Direct,
            metadata
        );

        emit DirectPayment(paymentId, msg.sender, payee, amount, token);
        return paymentId;
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

    /**
     * @dev Update registry (admin only)
     */
    function updateRegistry(address newRegistry) external onlyRole(ADMIN_ROLE) {
        require(newRegistry != address(0), "Invalid address");
        registry = PaymentRegistry(newRegistry);
    }

    receive() external payable {}
}

