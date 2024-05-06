import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  typechain: {
    outDir: "../frontend/typechain",
    target: "ethers-v6",
  },
};

export default config;
