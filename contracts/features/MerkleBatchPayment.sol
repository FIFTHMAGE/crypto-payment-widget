// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MerkleBatchPayment
 * @author Crypto Payment Widget Team
 * @notice Gas-efficient batch payments using merkle proofs
 * @dev Allows multiple recipients to claim payments with proof verification
 */
contract MerkleBatchPayment is ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct PaymentBatch {
        address payer;
        address token;
        bytes32 merkleRoot;
        uint256 totalAmount;
        uint256 claimedAmount;
        uint256 expiryTime;
        bool active;
        mapping(address => bool) claimed;
    }

    mapping(bytes32 => PaymentBatch) public batches;
    bytes32[] public allBatches;
    uint256 public batchCount;

    event BatchCreated(
        bytes32 indexed batchId,
        address indexed payer,
        bytes32 merkleRoot,
        uint256 totalAmount,
        uint256 expiryTime
    );

    event PaymentClaimed(
        bytes32 indexed batchId,
        address indexed recipient,
        uint256 amount
    );

    event BatchCancelled(bytes32 indexed batchId, uint256 refundedAmount);

    error InvalidMerkleRoot();
    error InvalidAmount(uint256 amount);
    error InvalidExpiry(uint256 expiry);
    error BatchNotActive(bytes32 batchId);
    error AlreadyClaimed(bytes32 batchId, address recipient);
    error InvalidProof();
    error Unauthorized(address caller);
    error BatchNotExpired(uint256 expiryTime);

    /**
     * @notice Create a new payment batch
     * @param token Token address (address(0) for ETH)
     * @param merkleRoot Merkle root of payment tree
     * @param totalAmount Total amount for all payments
     * @param expiryTime Batch expiry timestamp
     * @return batchId Created batch identifier
     */
    function createBatch(
        address token,
        bytes32 merkleRoot,
        uint256 totalAmount,
        uint256 expiryTime
    ) external payable nonReentrant returns (bytes32 batchId) {
        if (merkleRoot == bytes32(0)) revert InvalidMerkleRoot();
        if (totalAmount == 0) revert InvalidAmount(totalAmount);
        if (expiryTime <= block.timestamp) revert InvalidExpiry(expiryTime);

        batchId = keccak256(abi.encodePacked(
            msg.sender,
            merkleRoot,
            totalAmount,
            block.timestamp,
            batchCount
        ));

        if (token == address(0)) {
            require(msg.value == totalAmount, "Incorrect ETH amount");
        } else {
            IERC20(token).safeTransferFrom(msg.sender, address(this), totalAmount);
        }

        PaymentBatch storage batch = batches[batchId];
        batch.payer = msg.sender;
        batch.token = token;
        batch.merkleRoot = merkleRoot;
        batch.totalAmount = totalAmount;
        batch.claimedAmount = 0;
        batch.expiryTime = expiryTime;
        batch.active = true;

        allBatches.push(batchId);
        batchCount++;

        emit BatchCreated(batchId, msg.sender, merkleRoot, totalAmount, expiryTime);
        return batchId;
    }

    /**
     * @notice Claim payment from a batch
     * @param batchId Batch identifier
     * @param amount Amount to claim
     * @param merkleProof Merkle proof for verification
     */
    function claimPayment(
        bytes32 batchId,
        uint256 amount,
        bytes32[] calldata merkleProof
    ) external nonReentrant {
        PaymentBatch storage batch = batches[batchId];
        
        if (!batch.active) revert BatchNotActive(batchId);
        if (batch.claimed[msg.sender]) revert AlreadyClaimed(batchId, msg.sender);
        require(block.timestamp <= batch.expiryTime, "Batch expired");

        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));
        if (!MerkleProof.verify(merkleProof, batch.merkleRoot, leaf)) {
            revert InvalidProof();
        }

        batch.claimed[msg.sender] = true;
        batch.claimedAmount += amount;

        if (batch.token == address(0)) {
            _transferETH(msg.sender, amount);
        } else {
            IERC20(batch.token).safeTransfer(msg.sender, amount);
        }

        emit PaymentClaimed(batchId, msg.sender, amount);
    }

    /**
     * @notice Cancel batch and refund unclaimed amount
     * @param batchId Batch identifier
     */
    function cancelBatch(bytes32 batchId) external nonReentrant {
        PaymentBatch storage batch = batches[batchId];
        
        if (msg.sender != batch.payer) revert Unauthorized(msg.sender);
        if (!batch.active) revert BatchNotActive(batchId);
        if (block.timestamp <= batch.expiryTime) revert BatchNotExpired(batch.expiryTime);

        batch.active = false;
        uint256 refundAmount = batch.totalAmount - batch.claimedAmount;

        if (refundAmount > 0) {
            if (batch.token == address(0)) {
                _transferETH(batch.payer, refundAmount);
            } else {
                IERC20(batch.token).safeTransfer(batch.payer, refundAmount);
            }
        }

        emit BatchCancelled(batchId, refundAmount);
    }

    /**
     * @notice Check if address has claimed from batch
     * @param batchId Batch identifier
     * @param recipient Recipient address
     * @return Boolean indicating if claimed
     */
    function hasClaimed(bytes32 batchId, address recipient) external view returns (bool) {
        return batches[batchId].claimed[recipient];
    }

    /**
     * @notice Get batch details
     * @param batchId Batch identifier
     * @return payer Batch payer
     * @return token Token address
     * @return merkleRoot Merkle root
     * @return totalAmount Total batch amount
     * @return claimedAmount Amount claimed so far
     * @return expiryTime Batch expiry
     * @return active Batch active status
     */
    function getBatch(bytes32 batchId) external view returns (
        address payer,
        address token,
        bytes32 merkleRoot,
        uint256 totalAmount,
        uint256 claimedAmount,
        uint256 expiryTime,
        bool active
    ) {
        PaymentBatch storage batch = batches[batchId];
        return (
            batch.payer,
            batch.token,
            batch.merkleRoot,
            batch.totalAmount,
            batch.claimedAmount,
            batch.expiryTime,
            batch.active
        );
    }

    function _transferETH(address to, uint256 amount) private {
        (bool success, ) = to.call{value: amount}("");
        require(success, "ETH transfer failed");
    }

    receive() external payable {}
}

