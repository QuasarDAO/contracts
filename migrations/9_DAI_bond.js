const QuasarBondDepository = artifacts.require("QuasarBondDepository");
const Quasar = artifacts.require("QuasarERC20Token");
const DAIERC20 = artifacts.require("DAI");
const Treasury = artifacts.require("QuasarTreasury");

// Ethereum 0 address, used when toggling changes in treasury
const zeroAddress = '0x0000000000000000000000000000000000000000';

module.exports = async function (deployer, network, accounts) {
    await deployer.deploy(QuasarBondDepository, 
        Quasar.address, 
        DAIERC20.address, 
        Treasury.address,
        accounts[1], //mock DAO
        zeroAddress);
  };
