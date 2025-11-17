// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../upgradeable/PaymentProcessorUpgradeable.sol";

/**
 * @title PaymentProcessorFactory
 * @author Crypto Payment Widget Team
 * @notice Factory contract for deploying payment processors with deterministic addresses
 * @dev Uses CREATE2 for deterministic deployment and proxy pattern for upgradeability
 */
contract PaymentProcessorFactory is Ownable {
    address public implementation;
    uint256 public deploymentCount;
    
    mapping(address => bool) public isPaymentProcessor;
    mapping(bytes32 => address) public deployments;
    address[] public allDeployments;

    event PaymentProcessorDeployed(
        address indexed proxy,
        address indexed deployer,
        address indexed feeCollector,
        bytes32 salt
    );

    event ImplementationUpdated(
        address indexed oldImplementation,
        address indexed newImplementation
    );

    error DeploymentFailed(bytes32 salt);
    error InvalidFeeCollector(address feeCollector);
    error DeploymentAlreadyExists(bytes32 salt, address existing);

    constructor(address implementation_) Ownable(msg.sender) {
        require(implementation_ != address(0), "Invalid implementation");
        implementation = implementation_;
    }

    /**
     * @notice Deploy a new payment processor with deterministic address
     * @param feeCollector The fee collector address for the new processor
     * @param salt Salt for CREATE2 deployment
     * @return proxy The address of the deployed proxy
     */
    function deployPaymentProcessor(
        address feeCollector,
        bytes32 salt
    ) external returns (address proxy) {
        if (feeCollector == address(0)) {
            revert InvalidFeeCollector(feeCollector);
        }

        if (deployments[salt] != address(0)) {
            revert DeploymentAlreadyExists(salt, deployments[salt]);
        }

        bytes memory initData = abi.encodeWithSelector(
            PaymentProcessorUpgradeable.initialize.selector,
            feeCollector
        );

        proxy = address(new ERC1967Proxy{salt: salt}(implementation, initData));

        if (proxy == address(0)) {
            revert DeploymentFailed(salt);
        }

        deployments[salt] = proxy;
        isPaymentProcessor[proxy] = true;
        allDeployments.push(proxy);
        deploymentCount++;

        emit PaymentProcessorDeployed(proxy, msg.sender, feeCollector, salt);
        return proxy;
    }

    /**
     * @notice Compute the deployment address for a given salt
     * @param salt The salt to use for address computation
     * @return The predicted address
     */
    function computeAddress(bytes32 salt) external view returns (address) {
        bytes memory bytecode = abi.encodePacked(
            type(ERC1967Proxy).creationCode,
            abi.encode(implementation, "")
        );

        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(this),
                salt,
                keccak256(bytecode)
            )
        );

        return address(uint160(uint256(hash)));
    }

    /**
     * @notice Update the implementation address for future deployments
     * @param newImplementation The new implementation address
     */
    function updateImplementation(address newImplementation) external onlyOwner {
        require(newImplementation != address(0), "Invalid implementation");
        
        address oldImplementation = implementation;
        implementation = newImplementation;
        
        emit ImplementationUpdated(oldImplementation, newImplementation);
    }

    /**
     * @notice Get all deployed payment processor addresses
     * @return Array of all deployment addresses
     */
    function getAllDeployments() external view returns (address[] memory) {
        return allDeployments;
    }

    /**
     * @notice Get deployment address for a specific salt
     * @param salt The deployment salt
     * @return The deployment address (address(0) if not deployed)
     */
    function getDeployment(bytes32 salt) external view returns (address) {
        return deployments[salt];
    }

    /**
     * @notice Check if an address is a payment processor deployed by this factory
     * @param processor The address to check
     * @return Boolean indicating if it's a deployed processor
     */
    function isDeployedProcessor(address processor) external view returns (bool) {
        return isPaymentProcessor[processor];
    }

    /**
     * @notice Get the total number of deployed processors
     * @return Total deployment count
     */
    function getDeploymentCount() external view returns (uint256) {
        return deploymentCount;
    }

    /**
     * @notice Get paginated list of deployments
     * @param offset Starting index
     * @param limit Maximum number of results
     * @return Array of deployment addresses
     */
    function getDeploymentsPaginated(
        uint256 offset,
        uint256 limit
    ) external view returns (address[] memory) {
        if (offset >= allDeployments.length) {
            return new address[](0);
        }

        uint256 end = offset + limit;
        if (end > allDeployments.length) {
            end = allDeployments.length;
        }

        address[] memory result = new address[](end - offset);
        for (uint256 i = 0; i < end - offset; i++) {
            result[i] = allDeployments[offset + i];
        }

        return result;
    }
}

