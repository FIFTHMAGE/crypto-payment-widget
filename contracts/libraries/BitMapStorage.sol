// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BitMapStorage
 * @notice Gas-efficient bitmap storage for flags and states
 * @dev Uses bitwise operations for minimal storage costs
 */
library BitMapStorage {
    struct BitMap {
        mapping(uint256 => uint256) data;
    }

    /**
     * @notice Set a bit to true
     * @param bitmap The bitmap storage
     * @param index The bit index to set
     */
    function set(BitMap storage bitmap, uint256 index) internal {
        uint256 bucket = index / 256;
        uint256 position = index % 256;
        bitmap.data[bucket] |= (1 << position);
    }

    /**
     * @notice Set a bit to false
     * @param bitmap The bitmap storage
     * @param index The bit index to unset
     */
    function unset(BitMap storage bitmap, uint256 index) internal {
        uint256 bucket = index / 256;
        uint256 position = index % 256;
        bitmap.data[bucket] &= ~(1 << position);
    }

    /**
     * @notice Toggle a bit
     * @param bitmap The bitmap storage
     * @param index The bit index to toggle
     */
    function toggle(BitMap storage bitmap, uint256 index) internal {
        uint256 bucket = index / 256;
        uint256 position = index % 256;
        bitmap.data[bucket] ^= (1 << position);
    }

    /**
     * @notice Check if a bit is set
     * @param bitmap The bitmap storage
     * @param index The bit index to check
     * @return bool True if bit is set
     */
    function get(BitMap storage bitmap, uint256 index) internal view returns (bool) {
        uint256 bucket = index / 256;
        uint256 position = index % 256;
        return (bitmap.data[bucket] & (1 << position)) != 0;
    }

    /**
     * @notice Set multiple bits at once
     * @param bitmap The bitmap storage
     * @param indices Array of indices to set
     */
    function setMultiple(BitMap storage bitmap, uint256[] memory indices) internal {
        for (uint256 i = 0; i < indices.length; i++) {
            set(bitmap, indices[i]);
        }
    }

    /**
     * @notice Unset multiple bits at once
     * @param bitmap The bitmap storage
     * @param indices Array of indices to unset
     */
    function unsetMultiple(BitMap storage bitmap, uint256[] memory indices) internal {
        for (uint256 i = 0; i < indices.length; i++) {
            unset(bitmap, indices[i]);
        }
    }

    /**
     * @notice Set a range of bits
     * @param bitmap The bitmap storage
     * @param start Start index (inclusive)
     * @param end End index (exclusive)
     */
    function setRange(BitMap storage bitmap, uint256 start, uint256 end) internal {
        for (uint256 i = start; i < end; i++) {
            set(bitmap, i);
        }
    }

    /**
     * @notice Unset a range of bits
     * @param bitmap The bitmap storage
     * @param start Start index (inclusive)
     * @param end End index (exclusive)
     */
    function unsetRange(BitMap storage bitmap, uint256 start, uint256 end) internal {
        for (uint256 i = start; i < end; i++) {
            unset(bitmap, i);
        }
    }

    /**
     * @notice Count set bits in a bucket
     * @param bitmap The bitmap storage
     * @param bucket The bucket index
     * @return count Number of set bits
     */
    function popCount(BitMap storage bitmap, uint256 bucket) internal view returns (uint256 count) {
        uint256 value = bitmap.data[bucket];
        
        assembly {
            // Brian Kernighan's algorithm
            for { } gt(value, 0) { } {
                value := and(value, sub(value, 1))
                count := add(count, 1)
            }
        }
    }

    /**
     * @notice Find first set bit starting from index
     * @param bitmap The bitmap storage
     * @param startIndex Start searching from this index
     * @param maxIndex Maximum index to search
     * @return found True if found
     * @return index Index of first set bit
     */
    function findFirstSet(
        BitMap storage bitmap,
        uint256 startIndex,
        uint256 maxIndex
    ) internal view returns (bool found, uint256 index) {
        for (uint256 i = startIndex; i <= maxIndex; i++) {
            if (get(bitmap, i)) {
                return (true, i);
            }
        }
        return (false, 0);
    }

    /**
     * @notice Find first unset bit starting from index
     * @param bitmap The bitmap storage
     * @param startIndex Start searching from this index
     * @param maxIndex Maximum index to search
     * @return found True if found
     * @return index Index of first unset bit
     */
    function findFirstUnset(
        BitMap storage bitmap,
        uint256 startIndex,
        uint256 maxIndex
    ) internal view returns (bool found, uint256 index) {
        for (uint256 i = startIndex; i <= maxIndex; i++) {
            if (!get(bitmap, i)) {
                return (true, i);
            }
        }
        return (false, 0);
    }

    /**
     * @notice Check if all bits in range are set
     * @param bitmap The bitmap storage
     * @param start Start index (inclusive)
     * @param end End index (exclusive)
     * @return bool True if all bits are set
     */
    function allSet(BitMap storage bitmap, uint256 start, uint256 end) internal view returns (bool) {
        for (uint256 i = start; i < end; i++) {
            if (!get(bitmap, i)) {
                return false;
            }
        }
        return true;
    }

    /**
     * @notice Check if any bit in range is set
     * @param bitmap The bitmap storage
     * @param start Start index (inclusive)
     * @param end End index (exclusive)
     * @return bool True if any bit is set
     */
    function anySet(BitMap storage bitmap, uint256 start, uint256 end) internal view returns (bool) {
        for (uint256 i = start; i < end; i++) {
            if (get(bitmap, i)) {
                return true;
            }
        }
        return false;
    }

    /**
     * @notice Clear entire bucket
     * @param bitmap The bitmap storage
     * @param bucket The bucket index to clear
     */
    function clearBucket(BitMap storage bitmap, uint256 bucket) internal {
        delete bitmap.data[bucket];
    }

    /**
     * @notice Get raw bucket data
     * @param bitmap The bitmap storage
     * @param bucket The bucket index
     * @return uint256 Raw bucket value
     */
    function getBucket(BitMap storage bitmap, uint256 bucket) internal view returns (uint256) {
        return bitmap.data[bucket];
    }

    /**
     * @notice Set raw bucket data
     * @param bitmap The bitmap storage
     * @param bucket The bucket index
     * @param value New bucket value
     */
    function setBucket(BitMap storage bitmap, uint256 bucket, uint256 value) internal {
        bitmap.data[bucket] = value;
    }

    /**
     * @notice Perform bitwise AND between two buckets
     * @param bitmap The bitmap storage
     * @param bucket1 First bucket index
     * @param bucket2 Second bucket index
     * @return uint256 Result of AND operation
     */
    function andBuckets(
        BitMap storage bitmap,
        uint256 bucket1,
        uint256 bucket2
    ) internal view returns (uint256) {
        return bitmap.data[bucket1] & bitmap.data[bucket2];
    }

    /**
     * @notice Perform bitwise OR between two buckets
     * @param bitmap The bitmap storage
     * @param bucket1 First bucket index
     * @param bucket2 Second bucket index
     * @return uint256 Result of OR operation
     */
    function orBuckets(
        BitMap storage bitmap,
        uint256 bucket1,
        uint256 bucket2
    ) internal view returns (uint256) {
        return bitmap.data[bucket1] | bitmap.data[bucket2];
    }

    /**
     * @notice Perform bitwise XOR between two buckets
     * @param bitmap The bitmap storage
     * @param bucket1 First bucket index
     * @param bucket2 Second bucket index
     * @return uint256 Result of XOR operation
     */
    function xorBuckets(
        BitMap storage bitmap,
        uint256 bucket1,
        uint256 bucket2
    ) internal view returns (uint256) {
        return bitmap.data[bucket1] ^ bitmap.data[bucket2];
    }
}

