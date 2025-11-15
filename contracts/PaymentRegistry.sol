// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AccessControl.sol";

/**
 * @title PaymentRegistry
 * @dev Registry for tracking all payments across the platform
 */
contract PaymentRegistry is AccessControl {
    struct PaymentRecord {
        bytes32 paymentId;
        address payer;
        address payee;
        uint256 amount;
        address token;
        uint256 timestamp;
        PaymentType paymentType;
        string metadata;
    }

    enum PaymentType {
        Direct,
        Escrow,
        Split,
        Subscription
    }

    mapping(bytes32 => PaymentRecord) public payments;
    mapping(address => bytes32[]) public userPayments;
    
    bytes32[] public allPayments;
    
    uint256 public totalPayments;
    uint256 public totalVolume;

    event PaymentRegistered(
        bytes32 indexed paymentId,
        address indexed payer,
        address indexed payee,
        uint256 amount
    );

    /**
     * @dev Register a new payment
     */
    function registerPayment(
        bytes32 paymentId,
        address payer,
        address payee,
        uint256 amount,
        address token,
        PaymentType paymentType,
        string calldata metadata
    ) external onlyRole(OPERATOR_ROLE) {
        require(payments[paymentId].timestamp == 0, "Payment already registered");

        payments[paymentId] = PaymentRecord({
            paymentId: paymentId,
            payer: payer,
            payee: payee,
            amount: amount,
            token: token,
            timestamp: block.timestamp,
            paymentType: paymentType,
            metadata: metadata
        });

        userPayments[payer].push(paymentId);
        userPayments[payee].push(paymentId);
        allPayments.push(paymentId);
        
        totalPayments++;
        totalVolume += amount;

        emit PaymentRegistered(paymentId, payer, payee, amount);
    }

    /**
     * @dev Get payments for a user
     */
    function getUserPayments(address user) external view returns (bytes32[] memory) {
        return userPayments[user];
    }

    /**
     * @dev Get payment details
     */
    function getPayment(bytes32 paymentId) external view returns (PaymentRecord memory) {
        return payments[paymentId];
    }

    /**
     * @dev Get total payment count
     */
    function getTotalPayments() external view returns (uint256) {
        return totalPayments;
    }

    /**
     * @dev Get paginated payments
     */
    function getPayments(uint256 offset, uint256 limit) 
        external 
        view 
        returns (PaymentRecord[] memory) 
    {
        require(offset < allPayments.length, "Offset out of bounds");
        
        uint256 end = offset + limit;
        if (end > allPayments.length) {
            end = allPayments.length;
        }
        
        uint256 length = end - offset;
        PaymentRecord[] memory result = new PaymentRecord[](length);
        
        for (uint256 i = 0; i < length; i++) {
            result[i] = payments[allPayments[offset + i]];
        }
        
        return result;
    }
}

