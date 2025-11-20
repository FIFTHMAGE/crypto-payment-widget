// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SecurityErrors.sol";

/**
 * @title FlashLoanProtection
 * @notice Protection against flash loan attacks and same-block exploits
 * @dev Implements multiple layers of defense against flash loan manipulation
 */
abstract contract FlashLoanProtection {
    // Track balance changes within the same block
    struct BlockBalance {
        uint256 blockNumber;
        uint256 balance;
        bool locked;
    }

    // Track user actions within blocks
    struct UserAction {
        uint256 blockNumber;
        uint256 actionCount;
        uint256 totalValue;
    }

    mapping(address => BlockBalance) private _blockBalances;
    mapping(address => UserAction) private _userActions;
    mapping(address => uint256) private _lastActionBlock;
    
    uint256 private constant MAX_ACTIONS_PER_BLOCK = 5;
    uint256 private constant MAX_VALUE_PER_BLOCK = 1000 ether;
    uint256 private constant REQUIRED_BLOCK_DELAY = 1;
    
    bool public flashLoanProtectionEnabled = true;

    event FlashLoanAttemptDetected(address indexed user, uint256 blockNumber);
    event SuspiciousActivityDetected(address indexed user, string reason);
    event BlockDelayRequired(address indexed user, uint256 currentBlock, uint256 requiredBlock);

    /**
     * @dev Modifier to prevent flash loan attacks
     */
    modifier noFlashLoan() {
        _checkFlashLoan(msg.sender);
        _;
        _recordAction(msg.sender, 0);
    }

    /**
     * @dev Modifier to prevent flash loan attacks with value tracking
     */
    modifier noFlashLoanWithValue(uint256 value) {
        _checkFlashLoan(msg.sender);
        _;
        _recordAction(msg.sender, value);
    }

    /**
     * @dev Modifier requiring block delay between actions
     */
    modifier requireBlockDelay() {
        uint256 lastBlock = _lastActionBlock[msg.sender];
        if (lastBlock > 0 && block.number < lastBlock + REQUIRED_BLOCK_DELAY) {
            emit BlockDelayRequired(msg.sender, block.number, lastBlock + REQUIRED_BLOCK_DELAY);
            revert SecurityErrors.TooEarly(block.number, lastBlock + REQUIRED_BLOCK_DELAY);
        }
        _;
        _lastActionBlock[msg.sender] = block.number;
    }

    /**
     * @dev Modifier to prevent same-block deposit and withdrawal
     */
    modifier preventSameBlockExploit() {
        BlockBalance storage userBalance = _blockBalances[msg.sender];
        
        if (userBalance.blockNumber == block.number && userBalance.locked) {
            emit FlashLoanAttemptDetected(msg.sender, block.number);
            revert SecurityErrors.CircuitBreakerActive();
        }
        
        _;
    }

    /**
     * @notice Enable or disable flash loan protection
     * @param enabled True to enable, false to disable
     */
    function setFlashLoanProtection(bool enabled) external {
        flashLoanProtectionEnabled = enabled;
    }

    /**
     * @notice Check if user has suspicious activity in current block
     * @param user User address to check
     * @return bool True if suspicious
     */
    function hasSuspiciousActivity(address user) public view returns (bool) {
        UserAction memory action = _userActions[user];
        
        if (action.blockNumber != block.number) {
            return false;
        }

        // Too many actions in single block
        if (action.actionCount > MAX_ACTIONS_PER_BLOCK) {
            return true;
        }

        // Too much value in single block
        if (action.totalValue > MAX_VALUE_PER_BLOCK) {
            return true;
        }

        return false;
    }

    /**
     * @notice Get user's action data for current block
     * @param user User address
     * @return blockNumber Block of last action
     * @return actionCount Number of actions in block
     * @return totalValue Total value in block
     */
    function getUserActionData(address user) external view returns (
        uint256 blockNumber,
        uint256 actionCount,
        uint256 totalValue
    ) {
        UserAction memory action = _userActions[user];
        return (action.blockNumber, action.actionCount, action.totalValue);
    }

    /**
     * @notice Check blocks since last action
     * @param user User address
     * @return uint256 Blocks elapsed since last action
     */
    function blocksSinceLastAction(address user) external view returns (uint256) {
        uint256 lastBlock = _lastActionBlock[user];
        if (lastBlock == 0) return type(uint256).max;
        if (block.number < lastBlock) return 0;
        return block.number - lastBlock;
    }

    /**
     * @dev Internal function to check for flash loan patterns
     */
    function _checkFlashLoan(address user) internal view {
        if (!flashLoanProtectionEnabled) return;

        UserAction memory action = _userActions[user];
        
        // Check if same block
        if (action.blockNumber == block.number) {
            // Too many actions
            if (action.actionCount >= MAX_ACTIONS_PER_BLOCK) {
                revert SecurityErrors.RateLimitExceeded(user, MAX_ACTIONS_PER_BLOCK);
            }
        }

        // Check balance lock
        BlockBalance memory balance = _blockBalances[user];
        if (balance.blockNumber == block.number && balance.locked) {
            revert SecurityErrors.CircuitBreakerActive();
        }
    }

    /**
     * @dev Internal function to record user action
     */
    function _recordAction(address user, uint256 value) internal {
        UserAction storage action = _userActions[user];
        
        // Reset if new block
        if (action.blockNumber != block.number) {
            action.blockNumber = block.number;
            action.actionCount = 0;
            action.totalValue = 0;
        }

        action.actionCount++;
        action.totalValue += value;

        // Emit warning if suspicious
        if (action.actionCount > MAX_ACTIONS_PER_BLOCK) {
            emit SuspiciousActivityDetected(user, "Too many actions per block");
        }
        
        if (action.totalValue > MAX_VALUE_PER_BLOCK) {
            emit SuspiciousActivityDetected(user, "High value per block");
        }
    }

    /**
     * @dev Internal function to lock user balance for the block
     */
    function _lockBalanceForBlock(address user, uint256 balance) internal {
        BlockBalance storage userBalance = _blockBalances[user];
        
        if (userBalance.blockNumber != block.number) {
            userBalance.blockNumber = block.number;
            userBalance.balance = balance;
            userBalance.locked = true;
        }
    }

    /**
     * @dev Internal function to unlock user balance
     */
    function _unlockBalance(address user) internal {
        BlockBalance storage userBalance = _blockBalances[user];
        userBalance.locked = false;
    }

    /**
     * @dev Internal function to check if balance changed significantly in same block
     */
    function _checkBalanceManipulation(address user, uint256 currentBalance) internal view {
        BlockBalance memory userBalance = _blockBalances[user];
        
        if (userBalance.blockNumber == block.number) {
            uint256 balanceDiff;
            
            if (currentBalance > userBalance.balance) {
                balanceDiff = currentBalance - userBalance.balance;
            } else {
                balanceDiff = userBalance.balance - currentBalance;
            }

            // Significant balance change in same block
            if (balanceDiff > MAX_VALUE_PER_BLOCK) {
                revert SecurityErrors.CircuitBreakerActive();
            }
        }
    }

    /**
     * @dev Verify no flash loan is in progress by checking balance consistency
     */
    function _verifyBalanceConsistency(
        address user,
        uint256 startBalance,
        uint256 endBalance
    ) internal pure {
        // Balance should not increase without explicit deposits
        if (endBalance > startBalance) {
            // If balance increased, it might be from a flash loan
            uint256 increase = endBalance - startBalance;
            if (increase > 0) {
                revert SecurityErrors.CircuitBreakerActive();
            }
        }
    }

    /**
     * @dev Check for common flash loan patterns
     */
    function _detectFlashLoanPattern(address user) internal view returns (bool) {
        UserAction memory action = _userActions[user];
        BlockBalance memory balance = _blockBalances[user];
        
        // Same block multiple actions with locked balance
        if (action.blockNumber == block.number && 
            balance.blockNumber == block.number &&
            action.actionCount > 2 &&
            balance.locked) {
            return true;
        }

        return false;
    }

    /**
     * @dev Require minimum block confirmation before allowing action
     */
    function _requireBlockConfirmation(address user, uint256 requiredBlocks) internal view {
        uint256 lastBlock = _lastActionBlock[user];
        
        if (lastBlock > 0 && block.number < lastBlock + requiredBlocks) {
            revert SecurityErrors.TooEarly(block.number, lastBlock + requiredBlocks);
        }
    }
}

