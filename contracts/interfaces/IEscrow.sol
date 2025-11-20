// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IEscrow
 * @dev Interface for escrow operations
 */
interface IEscrow {
    struct EscrowDetails {
        bytes32 id;
        address payer;
        address payee;
        uint256 amount;
        address token;
        uint256 releaseTime;
        EscrowStatus status;
        bool disputed;
    }

    enum EscrowStatus {
        ACTIVE,
        RELEASED,
        REFUNDED,
        DISPUTED
    }

    /**
     * @dev Create an escrow
     * @param payee Recipient address
     * @param amount Escrow amount
     * @param token Token address (address(0) for ETH)
     * @param releaseTime Time when funds can be released
     * @return escrowId Unique escrow identifier
     */
    function createEscrow(
        address payee,
        uint256 amount,
        address token,
        uint256 releaseTime
    ) external payable returns (bytes32 escrowId);

    /**
     * @dev Release escrowed funds to payee
     * @param escrowId Escrow identifier
     */
    function releaseEscrow(bytes32 escrowId) external;

    /**
     * @dev Refund escrowed funds to payer
     * @param escrowId Escrow identifier
     */
    function refundEscrow(bytes32 escrowId) external;

    /**
     * @dev Open a dispute
     * @param escrowId Escrow identifier
     * @param reason Dispute reason
     */
    function openDispute(bytes32 escrowId, string calldata reason) external;

    /**
     * @dev Resolve a dispute
     * @param escrowId Escrow identifier
     * @param releaseToPayee True to release to payee, false to refund to payer
     */
    function resolveDispute(bytes32 escrowId, bool releaseToPayee) external;

    /**
     * @dev Get escrow details
     * @param escrowId Escrow identifier
     * @return details Escrow details
     */
    function getEscrow(bytes32 escrowId) external view returns (EscrowDetails memory details);

    /**
     * @dev Check if escrow can be released
     * @param escrowId Escrow identifier
     * @return canRelease True if can be released
     */
    function canReleaseEscrow(bytes32 escrowId) external view returns (bool canRelease);

    // Events
    event EscrowCreated(
        bytes32 indexed escrowId,
        address indexed payer,
        address indexed payee,
        uint256 amount,
        address token,
        uint256 releaseTime
    );

    event EscrowReleased(
        bytes32 indexed escrowId,
        address indexed payee,
        uint256 amount
    );

    event EscrowRefunded(
        bytes32 indexed escrowId,
        address indexed payer,
        uint256 amount
    );

    event DisputeOpened(
        bytes32 indexed escrowId,
        address indexed opener,
        string reason
    );

    event DisputeResolved(
        bytes32 indexed escrowId,
        address indexed resolver,
        bool payerWon
    );
}

