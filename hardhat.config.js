const fs = require('fs');
const mnemonic = fs.readFileSync(".secret").toString().trim();

require("@nomiclabs/hardhat-waffle");
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.7.5",
      },
      {
        version: "0.8.0",
      },
    ]
  },
  defaultNetwork: "moonbase",
  networks: {
    moonbase: {
      url: "https://rpc-mumbai.maticvigil.com/",
      accounts: {
        mnemonic: mnemonic
      }
    }
  },
};
