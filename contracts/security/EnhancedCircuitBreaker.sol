// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./EnhancedAccessControl.sol";
import "./SecurityErrors.sol";

/**
 * @title EnhancedCircuitBreaker
 * @notice Advanced circuit breaker with anomaly detection and automatic triggers
 * @dev Implements multiple protection levels and automatic halting
 */
abstract contract EnhancedCircuitBreaker is EnhancedAccessControl {
    enum CircuitState {
        Closed,      // Normal operation
        Open,        // Circuit breaker triggered
        HalfOpen     // Testing recovery
    }

    struct CircuitMetrics {
        uint256 transactionCount;
        uint256 failureCount;
        uint256 totalVolume;
        uint256 lastResetTime;
        uint256 consecutiveFailures;
    }

    struct ThresholdConfig {
        uint256 failureThreshold;      // Max failures before trigger
        uint256 volumeThreshold;       // Max volume in time window
        uint256 transactionThreshold;  // Max transactions in time window
        uint256 timeWindow;            // Time window for metrics
        uint256 cooldownPeriod;        // Cooldown before recovery
    }

    CircuitState public circuitState;
    CircuitMetrics public metrics;
    ThresholdConfig public thresholds;
    
    uint256 public lastTripTime;
    uint256 public tripCount;
    bool public automaticRecoveryEnabled;

    event CircuitBreakerTripped(string reason, uint256 timestamp);
    event CircuitBreakerReset(address indexed resetter, uint256 timestamp);
    event CircuitBreakerStateChanged(CircuitState oldState, CircuitState newState);
    event AnomalyDetected(string anomalyType, uint256 value, uint256 threshold);
    event ThresholdsUpdated(uint256 failures, uint256 volume, uint256 transactions);
    event MetricsReset(uint256 timestamp);

    modifier whenCircuitClosed() {
        if (circuitState != CircuitState.Closed) revert SecurityErrors.CircuitBreakerActive();
        _checkThresholds();
        _;
        _updateMetrics(true);
    }

    modifier whenCircuitNotOpen() {
        if (circuitState == CircuitState.Open) revert SecurityErrors.CircuitBreakerActive();
        _;
    }

    constructor() {
        circuitState = CircuitState.Closed;
        automaticRecoveryEnabled = true;
        
        thresholds = ThresholdConfig({
            failureThreshold: 10,
            volumeThreshold: 1000 ether,
            transactionThreshold: 100,
            timeWindow: 1 hours,
            cooldownPeriod: 30 minutes
        });

        metrics.lastResetTime = block.timestamp;
    }

    /**
     * @notice Manually trip the circuit breaker
     * @param reason Reason for tripping
     */
    function tripCircuitBreaker(string calldata reason) external onlyRole(PAUSER_ROLE) {
        _tripCircuit(reason);
    }

    /**
     * @notice Reset the circuit breaker
     */
    function resetCircuitBreaker() external onlyRole(PAUSER_ROLE) {
        if (circuitState != CircuitState.Open) revert SecurityErrors.InvalidState(uint8(circuitState), uint8(CircuitState.Open));
        
        if (block.timestamp < lastTripTime + thresholds.cooldownPeriod) {
            revert SecurityErrors.TooEarly(block.timestamp, lastTripTime + thresholds.cooldownPeriod);
        }

        _resetCircuit();
    }

    /**
     * @notice Test recovery with half-open state
     */
    function testRecovery() external onlyRole(OPERATOR_ROLE) {
        if (circuitState != CircuitState.Open) revert SecurityErrors.InvalidState(uint8(circuitState), uint8(CircuitState.Open));
        
        if (block.timestamp < lastTripTime + thresholds.cooldownPeriod) {
            revert SecurityErrors.TooEarly(block.timestamp, lastTripTime + thresholds.cooldownPeriod);
        }

        CircuitState oldState = circuitState;
        circuitState = CircuitState.HalfOpen;
        emit CircuitBreakerStateChanged(oldState, circuitState);
    }

    /**
     * @notice Update threshold configuration
     * @param failureThreshold Max failures before trigger
     * @param volumeThreshold Max volume in time window
     * @param transactionThreshold Max transactions in time window
     * @param timeWindow Time window for metrics
     * @param cooldownPeriod Cooldown before recovery
     */
    function updateThresholds(
        uint256 failureThreshold,
        uint256 volumeThreshold,
        uint256 transactionThreshold,
        uint256 timeWindow,
        uint256 cooldownPeriod
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (failureThreshold == 0 || volumeThreshold == 0 || transactionThreshold == 0) {
            revert SecurityErrors.InvalidAmount(0);
        }

        thresholds.failureThreshold = failureThreshold;
        thresholds.volumeThreshold = volumeThreshold;
        thresholds.transactionThreshold = transactionThreshold;
        thresholds.timeWindow = timeWindow;
        thresholds.cooldownPeriod = cooldownPeriod;

        emit ThresholdsUpdated(failureThreshold, volumeThreshold, transactionThreshold);
    }

    /**
     * @notice Enable or disable automatic recovery
     * @param enabled True to enable automatic recovery
     */
    function setAutomaticRecovery(bool enabled) external onlyRole(DEFAULT_ADMIN_ROLE) {
        automaticRecoveryEnabled = enabled;
    }

    /**
     * @notice Get current circuit metrics
     * @return transactionCount Total transactions in current window
     * @return failureCount Total failures in current window
     * @return totalVolume Total volume in current window
     * @return consecutiveFailures Current consecutive failure count
     */
    function getMetrics() external view returns (
        uint256 transactionCount,
        uint256 failureCount,
        uint256 totalVolume,
        uint256 consecutiveFailures
    ) {
        return (
            metrics.transactionCount,
            metrics.failureCount,
            metrics.totalVolume,
            metrics.consecutiveFailures
        );
    }

    /**
     * @notice Check if circuit should trip based on metrics
     * @return bool True if should trip
     */
    function shouldTrip() public view returns (bool) {
        // Reset window check
        if (block.timestamp > metrics.lastResetTime + thresholds.timeWindow) {
            return false;
        }

        // Check thresholds
        if (metrics.failureCount >= thresholds.failureThreshold) return true;
        if (metrics.transactionCount >= thresholds.transactionThreshold) return true;
        if (metrics.totalVolume >= thresholds.volumeThreshold) return true;
        if (metrics.consecutiveFailures >= thresholds.failureThreshold / 2) return true;

        return false;
    }

    /**
     * @dev Internal function to trip the circuit
     */
    function _tripCircuit(string memory reason) internal {
        if (circuitState == CircuitState.Open) return;

        CircuitState oldState = circuitState;
        circuitState = CircuitState.Open;
        lastTripTime = block.timestamp;
        tripCount++;

        emit CircuitBreakerTripped(reason, block.timestamp);
        emit CircuitBreakerStateChanged(oldState, circuitState);
    }

    /**
     * @dev Internal function to reset the circuit
     */
    function _resetCircuit() internal {
        CircuitState oldState = circuitState;
        circuitState = CircuitState.Closed;
        
        // Reset metrics
        metrics.transactionCount = 0;
        metrics.failureCount = 0;
        metrics.totalVolume = 0;
        metrics.consecutiveFailures = 0;
        metrics.lastResetTime = block.timestamp;

        emit CircuitBreakerReset(_msgSender(), block.timestamp);
        emit CircuitBreakerStateChanged(oldState, circuitState);
        emit MetricsReset(block.timestamp);
    }

    /**
     * @dev Internal function to check thresholds
     */
    function _checkThresholds() internal view {
        if (shouldTrip()) {
            revert SecurityErrors.CircuitBreakerActive();
        }
    }

    /**
     * @dev Internal function to update metrics
     */
    function _updateMetrics(bool success) internal {
        // Reset metrics if time window expired
        if (block.timestamp > metrics.lastResetTime + thresholds.timeWindow) {
            metrics.transactionCount = 0;
            metrics.failureCount = 0;
            metrics.totalVolume = 0;
            metrics.consecutiveFailures = 0;
            metrics.lastResetTime = block.timestamp;
        }

        metrics.transactionCount++;

        if (!success) {
            metrics.failureCount++;
            metrics.consecutiveFailures++;
            
            // Auto-trip on anomaly
            if (shouldTrip()) {
                _tripCircuit("Threshold exceeded");
            }
        } else {
            metrics.consecutiveFailures = 0;
            
            // Auto-recover if in half-open state
            if (circuitState == CircuitState.HalfOpen && automaticRecoveryEnabled) {
                _resetCircuit();
            }
        }
    }

    /**
     * @dev Internal function to record transaction volume
     */
    function _recordVolume(uint256 amount) internal {
        metrics.totalVolume += amount;
        
        if (metrics.totalVolume >= thresholds.volumeThreshold) {
            emit AnomalyDetected("Volume threshold exceeded", metrics.totalVolume, thresholds.volumeThreshold);
        }
    }

    /**
     * @dev Internal function to record failure
     */
    function _recordFailure() internal {
        _updateMetrics(false);
    }

    /**
     * @dev Internal function to record success
     */
    function _recordSuccess() internal {
        _updateMetrics(true);
    }
}

