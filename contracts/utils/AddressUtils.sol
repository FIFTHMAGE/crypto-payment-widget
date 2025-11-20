// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AddressUtils
 * @dev Utility library for address operations
 */
library AddressUtils {
    /**
     * @dev Returns true if `account` is a contract
     * @param account The address to check
     * @return True if the address is a contract
     */
    function isContract(address account) internal view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(account)
        }
        return size > 0;
    }

    /**
     * @dev Validates that an address is not zero
     * @param addr The address to validate
     * @param errorMessage Custom error message
     */
    function requireNonZero(address addr, string memory errorMessage) internal pure {
        require(addr != address(0), errorMessage);
    }

    /**
     * @dev Validates that an address is not zero (with default message)
     * @param addr The address to validate
     */
    function requireNonZero(address addr) internal pure {
        require(addr != address(0), "AddressUtils: zero address");
    }

    /**
     * @dev Validates that an address is a contract
     * @param addr The address to validate
     * @param errorMessage Custom error message
     */
    function requireContract(address addr, string memory errorMessage) internal view {
        require(isContract(addr), errorMessage);
    }

    /**
     * @dev Validates that an address is a contract (with default message)
     * @param addr The address to validate
     */
    function requireContract(address addr) internal view {
        require(isContract(addr), "AddressUtils: not a contract");
    }

    /**
     * @dev Validates that an address is an EOA (not a contract)
     * @param addr The address to validate
     * @param errorMessage Custom error message
     */
    function requireEOA(address addr, string memory errorMessage) internal view {
        require(!isContract(addr), errorMessage);
    }

    /**
     * @dev Validates that an address is an EOA (with default message)
     * @param addr The address to validate
     */
    function requireEOA(address addr) internal view {
        require(!isContract(addr), "AddressUtils: is a contract");
    }

    /**
     * @dev Converts address to string
     * @param addr The address to convert
     * @return The address as a string
     */
    function toString(address addr) internal pure returns (string memory) {
        bytes memory data = abi.encodePacked(addr);
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(2 + data.length * 2);
        
        str[0] = "0";
        str[1] = "x";
        
        for (uint256 i = 0; i < data.length; i++) {
            str[2 + i * 2] = alphabet[uint8(data[i] >> 4)];
            str[3 + i * 2] = alphabet[uint8(data[i] & 0x0f)];
        }
        
        return string(str);
    }

    /**
     * @dev Compare two addresses
     * @param a First address
     * @param b Second address
     * @return True if addresses are equal
     */
    function isEqual(address a, address b) internal pure returns (bool) {
        return a == b;
    }

    /**
     * @dev Check if address is in an array
     * @param addr The address to check
     * @param array The array to search
     * @return True if address is in array
     */
    function contains(address addr, address[] memory array) internal pure returns (bool) {
        for (uint256 i = 0; i < array.length; i++) {
            if (array[i] == addr) {
                return true;
            }
        }
        return false;
    }

    /**
     * @dev Get index of address in array
     * @param addr The address to find
     * @param array The array to search
     * @return Index of address (returns array.length if not found)
     */
    function indexOf(address addr, address[] memory array) internal pure returns (uint256) {
        for (uint256 i = 0; i < array.length; i++) {
            if (array[i] == addr) {
                return i;
            }
        }
        return array.length;
    }
}

