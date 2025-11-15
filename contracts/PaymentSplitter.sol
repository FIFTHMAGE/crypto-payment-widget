// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./Pausable.sol";

/**
 * @title PaymentSplitter
 * @dev Split payments among multiple recipients with configurable shares
 */
contract PaymentSplitter is Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Split {
        address[] recipients;
        uint256[] shares;
        uint256 totalShares;
        bool active;
    }

    mapping(bytes32 => Split) public splits;
    mapping(address => mapping(address => uint256)) public pendingWithdrawals;
    
    uint256 public platformFee;
    address public feeCollector;

    event SplitCreated(bytes32 indexed splitId, address[] recipients, uint256[] shares);
    event PaymentSplit(bytes32 indexed splitId, address indexed payer, uint256 amount, address token);
    event Withdrawal(address indexed recipient, address indexed token, uint256 amount);

    constructor(address _feeCollector, uint256 _platformFee) {
        feeCollector = _feeCollector;
        platformFee = _platformFee;
    }

    /**
     * @dev Create a new payment split configuration
     */
    function createSplit(
        address[] calldata recipients,
        uint256[] calldata shares
    ) external returns (bytes32) {
        require(recipients.length == shares.length, "Arrays length mismatch");
        require(recipients.length > 0, "No recipients");
        require(recipients.length <= 20, "Too many recipients");

        uint256 totalShares = 0;
        for (uint256 i = 0; i < shares.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient");
            require(shares[i] > 0, "Share must be > 0");
            totalShares += shares[i];
        }

        bytes32 splitId = keccak256(
            abi.encodePacked(msg.sender, recipients, shares, block.timestamp)
        );

        splits[splitId] = Split({
            recipients: recipients,
            shares: shares,
            totalShares: totalShares,
            active: true
        });

        emit SplitCreated(splitId, recipients, shares);
        return splitId;
    }

    /**
     * @dev Execute a split payment
     */
    function executeSplit(
        bytes32 splitId,
        address token,
        uint256 amount
    ) external payable nonReentrant whenNotPaused {
        Split storage split = splits[splitId];
        require(split.active, "Split not active");
        require(amount > 0, "Amount must be > 0");

        if (token == address(0)) {
            require(msg.value == amount, "Incorrect ETH amount");
        } else {
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        }

        uint256 fee = (amount * platformFee) / 10000;
        uint256 netAmount = amount - fee;

        // Distribute to recipients based on shares
        for (uint256 i = 0; i < split.recipients.length; i++) {
            uint256 recipientAmount = (netAmount * split.shares[i]) / split.totalShares;
            pendingWithdrawals[split.recipients[i]][token] += recipientAmount;
        }

        // Transfer fee
        if (fee > 0) {
            if (token == address(0)) {
                (bool success, ) = feeCollector.call{value: fee}("");
                require(success, "Fee transfer failed");
            } else {
                IERC20(token).safeTransfer(feeCollector, fee);
            }
        }

        emit PaymentSplit(splitId, msg.sender, amount, token);
    }

    /**
     * @dev Withdraw pending payments
     */
    function withdraw(address token) external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender][token];
        require(amount > 0, "No pending withdrawals");

        pendingWithdrawals[msg.sender][token] = 0;

        if (token == address(0)) {
            (bool success, ) = msg.sender.call{value: amount}("");
            require(success, "ETH withdrawal failed");
        } else {
            IERC20(token).safeTransfer(msg.sender, amount);
        }

        emit Withdrawal(msg.sender, token, amount);
    }

    /**
     * @dev Batch withdraw multiple tokens
     */
    function batchWithdraw(address[] calldata tokens) external nonReentrant {
        for (uint256 i = 0; i < tokens.length; i++) {
            uint256 amount = pendingWithdrawals[msg.sender][tokens[i]];
            if (amount > 0) {
                pendingWithdrawals[msg.sender][tokens[i]] = 0;
                
                if (tokens[i] == address(0)) {
                    (bool success, ) = msg.sender.call{value: amount}("");
                    require(success, "ETH withdrawal failed");
                } else {
                    IERC20(tokens[i]).safeTransfer(msg.sender, amount);
                }
                
                emit Withdrawal(msg.sender, tokens[i], amount);
            }
        }
    }

    /**
     * @dev Deactivate a split
     */
    function deactivateSplit(bytes32 splitId) external {
        Split storage split = splits[splitId];
        require(split.active, "Split already inactive");
        
        // Only creator or recipients can deactivate
        bool isRecipient = false;
        for (uint256 i = 0; i < split.recipients.length; i++) {
            if (split.recipients[i] == msg.sender) {
                isRecipient = true;
                break;
            }
        }
        require(isRecipient, "Not authorized");

        split.active = false;
    }

    /**
     * @dev Get pending withdrawal amount
     */
    function getPendingWithdrawal(address account, address token) external view returns (uint256) {
        return pendingWithdrawals[account][token];
    }

    /**
     * @dev Get split details
     */
    function getSplit(bytes32 splitId) external view returns (
        address[] memory recipients,
        uint256[] memory shares,
        uint256 totalShares,
        bool active
    ) {
        Split storage split = splits[splitId];
        return (split.recipients, split.shares, split.totalShares, split.active);
    }

    /**
     * @dev Update platform fee (admin only)
     */
    function updatePlatformFee(uint256 newFee) external onlyRole(ADMIN_ROLE) {
        require(newFee <= 500, "Fee too high");
        platformFee = newFee;
    }

    receive() external payable {}
}

