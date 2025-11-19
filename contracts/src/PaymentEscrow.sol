// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PaymentEscrow {
    mapping(bytes32 => uint256) public escrows;

    function deposit(bytes32 id) external payable {
        escrows[id] += msg.value;
    }

    function withdraw(bytes32 id, uint256 amount) external {
        require(escrows[id] >= amount, "Insufficient funds");
        escrows[id] -= amount;
        payable(msg.sender).transfer(amount);
    }
}
