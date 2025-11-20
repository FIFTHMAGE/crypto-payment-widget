// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ISubscription
 * @dev Interface for subscription payment operations
 */
interface ISubscription {
    struct Subscription {
        bytes32 id;
        address subscriber;
        address merchant;
        uint256 amount;
        address token;
        uint256 interval;
        uint256 lastChargeTime;
        uint256 nextChargeTime;
        uint256 chargeCount;
        SubscriptionStatus status;
    }

    enum SubscriptionStatus {
        ACTIVE,
        PAUSED,
        CANCELLED,
        EXPIRED
    }

    /**
     * @dev Create a subscription
     * @param merchant Merchant address
     * @param amount Subscription amount per period
     * @param token Token address (address(0) for ETH)
     * @param interval Billing interval in seconds
     * @return subscriptionId Unique subscription identifier
     */
    function createSubscription(
        address merchant,
        uint256 amount,
        address token,
        uint256 interval
    ) external payable returns (bytes32 subscriptionId);

    /**
     * @dev Charge subscription
     * @param subscriptionId Subscription identifier
     */
    function chargeSubscription(bytes32 subscriptionId) external;

    /**
     * @dev Cancel subscription
     * @param subscriptionId Subscription identifier
     */
    function cancelSubscription(bytes32 subscriptionId) external;

    /**
     * @dev Pause subscription
     * @param subscriptionId Subscription identifier
     */
    function pauseSubscription(bytes32 subscriptionId) external;

    /**
     * @dev Resume subscription
     * @param subscriptionId Subscription identifier
     */
    function resumeSubscription(bytes32 subscriptionId) external;

    /**
     * @dev Get subscription details
     * @param subscriptionId Subscription identifier
     * @return subscription Subscription details
     */
    function getSubscription(bytes32 subscriptionId) external view returns (Subscription memory subscription);

    /**
     * @dev Check if subscription can be charged
     * @param subscriptionId Subscription identifier
     * @return canCharge True if can be charged
     */
    function canChargeSubscription(bytes32 subscriptionId) external view returns (bool canCharge);

    /**
     * @dev Get subscriber's subscriptions
     * @param subscriber Subscriber address
     * @return subscriptionIds Array of subscription identifiers
     */
    function getSubscriberSubscriptions(address subscriber) external view returns (bytes32[] memory subscriptionIds);

    // Events
    event SubscriptionCreated(
        bytes32 indexed subscriptionId,
        address indexed subscriber,
        address indexed merchant,
        uint256 amount,
        address token,
        uint256 interval
    );

    event SubscriptionCharged(
        bytes32 indexed subscriptionId,
        address indexed subscriber,
        uint256 amount,
        uint256 chargeNumber
    );

    event SubscriptionCancelled(
        bytes32 indexed subscriptionId,
        address indexed subscriber
    );

    event SubscriptionPaused(
        bytes32 indexed subscriptionId,
        address indexed subscriber
    );

    event SubscriptionResumed(
        bytes32 indexed subscriptionId,
        address indexed subscriber
    );
}

