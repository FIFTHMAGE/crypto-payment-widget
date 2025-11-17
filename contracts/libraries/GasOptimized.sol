// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GasOptimized
 * @author Crypto Payment Widget Team
 * @notice Library with gas-optimized utility functions
 * @dev Contains patterns for minimizing gas costs in common operations
 */
library GasOptimized {
    /**
     * @notice Efficiently check if an address is in an array
     * @dev Uses unchecked increment and early return
     * @param array The address array to search
     * @param value The address to find
     * @return found Boolean indicating if address was found
     * @return index The index of the address (0 if not found)
     */
    function findAddress(
        address[] memory array,
        address value
    ) internal pure returns (bool found, uint256 index) {
        uint256 length = array.length;
        for (uint256 i = 0; i < length; ) {
            if (array[i] == value) {
                return (true, i);
            }
            unchecked {
                ++i;
            }
        }
        return (false, 0);
    }

    /**
     * @notice Sum an array of uint256 values efficiently
     * @dev Uses unchecked arithmetic for gas savings
     * @param amounts Array of amounts to sum
     * @return total The sum of all amounts
     */
    function sumArray(uint256[] memory amounts) internal pure returns (uint256 total) {
        uint256 length = amounts.length;
        for (uint256 i = 0; i < length; ) {
            unchecked {
                total += amounts[i];
                ++i;
            }
        }
        return total;
    }

    /**
     * @notice Validate multiple addresses are non-zero efficiently
     * @dev Reverts on first zero address found
     * @param addresses Array of addresses to validate
     */
    function validateAddresses(address[] memory addresses) internal pure {
        uint256 length = addresses.length;
        for (uint256 i = 0; i < length; ) {
            require(addresses[i] != address(0), "Zero address");
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice Pack two uint128 values into a single uint256
     * @dev Useful for storage optimization
     * @param a First uint128 value
     * @param b Second uint128 value
     * @return packed The packed uint256 value
     */
    function pack(uint128 a, uint128 b) internal pure returns (uint256 packed) {
        packed = (uint256(a) << 128) | uint256(b);
    }

    /**
     * @notice Unpack a uint256 into two uint128 values
     * @dev Reverses the pack operation
     * @param packed The packed uint256 value
     * @return a First uint128 value
     * @return b Second uint128 value
     */
    function unpack(uint256 packed) internal pure returns (uint128 a, uint128 b) {
        a = uint128(packed >> 128);
        b = uint128(packed);
    }

    /**
     * @notice Calculate percentage with basis points efficiently
     * @dev Uses 10000 as denominator (1 bp = 0.01%)
     * @param amount The base amount
     * @param basisPoints The percentage in basis points
     * @return result The calculated percentage
     */
    function calculateBasisPoints(
        uint256 amount,
        uint256 basisPoints
    ) internal pure returns (uint256 result) {
        unchecked {
            result = (amount * basisPoints) / 10000;
        }
    }

    /**
     * @notice Batch transfer validation
     * @dev Validates arrays have same length and non-zero values
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts
     */
    function validateBatchTransfer(
        address[] memory recipients,
        uint256[] memory amounts
    ) internal pure {
        uint256 length = recipients.length;
        require(length == amounts.length, "Length mismatch");
        require(length > 0, "Empty arrays");

        for (uint256 i = 0; i < length; ) {
            require(recipients[i] != address(0), "Zero recipient");
            require(amounts[i] > 0, "Zero amount");
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice Efficient modulo operation for power of 2
     * @dev Uses bitwise AND instead of modulo
     * @param value The value to get modulo of
     * @param powerOfTwo The modulus (must be power of 2)
     * @return result value % powerOfTwo
     */
    function fastModulo(uint256 value, uint256 powerOfTwo) internal pure returns (uint256 result) {
        unchecked {
            result = value & (powerOfTwo - 1);
        }
    }

    /**
     * @notice Check if value is power of 2
     * @param value The value to check
     * @return Boolean indicating if value is power of 2
     */
    function isPowerOfTwo(uint256 value) internal pure returns (bool) {
        return value != 0 && (value & (value - 1)) == 0;
    }

    /**
     * @notice Calculate minimum of two uint256 values
     * @param a First value
     * @param b Second value
     * @return Minimum value
     */
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    /**
     * @notice Calculate maximum of two uint256 values
     * @param a First value
     * @param b Second value
     * @return Maximum value
     */
    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a > b ? a : b;
    }

    /**
     * @notice Clamp a value between min and max
     * @param value The value to clamp
     * @param minValue Minimum allowed value
     * @param maxValue Maximum allowed value
     * @return Clamped value
     */
    function clamp(
        uint256 value,
        uint256 minValue,
        uint256 maxValue
    ) internal pure returns (uint256) {
        return min(max(value, minValue), maxValue);
    }
}

