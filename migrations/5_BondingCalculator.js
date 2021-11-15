const Quasar = artifacts.require("QuasarERC20Token");
const BondingCalculator = artifacts.require("QuasarBondingCalculator");

module.exports = async function (deployer) {
    await deployer.deploy(BondingCalculator, Quasar.address);
  };
