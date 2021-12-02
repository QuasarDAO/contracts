const HDWalletProvider = require('@truffle/hdwallet-provider');

const fs = require('fs');
const mnemonic = fs.readFileSync(".secret").toString().trim();

module.exports = {

  networks: {
  },

  mocha: {
  },

  compilers: {
    solc: {
      version: "0.7.5"
    }
  },
};
