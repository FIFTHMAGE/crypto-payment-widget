// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MilestonePayment
 * @author Crypto Payment Widget Team
 * @notice Project-based payments with milestone releases
 * @dev Enables multi-stage payments with approval workflow
 */
contract MilestonePayment is ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum MilestoneStatus {
        Pending,
        Completed,
        Approved,
        Disputed,
        Released
    }

    struct Milestone {
        string description;
        uint256 amount;
        uint256 dueDate;
        MilestoneStatus status;
        bool released;
    }

    struct Project {
        address payer;
        address payee;
        address token;
        uint256 totalAmount;
        uint256 releasedAmount;
        uint256 createdAt;
        bool active;
        Milestone[] milestones;
    }

    mapping(bytes32 => Project) public projects;
    mapping(address => bytes32[]) public payerProjects;
    mapping(address => bytes32[]) public payeeProjects;
    
    bytes32[] public allProjects;
    uint256 public projectCount;

    event ProjectCreated(
        bytes32 indexed projectId,
        address indexed payer,
        address indexed payee,
        uint256 totalAmount,
        uint256 milestoneCount
    );

    event MilestoneCompleted(
        bytes32 indexed projectId,
        uint256 indexed milestoneIndex,
        address indexed payee
    );

    event MilestoneApproved(
        bytes32 indexed projectId,
        uint256 indexed milestoneIndex,
        address indexed payer
    );

    event MilestoneReleased(
        bytes32 indexed projectId,
        uint256 indexed milestoneIndex,
        uint256 amount
    );

    event MilestoneDisputed(
        bytes32 indexed projectId,
        uint256 indexed milestoneIndex,
        address indexed disputer
    );

    error InvalidAddress(address addr);
    error InvalidAmount(uint256 amount);
    error InvalidMilestoneCount(uint256 count);
    error Unauthorized(address caller);
    error MilestoneNotCompleted(uint256 index);
    error MilestoneAlreadyReleased(uint256 index);
    error InsufficientFunds(uint256 required, uint256 available);
    error ProjectNotActive(bytes32 projectId);

    /**
     * @notice Create a new project with milestones
     * @param payee The service provider address
     * @param token Token address (address(0) for ETH)
     * @param milestoneAmounts Array of amounts for each milestone
     * @param milestoneDescriptions Array of descriptions for each milestone
     * @param milestoneDueDates Array of due dates for each milestone
     * @return projectId The created project identifier
     */
    function createProject(
        address payee,
        address token,
        uint256[] calldata milestoneAmounts,
        string[] calldata milestoneDescriptions,
        uint256[] calldata milestoneDueDates
    ) external payable nonReentrant returns (bytes32 projectId) {
        if (payee == address(0)) revert InvalidAddress(payee);
        if (milestoneAmounts.length == 0) revert InvalidMilestoneCount(0);
        if (milestoneAmounts.length != milestoneDescriptions.length ||
            milestoneAmounts.length != milestoneDueDates.length) {
            revert InvalidMilestoneCount(milestoneAmounts.length);
        }

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < milestoneAmounts.length; i++) {
            if (milestoneAmounts[i] == 0) revert InvalidAmount(0);
            totalAmount += milestoneAmounts[i];
        }

        projectId = keccak256(abi.encodePacked(
            msg.sender,
            payee,
            totalAmount,
            block.timestamp,
            projectCount
        ));

        Project storage project = projects[projectId];
        project.payer = msg.sender;
        project.payee = payee;
        project.token = token;
        project.totalAmount = totalAmount;
        project.releasedAmount = 0;
        project.createdAt = block.timestamp;
        project.active = true;

        if (token == address(0)) {
            if (msg.value != totalAmount) {
                revert InsufficientFunds(totalAmount, msg.value);
            }
        } else {
            IERC20(token).safeTransferFrom(msg.sender, address(this), totalAmount);
        }

        for (uint256 i = 0; i < milestoneAmounts.length; i++) {
            project.milestones.push(Milestone({
                description: milestoneDescriptions[i],
                amount: milestoneAmounts[i],
                dueDate: milestoneDueDates[i],
                status: MilestoneStatus.Pending,
                released: false
            }));
        }

        payerProjects[msg.sender].push(projectId);
        payeeProjects[payee].push(projectId);
        allProjects.push(projectId);
        projectCount++;

        emit ProjectCreated(projectId, msg.sender, payee, totalAmount, milestoneAmounts.length);
        return projectId;
    }

    /**
     * @notice Mark a milestone as completed
     * @param projectId The project identifier
     * @param milestoneIndex The milestone index
     */
    function completeMilestone(bytes32 projectId, uint256 milestoneIndex) external {
        Project storage project = projects[projectId];
        if (!project.active) revert ProjectNotActive(projectId);
        if (msg.sender != project.payee) revert Unauthorized(msg.sender);

        Milestone storage milestone = project.milestones[milestoneIndex];
        require(milestone.status == MilestoneStatus.Pending, "Not pending");
        
        milestone.status = MilestoneStatus.Completed;
        emit MilestoneCompleted(projectId, milestoneIndex, msg.sender);
    }

    /**
     * @notice Approve a completed milestone
     * @param projectId The project identifier
     * @param milestoneIndex The milestone index
     */
    function approveMilestone(bytes32 projectId, uint256 milestoneIndex) external {
        Project storage project = projects[projectId];
        if (!project.active) revert ProjectNotActive(projectId);
        if (msg.sender != project.payer) revert Unauthorized(msg.sender);

        Milestone storage milestone = project.milestones[milestoneIndex];
        if (milestone.status != MilestoneStatus.Completed) {
            revert MilestoneNotCompleted(milestoneIndex);
        }

        milestone.status = MilestoneStatus.Approved;
        emit MilestoneApproved(projectId, milestoneIndex, msg.sender);
    }

    /**
     * @notice Release payment for an approved milestone
     * @param projectId The project identifier
     * @param milestoneIndex The milestone index
     */
    function releaseMilestone(bytes32 projectId, uint256 milestoneIndex) external nonReentrant {
        Project storage project = projects[projectId];
        if (!project.active) revert ProjectNotActive(projectId);

        Milestone storage milestone = project.milestones[milestoneIndex];
        require(milestone.status == MilestoneStatus.Approved, "Not approved");
        if (milestone.released) revert MilestoneAlreadyReleased(milestoneIndex);

        milestone.released = true;
        milestone.status = MilestoneStatus.Released;
        project.releasedAmount += milestone.amount;

        if (project.token == address(0)) {
            _transferETH(project.payee, milestone.amount);
        } else {
            IERC20(project.token).safeTransfer(project.payee, milestone.amount);
        }

        emit MilestoneReleased(projectId, milestoneIndex, milestone.amount);
    }

    /**
     * @notice Dispute a milestone
     * @param projectId The project identifier
     * @param milestoneIndex The milestone index
     */
    function disputeMilestone(bytes32 projectId, uint256 milestoneIndex) external {
        Project storage project = projects[projectId];
        require(msg.sender == project.payer || msg.sender == project.payee, "Unauthorized");

        Milestone storage milestone = project.milestones[milestoneIndex];
        milestone.status = MilestoneStatus.Disputed;
        emit MilestoneDisputed(projectId, milestoneIndex, msg.sender);
    }

    /**
     * @notice Get project details
     * @param projectId The project identifier
     * @return payer Project payer address
     * @return payee Project payee address
     * @return token Token address
     * @return totalAmount Total project amount
     * @return releasedAmount Amount released so far
     * @return milestoneCount Number of milestones
     * @return active Project active status
     */
    function getProject(bytes32 projectId) external view returns (
        address payer,
        address payee,
        address token,
        uint256 totalAmount,
        uint256 releasedAmount,
        uint256 milestoneCount,
        bool active
    ) {
        Project storage project = projects[projectId];
        return (
            project.payer,
            project.payee,
            project.token,
            project.totalAmount,
            project.releasedAmount,
            project.milestones.length,
            project.active
        );
    }

    /**
     * @notice Get milestone details
     * @param projectId The project identifier
     * @param milestoneIndex The milestone index
     * @return Milestone details
     */
    function getMilestone(bytes32 projectId, uint256 milestoneIndex)
        external
        view
        returns (Milestone memory)
    {
        return projects[projectId].milestones[milestoneIndex];
    }

    /**
     * @notice Get all milestones for a project
     * @param projectId The project identifier
     * @return Array of milestones
     */
    function getAllMilestones(bytes32 projectId) external view returns (Milestone[] memory) {
        return projects[projectId].milestones;
    }

    /**
     * @notice Get projects for a payer
     * @param payer The payer address
     * @return Array of project identifiers
     */
    function getPayerProjects(address payer) external view returns (bytes32[] memory) {
        return payerProjects[payer];
    }

    /**
     * @notice Get projects for a payee
     * @param payee The payee address
     * @return Array of project identifiers
     */
    function getPayeeProjects(address payee) external view returns (bytes32[] memory) {
        return payeeProjects[payee];
    }

    function _transferETH(address to, uint256 amount) private {
        (bool success, ) = to.call{value: amount}("");
        require(success, "ETH transfer failed");
    }

    receive() external payable {}
}

