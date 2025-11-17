// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SubscriptionPayment
 * @author Crypto Payment Widget Team
 * @notice Recurring payment system with flexible billing cycles
 * @dev Supports ETH and ERC20 tokens for subscription payments
 */
contract SubscriptionPayment is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    enum SubscriptionStatus {
        Active,
        Paused,
        Cancelled,
        Expired
    }

    struct Subscription {
        address subscriber;
        address recipient;
        address token;
        uint256 amount;
        uint256 interval;
        uint256 startTime;
        uint256 lastPayment;
        uint256 nextPayment;
        uint256 totalPaid;
        uint256 paymentCount;
        SubscriptionStatus status;
        bytes32 planId;
    }

    struct SubscriptionPlan {
        string name;
        address recipient;
        address token;
        uint256 amount;
        uint256 interval;
        bool active;
        uint256 subscriberCount;
    }

    mapping(bytes32 => Subscription) public subscriptions;
    mapping(bytes32 => SubscriptionPlan) public plans;
    mapping(address => bytes32[]) public userSubscriptions;
    mapping(bytes32 => bytes32[]) public planSubscriptions;
    
    bytes32[] public allPlans;
    uint256 public subscriptionCount;
    uint256 public platformFee = 25;
    uint256 public constant FEE_DENOMINATOR = 10000;
    address public feeCollector;

    event PlanCreated(
        bytes32 indexed planId,
        string name,
        address indexed recipient,
        uint256 amount,
        uint256 interval
    );

    event SubscriptionCreated(
        bytes32 indexed subscriptionId,
        bytes32 indexed planId,
        address indexed subscriber,
        uint256 startTime
    );

    event PaymentProcessed(
        bytes32 indexed subscriptionId,
        address indexed subscriber,
        uint256 amount,
        uint256 timestamp
    );

    event SubscriptionPaused(bytes32 indexed subscriptionId, address indexed subscriber);
    event SubscriptionResumed(bytes32 indexed subscriptionId, address indexed subscriber);
    event SubscriptionCancelled(bytes32 indexed subscriptionId, address indexed subscriber);

    error InvalidAmount(uint256 amount);
    error InvalidInterval(uint256 interval);
    error InvalidAddress(address addr);
    error SubscriptionNotActive(bytes32 subscriptionId);
    error PaymentNotDue(uint256 nextPayment, uint256 currentTime);
    error PlanNotActive(bytes32 planId);
    error SubscriptionNotFound(bytes32 subscriptionId);

    constructor(address feeCollector_) Ownable(msg.sender) {
        require(feeCollector_ != address(0), "Invalid fee collector");
        feeCollector = feeCollector_;
    }

    /**
     * @notice Create a subscription plan
     * @param name Plan name
     * @param recipient Payment recipient
     * @param token Token address (address(0) for ETH)
     * @param amount Payment amount per interval
     * @param interval Time between payments in seconds
     * @return planId The created plan identifier
     */
    function createPlan(
        string calldata name,
        address recipient,
        address token,
        uint256 amount,
        uint256 interval
    ) external returns (bytes32 planId) {
        if (recipient == address(0)) revert InvalidAddress(recipient);
        if (amount == 0) revert InvalidAmount(amount);
        if (interval == 0) revert InvalidInterval(interval);

        planId = keccak256(abi.encodePacked(name, recipient, token, amount, interval, block.timestamp));

        plans[planId] = SubscriptionPlan({
            name: name,
            recipient: recipient,
            token: token,
            amount: amount,
            interval: interval,
            active: true,
            subscriberCount: 0
        });

        allPlans.push(planId);
        emit PlanCreated(planId, name, recipient, amount, interval);
        return planId;
    }

    /**
     * @notice Subscribe to a plan
     * @param planId The plan identifier
     * @return subscriptionId The created subscription identifier
     */
    function subscribe(bytes32 planId) external payable nonReentrant returns (bytes32 subscriptionId) {
        SubscriptionPlan storage plan = plans[planId];
        if (!plan.active) revert PlanNotActive(planId);

        subscriptionId = keccak256(abi.encodePacked(msg.sender, planId, block.timestamp, subscriptionCount));

        uint256 nextPayment = block.timestamp;

        subscriptions[subscriptionId] = Subscription({
            subscriber: msg.sender,
            recipient: plan.recipient,
            token: plan.token,
            amount: plan.amount,
            interval: plan.interval,
            startTime: block.timestamp,
            lastPayment: 0,
            nextPayment: nextPayment,
            totalPaid: 0,
            paymentCount: 0,
            status: SubscriptionStatus.Active,
            planId: planId
        });

        userSubscriptions[msg.sender].push(subscriptionId);
        planSubscriptions[planId].push(subscriptionId);
        plan.subscriberCount++;
        subscriptionCount++;

        emit SubscriptionCreated(subscriptionId, planId, msg.sender, block.timestamp);
        return subscriptionId;
    }

    /**
     * @notice Process a subscription payment
     * @param subscriptionId The subscription identifier
     */
    function processPayment(bytes32 subscriptionId) external nonReentrant {
        Subscription storage sub = subscriptions[subscriptionId];
        
        if (sub.status != SubscriptionStatus.Active) {
            revert SubscriptionNotActive(subscriptionId);
        }

        if (block.timestamp < sub.nextPayment) {
            revert PaymentNotDue(sub.nextPayment, block.timestamp);
        }

        uint256 fee = (sub.amount * platformFee) / FEE_DENOMINATOR;
        uint256 netAmount = sub.amount - fee;

        if (sub.token == address(0)) {
            require(msg.value == sub.amount, "Incorrect ETH amount");
            _transferETH(sub.recipient, netAmount);
            if (fee > 0) {
                _transferETH(feeCollector, fee);
            }
        } else {
            IERC20(sub.token).safeTransferFrom(msg.sender, sub.recipient, netAmount);
            if (fee > 0) {
                IERC20(sub.token).safeTransferFrom(msg.sender, feeCollector, fee);
            }
        }

        sub.lastPayment = block.timestamp;
        sub.nextPayment = block.timestamp + sub.interval;
        sub.totalPaid += sub.amount;
        sub.paymentCount++;

        emit PaymentProcessed(subscriptionId, sub.subscriber, sub.amount, block.timestamp);
    }

    /**
     * @notice Pause a subscription
     * @param subscriptionId The subscription identifier
     */
    function pauseSubscription(bytes32 subscriptionId) external {
        Subscription storage sub = subscriptions[subscriptionId];
        require(msg.sender == sub.subscriber, "Not subscriber");
        require(sub.status == SubscriptionStatus.Active, "Not active");

        sub.status = SubscriptionStatus.Paused;
        emit SubscriptionPaused(subscriptionId, msg.sender);
    }

    /**
     * @notice Resume a paused subscription
     * @param subscriptionId The subscription identifier
     */
    function resumeSubscription(bytes32 subscriptionId) external {
        Subscription storage sub = subscriptions[subscriptionId];
        require(msg.sender == sub.subscriber, "Not subscriber");
        require(sub.status == SubscriptionStatus.Paused, "Not paused");

        sub.status = SubscriptionStatus.Active;
        sub.nextPayment = block.timestamp + sub.interval;
        emit SubscriptionResumed(subscriptionId, msg.sender);
    }

    /**
     * @notice Cancel a subscription
     * @param subscriptionId The subscription identifier
     */
    function cancelSubscription(bytes32 subscriptionId) external {
        Subscription storage sub = subscriptions[subscriptionId];
        require(msg.sender == sub.subscriber, "Not subscriber");

        sub.status = SubscriptionStatus.Cancelled;
        emit SubscriptionCancelled(subscriptionId, msg.sender);
    }

    /**
     * @notice Get subscription details
     * @param subscriptionId The subscription identifier
     * @return The subscription details
     */
    function getSubscription(bytes32 subscriptionId) external view returns (Subscription memory) {
        return subscriptions[subscriptionId];
    }

    /**
     * @notice Get user's subscriptions
     * @param user The user address
     * @return Array of subscription identifiers
     */
    function getUserSubscriptions(address user) external view returns (bytes32[] memory) {
        return userSubscriptions[user];
    }

    /**
     * @notice Get plan details
     * @param planId The plan identifier
     * @return The plan details
     */
    function getPlan(bytes32 planId) external view returns (SubscriptionPlan memory) {
        return plans[planId];
    }

    /**
     * @notice Check if payment is due
     * @param subscriptionId The subscription identifier
     * @return Boolean indicating if payment is due
     */
    function isPaymentDue(bytes32 subscriptionId) external view returns (bool) {
        Subscription memory sub = subscriptions[subscriptionId];
        return sub.status == SubscriptionStatus.Active && block.timestamp >= sub.nextPayment;
    }

    function _transferETH(address to, uint256 amount) private {
        (bool success, ) = to.call{value: amount}("");
        require(success, "ETH transfer failed");
    }

    receive() external payable {}
}

