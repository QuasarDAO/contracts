const HDWalletProvider = require('@truffle/hdwallet-provider');

const fs = require('fs');
const mnemonic = fs.readFileSync(".secret").toString().trim();

module.exports = {

  networks: {
    moonbase: {
      provider: () => new HDWalletProvider({
        mnemonic: {
          phrase: mnemonic
        },
        providerOrUrl: `https://rpc.testnet.moonbeam.network`,
        pollingInterval: 5000,
      }),
      network_id: 1287,
      gas: 5500000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
      networkCheckTimeout: 1000000,
      deploymentPollingInterval: 5000,
    }
  },

  mocha: {
  },

  compilers: {
    solc: {
      version: "0.7.5"
    }
  },
};
