// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RateLimiter
 * @notice Rate limiting for payment operations
 */
contract RateLimiter {
    struct RateLimit {
        uint256 amount;
        uint256 windowStart;
        uint256 maxAmount;
        uint256 windowDuration;
    }

    mapping(address => RateLimit) public limits;
    uint256 public globalMaxAmount = 100 ether;
    uint256 public globalWindow = 1 days;

    error RateLimitExceeded(address account, uint256 requested, uint256 available);

    function checkAndUpdateLimit(address account, uint256 amount) internal {
        RateLimit storage limit = limits[account];
        
        if (block.timestamp >= limit.windowStart + globalWindow) {
            limit.amount = 0;
            limit.windowStart = block.timestamp;
        }

        if (limit.amount + amount > globalMaxAmount) {
            revert RateLimitExceeded(account, amount, globalMaxAmount - limit.amount);
        }

        limit.amount += amount;
    }

    function getRemainingLimit(address account) external view returns (uint256) {
        RateLimit storage limit = limits[account];
        
        if (block.timestamp >= limit.windowStart + globalWindow) {
            return globalMaxAmount;
        }

        return globalMaxAmount > limit.amount ? globalMaxAmount - limit.amount : 0;
    }
}

