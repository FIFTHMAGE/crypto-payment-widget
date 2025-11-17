// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TokenWhitelist
 * @notice Token whitelist/blacklist management
 */
contract TokenWhitelist {
    mapping(address => bool) public whitelisted;
    mapping(address => bool) public blacklisted;
    address public owner;

    event TokenWhitelisted(address indexed token);
    event TokenBlacklisted(address indexed token);
    event TokenRemoved(address indexed token);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function whitelistToken(address token) external onlyOwner {
        require(!blacklisted[token], "Token blacklisted");
        whitelisted[token] = true;
        emit TokenWhitelisted(token);
    }

    function blacklistToken(address token) external onlyOwner {
        blacklisted[token] = true;
        whitelisted[token] = false;
        emit TokenBlacklisted(token);
    }

    function removeToken(address token) external onlyOwner {
        whitelisted[token] = false;
        blacklisted[token] = false;
        emit TokenRemoved(token);
    }

    function isTokenAllowed(address token) external view returns (bool) {
        return whitelisted[token] && !blacklisted[token];
    }
}

