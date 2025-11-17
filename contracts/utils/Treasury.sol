// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Treasury
 * @notice Treasury management contract
 */
contract Treasury {
    address public owner;
    mapping(address => uint256) public balances;

    event Deposit(address indexed token, uint256 amount);
    event Withdrawal(address indexed token, address indexed to, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function deposit(address token, uint256 amount) external payable {
        if (token == address(0)) {
            balances[token] += msg.value;
        } else {
            IERC20(token).transferFrom(msg.sender, address(this), amount);
            balances[token] += amount;
        }
        emit Deposit(token, amount);
    }

    function withdraw(address token, address to, uint256 amount) external onlyOwner {
        require(balances[token] >= amount, "Insufficient balance");
        balances[token] -= amount;
        
        if (token == address(0)) {
            payable(to).transfer(amount);
        } else {
            IERC20(token).transfer(to, amount);
        }
        emit Withdrawal(token, to, amount);
    }

    receive() external payable {
        balances[address(0)] += msg.value;
        emit Deposit(address(0), msg.value);
    }
}

