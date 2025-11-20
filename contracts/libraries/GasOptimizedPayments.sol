// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GasOptimizedPayments
 * @notice Gas-optimized library for payment operations
 * @dev Uses assembly and optimized patterns to reduce gas consumption
 */
library GasOptimizedPayments {
    // Custom errors for gas efficiency
    error TransferFailed();
    error InsufficientBalance();
    error InvalidAmount();
    error InvalidAddress();

    /**
     * @notice Optimized ETH transfer
     * @param to Recipient address
     * @param amount Amount to transfer
     */
    function safeTransferETH(address to, uint256 amount) internal {
        if (to == address(0)) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();
        
        assembly {
            // Check contract balance
            if lt(selfbalance(), amount) {
                mstore(0x00, 0x356680b7) // InsufficientBalance()
                revert(0x1c, 0x04)
            }
            
            // Transfer ETH
            let success := call(gas(), to, amount, 0, 0, 0, 0)
            
            // Revert if transfer failed
            if iszero(success) {
                mstore(0x00, 0x90b8ec18) // TransferFailed()
                revert(0x1c, 0x04)
            }
        }
    }

    /**
     * @notice Batch ETH transfer (gas optimized)
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts
     */
    function batchTransferETH(
        address[] memory recipients,
        uint256[] memory amounts
    ) internal {
        uint256 length = recipients.length;
        
        assembly {
            // Check array lengths match
            if iszero(eq(length, mload(amounts))) {
                revert(0, 0)
            }
            
            // Get initial balance
            let totalRequired := 0
            
            // Calculate total required
            for { let i := 0 } lt(i, length) { i := add(i, 1) } {
                let amount := mload(add(amounts, add(0x20, mul(i, 0x20))))
                totalRequired := add(totalRequired, amount)
            }
            
            // Check sufficient balance
            if lt(selfbalance(), totalRequired) {
                mstore(0x00, 0x356680b7) // InsufficientBalance()
                revert(0x1c, 0x04)
            }
            
            // Execute transfers
            for { let i := 0 } lt(i, length) { i := add(i, 1) } {
                let recipient := mload(add(recipients, add(0x20, mul(i, 0x20))))
                let amount := mload(add(amounts, add(0x20, mul(i, 0x20))))
                
                // Skip zero amounts
                if iszero(amount) {
                    continue
                }
                
                // Check valid address
                if iszero(recipient) {
                    mstore(0x00, 0x5f15d672) // InvalidAddress()
                    revert(0x1c, 0x04)
                }
                
                // Transfer
                let success := call(gas(), recipient, amount, 0, 0, 0, 0)
                if iszero(success) {
                    mstore(0x00, 0x90b8ec18) // TransferFailed()
                    revert(0x1c, 0x04)
                }
            }
        }
    }

    /**
     * @notice Calculate fee with optimized math
     * @param amount Base amount
     * @param feeRate Fee rate in basis points
     * @param denominator Fee denominator
     * @return fee Calculated fee
     */
    function calculateFee(
        uint256 amount,
        uint256 feeRate,
        uint256 denominator
    ) internal pure returns (uint256 fee) {
        assembly {
            // fee = (amount * feeRate) / denominator
            fee := div(mul(amount, feeRate), denominator)
        }
    }

    /**
     * @notice Calculate net amount after fee
     * @param amount Gross amount
     * @param feeRate Fee rate in basis points
     * @param denominator Fee denominator
     * @return netAmount Net amount after fee
     * @return fee Fee amount
     */
    function calculateNetAmount(
        uint256 amount,
        uint256 feeRate,
        uint256 denominator
    ) internal pure returns (uint256 netAmount, uint256 fee) {
        assembly {
            // fee = (amount * feeRate) / denominator
            fee := div(mul(amount, feeRate), denominator)
            // netAmount = amount - fee
            netAmount := sub(amount, fee)
        }
    }

    /**
     * @notice Pack payment data for storage optimization
     * @param amount Payment amount (96 bits)
     * @param timestamp Timestamp (64 bits)
     * @param status Status (8 bits)
     * @return packed Packed data
     */
    function packPaymentData(
        uint96 amount,
        uint64 timestamp,
        uint8 status
    ) internal pure returns (uint256 packed) {
        assembly {
            // Pack: status (8) | timestamp (64) | amount (96)
            packed := or(
                or(
                    shl(168, status),
                    shl(96, timestamp)
                ),
                amount
            )
        }
    }

    /**
     * @notice Unpack payment data
     * @param packed Packed data
     * @return amount Payment amount
     * @return timestamp Timestamp
     * @return status Status
     */
    function unpackPaymentData(uint256 packed) internal pure returns (
        uint96 amount,
        uint64 timestamp,
        uint8 status
    ) {
        assembly {
            amount := and(packed, 0xFFFFFFFFFFFFFFFFFFFFFFFF)
            timestamp := and(shr(96, packed), 0xFFFFFFFFFFFFFFFF)
            status := and(shr(168, packed), 0xFF)
        }
    }

    /**
     * @notice Optimized keccak256 for payment ID generation
     * @param payer Payer address
     * @param payee Payee address
     * @param amount Amount
     * @param nonce Nonce
     * @return id Payment ID
     */
    function generatePaymentId(
        address payer,
        address payee,
        uint256 amount,
        uint256 nonce
    ) internal pure returns (bytes32 id) {
        assembly {
            // Store data in memory
            mstore(0x00, payer)
            mstore(0x20, payee)
            mstore(0x40, amount)
            mstore(0x60, nonce)
            
            // Compute hash
            id := keccak256(0x00, 0x80)
        }
    }

    /**
     * @notice Check if address is contract (gas optimized)
     * @param addr Address to check
     * @return isContract True if contract
     */
    function isContract(address addr) internal view returns (bool isContract) {
        assembly {
            isContract := gt(extcodesize(addr), 0)
        }
    }

    /**
     * @notice Sum array of amounts (gas optimized)
     * @param amounts Array of amounts
     * @return total Total sum
     */
    function sumAmounts(uint256[] memory amounts) internal pure returns (uint256 total) {
        assembly {
            let length := mload(amounts)
            let ptr := add(amounts, 0x20)
            
            for { let i := 0 } lt(i, length) { i := add(i, 1) } {
                total := add(total, mload(ptr))
                ptr := add(ptr, 0x20)
            }
        }
    }

    /**
     * @notice Efficient balance check
     * @param token Token address (address(0) for ETH)
     * @param account Account to check
     * @return balance Account balance
     */
    function getBalance(address token, address account) internal view returns (uint256 balance) {
        if (token == address(0)) {
            assembly {
                balance := balance(account)
            }
        } else {
            assembly {
                // balanceOf(address) selector
                mstore(0x00, 0x70a08231)
                mstore(0x04, account)
                
                // Static call to token
                let success := staticcall(gas(), token, 0x00, 0x24, 0x00, 0x20)
                
                if success {
                    balance := mload(0x00)
                }
            }
        }
    }

    /**
     * @notice Optimized address validation
     * @param addr Address to validate
     * @return valid True if valid (not zero address)
     */
    function isValidAddress(address addr) internal pure returns (bool valid) {
        assembly {
            valid := iszero(iszero(addr))
        }
    }

    /**
     * @notice Optimized min function
     * @param a First value
     * @param b Second value
     * @return min Minimum value
     */
    function min(uint256 a, uint256 b) internal pure returns (uint256 min) {
        assembly {
            min := xor(b, mul(xor(a, b), lt(a, b)))
        }
    }

    /**
     * @notice Optimized max function
     * @param a First value
     * @param b Second value
     * @return max Maximum value
     */
    function max(uint256 a, uint256 b) internal pure returns (uint256 max) {
        assembly {
            max := xor(a, mul(xor(a, b), lt(a, b)))
        }
    }

    /**
     * @notice Efficient percentage calculation
     * @param value Base value
     * @param percentage Percentage (0-10000 for 0-100%)
     * @return result Calculated percentage
     */
    function calculatePercentage(
        uint256 value,
        uint256 percentage
    ) internal pure returns (uint256 result) {
        assembly {
            result := div(mul(value, percentage), 10000)
        }
    }
}

