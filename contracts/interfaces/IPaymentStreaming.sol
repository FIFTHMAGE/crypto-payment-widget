// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IPaymentStreaming
 * @dev Interface for payment streaming functionality
 */
interface IPaymentStreaming {
    /**
     * @dev Emitted when a new stream is created
     */
    event StreamCreated(
        uint256 indexed streamId,
        address indexed sender,
        address indexed recipient,
        uint256 totalAmount,
        uint256 startTime,
        uint256 duration
    );

    /**
     * @dev Emitted when funds are withdrawn from a stream
     */
    event StreamWithdrawn(
        uint256 indexed streamId,
        address indexed recipient,
        uint256 amount
    );

    /**
     * @dev Emitted when a stream is cancelled
     */
    event StreamCancelled(
        uint256 indexed streamId,
        address indexed sender,
        uint256 refundAmount
    );

    /**
     * @dev Stream details
     */
    struct Stream {
        address sender;
        address recipient;
        uint256 totalAmount;
        uint256 startTime;
        uint256 duration;
        uint256 withdrawn;
        bool cancelled;
        address token; // address(0) for ETH
    }

    /**
     * @dev Creates a new payment stream
     * @param recipient The address that will receive the stream
     * @param totalAmount The total amount to be streamed
     * @param startTime The timestamp when streaming starts
     * @param duration The duration of the stream in seconds
     * @param token The token address (address(0) for ETH)
     * @return streamId The ID of the created stream
     */
    function createStream(
        address recipient,
        uint256 totalAmount,
        uint256 startTime,
        uint256 duration,
        address token
    ) external payable returns (uint256 streamId);

    /**
     * @dev Withdraws available balance from a stream
     * @param streamId The ID of the stream
     * @param amount The amount to withdraw
     */
    function withdrawStream(uint256 streamId, uint256 amount) external;

    /**
     * @dev Cancels a stream and refunds remaining balance to sender
     * @param streamId The ID of the stream to cancel
     */
    function cancelStream(uint256 streamId) external;

    /**
     * @dev Gets the available balance for a stream
     * @param streamId The ID of the stream
     * @return The available balance that can be withdrawn
     */
    function availableBalance(uint256 streamId) external view returns (uint256);

    /**
     * @dev Gets stream details
     * @param streamId The ID of the stream
     * @return The stream struct
     */
    function getStream(uint256 streamId) external view returns (Stream memory);

    /**
     * @dev Gets all streams where an address is the recipient
     * @param recipient The recipient address
     * @return An array of stream IDs
     */
    function getRecipientStreams(address recipient) external view returns (uint256[] memory);

    /**
     * @dev Gets all streams where an address is the sender
     * @param sender The sender address
     * @return An array of stream IDs
     */
    function getSenderStreams(address sender) external view returns (uint256[] memory);

    /**
     * @dev Checks if a stream is active
     * @param streamId The ID of the stream
     * @return True if the stream is active
     */
    function isStreamActive(uint256 streamId) external view returns (bool);

    /**
     * @dev Gets the total number of streams
     * @return The total count of streams
     */
    function getTotalStreams() external view returns (uint256);
}

