// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PaymentAnalytics
 * @notice Payment analytics tracking
 */
contract PaymentAnalytics {
    struct Analytics {
        uint256 totalVolume;
        uint256 transactionCount;
        uint256 uniqueUsers;
        uint256 averageAmount;
    }

    mapping(address => Analytics) public tokenAnalytics;
    mapping(address => uint256) public userTransactionCount;

    function recordPayment(address token, address user, uint256 amount) external {
        Analytics storage stats = tokenAnalytics[token];
        
        if (userTransactionCount[user] == 0) {
            stats.uniqueUsers++;
        }
        
        stats.totalVolume += amount;
        stats.transactionCount++;
        stats.averageAmount = stats.totalVolume / stats.transactionCount;
        
        userTransactionCount[user]++;
    }

    function getAnalytics(address token) external view returns (Analytics memory) {
        return tokenAnalytics[token];
    }
}

