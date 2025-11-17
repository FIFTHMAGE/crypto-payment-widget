// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MultiSigAdmin
 * @author Crypto Payment Widget Team
 * @notice Multi-signature control for administrative operations
 * @dev Requires multiple confirmations for sensitive operations
 */
contract MultiSigAdmin {
    uint256 public requiredConfirmations;
    uint256 public transactionCount;
    
    address[] public admins;
    mapping(address => bool) public isAdmin;
    mapping(uint256 => Transaction) public transactions;
    mapping(uint256 => mapping(address => bool)) public confirmations;

    struct Transaction {
        address target;
        uint256 value;
        bytes data;
        bool executed;
        uint256 confirmationCount;
        uint256 createdAt;
    }

    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    event TransactionSubmitted(uint256 indexed txIndex, address indexed submitter);
    event TransactionConfirmed(uint256 indexed txIndex, address indexed admin);
    event TransactionRevoked(uint256 indexed txIndex, address indexed admin);
    event TransactionExecuted(uint256 indexed txIndex, address indexed executor);
    event RequirementChanged(uint256 oldRequirement, uint256 newRequirement);

    error NotAdmin(address caller);
    error InvalidRequirement(uint256 requirement, uint256 adminCount);
    error TransactionNotExists(uint256 txIndex);
    error TransactionAlreadyExecuted(uint256 txIndex);
    error TransactionAlreadyConfirmed(uint256 txIndex);
    error TransactionNotConfirmed(uint256 txIndex);
    error InsufficientConfirmations(uint256 current, uint256 required);
    error TransactionExecutionFailed();
    error AdminAlreadyExists(address admin);
    error AdminNotFound(address admin);
    error ZeroAddress();

    modifier onlyAdmin() {
        if (!isAdmin[msg.sender]) {
            revert NotAdmin(msg.sender);
        }
        _;
    }

    modifier txExists(uint256 txIndex) {
        if (txIndex >= transactionCount) {
            revert TransactionNotExists(txIndex);
        }
        _;
    }

    modifier notExecuted(uint256 txIndex) {
        if (transactions[txIndex].executed) {
            revert TransactionAlreadyExecuted(txIndex);
        }
        _;
    }

    modifier notConfirmed(uint256 txIndex) {
        if (confirmations[txIndex][msg.sender]) {
            revert TransactionAlreadyConfirmed(txIndex);
        }
        _;
    }

    constructor(address[] memory admins_, uint256 requiredConfirmations_) {
        if (admins_.length == 0) {
            revert InvalidRequirement(0, 0);
        }
        if (requiredConfirmations_ == 0 || requiredConfirmations_ > admins_.length) {
            revert InvalidRequirement(requiredConfirmations_, admins_.length);
        }

        for (uint256 i = 0; i < admins_.length; i++) {
            address admin = admins_[i];
            if (admin == address(0)) {
                revert ZeroAddress();
            }
            if (isAdmin[admin]) {
                revert AdminAlreadyExists(admin);
            }

            isAdmin[admin] = true;
            admins.push(admin);
            emit AdminAdded(admin);
        }

        requiredConfirmations = requiredConfirmations_;
    }

    /**
     * @notice Submit a new transaction for approval
     * @param target The target contract address
     * @param value The ETH value to send
     * @param data The call data
     * @return txIndex The transaction index
     */
    function submitTransaction(
        address target,
        uint256 value,
        bytes calldata data
    ) external onlyAdmin returns (uint256 txIndex) {
        txIndex = transactionCount;
        transactions[txIndex] = Transaction({
            target: target,
            value: value,
            data: data,
            executed: false,
            confirmationCount: 0,
            createdAt: block.timestamp
        });

        transactionCount++;
        emit TransactionSubmitted(txIndex, msg.sender);
        
        return txIndex;
    }

    /**
     * @notice Confirm a pending transaction
     * @param txIndex The transaction index
     */
    function confirmTransaction(uint256 txIndex)
        external
        onlyAdmin
        txExists(txIndex)
        notExecuted(txIndex)
        notConfirmed(txIndex)
    {
        confirmations[txIndex][msg.sender] = true;
        transactions[txIndex].confirmationCount++;
        emit TransactionConfirmed(txIndex, msg.sender);
    }

    /**
     * @notice Execute a confirmed transaction
     * @param txIndex The transaction index
     */
    function executeTransaction(uint256 txIndex)
        external
        onlyAdmin
        txExists(txIndex)
        notExecuted(txIndex)
    {
        Transaction storage transaction = transactions[txIndex];
        
        if (transaction.confirmationCount < requiredConfirmations) {
            revert InsufficientConfirmations(
                transaction.confirmationCount,
                requiredConfirmations
            );
        }

        transaction.executed = true;
        (bool success, ) = transaction.target.call{value: transaction.value}(transaction.data);
        
        if (!success) {
            revert TransactionExecutionFailed();
        }

        emit TransactionExecuted(txIndex, msg.sender);
    }

    /**
     * @notice Revoke confirmation for a transaction
     * @param txIndex The transaction index
     */
    function revokeConfirmation(uint256 txIndex)
        external
        onlyAdmin
        txExists(txIndex)
        notExecuted(txIndex)
    {
        if (!confirmations[txIndex][msg.sender]) {
            revert TransactionNotConfirmed(txIndex);
        }

        confirmations[txIndex][msg.sender] = false;
        transactions[txIndex].confirmationCount--;
        emit TransactionRevoked(txIndex, msg.sender);
    }

    /**
     * @notice Get transaction details
     * @param txIndex The transaction index
     * @return Transaction details
     */
    function getTransaction(uint256 txIndex)
        external
        view
        txExists(txIndex)
        returns (
            address target,
            uint256 value,
            bytes memory data,
            bool executed,
            uint256 confirmationCount,
            uint256 createdAt
        )
    {
        Transaction memory transaction = transactions[txIndex];
        return (
            transaction.target,
            transaction.value,
            transaction.data,
            transaction.executed,
            transaction.confirmationCount,
            transaction.createdAt
        );
    }

    /**
     * @notice Get list of admins
     * @return Array of admin addresses
     */
    function getAdmins() external view returns (address[] memory) {
        return admins;
    }

    /**
     * @notice Check if transaction is confirmed by an admin
     * @param txIndex The transaction index
     * @param admin The admin address
     * @return Boolean indicating confirmation status
     */
    function isConfirmed(uint256 txIndex, address admin) external view returns (bool) {
        return confirmations[txIndex][admin];
    }

    /**
     * @notice Get confirmation count for a transaction
     * @param txIndex The transaction index
     * @return Number of confirmations
     */
    function getConfirmationCount(uint256 txIndex) external view returns (uint256) {
        return transactions[txIndex].confirmationCount;
    }

    receive() external payable {}
}

