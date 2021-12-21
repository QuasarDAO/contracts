const fs = require('fs');
const mnemonic = fs.readFileSync(".secret").toString().trim();

require("@nomiclabs/hardhat-waffle");

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

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
  defaultNetwork: "mumbai",
  networks: {
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com/",
      accounts: {
        mnemonic: mnemonic
      }
    }
  },
};
