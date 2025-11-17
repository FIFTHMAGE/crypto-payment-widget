// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PaymentNonce
 * @notice Payment nonce management
 */
contract PaymentNonce {
    mapping(address => uint256) private _nonces;
    mapping(bytes32 => bool) private _usedHashes;

    event NonceIncremented(address indexed account, uint256 newNonce);

    function getNonce(address account) external view returns (uint256) {
        return _nonces[account];
    }

    function incrementNonce() external {
        _nonces[msg.sender]++;
        emit NonceIncremented(msg.sender, _nonces[msg.sender]);
    }

    function verifyAndMarkHash(bytes32 hash) internal {
        require(!_usedHashes[hash], "Hash already used");
        _usedHashes[hash] = true;
    }

    function isHashUsed(bytes32 hash) external view returns (bool) {
        return _usedHashes[hash];
    }
}

