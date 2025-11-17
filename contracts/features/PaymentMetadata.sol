// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PaymentMetadata
 * @author Crypto Payment Widget Team
 * @notice Payment metadata with IPFS integration
 */
contract PaymentMetadata {
    struct Metadata {
        string ipfsHash;
        string description;
        string category;
        bytes32[] tags;
        uint256 timestamp;
    }

    mapping(bytes32 => Metadata) public paymentMetadata;
    mapping(string => bytes32[]) public categoryPayments;
    mapping(bytes32 => bytes32[]) public tagPayments;

    event MetadataAdded(bytes32 indexed paymentId, string ipfsHash);
    event MetadataUpdated(bytes32 indexed paymentId, string ipfsHash);

    function addMetadata(
        bytes32 paymentId,
        string calldata ipfsHash,
        string calldata description,
        string calldata category,
        bytes32[] calldata tags
    ) external {
        require(bytes(paymentMetadata[paymentId].ipfsHash).length == 0, "Metadata exists");

        paymentMetadata[paymentId] = Metadata({
            ipfsHash: ipfsHash,
            description: description,
            category: category,
            tags: tags,
            timestamp: block.timestamp
        });

        if (bytes(category).length > 0) {
            categoryPayments[category].push(paymentId);
        }

        for (uint256 i = 0; i < tags.length; i++) {
            tagPayments[tags[i]].push(paymentId);
        }

        emit MetadataAdded(paymentId, ipfsHash);
    }

    function updateMetadata(bytes32 paymentId, string calldata newIpfsHash) external {
        require(bytes(paymentMetadata[paymentId].ipfsHash).length > 0, "No metadata");
        
        paymentMetadata[paymentId].ipfsHash = newIpfsHash;
        paymentMetadata[paymentId].timestamp = block.timestamp;

        emit MetadataUpdated(paymentId, newIpfsHash);
    }

    function getMetadata(bytes32 paymentId) external view returns (Metadata memory) {
        return paymentMetadata[paymentId];
    }

    function getPaymentsByCategory(string calldata category) external view returns (bytes32[] memory) {
        return categoryPayments[category];
    }

    function getPaymentsByTag(bytes32 tag) external view returns (bytes32[] memory) {
        return tagPayments[tag];
    }
}

