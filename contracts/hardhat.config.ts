import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    hardhat: {},
    mainnet: { url: process.env.MAINNET_RPC_URL || "" }
  }
};

export default config;

