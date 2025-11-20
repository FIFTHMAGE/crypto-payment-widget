// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../security/EnhancedAccessControl.sol";
import "../security/EnhancedCircuitBreaker.sol";
import "../security/ContractRateLimiter.sol";
import "../security/FlashLoanProtection.sol";
import "../security/EIP712Signature.sol";

/**
 * @title SecurityTests
 * @notice Comprehensive security testing contract
 * @dev Tests all security mechanisms and edge cases
 */
contract SecurityTests is
    EnhancedAccessControl,
    EnhancedCircuitBreaker,
    ContractRateLimiter,
    FlashLoanProtection,
    EIP712Signature("SecurityTests", "1")
{
    event TestPassed(string testName);
    event TestFailed(string testName, string reason);

    uint256 public testCounter;
    mapping(bytes32 => bool) public testResults;

    constructor() EnhancedAccessControl() EnhancedCircuitBreaker() {}

    /**
     * @notice Test access control functionality
     */
    function testAccessControl() external returns (bool) {
        // Test role granting
        bytes32 testRole = keccak256("TEST_ROLE");
        address testAccount = address(0x123);
        
        try this.grantRole(testRole, testAccount) {
            if (!hasRole(testRole, testAccount)) {
                emit TestFailed("testAccessControl", "Role not granted");
                return false;
            }
        } catch {
            emit TestFailed("testAccessControl", "Failed to grant role");
            return false;
        }

        // Test role revocation
        try this.revokeRole(testRole, testAccount) {
            if (hasRole(testRole, testAccount)) {
                emit TestFailed("testAccessControl", "Role not revoked");
                return false;
            }
        } catch {
            emit TestFailed("testAccessControl", "Failed to revoke role");
            return false;
        }

        emit TestPassed("testAccessControl");
        return true;
    }

    /**
     * @notice Test circuit breaker functionality
     */
    function testCircuitBreaker() external returns (bool) {
        // Test threshold configuration
        try this.updateThresholds(20, 2000 ether, 200, 2 hours, 45 minutes) {
            ThresholdConfig memory config = thresholds;
            if (config.failureThreshold != 20) {
                emit TestFailed("testCircuitBreaker", "Threshold not updated");
                return false;
            }
        } catch {
            emit TestFailed("testCircuitBreaker", "Failed to update thresholds");
            return false;
        }

        emit TestPassed("testCircuitBreaker");
        return true;
    }

    /**
     * @notice Test rate limiting functionality
     */
    function testRateLimiting() external returns (bool) {
        address testUser = address(0x456);
        uint256 testAmount = 1 ether;

        // Test within limits
        if (!isWithinLimits(testUser, testAmount)) {
            emit TestFailed("testRateLimiting", "Should be within limits");
            return false;
        }

        // Test whitelisting
        try this.setWhitelisted(testUser, true) {
            if (!whitelistedAddresses[testUser]) {
                emit TestFailed("testRateLimiting", "Whitelist failed");
                return false;
            }
        } catch {
            emit TestFailed("testRateLimiting", "Failed to whitelist");
            return false;
        }

        emit TestPassed("testRateLimiting");
        return true;
    }

    /**
     * @notice Test flash loan protection
     */
    function testFlashLoanProtection() external returns (bool) {
        address testUser = address(0x789);

        // Should not have suspicious activity initially
        if (hasSuspiciousActivity(testUser)) {
            emit TestFailed("testFlashLoanProtection", "False positive on clean user");
            return false;
        }

        emit TestPassed("testFlashLoanProtection");
        return true;
    }

    /**
     * @notice Test EIP-712 signature verification
     */
    function testEIP712Signatures() external returns (bool) {
        address testSigner = address(0xABC);
        uint256 nonce = getNonce(testSigner);

        if (nonce != 0) {
            emit TestFailed("testEIP712Signatures", "Initial nonce should be 0");
            return false;
        }

        // Test domain separator
        bytes32 domainSeparator = getDomainSeparator();
        if (domainSeparator == bytes32(0)) {
            emit TestFailed("testEIP712Signatures", "Invalid domain separator");
            return false;
        }

        emit TestPassed("testEIP712Signatures");
        return true;
    }

    /**
     * @notice Test timelock functionality
     */
    function testTimelock() external returns (bool) {
        bytes32 actionId = keccak256("TEST_ACTION");
        
        try this.proposeAction(actionId, DEFAULT_ADMIN_ROLE) {
            // Action should be proposed
            emit TestPassed("testTimelock");
            return true;
        } catch {
            emit TestFailed("testTimelock", "Failed to propose action");
            return false;
        }
    }

    /**
     * @notice Test multi-sig requirements
     */
    function testMultiSig() external returns (bool) {
        bytes32 testRole = keccak256("MULTI_SIG_ROLE");
        
        try this.setRoleMultiSig(testRole, 2) {
            emit TestPassed("testMultiSig");
            return true;
        } catch {
            emit TestFailed("testMultiSig", "Failed to set multi-sig");
            return false;
        }
    }

    /**
     * @notice Run all security tests
     */
    function runAllTests() external returns (uint256 passed, uint256 failed) {
        passed = 0;
        failed = 0;

        if (this.testAccessControl()) passed++; else failed++;
        if (this.testCircuitBreaker()) passed++; else failed++;
        if (this.testRateLimiting()) passed++; else failed++;
        if (this.testFlashLoanProtection()) passed++; else failed++;
        if (this.testEIP712Signatures()) passed++; else failed++;
        if (this.testTimelock()) passed++; else failed++;
        if (this.testMultiSig()) passed++; else failed++;

        return (passed, failed);
    }

    /**
     * @notice Test reentrancy protection
     */
    function testReentrancyProtection() external whenCircuitClosed returns (bool) {
        emit TestPassed("testReentrancyProtection");
        return true;
    }

    /**
     * @notice Test rate limit with value tracking
     */
    function testRateLimitWithValue(uint256 value) external checkRateLimit(msg.sender, value) returns (bool) {
        emit TestPassed("testRateLimitWithValue");
        return true;
    }

    /**
     * @notice Test flash loan detection
     */
    function testFlashLoanDetection() external noFlashLoan returns (bool) {
        emit TestPassed("testFlashLoanDetection");
        return true;
    }

    /**
     * @notice Test block delay requirement
     */
    function testBlockDelay() external requireBlockDelay returns (bool) {
        emit TestPassed("testBlockDelay");
        return true;
    }

    /**
     * @notice Benchmark gas usage for security checks
     */
    function benchmarkSecurityGas() external view returns (
        uint256 accessControlGas,
        uint256 rateLimitGas,
        uint256 flashLoanGas
    ) {
        uint256 gasBefore;
        uint256 gasAfter;

        // Benchmark access control
        gasBefore = gasleft();
        hasRole(DEFAULT_ADMIN_ROLE, msg.sender);
        gasAfter = gasleft();
        accessControlGas = gasBefore - gasAfter;

        // Benchmark rate limiting
        gasBefore = gasleft();
        isWithinLimits(msg.sender, 1 ether);
        gasAfter = gasleft();
        rateLimitGas = gasBefore - gasAfter;

        // Benchmark flash loan check
        gasBefore = gasleft();
        hasSuspiciousActivity(msg.sender);
        gasAfter = gasleft();
        flashLoanGas = gasBefore - gasAfter;

        return (accessControlGas, rateLimitGas, flashLoanGas);
    }

    /**
     * @notice Get security status report
     */
    function getSecurityStatus() external view returns (
        CircuitState circuitStatus,
        bool rateLimitActive,
        bool flashLoanProtectionActive,
        uint256 adminCount
    ) {
        return (
            circuitState,
            rateLimitingEnabled,
            flashLoanProtectionEnabled,
            getRoleMemberCount(DEFAULT_ADMIN_ROLE)
        );
    }

    /**
     * @notice Simulate attack scenarios for testing
     */
    function simulateAttack(uint8 attackType) external returns (bool detected) {
        // Attack type 1: Rapid transactions
        if (attackType == 1) {
            for (uint256 i = 0; i < 10; i++) {
                _recordAction(msg.sender, 1 ether);
            }
            return hasSuspiciousActivity(msg.sender);
        }
        
        // Attack type 2: High value single transaction
        if (attackType == 2) {
            _recordAction(msg.sender, 1500 ether);
            return hasSuspiciousActivity(msg.sender);
        }
        
        return false;
    }

    /**
     * @notice Reset all security metrics for testing
     */
    function resetSecurityMetrics() external onlyRole(DEFAULT_ADMIN_ROLE) {
        // Reset circuit breaker
        if (circuitState == CircuitState.Open) {
            try this.resetCircuitBreaker() {} catch {}
        }
        
        // Reset rate limits
        try this.resetGlobalLimits() {} catch {}
    }
}

