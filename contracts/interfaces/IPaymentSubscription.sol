// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IPaymentSubscription
 * @dev Interface for subscription payment functionality
 */
interface IPaymentSubscription {
    /**
     * @dev Emitted when a new subscription plan is created
     */
    event PlanCreated(
        uint256 indexed planId,
        address indexed merchant,
        string name,
        uint256 amount,
        uint256 duration
    );

    /**
     * @dev Emitted when a user subscribes to a plan
     */
    event Subscribed(
        uint256 indexed subscriptionId,
        address indexed subscriber,
        uint256 indexed planId
    );

    /**
     * @dev Emitted when a subscription is renewed
     */
    event Renewed(
        uint256 indexed subscriptionId,
        address indexed subscriber
    );

    /**
     * @dev Emitted when a subscription is cancelled
     */
    event Cancelled(
        uint256 indexed subscriptionId,
        address indexed subscriber
    );

    /**
     * @dev Emitted when funds are deposited for auto-renewal
     */
    event Deposited(
        uint256 indexed subscriptionId,
        uint256 amount
    );

    /**
     * @dev Subscription plan details
     */
    struct Plan {
        address merchant;
        string name;
        uint256 amount;
        uint256 duration;
        address token; // address(0) for ETH
        bool active;
    }

    /**
     * @dev Subscription details
     */
    struct Subscription {
        address subscriber;
        uint256 planId;
        uint256 lastPayment;
        uint256 nextPayment;
        uint256 depositBalance;
        bool active;
        bool autoRenew;
    }

    /**
     * @dev Creates a new subscription plan
     * @param name The name of the plan
     * @param amount The subscription amount
     * @param duration The duration between payments in seconds
     * @param token The token address (address(0) for ETH)
     * @return planId The ID of the created plan
     */
    function createPlan(
        string memory name,
        uint256 amount,
        uint256 duration,
        address token
    ) external returns (uint256 planId);

    /**
     * @dev Subscribes to a plan
     * @param planId The ID of the plan to subscribe to
     * @return subscriptionId The ID of the subscription
     */
    function subscribe(uint256 planId) external payable returns (uint256 subscriptionId);

    /**
     * @dev Renews a subscription
     * @param subscriptionId The ID of the subscription
     */
    function renew(uint256 subscriptionId) external payable;

    /**
     * @dev Cancels a subscription
     * @param subscriptionId The ID of the subscription
     */
    function cancel(uint256 subscriptionId) external;

    /**
     * @dev Deposits funds for auto-renewal
     * @param subscriptionId The ID of the subscription
     */
    function deposit(uint256 subscriptionId) external payable;

    /**
     * @dev Sets auto-renewal status
     * @param subscriptionId The ID of the subscription
     * @param enabled Whether auto-renewal is enabled
     */
    function setAutoRenew(uint256 subscriptionId, bool enabled) external;

    /**
     * @dev Gets plan details
     * @param planId The ID of the plan
     * @return The plan struct
     */
    function getPlan(uint256 planId) external view returns (Plan memory);

    /**
     * @dev Gets subscription details
     * @param subscriptionId The ID of the subscription
     * @return The subscription struct
     */
    function getSubscription(uint256 subscriptionId) external view returns (Subscription memory);

    /**
     * @dev Gets all plans created by a merchant
     * @param merchant The merchant address
     * @return An array of plan IDs
     */
    function getMerchantPlans(address merchant) external view returns (uint256[] memory);

    /**
     * @dev Gets all subscriptions for a subscriber
     * @param subscriber The subscriber address
     * @return An array of subscription IDs
     */
    function getSubscriberSubscriptions(address subscriber) external view returns (uint256[] memory);

    /**
     * @dev Updates a plan (merchant only)
     * @param planId The ID of the plan
     * @param amount The new amount
     * @param duration The new duration
     */
    function updatePlan(uint256 planId, uint256 amount, uint256 duration) external;

    /**
     * @dev Deactivates a plan (merchant only)
     * @param planId The ID of the plan
     */
    function deactivatePlan(uint256 planId) external;

    /**
     * @dev Processes auto-renewals for subscriptions
     * @param subscriptionIds Array of subscription IDs to process
     */
    function processAutoRenewals(uint256[] memory subscriptionIds) external;

    /**
     * @dev Withdraws merchant funds from subscriptions
     * @param planId The ID of the plan
     */
    function withdrawMerchantFunds(uint256 planId) external;
}

