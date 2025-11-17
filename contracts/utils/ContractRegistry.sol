// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ContractRegistry
 * @notice Contract registry system
 */
contract ContractRegistry {
    mapping(bytes32 => address) public contracts;
    mapping(address => bool) public registered;
    address public owner;

    event ContractRegistered(bytes32 indexed name, address indexed contractAddress);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerContract(bytes32 name, address contractAddress) external onlyOwner {
        contracts[name] = contractAddress;
        registered[contractAddress] = true;
        emit ContractRegistered(name, contractAddress);
    }

    function getContract(bytes32 name) external view returns (address) {
        return contracts[name];
    }

    function isRegistered(address contractAddress) external view returns (bool) {
        return registered[contractAddress];
    }
}

