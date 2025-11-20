// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./EnhancedAccessControl.sol";
import "./SecurityErrors.sol";

/**
 * @title ContractRateLimiter
 * @notice On-chain rate limiting for payments and operations
 * @dev Implements per-user, global, and transaction-based rate limits
 */
abstract contract ContractRateLimiter is EnhancedAccessControl {
    struct RateLimitConfig {
        uint256 maxPerUser;        // Max amount per user in time window
        uint256 maxGlobal;         // Max total amount in time window
        uint256 maxPerTransaction; // Max amount per single transaction
        uint256 maxTransactions;   // Max transactions per user in time window
        uint256 timeWindow;        // Time window in seconds
    }

    struct UserLimitData {
        uint256 amount;
        uint256 transactionCount;
        uint256 lastResetTime;
    }

    struct GlobalLimitData {
        uint256 totalAmount;
        uint256 totalTransactions;
        uint256 lastResetTime;
    }

    RateLimitConfig public rateLimits;
    GlobalLimitData public globalLimits;
    
    mapping(address => UserLimitData) public userLimits;
    mapping(address => bool) public whitelistedAddresses;
    
    bool public rateLimitingEnabled;

    event RateLimitConfigured(
        uint256 maxPerUser,
        uint256 maxGlobal,
        uint256 maxPerTransaction,
        uint256 maxTransactions,
        uint256 timeWindow
    );
    event RateLimitExceeded(address indexed user, uint256 amount, uint256 limit, string limitType);
    event AddressWhitelisted(address indexed addr, bool whitelisted);
    event RateLimitingToggled(bool enabled);
    event LimitsReset(address indexed user);

    modifier checkRateLimit(address user, uint256 amount) {
        if (rateLimitingEnabled && !whitelistedAddresses[user]) {
            _checkAndUpdateLimits(user, amount);
        }
        _;
    }

    constructor() {
        rateLimitingEnabled = true;
        
        rateLimits = RateLimitConfig({
            maxPerUser: 100 ether,
            maxGlobal: 1000 ether,
            maxPerTransaction: 10 ether,
            maxTransactions: 10,
            timeWindow: 1 hours
        });

        globalLimits.lastResetTime = block.timestamp;
    }

    /**
     * @notice Configure rate limits
     * @param maxPerUser Max amount per user in time window
     * @param maxGlobal Max total amount in time window
     * @param maxPerTransaction Max amount per transaction
     * @param maxTransactions Max transactions per user in time window
     * @param timeWindow Time window in seconds
     */
    function configureRateLimits(
        uint256 maxPerUser,
        uint256 maxGlobal,
        uint256 maxPerTransaction,
        uint256 maxTransactions,
        uint256 timeWindow
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (maxPerUser == 0 || maxGlobal == 0 || maxPerTransaction == 0) {
            revert SecurityErrors.InvalidAmount(0);
        }
        if (maxPerTransaction > maxPerUser) {
            revert SecurityErrors.AmountTooHigh(maxPerTransaction, maxPerUser);
        }
        if (timeWindow == 0) revert SecurityErrors.InvalidAmount(timeWindow);

        rateLimits.maxPerUser = maxPerUser;
        rateLimits.maxGlobal = maxGlobal;
        rateLimits.maxPerTransaction = maxPerTransaction;
        rateLimits.maxTransactions = maxTransactions;
        rateLimits.timeWindow = timeWindow;

        emit RateLimitConfigured(maxPerUser, maxGlobal, maxPerTransaction, maxTransactions, timeWindow);
    }

    /**
     * @notice Whitelist or blacklist an address from rate limiting
     * @param addr Address to whitelist
     * @param whitelisted True to whitelist, false to remove
     */
    function setWhitelisted(address addr, bool whitelisted) external onlyRole(OPERATOR_ROLE) {
        if (addr == address(0)) revert SecurityErrors.ZeroAddress();
        whitelistedAddresses[addr] = whitelisted;
        emit AddressWhitelisted(addr, whitelisted);
    }

    /**
     * @notice Batch whitelist addresses
     * @param addresses Array of addresses to whitelist
     * @param whitelisted True to whitelist, false to remove
     */
    function batchSetWhitelisted(address[] calldata addresses, bool whitelisted) external onlyRole(OPERATOR_ROLE) {
        for (uint256 i = 0; i < addresses.length; i++) {
            if (addresses[i] == address(0)) revert SecurityErrors.ZeroAddress();
            whitelistedAddresses[addresses[i]] = whitelisted;
            emit AddressWhitelisted(addresses[i], whitelisted);
        }
    }

    /**
     * @notice Enable or disable rate limiting
     * @param enabled True to enable, false to disable
     */
    function setRateLimitingEnabled(bool enabled) external onlyRole(DEFAULT_ADMIN_ROLE) {
        rateLimitingEnabled = enabled;
        emit RateLimitingToggled(enabled);
    }

    /**
     * @notice Reset user limits (emergency use)
     * @param user User address to reset
     */
    function resetUserLimits(address user) external onlyRole(OPERATOR_ROLE) {
        delete userLimits[user];
        emit LimitsReset(user);
    }

    /**
     * @notice Reset global limits (emergency use)
     */
    function resetGlobalLimits() external onlyRole(DEFAULT_ADMIN_ROLE) {
        globalLimits.totalAmount = 0;
        globalLimits.totalTransactions = 0;
        globalLimits.lastResetTime = block.timestamp;
    }

    /**
     * @notice Get user's current limit usage
     * @param user User address
     * @return amount Amount used in current window
     * @return transactionCount Transactions in current window
     * @return remainingAmount Remaining amount available
     * @return remainingTransactions Remaining transactions available
     */
    function getUserLimitUsage(address user) external view returns (
        uint256 amount,
        uint256 transactionCount,
        uint256 remainingAmount,
        uint256 remainingTransactions
    ) {
        UserLimitData memory userData = userLimits[user];
        
        // Check if window expired
        if (block.timestamp > userData.lastResetTime + rateLimits.timeWindow) {
            return (0, 0, rateLimits.maxPerUser, rateLimits.maxTransactions);
        }

        remainingAmount = userData.amount < rateLimits.maxPerUser ? 
            rateLimits.maxPerUser - userData.amount : 0;
        
        remainingTransactions = userData.transactionCount < rateLimits.maxTransactions ?
            rateLimits.maxTransactions - userData.transactionCount : 0;

        return (userData.amount, userData.transactionCount, remainingAmount, remainingTransactions);
    }

    /**
     * @notice Get global limit usage
     * @return totalAmount Total amount used in current window
     * @return totalTransactions Total transactions in current window
     * @return remainingAmount Remaining global amount available
     */
    function getGlobalLimitUsage() external view returns (
        uint256 totalAmount,
        uint256 totalTransactions,
        uint256 remainingAmount
    ) {
        // Check if window expired
        if (block.timestamp > globalLimits.lastResetTime + rateLimits.timeWindow) {
            return (0, 0, rateLimits.maxGlobal);
        }

        remainingAmount = globalLimits.totalAmount < rateLimits.maxGlobal ?
            rateLimits.maxGlobal - globalLimits.totalAmount : 0;

        return (globalLimits.totalAmount, globalLimits.totalTransactions, remainingAmount);
    }

    /**
     * @notice Check if a transaction would exceed limits
     * @param user User address
     * @param amount Transaction amount
     * @return bool True if within limits
     */
    function isWithinLimits(address user, uint256 amount) public view returns (bool) {
        if (!rateLimitingEnabled || whitelistedAddresses[user]) {
            return true;
        }

        // Per-transaction limit
        if (amount > rateLimits.maxPerTransaction) {
            return false;
        }

        // User limits
        UserLimitData memory userData = userLimits[user];
        if (block.timestamp <= userData.lastResetTime + rateLimits.timeWindow) {
            if (userData.amount + amount > rateLimits.maxPerUser) {
                return false;
            }
            if (userData.transactionCount + 1 > rateLimits.maxTransactions) {
                return false;
            }
        }

        // Global limits
        if (block.timestamp <= globalLimits.lastResetTime + rateLimits.timeWindow) {
            if (globalLimits.totalAmount + amount > rateLimits.maxGlobal) {
                return false;
            }
        }

        return true;
    }

    /**
     * @dev Internal function to check and update limits
     */
    function _checkAndUpdateLimits(address user, uint256 amount) internal {
        // Per-transaction limit
        if (amount > rateLimits.maxPerTransaction) {
            emit RateLimitExceeded(user, amount, rateLimits.maxPerTransaction, "transaction");
            revert SecurityErrors.TransactionLimitExceeded(amount, rateLimits.maxPerTransaction);
        }

        // Update or reset user limits
        UserLimitData storage userData = userLimits[user];
        if (block.timestamp > userData.lastResetTime + rateLimits.timeWindow) {
            userData.amount = 0;
            userData.transactionCount = 0;
            userData.lastResetTime = block.timestamp;
        }

        // Check user limits
        if (userData.amount + amount > rateLimits.maxPerUser) {
            emit RateLimitExceeded(user, userData.amount + amount, rateLimits.maxPerUser, "user");
            revert SecurityErrors.DailyLimitExceeded(userData.amount + amount, rateLimits.maxPerUser);
        }

        if (userData.transactionCount + 1 > rateLimits.maxTransactions) {
            emit RateLimitExceeded(user, userData.transactionCount + 1, rateLimits.maxTransactions, "transaction_count");
            revert SecurityErrors.RateLimitExceeded(user, rateLimits.maxTransactions);
        }

        // Update user limits
        userData.amount += amount;
        userData.transactionCount++;

        // Update or reset global limits
        if (block.timestamp > globalLimits.lastResetTime + rateLimits.timeWindow) {
            globalLimits.totalAmount = 0;
            globalLimits.totalTransactions = 0;
            globalLimits.lastResetTime = block.timestamp;
        }

        // Check global limits
        if (globalLimits.totalAmount + amount > rateLimits.maxGlobal) {
            emit RateLimitExceeded(user, globalLimits.totalAmount + amount, rateLimits.maxGlobal, "global");
            revert SecurityErrors.DailyLimitExceeded(globalLimits.totalAmount + amount, rateLimits.maxGlobal);
        }

        // Update global limits
        globalLimits.totalAmount += amount;
        globalLimits.totalTransactions++;
    }
}

