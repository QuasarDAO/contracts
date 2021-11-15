const Quasar = artifacts.require("QuasarERC20Token");
const sQuasar = artifacts.require("sQuasarERC20Token");
const Treasury = artifacts.require("QuasarTreasury");
const Distributor = artifacts.require("Distributor");
const Staking = artifacts.require("QuasStaking");

module.exports = async function (deployer) {
    const web3 = Distributor.interfaceAdapter.web3;
    const latestBlockNumber = await web3.eth.getBlockNumber();

    // const epochLength = 28800; // 8 hours
    const epochLength = 120; // 8 hours
    const firstEpochNumber = 1;
    const latestBlock = await web3.eth.getBlock(latestBlockNumber);

    await deployer.deploy(
        Distributor,
        Treasury.address,
        Quasar.address,
        epochLength,
        latestBlock.timestamp,
    );

    await deployer.deploy(
        Staking,
        Quasar.address,
        sQuasar.address,
        epochLength,
        firstEpochNumber,
        latestBlock.timestamp,
    );
};
