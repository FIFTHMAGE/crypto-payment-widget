// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RoleBasedAccessControl
 * @author Crypto Payment Widget Team
 * @notice Comprehensive role-based access control system
 */
contract RoleBasedAccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant FEE_MANAGER_ROLE = keccak256("FEE_MANAGER_ROLE");

    mapping(bytes32 => mapping(address => bool)) private _roles;
    mapping(bytes32 => bytes32) private _roleAdmins;
    mapping(bytes32 => uint256) private _roleMemberCount;

    event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);
    event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);
    event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole);

    error UnauthorizedRole(bytes32 role, address account);
    error InvalidAddress();

    modifier onlyRole(bytes32 role) {
        if (!hasRole(role, msg.sender)) {
            revert UnauthorizedRole(role, msg.sender);
        }
        _;
    }

    constructor() {
        _grantRole(ADMIN_ROLE, msg.sender);
        _setRoleAdmin(OPERATOR_ROLE, ADMIN_ROLE);
        _setRoleAdmin(PAUSER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(UPGRADER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(FEE_MANAGER_ROLE, ADMIN_ROLE);
    }

    function hasRole(bytes32 role, address account) public view returns (bool) {
        return _roles[role][account];
    }

    function getRoleAdmin(bytes32 role) public view returns (bytes32) {
        return _roleAdmins[role];
    }

    function grantRole(bytes32 role, address account) external onlyRole(getRoleAdmin(role)) {
        _grantRole(role, account);
    }

    function revokeRole(bytes32 role, address account) external onlyRole(getRoleAdmin(role)) {
        _revokeRole(role, account);
    }

    function renounceRole(bytes32 role) external {
        _revokeRole(role, msg.sender);
    }

    function getRoleMemberCount(bytes32 role) external view returns (uint256) {
        return _roleMemberCount[role];
    }

    function _grantRole(bytes32 role, address account) internal {
        if (account == address(0)) revert InvalidAddress();
        
        if (!_roles[role][account]) {
            _roles[role][account] = true;
            _roleMemberCount[role]++;
            emit RoleGranted(role, account, msg.sender);
        }
    }

    function _revokeRole(bytes32 role, address account) internal {
        if (_roles[role][account]) {
            _roles[role][account] = false;
            _roleMemberCount[role]--;
            emit RoleRevoked(role, account, msg.sender);
        }
    }

    function _setRoleAdmin(bytes32 role, bytes32 adminRole) internal {
        bytes32 previousAdminRole = _roleAdmins[role];
        _roleAdmins[role] = adminRole;
        emit RoleAdminChanged(role, previousAdminRole, adminRole);
    }
}

