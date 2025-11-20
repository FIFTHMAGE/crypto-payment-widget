// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../security/EnhancedAccessControl.sol";
import "../security/SecurityErrors.sol";

/**
 * @title CrossChainBridge
 * @notice Cross-chain payment bridge for multi-chain support
 * @dev Enables payments across different blockchain networks
 */
contract CrossChainBridge is EnhancedAccessControl {
    using SafeERC20 for IERC20;

    enum BridgeStatus {
        Pending,
        Confirmed,
        Completed,
        Failed,
        Refunded
    }

    struct BridgeRequest {
        address sender;
        address recipient;
        uint256 amount;
        address token;
        uint256 sourceChainId;
        uint256 targetChainId;
        uint256 nonce;
        uint256 createdAt;
        uint256 completedAt;
        BridgeStatus status;
        bytes32 proof;
    }

    struct ChainConfig {
        bool enabled;
        uint256 minAmount;
        uint256 maxAmount;
        uint256 fee;
        address validator;
    }

    mapping(bytes32 => BridgeRequest) public bridgeRequests;
    mapping(uint256 => ChainConfig) public chainConfigs;
    mapping(address => mapping(uint256 => uint256)) public userNonces;
    mapping(bytes32 => bool) public processedProofs;
    
    bytes32[] public allBridgeRequests;
    uint256 public totalBridged;
    uint256 public totalFees;
    
    uint256 public constant CONFIRMATION_BLOCKS = 12;
    address public feeTreasury;

    event BridgeInitiated(
        bytes32 indexed requestId,
        address indexed sender,
        address indexed recipient,
        uint256 amount,
        uint256 sourceChainId,
        uint256 targetChainId
    );
    
    event BridgeCompleted(bytes32 indexed requestId, uint256 completedAt);
    event BridgeFailed(bytes32 indexed requestId, string reason);
    event BridgeRefunded(bytes32 indexed requestId, uint256 amount);
    event ChainConfigured(uint256 indexed chainId, bool enabled);
    event ValidatorUpdated(uint256 indexed chainId, address validator);

    constructor(address _feeTreasury) {
        if (_feeTreasury == address(0)) revert SecurityErrors.ZeroAddress();
        feeTreasury = _feeTreasury;
    }

    /**
     * @notice Initiate cross-chain bridge
     * @param recipient Recipient address on target chain
     * @param amount Amount to bridge
     * @param token Token address
     * @param targetChainId Target chain ID
     * @return requestId Bridge request identifier
     */
    function initiateBridge(
        address recipient,
        uint256 amount,
        address token,
        uint256 targetChainId
    ) external payable returns (bytes32 requestId) {
        if (recipient == address(0)) revert SecurityErrors.ZeroAddress();
        if (amount == 0) revert SecurityErrors.InvalidAmount(0);

        ChainConfig memory config = chainConfigs[targetChainId];
        if (!config.enabled) revert SecurityErrors.InvalidState(0, 1);
        
        if (amount < config.minAmount) {
            revert SecurityErrors.AmountTooLow(amount, config.minAmount);
        }
        if (amount > config.maxAmount) {
            revert SecurityErrors.AmountTooHigh(amount, config.maxAmount);
        }

        uint256 fee = (amount * config.fee) / 10000;
        uint256 netAmount = amount - fee;
        
        uint256 nonce = userNonces[msg.sender][targetChainId]++;
        
        requestId = keccak256(abi.encodePacked(
            msg.sender,
            recipient,
            amount,
            token,
            block.chainid,
            targetChainId,
            nonce,
            block.timestamp
        ));

        // Lock tokens
        if (token == address(0)) {
            require(msg.value == amount, "Incorrect ETH amount");
        } else {
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        }

        // Transfer fee
        if (fee > 0) {
            if (token == address(0)) {
                _transferETH(feeTreasury, fee);
            } else {
                IERC20(token).safeTransfer(feeTreasury, fee);
            }
        }

        bridgeRequests[requestId] = BridgeRequest({
            sender: msg.sender,
            recipient: recipient,
            amount: netAmount,
            token: token,
            sourceChainId: block.chainid,
            targetChainId: targetChainId,
            nonce: nonce,
            createdAt: block.timestamp,
            completedAt: 0,
            status: BridgeStatus.Pending,
            proof: bytes32(0)
        });

        allBridgeRequests.push(requestId);
        totalBridged += netAmount;
        totalFees += fee;

        emit BridgeInitiated(
            requestId,
            msg.sender,
            recipient,
            netAmount,
            block.chainid,
            targetChainId
        );

        return requestId;
    }

    /**
     * @notice Complete bridge on target chain
     * @param requestId Bridge request ID
     * @param proof Merkle proof or signature
     */
    function completeBridge(
        bytes32 requestId,
        bytes32 proof
    ) external onlyRole(OPERATOR_ROLE) {
        BridgeRequest storage request = bridgeRequests[requestId];
        
        if (request.status != BridgeStatus.Pending) {
            revert SecurityErrors.InvalidState(uint8(request.status), uint8(BridgeStatus.Pending));
        }

        if (processedProofs[proof]) {
            revert SecurityErrors.SignatureAlreadyUsed(proof);
        }

        // Verify we're on target chain
        if (block.chainid != request.targetChainId) {
            revert SecurityErrors.InvalidState(uint8(block.chainid), uint8(request.targetChainId));
        }

        // Release tokens to recipient
        if (request.token == address(0)) {
            _transferETH(request.recipient, request.amount);
        } else {
            IERC20(request.token).safeTransfer(request.recipient, request.amount);
        }

        request.status = BridgeStatus.Completed;
        request.completedAt = block.timestamp;
        request.proof = proof;
        processedProofs[proof] = true;

        emit BridgeCompleted(requestId, block.timestamp);
    }

    /**
     * @notice Refund failed bridge
     * @param requestId Bridge request ID
     * @param reason Failure reason
     */
    function refundBridge(
        bytes32 requestId,
        string calldata reason
    ) external onlyRole(OPERATOR_ROLE) {
        BridgeRequest storage request = bridgeRequests[requestId];
        
        if (request.status != BridgeStatus.Pending && request.status != BridgeStatus.Failed) {
            revert SecurityErrors.InvalidState(uint8(request.status), uint8(BridgeStatus.Pending));
        }

        // Must be on source chain to refund
        if (block.chainid != request.sourceChainId) {
            revert SecurityErrors.InvalidState(uint8(block.chainid), uint8(request.sourceChainId));
        }

        // Refund to sender
        if (request.token == address(0)) {
            _transferETH(request.sender, request.amount);
        } else {
            IERC20(request.token).safeTransfer(request.sender, request.amount);
        }

        request.status = BridgeStatus.Refunded;
        
        emit BridgeFailed(requestId, reason);
        emit BridgeRefunded(requestId, request.amount);
    }

    /**
     * @notice Configure chain settings
     * @param chainId Chain ID
     * @param enabled Enable/disable chain
     * @param minAmount Minimum bridge amount
     * @param maxAmount Maximum bridge amount
     * @param fee Bridge fee in basis points
     * @param validator Chain validator address
     */
    function configureChain(
        uint256 chainId,
        bool enabled,
        uint256 minAmount,
        uint256 maxAmount,
        uint256 fee,
        address validator
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (maxAmount <= minAmount) {
            revert SecurityErrors.InvalidAmount(maxAmount);
        }
        if (fee > 1000) revert SecurityErrors.FeeTooHigh(fee, 1000); // Max 10%
        if (validator == address(0)) revert SecurityErrors.ZeroAddress();

        chainConfigs[chainId] = ChainConfig({
            enabled: enabled,
            minAmount: minAmount,
            maxAmount: maxAmount,
            fee: fee,
            validator: validator
        });

        emit ChainConfigured(chainId, enabled);
        emit ValidatorUpdated(chainId, validator);
    }

    /**
     * @notice Update fee treasury
     * @param newTreasury New treasury address
     */
    function updateFeeTreasury(address newTreasury) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (newTreasury == address(0)) revert SecurityErrors.ZeroAddress();
        feeTreasury = newTreasury;
    }

    /**
     * @notice Get bridge request details
     * @param requestId Request identifier
     * @return request Bridge request data
     */
    function getBridgeRequest(bytes32 requestId) external view returns (BridgeRequest memory) {
        return bridgeRequests[requestId];
    }

    /**
     * @notice Get user bridge history
     * @param user User address
     * @return requests Array of request IDs
     */
    function getUserBridgeRequests(address user) external view returns (bytes32[] memory requests) {
        uint256 count = 0;
        
        // Count user's requests
        for (uint256 i = 0; i < allBridgeRequests.length; i++) {
            if (bridgeRequests[allBridgeRequests[i]].sender == user) {
                count++;
            }
        }

        // Build array
        requests = new bytes32[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allBridgeRequests.length; i++) {
            if (bridgeRequests[allBridgeRequests[i]].sender == user) {
                requests[index] = allBridgeRequests[i];
                index++;
            }
        }

        return requests;
    }

    /**
     * @notice Check if chain is supported
     * @param chainId Chain ID
     * @return bool True if supported
     */
    function isChainSupported(uint256 chainId) external view returns (bool) {
        return chainConfigs[chainId].enabled;
    }

    /**
     * @notice Calculate bridge fee
     * @param amount Bridge amount
     * @param targetChainId Target chain ID
     * @return fee Fee amount
     * @return netAmount Net amount after fee
     */
    function calculateBridgeFee(
        uint256 amount,
        uint256 targetChainId
    ) external view returns (uint256 fee, uint256 netAmount) {
        ChainConfig memory config = chainConfigs[targetChainId];
        fee = (amount * config.fee) / 10000;
        netAmount = amount - fee;
        return (fee, netAmount);
    }

    /**
     * @notice Get bridge statistics
     * @return total Total amount bridged
     * @return fees Total fees collected
     * @return requests Total bridge requests
     */
    function getBridgeStats() external view returns (
        uint256 total,
        uint256 fees,
        uint256 requests
    ) {
        return (totalBridged, totalFees, allBridgeRequests.length);
    }

    /**
     * @dev Transfer ETH safely
     */
    function _transferETH(address to, uint256 amount) private {
        (bool success, ) = to.call{value: amount}("");
        if (!success) revert SecurityErrors.TransferFailed(address(0), to, amount);
    }

    receive() external payable {}
}

