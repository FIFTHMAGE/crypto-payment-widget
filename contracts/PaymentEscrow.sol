// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

contract PaymentEscrow is OwnableUpgradeable, ReentrancyGuardUpgradeable {
    struct Payment {
        address payer;
        address payee;
        uint256 amount;
        bool released;
        bool refunded;
    }
    
    mapping(bytes32 => Payment) public payments;
    
    event PaymentCreated(bytes32 indexed paymentId, address payer, address payee, uint256 amount);
    event PaymentReleased(bytes32 indexed paymentId);
    event PaymentRefunded(bytes32 indexed paymentId);
    
    function initialize() public initializer {
        __Ownable_init();
        __ReentrancyGuard_init();
    }
    
    function createPayment(bytes32 paymentId, address payee) external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        require(payments[paymentId].amount == 0, "Payment already exists");
        
        payments[paymentId] = Payment({
            payer: msg.sender,
            payee: payee,
            amount: msg.value,
            released: false,
            refunded: false
        });
        
        emit PaymentCreated(paymentId, msg.sender, payee, msg.value);
    }
    
    function releasePayment(bytes32 paymentId) external nonReentrant {
        Payment storage payment = payments[paymentId];
        require(payment.amount > 0, "Payment does not exist");
        require(!payment.released, "Payment already released");
        require(!payment.refunded, "Payment already refunded");
        require(msg.sender == payment.payer || msg.sender == owner(), "Not authorized");
        
        payment.released = true;
        payable(payment.payee).transfer(payment.amount);
        
        emit PaymentReleased(paymentId);
    }
    
    function refundPayment(bytes32 paymentId) external nonReentrant {
        Payment storage payment = payments[paymentId];
        require(payment.amount > 0, "Payment does not exist");
        require(!payment.released, "Payment already released");
        require(!payment.refunded, "Payment already refunded");
        require(msg.sender == owner(), "Only owner can refund");
        
        payment.refunded = true;
        payable(payment.payer).transfer(payment.amount);
        
        emit PaymentRefunded(paymentId);
    }
}
