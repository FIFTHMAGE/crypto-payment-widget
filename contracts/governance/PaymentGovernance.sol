// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";

/**
 * @title PaymentGovernance
 * @dev Governance contract for payment protocol parameters
 * Allows token holders to propose and vote on protocol changes
 */
contract PaymentGovernance is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    GovernorTimelockControl
{
    // Custom proposal types
    enum ProposalType {
        FeeChange,
        ParameterUpdate,
        ProtocolUpgrade,
        EmergencyAction
    }

    // Governance parameters
    uint256 private constant VOTING_DELAY = 1 days;
    uint256 private constant VOTING_PERIOD = 1 weeks;
    uint256 private constant PROPOSAL_THRESHOLD = 100000e18; // 100,000 tokens

    // Events
    event ProposalTypeSet(uint256 indexed proposalId, ProposalType proposalType);
    event ParameterUpdated(string parameter, uint256 oldValue, uint256 newValue);
    event EmergencyActionExecuted(address indexed executor, string reason);

    /**
     * @dev Constructor
     * @param _token The governance token
     * @param _timelock The timelock controller
     */
    constructor(
        IVotes _token,
        TimelockController _timelock
    )
        Governor("Payment Protocol Governance")
        GovernorSettings(
            VOTING_DELAY,
            VOTING_PERIOD,
            PROPOSAL_THRESHOLD
        )
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4) // 4% quorum
        GovernorTimelockControl(_timelock)
    {}

    // The following functions are overrides required by Solidity

    function votingDelay()
        public
        view
        override(IGovernor, GovernorSettings)
        returns (uint256)
    {
        return super.votingDelay();
    }

    function votingPeriod()
        public
        view
        override(IGovernor, GovernorSettings)
        returns (uint256)
    {
        return super.votingPeriod();
    }

    function quorum(uint256 blockNumber)
        public
        view
        override(IGovernor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    function state(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }

    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public override(Governor, IGovernor) returns (uint256) {
        return super.propose(targets, values, calldatas, description);
    }

    function proposalThreshold()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.proposalThreshold();
    }

    function _execute(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) {
        super._execute(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    function _executor()
        internal
        view
        override(Governor, GovernorTimelockControl)
        returns (address)
    {
        return super._executor();
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Set proposal type for categorization
     */
    function setProposalType(uint256 proposalId, ProposalType proposalType)
        external
    {
        require(
            state(proposalId) == ProposalState.Pending,
            "Proposal not pending"
        );
        emit ProposalTypeSet(proposalId, proposalType);
    }

    /**
     * @dev Get voting power at a specific block
     */
    function getVotingPower(address account, uint256 blockNumber)
        external
        view
        returns (uint256)
    {
        return getVotes(account, blockNumber);
    }

    /**
     * @dev Check if an account has enough voting power to propose
     */
    function canPropose(address account) external view returns (bool) {
        return
            getVotes(account, block.number - 1) >= proposalThreshold();
    }
}

