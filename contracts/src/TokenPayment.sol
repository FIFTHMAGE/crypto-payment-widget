// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TokenPayment {
    event PaymentSent(address indexed from, address indexed to, uint256 amount);

    function sendPayment(address to, uint256 amount) external {
        emit PaymentSent(msg.sender, to, amount);
    }
}
