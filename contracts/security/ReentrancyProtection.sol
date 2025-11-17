// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ReentrancyProtection
 * @author Crypto Payment Widget Team
 * @notice Enhanced reentrancy guards on all external functions
 */
contract ReentrancyProtection {
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;

    uint256 private _status;
    mapping(bytes4 => uint256) private _functionLocks;

    error ReentrancyGuardReentrantCall();
    error FunctionLocked(bytes4 selector);

    constructor() {
        _status = NOT_ENTERED;
    }

    modifier nonReentrant() {
        if (_status == ENTERED) {
            revert ReentrancyGuardReentrantCall();
        }
        _status = ENTERED;
        _;
        _status = NOT_ENTERED;
    }

    modifier functionLock(bytes4 selector) {
        if (_functionLocks[selector] == ENTERED) {
            revert FunctionLocked(selector);
        }
        _functionLocks[selector] = ENTERED;
        _;
        _functionLocks[selector] = NOT_ENTERED;
    }

    function _isReentered() internal view returns (bool) {
        return _status == ENTERED;
    }
}

