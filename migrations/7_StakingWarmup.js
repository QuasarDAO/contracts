const sQuasar = artifacts.require("sQuasarERC20Token");
const Staking = artifacts.require("QuasStaking");
const StakingWarmup = artifacts.require("StakingWarmup");

module.exports = async function (deployer) {
    await deployer.deploy(StakingWarmup, Staking.address, sQuasar.address);
  };
