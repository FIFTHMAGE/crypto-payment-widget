// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title RefundableDeposit
 * @author Crypto Payment Widget Team
 * @notice Refundable security deposits
 */
contract RefundableDeposit is ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum DepositStatus { Active, Claimed, Refunded }

    struct Deposit {
        address depositor;
        address beneficiary;
        address token;
        uint256 amount;
        uint256 unlockTime;
        DepositStatus status;
        string purpose;
    }

    mapping(bytes32 => Deposit) public deposits;
    uint256 public depositCount;

    event DepositMade(bytes32 indexed depositId, address indexed depositor, uint256 amount);
    event DepositClaimed(bytes32 indexed depositId, address indexed beneficiary);
    event DepositRefunded(bytes32 indexed depositId, address indexed depositor);

    function makeDeposit(
        address beneficiary,
        address token,
        uint256 amount,
        uint256 unlockTime,
        string calldata purpose
    ) external payable nonReentrant returns (bytes32) {
        bytes32 depositId = keccak256(abi.encodePacked(
            msg.sender, beneficiary, amount, block.timestamp, depositCount++
        ));

        if (token == address(0)) {
            require(msg.value == amount, "Incorrect ETH");
        } else {
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        }

        deposits[depositId] = Deposit({
            depositor: msg.sender,
            beneficiary: beneficiary,
            token: token,
            amount: amount,
            unlockTime: unlockTime,
            status: DepositStatus.Active,
            purpose: purpose
        });

        emit DepositMade(depositId, msg.sender, amount);
        return depositId;
    }

    function claimDeposit(bytes32 depositId) external nonReentrant {
        Deposit storage deposit = deposits[depositId];
        require(msg.sender == deposit.beneficiary, "Not beneficiary");
        require(deposit.status == DepositStatus.Active, "Not active");
        require(block.timestamp >= deposit.unlockTime, "Still locked");

        deposit.status = DepositStatus.Claimed;

        if (deposit.token == address(0)) {
            (bool success, ) = msg.sender.call{value: deposit.amount}("");
            require(success, "Transfer failed");
        } else {
            IERC20(deposit.token).safeTransfer(msg.sender, deposit.amount);
        }

        emit DepositClaimed(depositId, msg.sender);
    }

    function refundDeposit(bytes32 depositId) external nonReentrant {
        Deposit storage deposit = deposits[depositId];
        require(msg.sender == deposit.depositor, "Not depositor");
        require(deposit.status == DepositStatus.Active, "Not active");

        deposit.status = DepositStatus.Refunded;

        if (deposit.token == address(0)) {
            (bool success, ) = msg.sender.call{value: deposit.amount}("");
            require(success, "Transfer failed");
        } else {
            IERC20(deposit.token).safeTransfer(msg.sender, deposit.amount);
        }

        emit DepositRefunded(depositId, msg.sender);
    }

    function getDeposit(bytes32 depositId) external view returns (Deposit memory) {
        return deposits[depositId];
    }

    receive() external payable {}
}

