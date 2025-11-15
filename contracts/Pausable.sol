// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AccessControl.sol";

/**
 * @title Pausable
 * @dev Emergency pause functionality for payment contracts
 */
contract Pausable is AccessControl {
    bool private _paused;

    event Paused(address account);
    event Unpaused(address account);

    modifier whenNotPaused() {
        require(!_paused, "Pausable: paused");
        _;
    }

    modifier whenPaused() {
        require(_paused, "Pausable: not paused");
        _;
    }

    constructor() {
        _paused = false;
    }

    /**
     * @dev Returns true if the contract is paused
     */
    function paused() public view returns (bool) {
        return _paused;
    }

    /**
     * @dev Pause the contract
     */
    function pause() public onlyRole(PAUSER_ROLE) whenNotPaused {
        _paused = true;
        emit Paused(msg.sender);
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() public onlyRole(ADMIN_ROLE) whenPaused {
        _paused = false;
        emit Unpaused(msg.sender);
    }
}

