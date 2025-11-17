// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FeeTierSystem
 * @notice Payment fee tier system
 */
contract FeeTierSystem {
    struct FeeTier {
        uint256 minAmount;
        uint256 maxAmount;
        uint256 feePercent;
    }

    FeeTier[] public feeTiers;
    uint256 public constant BASE_FEE = 25; // 0.25%

    event TierAdded(uint256 minAmount, uint256 maxAmount, uint256 feePercent);

    function addTier(uint256 minAmount, uint256 maxAmount, uint256 feePercent) external {
        feeTiers.push(FeeTier(minAmount, maxAmount, feePercent));
        emit TierAdded(minAmount, maxAmount, feePercent);
    }

    function getFeeForAmount(uint256 amount) public view returns (uint256) {
        for (uint256 i = 0; i < feeTiers.length; i++) {
            if (amount >= feeTiers[i].minAmount && amount <= feeTiers[i].maxAmount) {
                return (amount * feeTiers[i].feePercent) / 10000;
            }
        }
        return (amount * BASE_FEE) / 10000;
    }
}

