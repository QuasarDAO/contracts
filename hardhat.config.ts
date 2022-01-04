import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy";
import {task} from 'hardhat/config';

import { resolve } from "path";
import { config as dotenvConfig } from "dotenv";

dotenvConfig({ path: resolve(__dirname, "./.env") });

const privateKey = process.env.PRIVATE_KEY ?? "NO_PRIVATE_KEY";

const chainIds = {
  polygon: 137,
  mumbai: 80001,
};

module.exports = {
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
    deploy: "./scripts/deploy",
    deployments: "./deployments",
  },
  solidity: {
    compilers: [
      {
        version: "0.7.5",
        settings: {
          metadata: {
            bytecodeHash: "none",
          },
          optimizer: {
            enabled: true,
            runs: 800,
          },
        },
      },
      {
        version: "0.8.0",
      },
    ]
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    daoMultisig: {},
  },
  defaultNetwork: "polygonMumbai",
  networks: {
    polygonMumbai: {
      url: "https://rpc-mumbai.maticvigil.com/",
      accounts: [`${privateKey}`],
      gas: 2100000,
      gasPrice: 8000000000,
    }
  },
  etherscan: {
    apiKey: "G3174RRXZ98D94UBIF3TUCFVSG5M1VRXNA"
  }
};
