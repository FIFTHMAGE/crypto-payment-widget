// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MultiTokenSplit
 * @author Crypto Payment Widget Team
 * @notice Multi-token payment splitting
 */
contract MultiTokenSplit is ReentrancyGuard {
    using SafeERC20 for IERC20;

    event MultiTokenSplit(
        address indexed sender,
        address[] recipients,
        address[] tokens,
        uint256[] amounts
    );

    function splitMultiToken(
        address[] calldata recipients,
        address[] calldata tokens,
        uint256[] calldata amounts
    ) external payable nonReentrant {
        require(
            recipients.length == tokens.length && tokens.length == amounts.length,
            "Length mismatch"
        );
        require(recipients.length > 0, "Empty arrays");

        uint256 ethTotal = 0;
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient");
            require(amounts[i] > 0, "Invalid amount");

            if (tokens[i] == address(0)) {
                ethTotal += amounts[i];
            }
        }

        if (ethTotal > 0) {
            require(msg.value == ethTotal, "Incorrect ETH");
        }

        for (uint256 i = 0; i < recipients.length; i++) {
            if (tokens[i] == address(0)) {
                (bool success, ) = recipients[i].call{value: amounts[i]}("");
                require(success, "ETH transfer failed");
            } else {
                IERC20(tokens[i]).safeTransferFrom(msg.sender, recipients[i], amounts[i]);
            }
        }

        emit MultiTokenSplit(msg.sender, recipients, tokens, amounts);
    }

    receive() external payable {}
}

