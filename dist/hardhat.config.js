"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
require("@nomiclabs/hardhat-waffle");
require("@typechain/hardhat");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-ethers");
require("hardhat-deploy");
var path_1 = require("path");
var dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: (0, path_1.resolve)(__dirname, "./.env") });
var privateKey = (_a = process.env.PRIVATE_KEY) !== null && _a !== void 0 ? _a : "NO_PRIVATE_KEY";
var chainIds = {
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
            accounts: ["".concat(privateKey)],
            gas: 2100000,
            gasPrice: 8000000000,
        }
    },
    etherscan: {
        apiKey: "G3174RRXZ98D94UBIF3TUCFVSG5M1VRXNA"
    }
};
