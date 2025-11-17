// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title OverflowProtection
 * @notice Safe math operations with overflow checks
 */
library OverflowProtection {
    error AdditionOverflow();
    error SubtractionUnderflow();
    error MultiplicationOverflow();
    
    function safeAdd(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        if (c < a) revert AdditionOverflow();
        return c;
    }

    function safeSub(uint256 a, uint256 b) internal pure returns (uint256) {
        if (b > a) revert SubtractionUnderflow();
        return a - b;
    }

    function safeMul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) return 0;
        uint256 c = a * b;
        if (c / a != b) revert MultiplicationOverflow();
        return c;
    }
}

