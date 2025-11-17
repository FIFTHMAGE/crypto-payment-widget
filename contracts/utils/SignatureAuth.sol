// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SignatureAuth
 * @notice Signature-based payment authorization
 */
contract SignatureAuth {
    mapping(address => uint256) public nonces;

    function verifyAuthorization(
        address user,
        uint256 amount,
        uint256 nonce,
        bytes memory signature
    ) public view returns (bool) {
        require(nonce == nonces[user], "Invalid nonce");
        
        bytes32 hash = keccak256(abi.encodePacked(user, amount, nonce));
        bytes32 messageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
        
        address signer = recoverSigner(messageHash, signature);
        return signer == user;
    }

    function recoverSigner(bytes32 hash, bytes memory signature) internal pure returns (address) {
        require(signature.length == 65, "Invalid length");
        
        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }

        return ecrecover(hash, v, r, s);
    }

    function incrementNonce() external {
        nonces[msg.sender]++;
    }
}

