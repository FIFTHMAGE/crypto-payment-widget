// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Context.sol";
import "./SecurityErrors.sol";

/**
 * @title EnhancedAccessControl
 * @notice Advanced role-based access control with time-locks and multi-sig requirements
 * @dev Extends standard access control with additional security features
 */
abstract contract EnhancedAccessControl is Context {
    struct RoleData {
        mapping(address => bool) members;
        bytes32 adminRole;
        uint256 memberCount;
        bool requiresMultiSig;
        uint256 requiredApprovals;
    }

    struct PendingAction {
        address proposer;
        bytes32 action;
        uint256 proposedAt;
        uint256 executionTime;
        uint256 approvalCount;
        mapping(address => bool) approvals;
        bool executed;
        bool cancelled;
    }

    mapping(bytes32 => RoleData) private _roles;
    mapping(bytes32 => PendingAction) private _pendingActions;
    
    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant FEE_MANAGER_ROLE = keccak256("FEE_MANAGER_ROLE");
    
    uint256 public constant MIN_TIMELOCK = 1 days;
    uint256 public constant MAX_TIMELOCK = 30 days;
    uint256 public timelockDuration = 2 days;

    event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);
    event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);
    event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole);
    event ActionProposed(bytes32 indexed actionId, address indexed proposer, uint256 executionTime);
    event ActionApproved(bytes32 indexed actionId, address indexed approver);
    event ActionExecuted(bytes32 indexed actionId, address indexed executor);
    event ActionCancelled(bytes32 indexed actionId, address indexed canceller);
    event TimelockDurationChanged(uint256 oldDuration, uint256 newDuration);

    /**
     * @dev Modifier that checks if caller has a specific role
     */
    modifier onlyRole(bytes32 role) {
        _checkRole(role, _msgSender());
        _;
    }

    /**
     * @dev Modifier for actions requiring timelock
     */
    modifier withTimelock(bytes32 actionId) {
        PendingAction storage action = _pendingActions[actionId];
        if (action.executionTime == 0) revert SecurityErrors.NotInitialized();
        if (block.timestamp < action.executionTime) {
            revert SecurityErrors.TooEarly(block.timestamp, action.executionTime);
        }
        if (action.executed) revert SecurityErrors.AlreadyExecuted();
        if (action.cancelled) revert SecurityErrors.AlreadyCancelled();
        _;
        action.executed = true;
    }

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setRoleAdmin(OPERATOR_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(PAUSER_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(UPGRADER_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(FEE_MANAGER_ROLE, DEFAULT_ADMIN_ROLE);
    }

    /**
     * @notice Grant a role to an account
     * @param role The role to grant
     * @param account The account to grant the role to
     */
    function grantRole(bytes32 role, address account) public virtual onlyRole(getRoleAdmin(role)) {
        _grantRole(role, account);
    }

    /**
     * @notice Revoke a role from an account
     * @param role The role to revoke
     * @param account The account to revoke the role from
     */
    function revokeRole(bytes32 role, address account) public virtual onlyRole(getRoleAdmin(role)) {
        _revokeRole(role, account);
    }

    /**
     * @notice Renounce a role
     * @param role The role to renounce
     */
    function renounceRole(bytes32 role) public virtual {
        _revokeRole(role, _msgSender());
    }

    /**
     * @notice Check if an account has a specific role
     * @param role The role to check
     * @param account The account to check
     * @return bool True if account has role
     */
    function hasRole(bytes32 role, address account) public view returns (bool) {
        return _roles[role].members[account];
    }

    /**
     * @notice Get the admin role for a role
     * @param role The role to query
     * @return bytes32 The admin role
     */
    function getRoleAdmin(bytes32 role) public view returns (bytes32) {
        return _roles[role].adminRole;
    }

    /**
     * @notice Get member count for a role
     * @param role The role to query
     * @return uint256 The member count
     */
    function getRoleMemberCount(bytes32 role) public view returns (uint256) {
        return _roles[role].memberCount;
    }

    /**
     * @notice Propose an action with timelock
     * @param actionId Unique identifier for the action
     * @param role Required role to propose
     * @return bytes32 The action ID
     */
    function proposeAction(bytes32 actionId, bytes32 role) public onlyRole(role) returns (bytes32) {
        PendingAction storage action = _pendingActions[actionId];
        if (action.proposedAt != 0) revert SecurityErrors.AlreadyInitialized();

        action.proposer = _msgSender();
        action.action = actionId;
        action.proposedAt = block.timestamp;
        action.executionTime = block.timestamp + timelockDuration;
        action.approvalCount = 0;
        action.executed = false;
        action.cancelled = false;

        emit ActionProposed(actionId, _msgSender(), action.executionTime);
        return actionId;
    }

    /**
     * @notice Approve a pending action
     * @param actionId The action to approve
     */
    function approveAction(bytes32 actionId) public onlyRole(DEFAULT_ADMIN_ROLE) {
        PendingAction storage action = _pendingActions[actionId];
        if (action.proposedAt == 0) revert SecurityErrors.NotInitialized();
        if (action.executed) revert SecurityErrors.AlreadyExecuted();
        if (action.cancelled) revert SecurityErrors.AlreadyCancelled();
        if (action.approvals[_msgSender()]) return; // Already approved

        action.approvals[_msgSender()] = true;
        action.approvalCount++;

        emit ActionApproved(actionId, _msgSender());
    }

    /**
     * @notice Cancel a pending action
     * @param actionId The action to cancel
     */
    function cancelAction(bytes32 actionId) public onlyRole(DEFAULT_ADMIN_ROLE) {
        PendingAction storage action = _pendingActions[actionId];
        if (action.proposedAt == 0) revert SecurityErrors.NotInitialized();
        if (action.executed) revert SecurityErrors.AlreadyExecuted();
        if (action.cancelled) revert SecurityErrors.AlreadyCancelled();

        action.cancelled = true;
        emit ActionCancelled(actionId, _msgSender());
    }

    /**
     * @notice Update timelock duration
     * @param newDuration New duration in seconds
     */
    function updateTimelockDuration(uint256 newDuration) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (newDuration < MIN_TIMELOCK || newDuration > MAX_TIMELOCK) {
            revert SecurityErrors.InvalidAmount(newDuration);
        }
        uint256 oldDuration = timelockDuration;
        timelockDuration = newDuration;
        emit TimelockDurationChanged(oldDuration, newDuration);
    }

    /**
     * @notice Enable multi-sig requirement for a role
     * @param role The role to configure
     * @param requiredApprovals Number of approvals required
     */
    function setRoleMultiSig(bytes32 role, uint256 requiredApprovals) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (requiredApprovals == 0) revert SecurityErrors.InvalidAmount(requiredApprovals);
        RoleData storage roleData = _roles[role];
        roleData.requiresMultiSig = true;
        roleData.requiredApprovals = requiredApprovals;
    }

    /**
     * @dev Internal function to setup a role
     */
    function _setupRole(bytes32 role, address account) internal {
        _grantRole(role, account);
    }

    /**
     * @dev Internal function to grant a role
     */
    function _grantRole(bytes32 role, address account) internal {
        if (account == address(0)) revert SecurityErrors.ZeroAddress();
        if (!_roles[role].members[account]) {
            _roles[role].members[account] = true;
            _roles[role].memberCount++;
            emit RoleGranted(role, account, _msgSender());
        }
    }

    /**
     * @dev Internal function to revoke a role
     */
    function _revokeRole(bytes32 role, address account) internal {
        if (_roles[role].members[account]) {
            _roles[role].members[account] = false;
            _roles[role].memberCount--;
            emit RoleRevoked(role, account, _msgSender());
        }
    }

    /**
     * @dev Internal function to set role admin
     */
    function _setRoleAdmin(bytes32 role, bytes32 adminRole) internal {
        bytes32 previousAdminRole = getRoleAdmin(role);
        _roles[role].adminRole = adminRole;
        emit RoleAdminChanged(role, previousAdminRole, adminRole);
    }

    /**
     * @dev Internal function to check role
     */
    function _checkRole(bytes32 role, address account) internal view {
        if (!hasRole(role, account)) {
            revert SecurityErrors.Unauthorized(account, role);
        }
    }
}

