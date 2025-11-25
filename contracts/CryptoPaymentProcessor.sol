// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title CryptoPaymentProcessor
 * @dev Handles cryptocurrency payments with support for multiple tokens
 */
contract CryptoPaymentProcessor is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    struct Payment {
        address payer;
        address token;
        uint256 amount;
        uint256 timestamp;
        string orderId;
        bool processed;
    }

    mapping(bytes32 => Payment) public payments;
    mapping(address => bool) public supportedTokens;
    mapping(address => uint256) public totalCollected;
    
    address public treasury;
    uint256 public feePercentage; // in basis points (100 = 1%)
    uint256 public constant MAX_FEE = 1000; // 10%

    event PaymentReceived(
        bytes32 indexed paymentId,
        address indexed payer,
        address indexed token,
        uint256 amount,
        string orderId
    );
    
    event PaymentProcessed(bytes32 indexed paymentId);
    event TokenAdded(address indexed token);
    event TokenRemoved(address indexed token);
    event TreasuryUpdated(address indexed newTreasury);
    event FeeUpdated(uint256 newFee);

    constructor(address _treasury, uint256 _feePercentage) {
        require(_treasury != address(0), "Invalid treasury");
        require(_feePercentage <= MAX_FEE, "Fee too high");
        
        treasury = _treasury;
        feePercentage = _feePercentage;
    }

    /**
     * @dev Process a payment
     */
    function processPayment(
        address token,
        uint256 amount,
        string calldata orderId
    ) external nonReentrant whenNotPaused returns (bytes32) {
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Amount must be positive");
        require(bytes(orderId).length > 0, "Order ID required");

        bytes32 paymentId = keccak256(
            abi.encodePacked(msg.sender, token, amount, orderId, block.timestamp)
        );
        require(!payments[paymentId].processed, "Payment already exists");

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        payments[paymentId] = Payment({
            payer: msg.sender,
            token: token,
            amount: amount,
            timestamp: block.timestamp,
            orderId: orderId,
            processed: false
        });

        totalCollected[token] += amount;

        emit PaymentReceived(paymentId, msg.sender, token, amount, orderId);
        return paymentId;
    }

    /**
     * @dev Process native currency payment
     */
    function processNativePayment(string calldata orderId) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
        returns (bytes32) 
    {
        require(msg.value > 0, "Amount must be positive");
        require(bytes(orderId).length > 0, "Order ID required");

        bytes32 paymentId = keccak256(
            abi.encodePacked(msg.sender, address(0), msg.value, orderId, block.timestamp)
        );

        payments[paymentId] = Payment({
            payer: msg.sender,
            token: address(0),
            amount: msg.value,
            timestamp: block.timestamp,
            orderId: orderId,
            processed: false
        });

        totalCollected[address(0)] += msg.value;

        emit PaymentReceived(paymentId, msg.sender, address(0), msg.value, orderId);
        return paymentId;
    }

    /**
     * @dev Mark payment as processed
     */
    function markProcessed(bytes32 paymentId) external onlyOwner {
        require(payments[paymentId].amount > 0, "Payment not found");
        require(!payments[paymentId].processed, "Already processed");
        
        payments[paymentId].processed = true;
        emit PaymentProcessed(paymentId);
    }

    /**
     * @dev Withdraw collected funds
     */
    function withdraw(address token, uint256 amount) external onlyOwner {
        require(amount > 0, "Invalid amount");
        
        if (token == address(0)) {
            require(address(this).balance >= amount, "Insufficient balance");
            (bool success, ) = treasury.call{value: amount}("");
            require(success, "Transfer failed");
        } else {
            IERC20(token).safeTransfer(treasury, amount);
        }
    }

    /**
     * @dev Add supported token
     */
    function addToken(address token) external onlyOwner {
        require(token != address(0), "Invalid token");
        require(!supportedTokens[token], "Already supported");
        
        supportedTokens[token] = true;
        emit TokenAdded(token);
    }

    /**
     * @dev Remove supported token
     */
    function removeToken(address token) external onlyOwner {
        require(supportedTokens[token], "Not supported");
        
        supportedTokens[token] = false;
        emit TokenRemoved(token);
    }

    /**
     * @dev Update treasury address
     */
    function updateTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid treasury");
        treasury = newTreasury;
        emit TreasuryUpdated(newTreasury);
    }

    /**
     * @dev Update fee percentage
     */
    function updateFee(uint256 newFee) external onlyOwner {
        require(newFee <= MAX_FEE, "Fee too high");
        feePercentage = newFee;
        emit FeeUpdated(newFee);
    }

    /**
     * @dev Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    receive() external payable {}
}
