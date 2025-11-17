// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PaymentStreaming
 * @author Crypto Payment Widget Team
 * @notice Continuous payment streaming over time
 * @dev Enables real-time payment flows with per-second rate
 */
contract PaymentStreaming is ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Stream {
        address sender;
        address recipient;
        address token;
        uint256 deposit;
        uint256 ratePerSecond;
        uint256 startTime;
        uint256 stopTime;
        uint256 withdrawn;
        bool active;
    }

    mapping(bytes32 => Stream) public streams;
    mapping(address => bytes32[]) public senderStreams;
    mapping(address => bytes32[]) public recipientStreams;
    
    bytes32[] public allStreams;
    uint256 public streamCount;

    event StreamCreated(
        bytes32 indexed streamId,
        address indexed sender,
        address indexed recipient,
        uint256 deposit,
        uint256 ratePerSecond,
        uint256 startTime,
        uint256 stopTime
    );

    event StreamWithdrawn(
        bytes32 indexed streamId,
        address indexed recipient,
        uint256 amount
    );

    event StreamCancelled(
        bytes32 indexed streamId,
        uint256 senderBalance,
        uint256 recipientBalance
    );

    error InvalidAddress(address addr);
    error InvalidAmount(uint256 amount);
    error InvalidTimeRange(uint256 start, uint256 stop);
    error StreamNotActive(bytes32 streamId);
    error Unauthorized(address caller);
    error NoBalanceToWithdraw();

    /**
     * @notice Create a new payment stream
     * @param recipient Stream recipient address
     * @param token Token address (address(0) for ETH)
     * @param deposit Total amount to stream
     * @param startTime Stream start timestamp
     * @param stopTime Stream stop timestamp
     * @return streamId Created stream identifier
     */
    function createStream(
        address recipient,
        address token,
        uint256 deposit,
        uint256 startTime,
        uint256 stopTime
    ) external payable nonReentrant returns (bytes32 streamId) {
        if (recipient == address(0)) revert InvalidAddress(recipient);
        if (deposit == 0) revert InvalidAmount(deposit);
        if (startTime < block.timestamp) revert InvalidTimeRange(startTime, stopTime);
        if (stopTime <= startTime) revert InvalidTimeRange(startTime, stopTime);

        uint256 duration = stopTime - startTime;
        uint256 ratePerSecond = deposit / duration;
        if (ratePerSecond == 0) revert InvalidAmount(deposit);

        streamId = keccak256(abi.encodePacked(
            msg.sender,
            recipient,
            deposit,
            block.timestamp,
            streamCount
        ));

        if (token == address(0)) {
            require(msg.value == deposit, "Incorrect ETH amount");
        } else {
            IERC20(token).safeTransferFrom(msg.sender, address(this), deposit);
        }

        streams[streamId] = Stream({
            sender: msg.sender,
            recipient: recipient,
            token: token,
            deposit: deposit,
            ratePerSecond: ratePerSecond,
            startTime: startTime,
            stopTime: stopTime,
            withdrawn: 0,
            active: true
        });

        senderStreams[msg.sender].push(streamId);
        recipientStreams[recipient].push(streamId);
        allStreams.push(streamId);
        streamCount++;

        emit StreamCreated(
            streamId,
            msg.sender,
            recipient,
            deposit,
            ratePerSecond,
            startTime,
            stopTime
        );

        return streamId;
    }

    /**
     * @notice Calculate available balance for recipient
     * @param streamId Stream identifier
     * @return Available amount to withdraw
     */
    function balanceOf(bytes32 streamId) public view returns (uint256) {
        Stream storage stream = streams[streamId];
        if (!stream.active) return 0;

        if (block.timestamp <= stream.startTime) {
            return 0;
        }

        uint256 endTime = block.timestamp > stream.stopTime ? stream.stopTime : block.timestamp;
        uint256 elapsed = endTime - stream.startTime;
        uint256 streamed = elapsed * stream.ratePerSecond;

        if (streamed > stream.deposit) {
            streamed = stream.deposit;
        }

        return streamed - stream.withdrawn;
    }

    /**
     * @notice Withdraw available streamed amount
     * @param streamId Stream identifier
     * @param amount Amount to withdraw (0 for all available)
     */
    function withdrawFromStream(bytes32 streamId, uint256 amount) external nonReentrant {
        Stream storage stream = streams[streamId];
        
        if (!stream.active) revert StreamNotActive(streamId);
        if (msg.sender != stream.recipient) revert Unauthorized(msg.sender);

        uint256 available = balanceOf(streamId);
        if (available == 0) revert NoBalanceToWithdraw();

        uint256 withdrawAmount = amount == 0 ? available : amount;
        require(withdrawAmount <= available, "Insufficient balance");

        stream.withdrawn += withdrawAmount;

        if (stream.token == address(0)) {
            _transferETH(stream.recipient, withdrawAmount);
        } else {
            IERC20(stream.token).safeTransfer(stream.recipient, withdrawAmount);
        }

        emit StreamWithdrawn(streamId, stream.recipient, withdrawAmount);
    }

    /**
     * @notice Cancel an active stream
     * @param streamId Stream identifier
     */
    function cancelStream(bytes32 streamId) external nonReentrant {
        Stream storage stream = streams[streamId];
        
        if (!stream.active) revert StreamNotActive(streamId);
        if (msg.sender != stream.sender && msg.sender != stream.recipient) {
            revert Unauthorized(msg.sender);
        }

        uint256 recipientBalance = balanceOf(streamId);
        uint256 senderBalance = stream.deposit - stream.withdrawn - recipientBalance;

        stream.active = false;

        if (recipientBalance > 0) {
            if (stream.token == address(0)) {
                _transferETH(stream.recipient, recipientBalance);
            } else {
                IERC20(stream.token).safeTransfer(stream.recipient, recipientBalance);
            }
        }

        if (senderBalance > 0) {
            if (stream.token == address(0)) {
                _transferETH(stream.sender, senderBalance);
            } else {
                IERC20(stream.token).safeTransfer(stream.sender, senderBalance);
            }
        }

        emit StreamCancelled(streamId, senderBalance, recipientBalance);
    }

    /**
     * @notice Get stream details
     * @param streamId Stream identifier
     * @return Stream data
     */
    function getStream(bytes32 streamId) external view returns (Stream memory) {
        return streams[streamId];
    }

    /**
     * @notice Get sender's streams
     * @param sender Sender address
     * @return Array of stream identifiers
     */
    function getSenderStreams(address sender) external view returns (bytes32[] memory) {
        return senderStreams[sender];
    }

    /**
     * @notice Get recipient's streams
     * @param recipient Recipient address
     * @return Array of stream identifiers
     */
    function getRecipientStreams(address recipient) external view returns (bytes32[] memory) {
        return recipientStreams[recipient];
    }

    /**
     * @notice Check if stream is active and ongoing
     * @param streamId Stream identifier
     * @return Boolean indicating if stream is active
     */
    function isActiveStream(bytes32 streamId) external view returns (bool) {
        Stream storage stream = streams[streamId];
        return stream.active && 
               block.timestamp >= stream.startTime && 
               block.timestamp < stream.stopTime;
    }

    function _transferETH(address to, uint256 amount) private {
        (bool success, ) = to.call{value: amount}("");
        require(success, "ETH transfer failed");
    }

    receive() external payable {}
}

