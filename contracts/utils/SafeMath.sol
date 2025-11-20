// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SafeMath
 * @dev Additional math operations with overflow checks (for specific use cases)
 * @notice Solidity 0.8+ has built-in overflow checks, but this library provides
 * additional utility functions for percentage calculations and safe operations
 */
library SafeMath {
    /**
     * @dev Calculate percentage of a value
     * @param value The base value
     * @param percentage The percentage (in basis points, where 10000 = 100%)
     * @return The calculated percentage amount
     */
    function percentage(uint256 value, uint256 percentage) internal pure returns (uint256) {
        require(percentage <= 10000, "SafeMath: percentage exceeds 100%");
        return (value * percentage) / 10000;
    }

    /**
     * @dev Calculate percentage with rounding up
     * @param value The base value
     * @param percentage The percentage (in basis points)
     * @return The calculated percentage amount (rounded up)
     */
    function percentageRoundUp(uint256 value, uint256 percentage) internal pure returns (uint256) {
        require(percentage <= 10000, "SafeMath: percentage exceeds 100%");
        uint256 result = (value * percentage) / 10000;
        if ((value * percentage) % 10000 > 0) {
            result += 1;
        }
        return result;
    }

    /**
     * @dev Safe division that returns 0 if divisor is 0
     * @param a Numerator
     * @param b Denominator
     * @return Result of division or 0 if b is 0
     */
    function divSafe(uint256 a, uint256 b) internal pure returns (uint256) {
        if (b == 0) {
            return 0;
        }
        return a / b;
    }

    /**
     * @dev Calculate average of two numbers
     * @param a First number
     * @param b Second number
     * @return Average of the two numbers
     */
    function average(uint256 a, uint256 b) internal pure returns (uint256) {
        return (a & b) + ((a ^ b) / 2);
    }

    /**
     * @dev Returns the ceiling of the division of two numbers
     * @param a Numerator
     * @param b Denominator
     * @return Ceiling of a/b
     */
    function ceilDiv(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b > 0, "SafeMath: division by zero");
        return a == 0 ? 0 : ((a - 1) / b) + 1;
    }

    /**
     * @dev Returns the minimum of two numbers
     */
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    /**
     * @dev Returns the maximum of two numbers
     */
    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a > b ? a : b;
    }

    /**
     * @dev Clamp a value between min and max
     */
    function clamp(uint256 value, uint256 minValue, uint256 maxValue) internal pure returns (uint256) {
        return min(max(value, minValue), maxValue);
    }

    /**
     * @dev Calculate compound interest
     * @param principal Principal amount
     * @param rate Interest rate (in basis points)
     * @param periods Number of compounding periods
     * @return Final amount after compound interest
     */
    function compoundInterest(
        uint256 principal,
        uint256 rate,
        uint256 periods
    ) internal pure returns (uint256) {
        uint256 result = principal;
        for (uint256 i = 0; i < periods; i++) {
            result = result + percentage(result, rate);
        }
        return result;
    }

    /**
     * @dev Calculate simple interest
     * @param principal Principal amount
     * @param rate Interest rate (in basis points)
     * @param periods Number of periods
     * @return Interest amount
     */
    function simpleInterest(
        uint256 principal,
        uint256 rate,
        uint256 periods
    ) internal pure returns (uint256) {
        return percentage(principal, rate) * periods;
    }
}

