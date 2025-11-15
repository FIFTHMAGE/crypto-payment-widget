const { ethers } = require("hardhat");

module.exports = {
  ZERO_ADDRESS: ethers.ZeroAddress,
  ONE_ETH: ethers.parseEther("1.0"),
  HALF_ETH: ethers.parseEther("0.5"),
  DEFAULT_FEE: 25, // 0.25%
  MAX_FEE: 500, // 5%
  FEE_DENOMINATOR: 10000,
};

