// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PaymentVoucher
 * @author Crypto Payment Widget Team
 * @notice Gift card/voucher system for prepaid payments
 */
contract PaymentVoucher is ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Voucher {
        address issuer;
        address token;
        uint256 value;
        uint256 expiryTime;
        bool redeemed;
        address redeemedBy;
    }

    mapping(bytes32 => Voucher) public vouchers;
    uint256 public voucherCount;

    event VoucherCreated(bytes32 indexed voucherId, address indexed issuer, uint256 value);
    event VoucherRedeemed(bytes32 indexed voucherId, address indexed redeemer);

    function createVoucher(address token, uint256 value, uint256 expiryTime) 
        external payable nonReentrant returns (bytes32) 
    {
        bytes32 voucherId = keccak256(abi.encodePacked(msg.sender, value, block.timestamp, voucherCount++));
        
        if (token == address(0)) {
            require(msg.value == value, "Incorrect ETH");
        } else {
            IERC20(token).safeTransferFrom(msg.sender, address(this), value);
        }

        vouchers[voucherId] = Voucher({
            issuer: msg.sender,
            token: token,
            value: value,
            expiryTime: expiryTime,
            redeemed: false,
            redeemedBy: address(0)
        });

        emit VoucherCreated(voucherId, msg.sender, value);
        return voucherId;
    }

    function redeemVoucher(bytes32 voucherId) external nonReentrant {
        Voucher storage voucher = vouchers[voucherId];
        require(!voucher.redeemed, "Already redeemed");
        require(block.timestamp <= voucher.expiryTime, "Expired");

        voucher.redeemed = true;
        voucher.redeemedBy = msg.sender;

        if (voucher.token == address(0)) {
            (bool success, ) = msg.sender.call{value: voucher.value}("");
            require(success, "Transfer failed");
        } else {
            IERC20(voucher.token).safeTransfer(msg.sender, voucher.value);
        }

        emit VoucherRedeemed(voucherId, msg.sender);
    }

    receive() external payable {}
}

