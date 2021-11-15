const sQuasar = artifacts.require("sQuasarERC20Token");

module.exports = async function (deployer) {
  await deployer.deploy(sQuasar);
};
