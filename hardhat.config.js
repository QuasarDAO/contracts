const fs = require('fs');
const mnemonic = fs.readFileSync(".secret").toString().trim();

require("@nomiclabs/hardhat-waffle");
module.exports = {
  solidity: "0.7.5",
  defaultNetwork: "moonbase",
  networks: {
    moonbase: {
      url: "https://rpc.testnet.moonbeam.network",
      accounts: {
        mnemonic: mnemonic
      }
    }
  },
};
