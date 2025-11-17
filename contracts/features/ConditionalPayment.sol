// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ConditionalPayment
 * @author Crypto Payment Widget Team
 * @notice Payments that execute based on external conditions
 * @dev Oracle-based conditional payment release system
 */
contract ConditionalPayment is ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum ConditionType {
        Oracle,
        Signature,
        Threshold,
        TimeAndCondition
    }

    enum PaymentStatus {
        Pending,
        ConditionMet,
        Released,
        Expired,
        Cancelled
    }

    struct Condition {
        ConditionType conditionType;
        address oracle;
        bytes32 conditionData;
        uint256 threshold;
        uint256 expiryTime;
        bool isMet;
    }

    struct ConditionalPaymentData {
        address payer;
        address payee;
        address token;
        uint256 amount;
        Condition condition;
        PaymentStatus status;
        uint256 createdAt;
    }

    mapping(bytes32 => ConditionalPaymentData) public payments;
    mapping(address => bool) public trustedOracles;
    mapping(address => bytes32[]) public payerPayments;
    mapping(address => bytes32[]) public payeePayments;
    
    bytes32[] public allPayments;
    uint256 public paymentCount;
    address public owner;

    event PaymentCreated(
        bytes32 indexed paymentId,
        address indexed payer,
        address indexed payee,
        uint256 amount,
        ConditionType conditionType
    );

    event ConditionMet(bytes32 indexed paymentId, address indexed oracle);
    event PaymentReleased(bytes32 indexed paymentId, uint256 amount);
    event PaymentCancelled(bytes32 indexed paymentId);
    event PaymentExpired(bytes32 indexed paymentId);
    event OracleAdded(address indexed oracle);
    event OracleRemoved(address indexed oracle);

    error Unauthorized(address caller);
    error InvalidAddress(address addr);
    error InvalidAmount(uint256 amount);
    error InvalidExpiry(uint256 expiry);
    error PaymentNotFound(bytes32 paymentId);
    error ConditionNotMet(bytes32 paymentId);
    error PaymentAlreadyReleased(bytes32 paymentId);
    error PaymentExpired(bytes32 paymentId, uint256 expiryTime);
    error OracleNotTrusted(address oracle);

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized(msg.sender);
        _;
    }

    modifier onlyOracle() {
        if (!trustedOracles[msg.sender]) revert OracleNotTrusted(msg.sender);
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Create a conditional payment
     * @param payee Payment recipient
     * @param token Token address (address(0) for ETH)
     * @param amount Payment amount
     * @param conditionType Type of condition
     * @param oracle Oracle address for validation
     * @param conditionData Additional condition data
     * @param threshold Threshold value if applicable
     * @param expiryTime Payment expiry timestamp
     * @return paymentId Created payment identifier
     */
    function createConditionalPayment(
        address payee,
        address token,
        uint256 amount,
        ConditionType conditionType,
        address oracle,
        bytes32 conditionData,
        uint256 threshold,
        uint256 expiryTime
    ) external payable nonReentrant returns (bytes32 paymentId) {
        if (payee == address(0)) revert InvalidAddress(payee);
        if (amount == 0) revert InvalidAmount(amount);
        if (expiryTime <= block.timestamp) revert InvalidExpiry(expiryTime);

        paymentId = keccak256(abi.encodePacked(
            msg.sender,
            payee,
            amount,
            block.timestamp,
            paymentCount
        ));

        if (token == address(0)) {
            require(msg.value == amount, "Incorrect ETH amount");
        } else {
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        }

        payments[paymentId] = ConditionalPaymentData({
            payer: msg.sender,
            payee: payee,
            token: token,
            amount: amount,
            condition: Condition({
                conditionType: conditionType,
                oracle: oracle,
                conditionData: conditionData,
                threshold: threshold,
                expiryTime: expiryTime,
                isMet: false
            }),
            status: PaymentStatus.Pending,
            createdAt: block.timestamp
        });

        payerPayments[msg.sender].push(paymentId);
        payeePayments[payee].push(paymentId);
        allPayments.push(paymentId);
        paymentCount++;

        emit PaymentCreated(paymentId, msg.sender, payee, amount, conditionType);
        return paymentId;
    }

    /**
     * @notice Oracle confirms condition is met
     * @param paymentId Payment identifier
     */
    function confirmCondition(bytes32 paymentId) external onlyOracle {
        ConditionalPaymentData storage payment = payments[paymentId];
        
        if (payment.payer == address(0)) revert PaymentNotFound(paymentId);
        require(payment.status == PaymentStatus.Pending, "Invalid status");
        require(payment.condition.oracle == msg.sender, "Wrong oracle");

        if (block.timestamp > payment.condition.expiryTime) {
            payment.status = PaymentStatus.Expired;
            emit PaymentExpired(paymentId);
            return;
        }

        payment.condition.isMet = true;
        payment.status = PaymentStatus.ConditionMet;
        emit ConditionMet(paymentId, msg.sender);
    }

    /**
     * @notice Release payment after condition is met
     * @param paymentId Payment identifier
     */
    function releasePayment(bytes32 paymentId) external nonReentrant {
        ConditionalPaymentData storage payment = payments[paymentId];
        
        if (payment.payer == address(0)) revert PaymentNotFound(paymentId);
        if (payment.status != PaymentStatus.ConditionMet) {
            revert ConditionNotMet(paymentId);
        }

        if (block.timestamp > payment.condition.expiryTime) {
            payment.status = PaymentStatus.Expired;
            revert PaymentExpired(paymentId, payment.condition.expiryTime);
        }

        payment.status = PaymentStatus.Released;

        if (payment.token == address(0)) {
            _transferETH(payment.payee, payment.amount);
        } else {
            IERC20(payment.token).safeTransfer(payment.payee, payment.amount);
        }

        emit PaymentReleased(paymentId, payment.amount);
    }

    /**
     * @notice Cancel expired payment and refund
     * @param paymentId Payment identifier
     */
    function cancelExpiredPayment(bytes32 paymentId) external nonReentrant {
        ConditionalPaymentData storage payment = payments[paymentId];
        
        if (payment.payer == address(0)) revert PaymentNotFound(paymentId);
        require(msg.sender == payment.payer, "Only payer");
        require(block.timestamp > payment.condition.expiryTime, "Not expired");
        require(payment.status == PaymentStatus.Pending || 
                payment.status == PaymentStatus.Expired, "Invalid status");

        payment.status = PaymentStatus.Cancelled;

        if (payment.token == address(0)) {
            _transferETH(payment.payer, payment.amount);
        } else {
            IERC20(payment.token).safeTransfer(payment.payer, payment.amount);
        }

        emit PaymentCancelled(paymentId);
    }

    /**
     * @notice Add trusted oracle
     * @param oracle Oracle address
     */
    function addOracle(address oracle) external onlyOwner {
        if (oracle == address(0)) revert InvalidAddress(oracle);
        trustedOracles[oracle] = true;
        emit OracleAdded(oracle);
    }

    /**
     * @notice Remove trusted oracle
     * @param oracle Oracle address
     */
    function removeOracle(address oracle) external onlyOwner {
        trustedOracles[oracle] = false;
        emit OracleRemoved(oracle);
    }

    /**
     * @notice Get payment details
     * @param paymentId Payment identifier
     * @return Payment data
     */
    function getPayment(bytes32 paymentId) external view returns (ConditionalPaymentData memory) {
        return payments[paymentId];
    }

    /**
     * @notice Check if condition is met
     * @param paymentId Payment identifier
     * @return Boolean indicating if condition is met
     */
    function isConditionMet(bytes32 paymentId) external view returns (bool) {
        return payments[paymentId].condition.isMet;
    }

    /**
     * @notice Get payer's payments
     * @param payer Payer address
     * @return Array of payment identifiers
     */
    function getPayerPayments(address payer) external view returns (bytes32[] memory) {
        return payerPayments[payer];
    }

    /**
     * @notice Get payee's payments
     * @param payee Payee address
     * @return Array of payment identifiers
     */
    function getPayeePayments(address payee) external view returns (bytes32[] memory) {
        return payeePayments[payee];
    }

    function _transferETH(address to, uint256 amount) private {
        (bool success, ) = to.call{value: amount}("");
        require(success, "ETH transfer failed");
    }

    receive() external payable {}
}

