// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../PaymentProcessor.sol";
import "../Escrow.sol";
import "../security/EnhancedCircuitBreaker.sol";
import "../security/ContractRateLimiter.sol";

/**
 * @title Security Tests with Foundry
 * @dev Comprehensive security tests using Foundry framework
 */
contract SecurityTestsFoundry is Test {
    PaymentProcessor public paymentProcessor;
    Escrow public escrow;
    EnhancedCircuitBreaker public circuitBreaker;
    ContractRateLimiter public rateLimiter;

    address public owner;
    address public user1;
    address public user2;
    address public attacker;

    event SecurityEvent(string eventType, address indexed actor, uint256 value);

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        attacker = makeAddr("attacker");

        // Deploy contracts
        paymentProcessor = new PaymentProcessor();
        escrow = new Escrow();
        circuitBreaker = new EnhancedCircuitBreaker();
        rateLimiter = new ContractRateLimiter();

        // Fund test addresses
        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);
        vm.deal(attacker, 100 ether);
    }

    /**
     * Test reentrancy protection
     */
    function testReentrancyProtection() public {
        // Create malicious contract that attempts reentrancy
        ReentrancyAttacker attackerContract = new ReentrancyAttacker(
            address(paymentProcessor)
        );
        vm.deal(address(attackerContract), 10 ether);

        // Attempt reentrancy attack
        vm.expectRevert("ReentrancyGuard: reentrant call");
        attackerContract.attack{value: 1 ether}();
    }

    /**
     * Test overflow protection
     */
    function testOverflowProtection() public {
        uint256 maxUint = type(uint256).max;

        // Attempt to cause overflow
        vm.expectRevert();
        paymentProcessor.processPayment{value: maxUint}(user1);
    }

    /**
     * Test unauthorized access
     */
    function testUnauthorizedAccess() public {
        vm.prank(attacker);
        vm.expectRevert("Ownable: caller is not the owner");
        paymentProcessor.pause();
    }

    /**
     * Test circuit breaker functionality
     */
    function testCircuitBreaker() public {
        // Trigger circuit breaker
        circuitBreaker.trip();

        assertTrue(circuitBreaker.isTripped());

        // Operations should fail when tripped
        vm.expectRevert("Circuit breaker is tripped");
        circuitBreaker.executeProtected();
    }

    /**
     * Test rate limiting
     */
    function testRateLimiting() public {
        // Configure rate limit: 5 calls per minute
        rateLimiter.setRateLimit(user1, 5, 60);

        // Make allowed calls
        for (uint256 i = 0; i < 5; i++) {
            vm.prank(user1);
            rateLimiter.executeRateLimited();
        }

        // Next call should be rate limited
        vm.prank(user1);
        vm.expectRevert("Rate limit exceeded");
        rateLimiter.executeRateLimited();

        // Fast forward time and try again
        vm.warp(block.timestamp + 61);
        vm.prank(user1);
        rateLimiter.executeRateLimited();
    }

    /**
     * Test flash loan attack prevention
     */
    function testFlashLoanProtection() public {
        // Same-block operations should be detected
        vm.prank(attacker);
        paymentProcessor.deposit{value: 1 ether}();

        vm.prank(attacker);
        vm.expectRevert("Same-block operation not allowed");
        paymentProcessor.withdraw(1 ether);
    }

    /**
     * Test integer precision attacks
     */
    function testPrecisionAttacks() public {
        // Very small amounts
        vm.prank(user1);
        vm.expectRevert("Amount too small");
        paymentProcessor.processPayment{value: 1 wei}(user2);

        // Very large amounts
        vm.prank(user1);
        vm.expectRevert("Amount exceeds maximum");
        paymentProcessor.processPayment{value: 1000000 ether}(user2);
    }

    /**
     * Test gas griefing protection
     */
    function testGasGriefingProtection() public {
        // Create array of many recipients
        address[] memory recipients = new address[](1000);
        uint256[] memory amounts = new uint256[](1000);

        for (uint256 i = 0; i < 1000; i++) {
            recipients[i] = address(uint160(i + 1));
            amounts[i] = 0.001 ether;
        }

        // Should enforce maximum batch size
        vm.expectRevert("Batch size exceeds maximum");
        paymentProcessor.batchTransfer{value: 1 ether}(recipients, amounts);
    }

    /**
     * Test front-running protection
     */
    function testFrontRunningProtection() public {
        // User creates payment with deadline
        uint256 deadline = block.timestamp + 300;

        vm.prank(user1);
        bytes32 paymentId = paymentProcessor.createPaymentWithDeadline{
            value: 1 ether
        }(user2, deadline);

        // Attacker tries to front-run
        vm.warp(block.timestamp + 301);
        vm.prank(attacker);
        vm.expectRevert("Payment deadline exceeded");
        paymentProcessor.executePayment(paymentId);
    }

    /**
     * Test signature replay protection
     */
    function testSignatureReplayProtection() public {
        // Create signed message
        bytes32 messageHash = keccak256(
            abi.encodePacked(user1, user2, 1 ether, block.timestamp)
        );
        bytes memory signature = signMessage(messageHash);

        // First execution should succeed
        vm.prank(user1);
        paymentProcessor.executeWithSignature{value: 1 ether}(
            user2,
            1 ether,
            signature
        );

        // Replay should fail
        vm.prank(attacker);
        vm.expectRevert("Signature already used");
        paymentProcessor.executeWithSignature{value: 1 ether}(
            user2,
            1 ether,
            signature
        );
    }

    /**
     * Test access control hierarchy
     */
    function testAccessControlHierarchy() public {
        bytes32 ADMIN_ROLE = keccak256("ADMIN_ROLE");
        bytes32 OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

        // Grant roles
        paymentProcessor.grantRole(ADMIN_ROLE, user1);
        paymentProcessor.grantRole(OPERATOR_ROLE, user2);

        // Admin can grant operator role
        vm.prank(user1);
        paymentProcessor.grantRole(OPERATOR_ROLE, attacker);

        // Operator cannot grant admin role
        vm.prank(user2);
        vm.expectRevert("AccessControl: insufficient permissions");
        paymentProcessor.grantRole(ADMIN_ROLE, attacker);
    }

    /**
     * Test emergency withdrawal
     */
    function testEmergencyWithdrawal() public {
        // Deposit funds
        vm.prank(user1);
        paymentProcessor.deposit{value: 10 ether}();

        // Non-owner cannot emergency withdraw
        vm.prank(attacker);
        vm.expectRevert("Ownable: caller is not the owner");
        paymentProcessor.emergencyWithdraw();

        // Owner can emergency withdraw
        uint256 balanceBefore = owner.balance;
        paymentProcessor.emergencyWithdraw();
        uint256 balanceAfter = owner.balance;

        assertEq(balanceAfter - balanceBefore, 10 ether);
    }

    /**
     * Test time-lock mechanism
     */
    function testTimeLock() public {
        // Queue admin action with timelock
        bytes memory data = abi.encodeWithSignature("setFeeRate(uint256)", 500);
        uint256 executeTime = block.timestamp + 2 days;

        bytes32 txId = paymentProcessor.queueTransaction(
            address(paymentProcessor),
            data,
            executeTime
        );

        // Cannot execute before timelock
        vm.expectRevert("Transaction not ready");
        paymentProcessor.executeTransaction(txId);

        // Fast forward time
        vm.warp(executeTime + 1);

        // Should execute successfully
        paymentProcessor.executeTransaction(txId);
    }

    /**
     * Helper function to sign messages
     */
    function signMessage(bytes32 messageHash)
        internal
        pure
        returns (bytes memory)
    {
        // Simplified signature for testing
        return abi.encodePacked(messageHash);
    }

    /**
     * Fuzz test for payment amounts
     */
    function testFuzz_PaymentAmounts(uint256 amount) public {
        vm.assume(amount > 0.001 ether && amount < 1000 ether);

        vm.deal(user1, amount + 1 ether);
        vm.prank(user1);
        paymentProcessor.processPayment{value: amount}(user2);

        // Verify payment was processed correctly
        assertEq(user2.balance, amount);
    }

    /**
     * Invariant test for total balance
     */
    function invariant_TotalBalanceConsistency() public {
        uint256 contractBalance = address(paymentProcessor).balance;
        uint256 trackedBalance = paymentProcessor.getTotalTrackedBalance();

        assertEq(contractBalance, trackedBalance);
    }
}

/**
 * Malicious contract for reentrancy testing
 */
contract ReentrancyAttacker {
    PaymentProcessor public target;
    uint256 public attackCount;

    constructor(address _target) {
        target = PaymentProcessor(_target);
    }

    function attack() external payable {
        target.deposit{value: msg.value}();
        target.withdraw(msg.value);
    }

    receive() external payable {
        if (attackCount < 2) {
            attackCount++;
            target.withdraw(msg.value);
        }
    }
}

