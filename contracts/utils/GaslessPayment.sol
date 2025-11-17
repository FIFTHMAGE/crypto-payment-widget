// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GaslessPayment
 * @notice Gasless transaction support (meta-transactions)
 */
contract GaslessPayment {
    mapping(address => uint256) public nonces;

    function executeMetaTransaction(
        address from,
        address to,
        uint256 amount,
        bytes memory signature
    ) external returns (bool) {
        uint256 nonce = nonces[from]++;
        bytes32 hash = keccak256(abi.encodePacked(from, to, amount, nonce));
        
        require(verify(from, hash, signature), "Invalid signature");
        
        // Execute payment logic here
        return true;
    }

    function verify(address signer, bytes32 hash, bytes memory signature) internal pure returns (bool) {
        bytes32 messageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
        return recoverSigner(messageHash, signature) == signer;
    }

    function recoverSigner(bytes32 hash, bytes memory sig) internal pure returns (address) {
        require(sig.length == 65, "Invalid length");
        
        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }

        return ecrecover(hash, v, r, s);
    }
}

