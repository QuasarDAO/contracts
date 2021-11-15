const Quasar = artifacts.require("QuasarERC20Token");
const Staking = artifacts.require("QuasStaking");
const StakingHelper = artifacts.require("StakingHelper");

module.exports = async function (deployer) {
    await deployer.deploy(StakingHelper, Staking.address, Quasar.address);
  };
