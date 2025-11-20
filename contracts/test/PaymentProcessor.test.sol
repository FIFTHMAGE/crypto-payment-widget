// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../PaymentProcessor.sol";
import "../mocks/MockERC20.sol";

contract PaymentProcessorTest is Test {
    PaymentProcessor public processor;
    MockERC20 public token;
    
    address public owner = address(1);
    address public payer = address(2);
    address public payee = address(3);
    address public treasury = address(4);
    
    uint256 constant PLATFORM_FEE = 250; // 2.5%
    uint256 constant INITIAL_BALANCE = 1000 ether;

    event PaymentProcessed(
        bytes32 indexed paymentId,
        address indexed payer,
        address indexed payee,
        uint256 amount,
        address token,
        uint256 fee
    );

    function setUp() public {
        vm.startPrank(owner);
        
        processor = new PaymentProcessor(treasury, PLATFORM_FEE);
        token = new MockERC20("Test Token", "TEST", 18);
        
        vm.stopPrank();
        
        // Setup balances
        vm.deal(payer, INITIAL_BALANCE);
        token.mint(payer, INITIAL_BALANCE);
    }

    function testProcessETHPayment() public {
        uint256 amount = 1 ether;
        uint256 expectedFee = (amount * PLATFORM_FEE) / 10000;
        uint256 expectedPayeeAmount = amount - expectedFee;
        
        vm.startPrank(payer);
        
        uint256 payeeBefore = payee.balance;
        uint256 treasuryBefore = treasury.balance;
        
        bytes32 paymentId = processor.processPayment{value: amount}(
            payee,
            amount,
            address(0)
        );
        
        vm.stopPrank();
        
        assertEq(payee.balance, payeeBefore + expectedPayeeAmount);
        assertEq(treasury.balance, treasuryBefore + expectedFee);
        assertTrue(paymentId != bytes32(0));
    }

    function testProcessTokenPayment() public {
        uint256 amount = 100 ether;
        uint256 expectedFee = (amount * PLATFORM_FEE) / 10000;
        uint256 expectedPayeeAmount = amount - expectedFee;
        
        vm.startPrank(payer);
        
        token.approve(address(processor), amount);
        
        uint256 payeeBefore = token.balanceOf(payee);
        uint256 treasuryBefore = token.balanceOf(treasury);
        
        bytes32 paymentId = processor.processPayment(
            payee,
            amount,
            address(token)
        );
        
        vm.stopPrank();
        
        assertEq(token.balanceOf(payee), payeeBefore + expectedPayeeAmount);
        assertEq(token.balanceOf(treasury), treasuryBefore + expectedFee);
        assertTrue(paymentId != bytes32(0));
    }

    function testCannotProcessPaymentToZeroAddress() public {
        vm.startPrank(payer);
        vm.expectRevert("Invalid payee");
        processor.processPayment{value: 1 ether}(address(0), 1 ether, address(0));
        vm.stopPrank();
    }

    function testCannotProcessZeroAmount() public {
        vm.startPrank(payer);
        vm.expectRevert("Invalid amount");
        processor.processPayment(payee, 0, address(0));
        vm.stopPrank();
    }

    function testUpdatePlatformFee() public {
        uint256 newFee = 500; // 5%
        
        vm.startPrank(owner);
        processor.updatePlatformFee(newFee);
        vm.stopPrank();
        
        assertEq(processor.getPlatformFee(), newFee);
    }

    function testCannotUpdateFeeAboveMax() public {
        vm.startPrank(owner);
        vm.expectRevert("Fee too high");
        processor.updatePlatformFee(1001); // > 10%
        vm.stopPrank();
    }

    function testUpdateTreasury() public {
        address newTreasury = address(5);
        
        vm.startPrank(owner);
        processor.updateTreasury(newTreasury);
        vm.stopPrank();
        
        // Verify by processing a payment
        vm.startPrank(payer);
        processor.processPayment{value: 1 ether}(payee, 1 ether, address(0));
        vm.stopPrank();
        
        assertTrue(newTreasury.balance > 0);
    }
}

