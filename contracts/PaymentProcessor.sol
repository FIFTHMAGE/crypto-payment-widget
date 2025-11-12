// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PaymentProcessor
 * @dev Advanced payment processing with escrow, token support, and payment splitting
 */
contract PaymentProcessor is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    struct Payment {
        address payer;
        address payee;
        uint256 amount;
        address token; // address(0) for ETH
        uint256 timestamp;
        PaymentStatus status;
        string metadata; // Optional metadata (order ID, invoice number, etc.)
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

    enum PaymentStatus {
        Pending,
        Completed,
        Refunded,
        Failed
    }

    // State variables
    mapping(bytes32 => Payment) public payments;
    mapping(bytes32 => EscrowPayment) public escrowPayments;
    mapping(address => uint256) public totalReceived;
    mapping(address => uint256) public totalSent;
    
    bytes32[] public paymentIds;
    uint256 public platformFee = 25; // 0.25% (25 basis points)
    uint256 public constant FEE_DENOMINATOR = 10000;
    address public feeCollector;

    // Events
    event PaymentProcessed(
        bytes32 indexed paymentId,
        address indexed payer,
        address indexed payee,
        uint256 amount,
        address token
    );
    
    event EscrowCreated(
        bytes32 indexed escrowId,
        address indexed payer,
        address indexed payee,
        uint256 amount,
        uint256 releaseTime
    );
    
    event EscrowReleased(bytes32 indexed escrowId, address indexed payee, uint256 amount);
    event EscrowRefunded(bytes32 indexed escrowId, address indexed payer, uint256 amount);
    event PaymentRefunded(bytes32 indexed paymentId, address indexed payer, uint256 amount);
    event PlatformFeeUpdated(uint256 newFee);

    constructor(address _feeCollector) Ownable(msg.sender) {
        feeCollector = _feeCollector;
    }

    /**
     * @dev Process a direct payment (ETH or ERC20)
     */
    function processPayment(
        address payee,
        address token,
        uint256 amount,
        string calldata metadata
    ) external payable nonReentrant returns (bytes32) {
        require(payee != address(0), "Invalid payee");
        require(amount > 0, "Amount must be greater than 0");

        bytes32 paymentId = keccak256(
            abi.encodePacked(msg.sender, payee, amount, block.timestamp, paymentIds.length)
        );

        uint256 fee = (amount * platformFee) / FEE_DENOMINATOR;
        uint256 netAmount = amount - fee;

        if (token == address(0)) {
            // ETH payment
            require(msg.value == amount, "Incorrect ETH amount");
            (bool success, ) = payee.call{value: netAmount}("");
            require(success, "ETH transfer failed");
            if (fee > 0) {
                (bool feeSuccess, ) = feeCollector.call{value: fee}("");
                require(feeSuccess, "Fee transfer failed");
            }
        } else {
            // ERC20 payment
            IERC20(token).safeTransferFrom(msg.sender, payee, netAmount);
            if (fee > 0) {
                IERC20(token).safeTransferFrom(msg.sender, feeCollector, fee);
            }
        }

        payments[paymentId] = Payment({
            payer: msg.sender,
            payee: payee,
            amount: amount,
            token: token,
            timestamp: block.timestamp,
            status: PaymentStatus.Completed,
            metadata: metadata
        });

        paymentIds.push(paymentId);
        totalSent[msg.sender] += amount;
        totalReceived[payee] += amount;

        emit PaymentProcessed(paymentId, msg.sender, payee, amount, token);
        return paymentId;
    }

    /**
     * @dev Create an escrow payment (released after time or manually)
     */
    function createEscrow(
        address payee,
        address token,
        uint256 amount,
        uint256 releaseTime,
        string calldata metadata
    ) external payable nonReentrant returns (bytes32) {
        require(payee != address(0), "Invalid payee");
        require(amount > 0, "Amount must be greater than 0");
        require(releaseTime > block.timestamp, "Release time must be in future");

        bytes32 escrowId = keccak256(
            abi.encodePacked(msg.sender, payee, amount, block.timestamp, "escrow")
        );

        if (token == address(0)) {
            require(msg.value == amount, "Incorrect ETH amount");
        } else {
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        }

        escrowPayments[escrowId] = EscrowPayment({
            payer: msg.sender,
            payee: payee,
            amount: amount,
            token: token,
            releaseTime: releaseTime,
            released: false,
            refunded: false,
            metadata: metadata
        });

        emit EscrowCreated(escrowId, msg.sender, payee, amount, releaseTime);
        return escrowId;
    }

    /**
     * @dev Release escrow payment to payee
     */
    function releaseEscrow(bytes32 escrowId) external nonReentrant {
        EscrowPayment storage escrow = escrowPayments[escrowId];
        require(!escrow.released && !escrow.refunded, "Escrow already processed");
        require(
            msg.sender == escrow.payer || block.timestamp >= escrow.releaseTime,
            "Cannot release yet"
        );

        escrow.released = true;

        uint256 fee = (escrow.amount * platformFee) / FEE_DENOMINATOR;
        uint256 netAmount = escrow.amount - fee;

        if (escrow.token == address(0)) {
            (bool success, ) = escrow.payee.call{value: netAmount}("");
            require(success, "ETH transfer failed");
            if (fee > 0) {
                (bool feeSuccess, ) = feeCollector.call{value: fee}("");
                require(feeSuccess, "Fee transfer failed");
            }
        } else {
            IERC20(escrow.token).safeTransfer(escrow.payee, netAmount);
            if (fee > 0) {
                IERC20(escrow.token).safeTransfer(feeCollector, fee);
            }
        }

        emit EscrowReleased(escrowId, escrow.payee, netAmount);
    }

    /**
     * @dev Refund escrow payment to payer
     */
    function refundEscrow(bytes32 escrowId) external nonReentrant {
        EscrowPayment storage escrow = escrowPayments[escrowId];
        require(!escrow.released && !escrow.refunded, "Escrow already processed");
        require(msg.sender == escrow.payer, "Only payer can refund");

        escrow.refunded = true;

        if (escrow.token == address(0)) {
            (bool success, ) = escrow.payer.call{value: escrow.amount}("");
            require(success, "ETH refund failed");
        } else {
            IERC20(escrow.token).safeTransfer(escrow.payer, escrow.amount);
        }

        emit EscrowRefunded(escrowId, escrow.payer, escrow.amount);
    }

    /**
     * @dev Split payment among multiple recipients
     */
    function splitPayment(
        address[] calldata recipients,
        uint256[] calldata amounts,
        address token,
        string calldata metadata
    ) external payable nonReentrant returns (bytes32) {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        require(recipients.length > 0, "No recipients");

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }

        if (token == address(0)) {
            require(msg.value == totalAmount, "Incorrect ETH amount");
        }

        bytes32 paymentId = keccak256(
            abi.encodePacked(msg.sender, recipients, amounts, block.timestamp)
        );

        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient");
            
            uint256 fee = (amounts[i] * platformFee) / FEE_DENOMINATOR;
            uint256 netAmount = amounts[i] - fee;

            if (token == address(0)) {
                (bool success, ) = recipients[i].call{value: netAmount}("");
                require(success, "ETH transfer failed");
                if (fee > 0) {
                    (bool feeSuccess, ) = feeCollector.call{value: fee}("");
                    require(feeSuccess, "Fee transfer failed");
                }
            } else {
                IERC20(token).safeTransferFrom(msg.sender, recipients[i], netAmount);
                if (fee > 0) {
                    IERC20(token).safeTransferFrom(msg.sender, feeCollector, fee);
                }
            }

            totalReceived[recipients[i]] += amounts[i];
        }

        totalSent[msg.sender] += totalAmount;
        emit PaymentProcessed(paymentId, msg.sender, address(0), totalAmount, token);
        return paymentId;
    }

    /**
     * @dev Update platform fee (only owner)
     */
    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 500, "Fee too high"); // Max 5%
        platformFee = newFee;
        emit PlatformFeeUpdated(newFee);
    }

    /**
     * @dev Update fee collector address (only owner)
     */
    function updateFeeCollector(address newCollector) external onlyOwner {
        require(newCollector != address(0), "Invalid address");
        feeCollector = newCollector;
    }

    /**
     * @dev Get payment details
     */
    function getPayment(bytes32 paymentId) external view returns (Payment memory) {
        return payments[paymentId];
    }

    /**
     * @dev Get escrow details
     */
    function getEscrow(bytes32 escrowId) external view returns (EscrowPayment memory) {
        return escrowPayments[escrowId];
    }

    /**
     * @dev Get total number of payments
     */
    function getPaymentCount() external view returns (uint256) {
        return paymentIds.length;
    }

    receive() external payable {}
}
