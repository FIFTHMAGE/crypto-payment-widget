// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PaymentLink
 * @author Crypto Payment Widget Team
 * @notice Payment link generator for easy payments
 */
contract PaymentLink is ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Link {
        address creator;
        address token;
        uint256 amount;
        uint256 maxUses;
        uint256 usedCount;
        uint256 expiryTime;
        bool active;
        string description;
    }

    mapping(bytes32 => Link) public links;
    mapping(bytes32 => address[]) public linkPayers;
    uint256 public linkCount;

    event LinkCreated(bytes32 indexed linkId, address indexed creator, uint256 amount);
    event LinkPaid(bytes32 indexed linkId, address indexed payer, uint256 amount);
    event LinkDeactivated(bytes32 indexed linkId);

    function createLink(
        address token,
        uint256 amount,
        uint256 maxUses,
        uint256 expiryTime,
        string calldata description
    ) external returns (bytes32) {
        bytes32 linkId = keccak256(abi.encodePacked(
            msg.sender, token, amount, block.timestamp, linkCount++
        ));

        links[linkId] = Link({
            creator: msg.sender,
            token: token,
            amount: amount,
            maxUses: maxUses,
            usedCount: 0,
            expiryTime: expiryTime,
            active: true,
            description: description
        });

        emit LinkCreated(linkId, msg.sender, amount);
        return linkId;
    }

    function payLink(bytes32 linkId) external payable nonReentrant {
        Link storage link = links[linkId];
        require(link.active, "Link not active");
        require(block.timestamp <= link.expiryTime, "Link expired");
        require(link.usedCount < link.maxUses || link.maxUses == 0, "Max uses reached");

        if (link.token == address(0)) {
            require(msg.value == link.amount, "Incorrect ETH");
            (bool success, ) = link.creator.call{value: link.amount}("");
            require(success, "Transfer failed");
        } else {
            IERC20(link.token).safeTransferFrom(msg.sender, link.creator, link.amount);
        }

        link.usedCount++;
        linkPayers[linkId].push(msg.sender);

        emit LinkPaid(linkId, msg.sender, link.amount);
    }

    function deactivateLink(bytes32 linkId) external {
        Link storage link = links[linkId];
        require(msg.sender == link.creator, "Not creator");
        
        link.active = false;
        emit LinkDeactivated(linkId);
    }

    function getLink(bytes32 linkId) external view returns (Link memory) {
        return links[linkId];
    }

    function getLinkPayers(bytes32 linkId) external view returns (address[] memory) {
        return linkPayers[linkId];
    }

    receive() external payable {}
}

