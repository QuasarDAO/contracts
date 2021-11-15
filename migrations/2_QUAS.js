const Quasar = artifacts.require("QuasarERC20Token");

module.exports = async function (deployer) {
  await deployer.deploy(Quasar);
};
