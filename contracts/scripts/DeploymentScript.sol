// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DeploymentScript
 * @notice Deployment scripts with verification
 */
contract DeploymentScript {
    address[] public deployedContracts;
    mapping(address => string) public contractNames;
    mapping(address => bool) public verified;

    event ContractDeployed(address indexed contractAddress, string name);
    event ContractVerified(address indexed contractAddress);

    function recordDeployment(address contractAddress, string memory name) external {
        deployedContracts.push(contractAddress);
        contractNames[contractAddress] = name;
        emit ContractDeployed(contractAddress, name);
    }

    function markVerified(address contractAddress) external {
        verified[contractAddress] = true;
        emit ContractVerified(contractAddress);
    }

    function getDeployedContracts() external view returns (address[] memory) {
        return deployedContracts;
    }

    function isVerified(address contractAddress) external view returns (bool) {
        return verified[contractAddress];
    }
}

