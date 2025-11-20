// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "./SecurityErrors.sol";

/**
 * @title EIP712Signature
 * @notice EIP-712 compliant signature verification for typed structured data
 * @dev Provides secure off-chain signature verification with replay protection
 */
abstract contract EIP712Signature is EIP712 {
    using ECDSA for bytes32;

    // Type hashes for different operations
    bytes32 public constant PAYMENT_TYPEHASH = keccak256(
        "Payment(address payer,address payee,uint256 amount,address token,uint256 nonce,uint256 deadline)"
    );
    
    bytes32 public constant AUTHORIZATION_TYPEHASH = keccak256(
        "Authorization(address user,address spender,uint256 value,uint256 nonce,uint256 deadline)"
    );
    
    bytes32 public constant WITHDRAWAL_TYPEHASH = keccak256(
        "Withdrawal(address user,uint256 amount,address token,uint256 nonce,uint256 deadline)"
    );

    bytes32 public constant META_TRANSACTION_TYPEHASH = keccak256(
        "MetaTransaction(address from,address to,uint256 value,bytes data,uint256 nonce,uint256 deadline)"
    );

    // Nonce management
    mapping(address => uint256) public nonces;
    mapping(bytes32 => bool) public usedSignatures;

    event NonceUsed(address indexed user, uint256 nonce);
    event SignatureVerified(address indexed signer, bytes32 structHash);
    event SignatureInvalidated(bytes32 signatureHash);

    constructor(string memory name, string memory version) EIP712(name, version) {}

    /**
     * @notice Verify payment signature
     * @param payer Payer address
     * @param payee Payee address
     * @param amount Payment amount
     * @param token Token address
     * @param deadline Signature deadline
     * @param signature Signature bytes
     * @return bool True if signature is valid
     */
    function verifyPaymentSignature(
        address payer,
        address payee,
        uint256 amount,
        address token,
        uint256 deadline,
        bytes memory signature
    ) public returns (bool) {
        if (block.timestamp > deadline) {
            revert SecurityErrors.DeadlineExpired(deadline, block.timestamp);
        }

        uint256 nonce = nonces[payer];
        
        bytes32 structHash = keccak256(
            abi.encode(
                PAYMENT_TYPEHASH,
                payer,
                payee,
                amount,
                token,
                nonce,
                deadline
            )
        );

        bytes32 digest = _hashTypedDataV4(structHash);
        
        if (usedSignatures[digest]) {
            revert SecurityErrors.SignatureAlreadyUsed(digest);
        }

        address signer = digest.recover(signature);
        
        if (signer != payer) {
            revert SecurityErrors.InvalidSigner(payer, signer);
        }

        // Mark signature as used
        usedSignatures[digest] = true;
        nonces[payer]++;
        
        emit SignatureVerified(signer, structHash);
        emit NonceUsed(payer, nonce);

        return true;
    }

    /**
     * @notice Verify authorization signature
     * @param user User address
     * @param spender Spender address
     * @param value Authorized value
     * @param deadline Signature deadline
     * @param signature Signature bytes
     * @return bool True if signature is valid
     */
    function verifyAuthorizationSignature(
        address user,
        address spender,
        uint256 value,
        uint256 deadline,
        bytes memory signature
    ) public returns (bool) {
        if (block.timestamp > deadline) {
            revert SecurityErrors.DeadlineExpired(deadline, block.timestamp);
        }

        uint256 nonce = nonces[user];
        
        bytes32 structHash = keccak256(
            abi.encode(
                AUTHORIZATION_TYPEHASH,
                user,
                spender,
                value,
                nonce,
                deadline
            )
        );

        bytes32 digest = _hashTypedDataV4(structHash);
        
        if (usedSignatures[digest]) {
            revert SecurityErrors.SignatureAlreadyUsed(digest);
        }

        address signer = digest.recover(signature);
        
        if (signer != user) {
            revert SecurityErrors.InvalidSigner(user, signer);
        }

        usedSignatures[digest] = true;
        nonces[user]++;
        
        emit SignatureVerified(signer, structHash);
        emit NonceUsed(user, nonce);

        return true;
    }

    /**
     * @notice Verify withdrawal signature
     * @param user User address
     * @param amount Withdrawal amount
     * @param token Token address
     * @param deadline Signature deadline
     * @param signature Signature bytes
     * @return bool True if signature is valid
     */
    function verifyWithdrawalSignature(
        address user,
        uint256 amount,
        address token,
        uint256 deadline,
        bytes memory signature
    ) public returns (bool) {
        if (block.timestamp > deadline) {
            revert SecurityErrors.DeadlineExpired(deadline, block.timestamp);
        }

        uint256 nonce = nonces[user];
        
        bytes32 structHash = keccak256(
            abi.encode(
                WITHDRAWAL_TYPEHASH,
                user,
                amount,
                token,
                nonce,
                deadline
            )
        );

        bytes32 digest = _hashTypedDataV4(structHash);
        
        if (usedSignatures[digest]) {
            revert SecurityErrors.SignatureAlreadyUsed(digest);
        }

        address signer = digest.recover(signature);
        
        if (signer != user) {
            revert SecurityErrors.InvalidSigner(user, signer);
        }

        usedSignatures[digest] = true;
        nonces[user]++;
        
        emit SignatureVerified(signer, structHash);
        emit NonceUsed(user, nonce);

        return true;
    }

    /**
     * @notice Verify meta-transaction signature
     * @param from Sender address
     * @param to Recipient address
     * @param value Transaction value
     * @param data Transaction data
     * @param deadline Signature deadline
     * @param signature Signature bytes
     * @return bool True if signature is valid
     */
    function verifyMetaTransactionSignature(
        address from,
        address to,
        uint256 value,
        bytes memory data,
        uint256 deadline,
        bytes memory signature
    ) public returns (bool) {
        if (block.timestamp > deadline) {
            revert SecurityErrors.DeadlineExpired(deadline, block.timestamp);
        }

        uint256 nonce = nonces[from];
        
        bytes32 structHash = keccak256(
            abi.encode(
                META_TRANSACTION_TYPEHASH,
                from,
                to,
                value,
                keccak256(data),
                nonce,
                deadline
            )
        );

        bytes32 digest = _hashTypedDataV4(structHash);
        
        if (usedSignatures[digest]) {
            revert SecurityErrors.SignatureAlreadyUsed(digest);
        }

        address signer = digest.recover(signature);
        
        if (signer != from) {
            revert SecurityErrors.InvalidSigner(from, signer);
        }

        usedSignatures[digest] = true;
        nonces[from]++;
        
        emit SignatureVerified(signer, structHash);
        emit NonceUsed(from, nonce);

        return true;
    }

    /**
     * @notice Get current nonce for an address
     * @param user User address
     * @return uint256 Current nonce
     */
    function getNonce(address user) external view returns (uint256) {
        return nonces[user];
    }

    /**
     * @notice Check if signature has been used
     * @param structHash The struct hash
     * @return bool True if used
     */
    function isSignatureUsed(bytes32 structHash) external view returns (bool) {
        bytes32 digest = _hashTypedDataV4(structHash);
        return usedSignatures[digest];
    }

    /**
     * @notice Invalidate a signature (user can cancel their own signatures)
     * @param structHash The struct hash to invalidate
     */
    function invalidateSignature(bytes32 structHash) external {
        bytes32 digest = _hashTypedDataV4(structHash);
        usedSignatures[digest] = true;
        emit SignatureInvalidated(digest);
    }

    /**
     * @notice Increment nonce to invalidate all pending signatures
     */
    function incrementNonce() external {
        nonces[msg.sender]++;
        emit NonceUsed(msg.sender, nonces[msg.sender] - 1);
    }

    /**
     * @dev Get domain separator
     */
    function getDomainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }

    /**
     * @dev Recover signer from signature
     */
    function recoverSigner(
        bytes32 structHash,
        bytes memory signature
    ) public view returns (address) {
        bytes32 digest = _hashTypedDataV4(structHash);
        return digest.recover(signature);
    }

    /**
     * @dev Build payment struct hash
     */
    function buildPaymentHash(
        address payer,
        address payee,
        uint256 amount,
        address token,
        uint256 nonce,
        uint256 deadline
    ) public pure returns (bytes32) {
        return keccak256(
            abi.encode(
                PAYMENT_TYPEHASH,
                payer,
                payee,
                amount,
                token,
                nonce,
                deadline
            )
        );
    }

    /**
     * @dev Build authorization struct hash
     */
    function buildAuthorizationHash(
        address user,
        address spender,
        uint256 value,
        uint256 nonce,
        uint256 deadline
    ) public pure returns (bytes32) {
        return keccak256(
            abi.encode(
                AUTHORIZATION_TYPEHASH,
                user,
                spender,
                value,
                nonce,
                deadline
            )
        );
    }
}

