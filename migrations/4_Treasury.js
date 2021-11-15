const Quasar = artifacts.require("QuasarERC20Token");
const Treasury = artifacts.require("QuasarTreasury");
const DAIERC20 = artifacts.require("DAI");

module.exports = async function (deployer, network) {
    const QUAS = Quasar.address;

    var DAI;
    if (network === 'moonbase') {
        console.log("Deploying DAI to testnet...")
        await deployer.deploy(DAIERC20, 0);
        DAI = DAIERC20.address;
    } else {
        //TODO hardcode DAI token address
    }

    await deployer.deploy(Treasury, QUAS, DAI, 0);
};
