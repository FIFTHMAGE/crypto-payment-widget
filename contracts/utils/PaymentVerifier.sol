// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PaymentVerifier
 * @notice Payment verification helpers
 */
contract PaymentVerifier {
    function verifyPaymentSignature(
        bytes32 paymentId,
        address signer,
        bytes memory signature
    ) public pure returns (bool) {
        bytes32 messageHash = keccak256(abi.encodePacked(paymentId));
        bytes32 ethSignedMessageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );
        return recoverSigner(ethSignedMessageHash, signature) == signer;
    }

    function recoverSigner(bytes32 hash, bytes memory signature) internal pure returns (address) {
        require(signature.length == 65, "Invalid signature length");
        
        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }

        if (v < 27) {
            v += 27;
        }

        return ecrecover(hash, v, r, s);
    }
}

