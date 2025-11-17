// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title DisputeResolution
 * @author Crypto Payment Widget Team
 * @notice Dispute resolution system for payments
 */
contract DisputeResolution is ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum DisputeStatus { Open, UnderReview, Resolved, Cancelled }
    enum Resolution { None, RefundPayer, ReleaseTo Payee, Split }

    struct Dispute {
        bytes32 paymentId;
        address payer;
        address payee;
        address token;
        uint256 amount;
        string reason;
        DisputeStatus status;
        Resolution resolution;
        address arbitrator;
        uint256 createdAt;
    }

    mapping(bytes32 => Dispute) public disputes;
    mapping(address => bool) public isArbitrator;
    uint256 public disputeCount;
    address public owner;

    event DisputeOpened(bytes32 indexed disputeId, bytes32 indexed paymentId, address indexed opener);
    event DisputeResolved(bytes32 indexed disputeId, Resolution resolution);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyArbitrator() {
        require(isArbitrator[msg.sender], "Not arbitrator");
        _;
    }

    constructor() {
        owner = msg.sender;
        isArbitrator[msg.sender] = true;
    }

    function openDispute(
        bytes32 paymentId,
        address payee,
        address token,
        uint256 amount,
        string calldata reason
    ) external payable nonReentrant returns (bytes32) {
        bytes32 disputeId = keccak256(abi.encodePacked(
            paymentId, msg.sender, block.timestamp, disputeCount++
        ));

        if (token == address(0)) {
            require(msg.value == amount, "Incorrect ETH");
        } else {
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        }

        disputes[disputeId] = Dispute({
            paymentId: paymentId,
            payer: msg.sender,
            payee: payee,
            token: token,
            amount: amount,
            reason: reason,
            status: DisputeStatus.Open,
            resolution: Resolution.None,
            arbitrator: address(0),
            createdAt: block.timestamp
        });

        emit DisputeOpened(disputeId, paymentId, msg.sender);
        return disputeId;
    }

    function resolveDispute(bytes32 disputeId, Resolution resolution) 
        external onlyArbitrator nonReentrant 
    {
        Dispute storage dispute = disputes[disputeId];
        require(dispute.status == DisputeStatus.Open || dispute.status == DisputeStatus.UnderReview, "Invalid status");

        dispute.status = DisputeStatus.Resolved;
        dispute.resolution = resolution;
        dispute.arbitrator = msg.sender;

        if (resolution == Resolution.RefundPayer) {
            _transferAsset(dispute.token, dispute.payer, dispute.amount);
        } else if (resolution == Resolution.ReleaseToPayee) {
            _transferAsset(dispute.token, dispute.payee, dispute.amount);
        } else if (resolution == Resolution.Split) {
            uint256 half = dispute.amount / 2;
            _transferAsset(dispute.token, dispute.payer, half);
            _transferAsset(dispute.token, dispute.payee, dispute.amount - half);
        }

        emit DisputeResolved(disputeId, resolution);
    }

    function addArbitrator(address arbitrator) external onlyOwner {
        isArbitrator[arbitrator] = true;
    }

    function removeArbitrator(address arbitrator) external onlyOwner {
        isArbitrator[arbitrator] = false;
    }

    function _transferAsset(address token, address to, uint256 amount) private {
        if (token == address(0)) {
            (bool success, ) = to.call{value: amount}("");
            require(success, "Transfer failed");
        } else {
            IERC20(token).safeTransfer(to, amount);
        }
    }

    receive() external payable {}
}

