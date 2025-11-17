// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title EnhancedPausable
 * @author Crypto Payment Widget Team
 * @notice Advanced emergency stop mechanism with reason tracking
 * @dev Implements pausable functionality with detailed event logging and pause reasons
 */
contract EnhancedPausable is Ownable {
    bool private _paused;
    uint256 private _pausedAt;
    uint256 private _pauseCount;
    string private _pauseReason;
    
    mapping(uint256 => PauseRecord) private _pauseHistory;

    struct PauseRecord {
        uint256 pausedAt;
        uint256 unpausedAt;
        address pausedBy;
        address unpausedBy;
        string reason;
    }

    /**
     * @notice Emitted when contract is paused
     * @param account Address that triggered the pause
     * @param reason Reason for pausing
     * @param timestamp Time when pause was triggered
     */
    event Paused(address indexed account, string reason, uint256 timestamp);

    /**
     * @notice Emitted when contract is unpaused
     * @param account Address that triggered the unpause
     * @param timestamp Time when unpause was triggered
     * @param duration How long the contract was paused
     */
    event Unpaused(address indexed account, uint256 timestamp, uint256 duration);

    error ContractPaused(string reason);
    error ContractNotPaused();

    constructor() Ownable(msg.sender) {
        _paused = false;
        _pausedAt = 0;
        _pauseCount = 0;
    }

    /**
     * @notice Modifier to make a function callable only when contract is not paused
     */
    modifier whenNotPaused() {
        if (_paused) {
            revert ContractPaused(_pauseReason);
        }
        _;
    }

    /**
     * @notice Modifier to make a function callable only when contract is paused
     */
    modifier whenPaused() {
        if (!_paused) {
            revert ContractNotPaused();
        }
        _;
    }

    /**
     * @notice Pause contract operations with a reason
     * @dev Can only be called by contract owner
     * @param reason Human-readable reason for pausing
     */
    function pause(string calldata reason) external onlyOwner whenNotPaused {
        _paused = true;
        _pausedAt = block.timestamp;
        _pauseReason = reason;
        
        _pauseHistory[_pauseCount] = PauseRecord({
            pausedAt: block.timestamp,
            unpausedAt: 0,
            pausedBy: msg.sender,
            unpausedBy: address(0),
            reason: reason
        });
        
        emit Paused(msg.sender, reason, block.timestamp);
    }

    /**
     * @notice Resume contract operations
     * @dev Can only be called by contract owner
     */
    function unpause() external onlyOwner whenPaused {
        uint256 duration = block.timestamp - _pausedAt;
        
        _pauseHistory[_pauseCount].unpausedAt = block.timestamp;
        _pauseHistory[_pauseCount].unpausedBy = msg.sender;
        _pauseCount++;
        
        _paused = false;
        _pausedAt = 0;
        _pauseReason = "";
        
        emit Unpaused(msg.sender, block.timestamp, duration);
    }

    /**
     * @notice Check if contract is currently paused
     * @return Boolean indicating pause status
     */
    function isPaused() external view returns (bool) {
        return _paused;
    }

    /**
     * @notice Get current pause details
     * @return paused Current pause status
     * @return pausedAt Timestamp when contract was paused
     * @return reason Reason for the pause
     */
    function getPauseInfo() external view returns (bool paused, uint256 pausedAt, string memory reason) {
        return (_paused, _pausedAt, _pauseReason);
    }

    /**
     * @notice Get historical pause record
     * @param index Index of the pause record
     * @return record The pause record at the given index
     */
    function getPauseHistory(uint256 index) external view returns (PauseRecord memory record) {
        require(index < _pauseCount, "Invalid index");
        return _pauseHistory[index];
    }

    /**
     * @notice Get total number of times contract was paused
     * @return Total pause count
     */
    function getPauseCount() external view returns (uint256) {
        return _pauseCount;
    }
}

