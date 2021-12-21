const { ethers } = require("hardhat");
const { waitSuccess, deployContract } = require("./utils.js")

// const epochLength = ; // 8 hours
const epochLength = 60 * 5; // 5 minute
// first epoch number
const firstEpochNumber = 1;

// Ethereum 0 address, used when toggling changes in treasury
const zeroAddress = '0x0000000000000000000000000000000000000000';

// Initial staking index
const initialIndex = '7675210820';
// Initial reward rate for epoch
const initialRewardRate = '3000';

async function main() {

    const [deployer] = await ethers.getSigners();
    console.log('Deploying contracts with the account: ' + deployer.address);

    const quas = await deployContract('QuasarERC20Token');

    const squas = await deployContract('sQuasarERC20Token');

    const treasury = await deployContract('QuasarTreasury', quas.address, 0);

    const bonding_calc = await deployContract('QuasarBondingCalculator', quas.address);

    const latestBlockNumber = await ethers.getDefaultProvider().getBlockNumber();
    const latestBlock = await ethers.getDefaultProvider().getBlock(latestBlockNumber);
    const distributor = await deployContract(
        'Distributor',
        treasury.address, 
        quas.address, 
        epochLength,
        latestBlock.timestamp);

    const staking = await deployContract(
        'QuasStaking',
        quas.address, 
        squas.address, 
        epochLength, 
        firstEpochNumber, 
        latestBlock.timestamp);

    const staking_warmup = await deployContract('StakingWarmup', staking.address, squas.address);

    const staking_helper = await deployContract('StakingHelper', staking.address, quas.address);

    // INITIALIZE
    console.log("Initializing protocol...")

    // Initialize sQUAS and set the index
    console.log('squas.initialize(staking.address)')
    await waitSuccess(await squas.initialize(staking.address))
    console.log('squas.setIndex(initialIndex)')
    await waitSuccess(await squas.setIndex(initialIndex))

    // Set distributor contract and warmup contract
    console.log("staking.setContract('0', distributor.address)")
    await waitSuccess(await staking.setContract('0', distributor.address))
    console.log("staking.setContract('1', staking_warmup.address)")
    await waitSuccess(await staking.setContract('1', staking_warmup.address))

    // Set treasury for QUAS token
    console.log("quas.setVault(treasury.address)")
    await waitSuccess(await quas.setVault(treasury.address))

    // Add staking contract as distributor recipient
    console.log("distributor.addRecipient(staking.address, initialRewardRate)")
    await waitSuccess(await distributor.addRecipient(staking.address, initialRewardRate))

    // queue and toggle reward manager
    console.log("treasury.queue('8', distributor.address)")
    await waitSuccess(await treasury.queue('8', distributor.address))
    console.log("treasury.toggle('8', distributor.address, zeroAddress)")
    await waitSuccess(await treasury.toggle('8', distributor.address, zeroAddress, {gasLimit: 300000}))
    // queue and toggle deployer reserve depositor
    console.log("treasury.queue('0', deployer.address)")
    await waitSuccess(await treasury.queue('0', deployer.address, {gasLimit: 300000}))
    console.log("reasury.toggle('0', deployer.address, zeroAddress)")
    await waitSuccess(await treasury.toggle('0', deployer.address, zeroAddress, {gasLimit: 300000}))
    // queue and toggle liquidity depositor
    console.log("treasury.queue('4', deployer.address)")
    await waitSuccess(await treasury.queue('4', deployer.address, {gasLimit: 300000}))
    console.log("treasury.toggle('4', deployer.address, zeroAddress)")
    await waitSuccess(await treasury.toggle('4', deployer.address, zeroAddress, {gasLimit: 300000}))

    console.log(`
        QUAS:              ${quas.address}
        sQUAS:             ${squas.address}
        Staking:           ${staking.address}
        StakingWarmup:     ${staking_warmup.address}
        StakingHelper:     ${staking_helper.address}
        Distributor:       ${distributor.address}
        Treasury:          ${treasury.address}
        BondingCalculator: ${bonding_calc.address}

        export QUAS=${quas.address}
        export SQUAS=${squas.address}
        export STAKING=${staking.address}
        export STAKING_WARMUP=${staking_warmup.address}
        export STAKING_HELPER=${staking_helper.address}
        export DISTRIBUTOR=${distributor.address}
        export TREASURY=${treasury.address}
        export BONDING_CALCULATOR=${bonding_calc.address}
    `);
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
