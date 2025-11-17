// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title FeeDistributor
 * @notice Automated fee distribution mechanism
 */
contract FeeDistributor {
    address[] public recipients;
    mapping(address => uint256) public shares;
    uint256 public totalShares;

    function addRecipient(address recipient, uint256 share) external {
        recipients.push(recipient);
        shares[recipient] = share;
        totalShares += share;
    }

    function distributeFees(address token, uint256 amount) external {
        for (uint256 i = 0; i < recipients.length; i++) {
            uint256 recipientShare = (amount * shares[recipients[i]]) / totalShares;
            if (token == address(0)) {
                payable(recipients[i]).transfer(recipientShare);
            } else {
                IERC20(token).transfer(recipients[i], recipientShare);
            }
        }
    }

    receive() external payable {}
}

