// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../security/EnhancedAccessControl.sol";
import "../security/SecurityErrors.sol";

/**
 * @title TokenomicsManager
 * @notice Advanced tokenomics management for platform fees and rewards
 * @dev Handles fee distribution, staking rewards, and treasury management
 */
contract TokenomicsManager is EnhancedAccessControl {
    using SafeERC20 for IERC20;

    struct FeeDistribution {
        uint256 treasuryShare;      // Basis points going to treasury
        uint256 stakingRewardShare; // Basis points for staking rewards
        uint256 burnShare;          // Basis points to burn
        uint256 lpRewardShare;      // Basis points for LP rewards
    }

    struct StakingInfo {
        uint256 amount;
        uint256 rewardDebt;
        uint256 lastStakeTime;
        uint256 lockEndTime;
    }

    struct RewardPool {
        uint256 totalRewards;
        uint256 accRewardPerShare;
        uint256 lastRewardBlock;
        uint256 rewardPerBlock;
    }

    // Fee distribution configuration
    FeeDistribution public feeDistribution;
    
    // Staking data
    mapping(address => StakingInfo) public stakingInfo;
    mapping(address => RewardPool) public rewardPools;
    
    uint256 public totalStaked;
    uint256 public constant PRECISION = 1e12;
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant MIN_LOCK_PERIOD = 7 days;
    uint256 public constant MAX_LOCK_PERIOD = 365 days;

    address public treasury;
    address public platformToken;
    
    bool public stakingEnabled = true;
    uint256 public minStakeAmount = 100 * 10**18; // 100 tokens
    uint256 public earlyWithdrawalFee = 500; // 5%

    event FeeDistributionUpdated(
        uint256 treasuryShare,
        uint256 stakingRewardShare,
        uint256 burnShare,
        uint256 lpRewardShare
    );
    event Staked(address indexed user, uint256 amount, uint256 lockEndTime);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event FeesDistributed(uint256 treasuryAmount, uint256 rewardAmount, uint256 burnAmount, uint256 lpAmount);
    event RewardPoolCreated(address indexed token, uint256 rewardPerBlock);
    event TreasuryUpdated(address oldTreasury, address newTreasury);

    constructor(address _treasury, address _platformToken) {
        if (_treasury == address(0) || _platformToken == address(0)) {
            revert SecurityErrors.ZeroAddress();
        }

        treasury = _treasury;
        platformToken = _platformToken;

        // Default fee distribution
        feeDistribution = FeeDistribution({
            treasuryShare: 4000,      // 40%
            stakingRewardShare: 3000, // 30%
            burnShare: 1000,          // 10%
            lpRewardShare: 2000       // 20%
        });
    }

    /**
     * @notice Update fee distribution percentages
     * @param treasuryShare Treasury percentage (basis points)
     * @param stakingRewardShare Staking reward percentage
     * @param burnShare Burn percentage
     * @param lpRewardShare LP reward percentage
     */
    function updateFeeDistribution(
        uint256 treasuryShare,
        uint256 stakingRewardShare,
        uint256 burnShare,
        uint256 lpRewardShare
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 total = treasuryShare + stakingRewardShare + burnShare + lpRewardShare;
        if (total != BASIS_POINTS) {
            revert SecurityErrors.InvalidAmount(total);
        }

        feeDistribution.treasuryShare = treasuryShare;
        feeDistribution.stakingRewardShare = stakingRewardShare;
        feeDistribution.burnShare = burnShare;
        feeDistribution.lpRewardShare = lpRewardShare;

        emit FeeDistributionUpdated(treasuryShare, stakingRewardShare, burnShare, lpRewardShare);
    }

    /**
     * @notice Distribute collected fees
     * @param amount Total fee amount to distribute
     */
    function distributeFees(uint256 amount) external onlyRole(OPERATOR_ROLE) {
        if (amount == 0) revert SecurityErrors.InvalidAmount(0);

        uint256 treasuryAmount = (amount * feeDistribution.treasuryShare) / BASIS_POINTS;
        uint256 rewardAmount = (amount * feeDistribution.stakingRewardShare) / BASIS_POINTS;
        uint256 burnAmount = (amount * feeDistribution.burnShare) / BASIS_POINTS;
        uint256 lpAmount = (amount * feeDistribution.lpRewardShare) / BASIS_POINTS;

        IERC20 token = IERC20(platformToken);

        // Transfer to treasury
        if (treasuryAmount > 0) {
            token.safeTransfer(treasury, treasuryAmount);
        }

        // Add to reward pool
        if (rewardAmount > 0) {
            _addRewards(platformToken, rewardAmount);
        }

        // Burn tokens
        if (burnAmount > 0) {
            token.safeTransfer(address(0xdead), burnAmount);
        }

        // Transfer to LP rewards (implementation specific)
        if (lpAmount > 0) {
            // This would integrate with LP contract
            token.safeTransfer(treasury, lpAmount); // Placeholder
        }

        emit FeesDistributed(treasuryAmount, rewardAmount, burnAmount, lpAmount);
    }

    /**
     * @notice Stake tokens
     * @param amount Amount to stake
     * @param lockPeriod Lock period in seconds
     */
    function stake(uint256 amount, uint256 lockPeriod) external {
        if (!stakingEnabled) revert SecurityErrors.SystemHalted();
        if (amount < minStakeAmount) {
            revert SecurityErrors.AmountTooLow(amount, minStakeAmount);
        }
        if (lockPeriod < MIN_LOCK_PERIOD || lockPeriod > MAX_LOCK_PERIOD) {
            revert SecurityErrors.InvalidAmount(lockPeriod);
        }

        StakingInfo storage info = stakingInfo[msg.sender];
        
        // Update rewards before changing stake
        _updateRewards(msg.sender);

        // Transfer tokens
        IERC20(platformToken).safeTransferFrom(msg.sender, address(this), amount);

        // Update staking info
        info.amount += amount;
        info.lastStakeTime = block.timestamp;
        info.lockEndTime = block.timestamp + lockPeriod;
        
        totalStaked += amount;

        emit Staked(msg.sender, amount, info.lockEndTime);
    }

    /**
     * @notice Unstake tokens
     * @param amount Amount to unstake
     */
    function unstake(uint256 amount) external {
        StakingInfo storage info = stakingInfo[msg.sender];
        
        if (amount == 0 || amount > info.amount) {
            revert SecurityErrors.InvalidAmount(amount);
        }

        // Update rewards before changing stake
        _updateRewards(msg.sender);

        uint256 amountToTransfer = amount;
        
        // Apply early withdrawal fee if still locked
        if (block.timestamp < info.lockEndTime) {
            uint256 fee = (amount * earlyWithdrawalFee) / BASIS_POINTS;
            amountToTransfer = amount - fee;
            
            // Send fee to treasury
            IERC20(platformToken).safeTransfer(treasury, fee);
        }

        // Update staking info
        info.amount -= amount;
        totalStaked -= amount;

        // Transfer tokens
        IERC20(platformToken).safeTransfer(msg.sender, amountToTransfer);

        emit Unstaked(msg.sender, amountToTransfer);
    }

    /**
     * @notice Claim staking rewards
     */
    function claimRewards() external {
        _updateRewards(msg.sender);
        
        StakingInfo storage info = stakingInfo[msg.sender];
        RewardPool storage pool = rewardPools[platformToken];
        
        uint256 pending = (info.amount * pool.accRewardPerShare) / PRECISION - info.rewardDebt;
        
        if (pending == 0) revert SecurityErrors.NoBalanceToWithdraw();

        // Reset reward debt
        info.rewardDebt = (info.amount * pool.accRewardPerShare) / PRECISION;

        // Transfer rewards
        IERC20(platformToken).safeTransfer(msg.sender, pending);

        emit RewardsClaimed(msg.sender, pending);
    }

    /**
     * @notice Get pending rewards for user
     * @param user User address
     * @return pending Pending reward amount
     */
    function pendingRewards(address user) external view returns (uint256 pending) {
        StakingInfo memory info = stakingInfo[user];
        RewardPool memory pool = rewardPools[platformToken];

        uint256 accRewardPerShare = pool.accRewardPerShare;
        
        if (block.number > pool.lastRewardBlock && totalStaked > 0) {
            uint256 blocks = block.number - pool.lastRewardBlock;
            uint256 reward = blocks * pool.rewardPerBlock;
            accRewardPerShare += (reward * PRECISION) / totalStaked;
        }

        pending = (info.amount * accRewardPerShare) / PRECISION - info.rewardDebt;
    }

    /**
     * @notice Create reward pool for token
     * @param token Token address
     * @param rewardPerBlock Rewards per block
     */
    function createRewardPool(address token, uint256 rewardPerBlock) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (token == address(0)) revert SecurityErrors.ZeroAddress();
        if (rewardPools[token].lastRewardBlock != 0) {
            revert SecurityErrors.AlreadyInitialized();
        }

        rewardPools[token] = RewardPool({
            totalRewards: 0,
            accRewardPerShare: 0,
            lastRewardBlock: block.number,
            rewardPerBlock: rewardPerBlock
        });

        emit RewardPoolCreated(token, rewardPerBlock);
    }

    /**
     * @notice Update treasury address
     * @param newTreasury New treasury address
     */
    function updateTreasury(address newTreasury) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (newTreasury == address(0)) revert SecurityErrors.ZeroAddress();
        address oldTreasury = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }

    /**
     * @notice Set staking enabled status
     * @param enabled New status
     */
    function setStakingEnabled(bool enabled) external onlyRole(DEFAULT_ADMIN_ROLE) {
        stakingEnabled = enabled;
    }

    /**
     * @notice Update min stake amount
     * @param amount New minimum stake amount
     */
    function updateMinStakeAmount(uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (amount == 0) revert SecurityErrors.InvalidAmount(0);
        minStakeAmount = amount;
    }

    /**
     * @notice Update early withdrawal fee
     * @param fee New fee in basis points
     */
    function updateEarlyWithdrawalFee(uint256 fee) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (fee > 2000) revert SecurityErrors.FeeTooHigh(fee, 2000); // Max 20%
        earlyWithdrawalFee = fee;
    }

    /**
     * @dev Update rewards for user
     */
    function _updateRewards(address user) internal {
        RewardPool storage pool = rewardPools[platformToken];
        
        if (pool.lastRewardBlock == 0) return;

        if (block.number <= pool.lastRewardBlock) return;

        if (totalStaked == 0) {
            pool.lastRewardBlock = block.number;
            return;
        }

        uint256 blocks = block.number - pool.lastRewardBlock;
        uint256 reward = blocks * pool.rewardPerBlock;
        
        pool.accRewardPerShare += (reward * PRECISION) / totalStaked;
        pool.totalRewards += reward;
        pool.lastRewardBlock = block.number;

        // Update user reward debt
        StakingInfo storage info = stakingInfo[user];
        if (info.amount > 0) {
            info.rewardDebt = (info.amount * pool.accRewardPerShare) / PRECISION;
        }
    }

    /**
     * @dev Add rewards to pool
     */
    function _addRewards(address token, uint256 amount) internal {
        RewardPool storage pool = rewardPools[token];
        pool.totalRewards += amount;
    }

    /**
     * @notice Get staking statistics
     * @param user User address
     * @return staked Amount staked
     * @return lockEnd Lock end timestamp
     * @return pending Pending rewards
     * @return isLocked Whether still locked
     */
    function getStakingStats(address user) external view returns (
        uint256 staked,
        uint256 lockEnd,
        uint256 pending,
        bool isLocked
    ) {
        StakingInfo memory info = stakingInfo[user];
        return (
            info.amount,
            info.lockEndTime,
            this.pendingRewards(user),
            block.timestamp < info.lockEndTime
        );
    }
}

