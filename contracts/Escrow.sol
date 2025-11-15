// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./Pausable.sol";

/**
 * @title Escrow
 * @dev Secure escrow service for crypto payments
 */
contract Escrow is Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct EscrowDetails {
        address payer;
        address payee;
        address arbiter;
        uint256 amount;
        address token;
        uint256 releaseTime;
        EscrowStatus status;
        string metadata;
        uint256 createdAt;
    }

    enum EscrowStatus {
        Active,
        Released,
        Refunded,
        Disputed
    }

    mapping(bytes32 => EscrowDetails) public escrows;
    mapping(address => uint256) public escrowCount;
    
    uint256 public totalEscrows;
    uint256 public platformFee;
    address public feeCollector;

    event EscrowCreated(
        bytes32 indexed escrowId,
        address indexed payer,
        address indexed payee,
        uint256 amount,
        uint256 releaseTime
    );
    
    event EscrowReleased(bytes32 indexed escrowId, uint256 amount);
    event EscrowRefunded(bytes32 indexed escrowId, uint256 amount);
    event EscrowDisputed(bytes32 indexed escrowId, address disputer);
    event DisputeResolved(bytes32 indexed escrowId, address winner);

    constructor(address _feeCollector, uint256 _platformFee) {
        feeCollector = _feeCollector;
        platformFee = _platformFee;
    }

    /**
     * @dev Create a new escrow
     */
    function createEscrow(
        address payee,
        address arbiter,
        address token,
        uint256 amount,
        uint256 releaseTime,
        string calldata metadata
    ) external payable nonReentrant whenNotPaused returns (bytes32) {
        require(payee != address(0), "Invalid payee");
        require(amount > 0, "Amount must be greater than 0");
        require(releaseTime > block.timestamp, "Release time must be in future");

        bytes32 escrowId = keccak256(
            abi.encodePacked(msg.sender, payee, amount, block.timestamp, totalEscrows)
        );

        if (token == address(0)) {
            require(msg.value == amount, "Incorrect ETH amount");
        } else {
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        }

        escrows[escrowId] = EscrowDetails({
            payer: msg.sender,
            payee: payee,
            arbiter: arbiter,
            amount: amount,
            token: token,
            releaseTime: releaseTime,
            status: EscrowStatus.Active,
            metadata: metadata,
            createdAt: block.timestamp
        });

        escrowCount[msg.sender]++;
        totalEscrows++;

        emit EscrowCreated(escrowId, msg.sender, payee, amount, releaseTime);
        return escrowId;
    }

    /**
     * @dev Release escrow to payee
     */
    function releaseEscrow(bytes32 escrowId) external nonReentrant {
        EscrowDetails storage escrow = escrows[escrowId];
        require(escrow.status == EscrowStatus.Active, "Escrow not active");
        require(
            msg.sender == escrow.payer || 
            msg.sender == escrow.arbiter || 
            block.timestamp >= escrow.releaseTime,
            "Cannot release yet"
        );

        escrow.status = EscrowStatus.Released;

        uint256 fee = (escrow.amount * platformFee) / 10000;
        uint256 netAmount = escrow.amount - fee;

        if (escrow.token == address(0)) {
            (bool success, ) = escrow.payee.call{value: netAmount}("");
            require(success, "ETH transfer failed");
            if (fee > 0) {
                (bool feeSuccess, ) = feeCollector.call{value: fee}("");
                require(feeSuccess, "Fee transfer failed");
            }
        } else {
            IERC20(escrow.token).safeTransfer(escrow.payee, netAmount);
            if (fee > 0) {
                IERC20(escrow.token).safeTransfer(feeCollector, fee);
            }
        }

        emit EscrowReleased(escrowId, netAmount);
    }

    /**
     * @dev Refund escrow to payer
     */
    function refundEscrow(bytes32 escrowId) external nonReentrant {
        EscrowDetails storage escrow = escrows[escrowId];
        require(escrow.status == EscrowStatus.Active, "Escrow not active");
        require(
            msg.sender == escrow.payee || msg.sender == escrow.arbiter,
            "Only payee or arbiter can refund"
        );

        escrow.status = EscrowStatus.Refunded;

        if (escrow.token == address(0)) {
            (bool success, ) = escrow.payer.call{value: escrow.amount}("");
            require(success, "ETH refund failed");
        } else {
            IERC20(escrow.token).safeTransfer(escrow.payer, escrow.amount);
        }

        emit EscrowRefunded(escrowId, escrow.amount);
    }

    /**
     * @dev Dispute an escrow
     */
    function disputeEscrow(bytes32 escrowId) external {
        EscrowDetails storage escrow = escrows[escrowId];
        require(escrow.status == EscrowStatus.Active, "Escrow not active");
        require(
            msg.sender == escrow.payer || msg.sender == escrow.payee,
            "Only parties can dispute"
        );

        escrow.status = EscrowStatus.Disputed;
        emit EscrowDisputed(escrowId, msg.sender);
    }

    /**
     * @dev Resolve a disputed escrow (arbiter only)
     */
    function resolveDispute(bytes32 escrowId, bool releaseToPayee) external nonReentrant {
        EscrowDetails storage escrow = escrows[escrowId];
        require(escrow.status == EscrowStatus.Disputed, "Escrow not disputed");
        require(msg.sender == escrow.arbiter, "Only arbiter can resolve");

        address winner = releaseToPayee ? escrow.payee : escrow.payer;
        escrow.status = releaseToPayee ? EscrowStatus.Released : EscrowStatus.Refunded;

        if (escrow.token == address(0)) {
            (bool success, ) = winner.call{value: escrow.amount}("");
            require(success, "ETH transfer failed");
        } else {
            IERC20(escrow.token).safeTransfer(winner, escrow.amount);
        }

        emit DisputeResolved(escrowId, winner);
    }

    /**
     * @dev Get escrow details
     */
    function getEscrow(bytes32 escrowId) external view returns (EscrowDetails memory) {
        return escrows[escrowId];
    }

    /**
     * @dev Update platform fee (admin only)
     */
    function updatePlatformFee(uint256 newFee) external onlyRole(ADMIN_ROLE) {
        require(newFee <= 500, "Fee too high");
        platformFee = newFee;
    }

    /**
     * @dev Update fee collector (admin only)
     */
    function updateFeeCollector(address newCollector) external onlyRole(ADMIN_ROLE) {
        require(newCollector != address(0), "Invalid address");
        feeCollector = newCollector;
    }

    receive() external payable {}
}

