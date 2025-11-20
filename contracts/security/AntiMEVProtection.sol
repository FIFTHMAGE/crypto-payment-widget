// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SecurityErrors.sol";

/**
 * @title AntiMEVProtection  
 * @notice Protection against MEV (Maximal Extractable Value) and front-running attacks
 * @dev Implements commit-reveal scheme and transaction ordering protection
 */
abstract contract AntiMEVProtection {
    struct Commitment {
        bytes32 commitHash;
        uint256 commitBlock;
        uint256 revealDeadline;
        bool revealed;
        bool executed;
    }

    struct TransactionIntent {
        address user;
        bytes32 intentHash;
        uint256 minBlock;
        uint256 maxBlock;
        uint256 createdAt;
        bool executed;
    }

    mapping(bytes32 => Commitment) public commitments;
    mapping(bytes32 => TransactionIntent) public intents;
    mapping(address => bytes32[]) public userCommitments;
    
    uint256 public constant MIN_COMMIT_DELAY = 2; // blocks
    uint256 public constant MAX_COMMIT_DELAY = 50; // blocks
    uint256 public constant REVEAL_WINDOW = 20; // blocks

    bool public commitRevealEnabled = true;
    bool public intentBasedOrderingEnabled = true;

    event CommitmentCreated(bytes32 indexed commitId, address indexed user, uint256 revealDeadline);
    event CommitmentRevealed(bytes32 indexed commitId, address indexed user);
    event CommitmentExecuted(bytes32 indexed commitId);
    event IntentRegistered(bytes32 indexed intentId, address indexed user, uint256 minBlock, uint256 maxBlock);
    event IntentExecuted(bytes32 indexed intentId);
    event FrontRunningAttemptDetected(address indexed attacker, bytes32 targetTx);

    /**
     * @dev Modifier requiring commit-reveal pattern
     */
    modifier requiresCommitReveal(bytes32 commitId) {
        if (commitRevealEnabled) {
            Commitment storage commitment = commitments[commitId];
            
            if (commitment.commitBlock == 0) {
                revert SecurityErrors.NotInitialized();
            }
            
            if (!commitment.revealed) {
                revert SecurityErrors.InvalidState(0, 1);
            }
            
            if (commitment.executed) {
                revert SecurityErrors.AlreadyExecuted();
            }
            
            uint256 minExecuteBlock = commitment.commitBlock + MIN_COMMIT_DELAY;
            if (block.number < minExecuteBlock) {
                revert SecurityErrors.TooEarly(block.number, minExecuteBlock);
            }
            
            if (block.number > commitment.revealDeadline) {
                revert SecurityErrors.DeadlineExpired(commitment.revealDeadline, block.number);
            }
        }
        _;
        if (commitRevealEnabled) {
            commitments[commitId].executed = true;
            emit CommitmentExecuted(commitId);
        }
    }

    /**
     * @dev Modifier for intent-based execution
     */
    modifier requiresIntent(bytes32 intentId) {
        if (intentBasedOrderingEnabled) {
            TransactionIntent storage intent = intents[intentId];
            
            if (intent.createdAt == 0) {
                revert SecurityErrors.NotInitialized();
            }
            
            if (block.number < intent.minBlock) {
                revert SecurityErrors.TooEarly(block.number, intent.minBlock);
            }
            
            if (block.number > intent.maxBlock) {
                revert SecurityErrors.TooLate(block.number, intent.maxBlock);
            }
            
            if (intent.executed) {
                revert SecurityErrors.AlreadyExecuted();
            }
        }
        _;
        if (intentBasedOrderingEnabled) {
            intents[intentId].executed = true;
            emit IntentExecuted(intentId);
        }
    }

    /**
     * @notice Create a commitment for future transaction
     * @param commitHash Hash of the committed data
     * @return commitId The commitment identifier
     */
    function createCommitment(bytes32 commitHash) external returns (bytes32 commitId) {
        commitId = keccak256(abi.encodePacked(msg.sender, commitHash, block.number));
        
        if (commitments[commitId].commitBlock != 0) {
            revert SecurityErrors.AlreadyInitialized();
        }

        uint256 revealDeadline = block.number + REVEAL_WINDOW;
        
        commitments[commitId] = Commitment({
            commitHash: commitHash,
            commitBlock: block.number,
            revealDeadline: revealDeadline,
            revealed: false,
            executed: false
        });

        userCommitments[msg.sender].push(commitId);
        
        emit CommitmentCreated(commitId, msg.sender, revealDeadline);
        return commitId;
    }

    /**
     * @notice Reveal a commitment
     * @param commitId The commitment identifier
     * @param data The revealed data
     * @param salt Salt used in commitment
     */
    function revealCommitment(
        bytes32 commitId,
        bytes memory data,
        bytes32 salt
    ) external {
        Commitment storage commitment = commitments[commitId];
        
        if (commitment.commitBlock == 0) {
            revert SecurityErrors.NotInitialized();
        }
        
        if (commitment.revealed) {
            revert SecurityErrors.AlreadyExecuted();
        }

        uint256 minRevealBlock = commitment.commitBlock + MIN_COMMIT_DELAY;
        if (block.number < minRevealBlock) {
            revert SecurityErrors.TooEarly(block.number, minRevealBlock);
        }
        
        if (block.number > commitment.revealDeadline) {
            revert SecurityErrors.DeadlineExpired(commitment.revealDeadline, block.number);
        }

        bytes32 computedHash = keccak256(abi.encodePacked(msg.sender, data, salt));
        if (computedHash != commitment.commitHash) {
            revert SecurityErrors.InvalidSignature();
        }

        commitment.revealed = true;
        emit CommitmentRevealed(commitId, msg.sender);
    }

    /**
     * @notice Register a transaction intent
     * @param intentHash Hash of the intent
     * @param minBlock Minimum block for execution
     * @param maxBlock Maximum block for execution
     * @return intentId The intent identifier
     */
    function registerIntent(
        bytes32 intentHash,
        uint256 minBlock,
        uint256 maxBlock
    ) external returns (bytes32 intentId) {
        if (minBlock < block.number) {
            revert SecurityErrors.TooEarly(minBlock, block.number);
        }
        
        if (maxBlock <= minBlock) {
            revert SecurityErrors.InvalidTimeRange(minBlock, maxBlock);
        }

        intentId = keccak256(abi.encodePacked(msg.sender, intentHash, block.number));
        
        if (intents[intentId].createdAt != 0) {
            revert SecurityErrors.AlreadyInitialized();
        }

        intents[intentId] = TransactionIntent({
            user: msg.sender,
            intentHash: intentHash,
            minBlock: minBlock,
            maxBlock: maxBlock,
            createdAt: block.timestamp,
            executed: false
        });

        emit IntentRegistered(intentId, msg.sender, minBlock, maxBlock);
        return intentId;
    }

    /**
     * @notice Check if commitment can be executed
     * @param commitId Commitment identifier
     * @return bool True if executable
     */
    function canExecuteCommitment(bytes32 commitId) external view returns (bool) {
        Commitment memory commitment = commitments[commitId];
        
        if (commitment.commitBlock == 0) return false;
        if (!commitment.revealed) return false;
        if (commitment.executed) return false;
        
        uint256 minExecuteBlock = commitment.commitBlock + MIN_COMMIT_DELAY;
        if (block.number < minExecuteBlock) return false;
        if (block.number > commitment.revealDeadline) return false;
        
        return true;
    }

    /**
     * @notice Check if intent can be executed
     * @param intentId Intent identifier
     * @return bool True if executable
     */
    function canExecuteIntent(bytes32 intentId) external view returns (bool) {
        TransactionIntent memory intent = intents[intentId];
        
        if (intent.createdAt == 0) return false;
        if (intent.executed) return false;
        if (block.number < intent.minBlock) return false;
        if (block.number > intent.maxBlock) return false;
        
        return true;
    }

    /**
     * @notice Get user's commitments
     * @param user User address
     * @return bytes32[] Array of commitment IDs
     */
    function getUserCommitments(address user) external view returns (bytes32[] memory) {
        return userCommitments[user];
    }

    /**
     * @notice Enable or disable commit-reveal
     * @param enabled True to enable
     */
    function setCommitRevealEnabled(bool enabled) external {
        commitRevealEnabled = enabled;
    }

    /**
     * @notice Enable or disable intent-based ordering
     * @param enabled True to enable
     */
    function setIntentBasedOrderingEnabled(bool enabled) external {
        intentBasedOrderingEnabled = enabled;
    }

    /**
     * @dev Build commitment hash
     */
    function buildCommitHash(
        address user,
        bytes memory data,
        bytes32 salt
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(user, data, salt));
    }

    /**
     * @dev Detect potential front-running attempt
     */
    function _detectFrontRunning(
        bytes32 targetTxHash,
        uint256 targetValue
    ) internal view returns (bool) {
        // Check if there's an uncommonly high gas price
        if (tx.gasprice > block.basefee * 2) {
            return true;
        }

        // Additional heuristics can be added here
        return false;
    }

    /**
     * @dev Require transaction to be in specific block range
     */
    function _requireBlockRange(uint256 minBlock, uint256 maxBlock) internal view {
        if (block.number < minBlock) {
            revert SecurityErrors.TooEarly(block.number, minBlock);
        }
        if (block.number > maxBlock) {
            revert SecurityErrors.TooLate(block.number, maxBlock);
        }
    }

    /**
     * @dev Calculate secure block window for execution
     */
    function _calculateSecureBlockWindow() internal view returns (uint256 minBlock, uint256 maxBlock) {
        minBlock = block.number + MIN_COMMIT_DELAY;
        maxBlock = block.number + MAX_COMMIT_DELAY;
        return (minBlock, maxBlock);
    }
}

