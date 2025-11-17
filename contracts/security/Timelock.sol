// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Timelock
 * @author Crypto Payment Widget Team
 * @notice Time-delayed execution for sensitive administrative operations
 * @dev Implements a timelock mechanism to ensure critical changes have a delay period
 */
contract Timelock is Ownable {
    uint256 public constant MINIMUM_DELAY = 2 days;
    uint256 public constant MAXIMUM_DELAY = 30 days;
    uint256 public constant GRACE_PERIOD = 14 days;
    
    uint256 public delay;
    mapping(bytes32 => bool) public queuedTransactions;

    event TransactionQueued(
        bytes32 indexed txHash,
        address indexed target,
        uint256 value,
        string signature,
        bytes data,
        uint256 executeTime
    );

    event TransactionExecuted(
        bytes32 indexed txHash,
        address indexed target,
        uint256 value,
        string signature,
        bytes data,
        uint256 executeTime
    );

    event TransactionCancelled(bytes32 indexed txHash);
    event DelayUpdated(uint256 oldDelay, uint256 newDelay);

    error InvalidDelay(uint256 delay);
    error TransactionNotQueued(bytes32 txHash);
    error TransactionAlreadyQueued(bytes32 txHash);
    error TimelockNotMet(uint256 currentTime, uint256 executeTime);
    error TransactionExpired(uint256 currentTime, uint256 expireTime);
    error TransactionExecutionFailed(bytes32 txHash);

    constructor(uint256 delay_) Ownable(msg.sender) {
        if (delay_ < MINIMUM_DELAY || delay_ > MAXIMUM_DELAY) {
            revert InvalidDelay(delay_);
        }
        delay = delay_;
    }

    /**
     * @notice Queue a transaction for execution after the delay period
     * @param target The contract address to call
     * @param value The ETH value to send
     * @param signature The function signature
     * @param data The call data
     * @param executeTime The earliest time the transaction can be executed
     * @return txHash The hash of the queued transaction
     */
    function queueTransaction(
        address target,
        uint256 value,
        string calldata signature,
        bytes calldata data,
        uint256 executeTime
    ) external onlyOwner returns (bytes32) {
        if (executeTime < block.timestamp + delay) {
            revert TimelockNotMet(block.timestamp, executeTime);
        }

        bytes32 txHash = keccak256(abi.encode(target, value, signature, data, executeTime));
        
        if (queuedTransactions[txHash]) {
            revert TransactionAlreadyQueued(txHash);
        }

        queuedTransactions[txHash] = true;
        emit TransactionQueued(txHash, target, value, signature, data, executeTime);
        
        return txHash;
    }

    /**
     * @notice Execute a queued transaction
     * @param target The contract address to call
     * @param value The ETH value to send
     * @param signature The function signature
     * @param data The call data
     * @param executeTime The execution time from when it was queued
     * @return The return data from the executed transaction
     */
    function executeTransaction(
        address target,
        uint256 value,
        string calldata signature,
        bytes calldata data,
        uint256 executeTime
    ) external onlyOwner returns (bytes memory) {
        bytes32 txHash = keccak256(abi.encode(target, value, signature, data, executeTime));
        
        if (!queuedTransactions[txHash]) {
            revert TransactionNotQueued(txHash);
        }

        if (block.timestamp < executeTime) {
            revert TimelockNotMet(block.timestamp, executeTime);
        }

        if (block.timestamp > executeTime + GRACE_PERIOD) {
            revert TransactionExpired(block.timestamp, executeTime + GRACE_PERIOD);
        }

        queuedTransactions[txHash] = false;

        bytes memory callData;
        if (bytes(signature).length == 0) {
            callData = data;
        } else {
            callData = abi.encodePacked(bytes4(keccak256(bytes(signature))), data);
        }

        (bool success, bytes memory returnData) = target.call{value: value}(callData);
        if (!success) {
            revert TransactionExecutionFailed(txHash);
        }

        emit TransactionExecuted(txHash, target, value, signature, data, executeTime);
        return returnData;
    }

    /**
     * @notice Cancel a queued transaction
     * @param target The contract address
     * @param value The ETH value
     * @param signature The function signature
     * @param data The call data
     * @param executeTime The execution time
     */
    function cancelTransaction(
        address target,
        uint256 value,
        string calldata signature,
        bytes calldata data,
        uint256 executeTime
    ) external onlyOwner {
        bytes32 txHash = keccak256(abi.encode(target, value, signature, data, executeTime));
        
        if (!queuedTransactions[txHash]) {
            revert TransactionNotQueued(txHash);
        }

        queuedTransactions[txHash] = false;
        emit TransactionCancelled(txHash);
    }

    /**
     * @notice Update the timelock delay
     * @param newDelay The new delay period
     */
    function setDelay(uint256 newDelay) external onlyOwner {
        if (newDelay < MINIMUM_DELAY || newDelay > MAXIMUM_DELAY) {
            revert InvalidDelay(newDelay);
        }
        
        uint256 oldDelay = delay;
        delay = newDelay;
        emit DelayUpdated(oldDelay, newDelay);
    }

    /**
     * @notice Check if a transaction is queued
     * @param target The contract address
     * @param value The ETH value
     * @param signature The function signature
     * @param data The call data
     * @param executeTime The execution time
     * @return Boolean indicating if transaction is queued
     */
    function isTransactionQueued(
        address target,
        uint256 value,
        string calldata signature,
        bytes calldata data,
        uint256 executeTime
    ) external view returns (bool) {
        bytes32 txHash = keccak256(abi.encode(target, value, signature, data, executeTime));
        return queuedTransactions[txHash];
    }

    receive() external payable {}
}

