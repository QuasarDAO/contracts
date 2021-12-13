const { ethers } = require("hardhat");
const { waitSuccess } = require("./wait_tx.js")

// const epochLength = ; // 8 hours
const epochLength = 60 * 60; // 1 hour
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

    console.log('Deploying QUAS...')
    const QUAS = await ethers.getContractFactory('QuasarERC20Token');
    const quas = await QUAS.deploy();
    await quas.deployed();
    console.log(`QUAS: ${quas.address}\n`)

    console.log('Deploying sQUAS...');
    const SQUAS = await ethers.getContractFactory('sQuasarERC20Token');
    var squas = await SQUAS.deploy();
    squas = await squas.deployed();
    console.log(`sQUAS: ${squas.address}\n`);

    console.log('Deploying Treasury...');
    const TREASURY = await ethers.getContractFactory('QuasarTreasury');
    var treasury = await TREASURY.deploy(quas.address, 0);
    treasury = await treasury.deployed();
    console.log(`Treasury: ${treasury.address}\n`);

    console.log('Deploying BondingCalculator...');
    const BONDING_CALC = await ethers.getContractFactory('QuasarBondingCalculator');
    var bonding_calc = await BONDING_CALC.deploy(quas.address);
    bonding_calc = await bonding_calc.deployed();
    console.log(`BondingCalculator: ${bonding_calc.address}\n`);

    console.log('Deploying StakingDistributor...');
    const latestBlockNumber = await ethers.getDefaultProvider().getBlockNumber();
    const latestBlock = await ethers.getDefaultProvider().getBlock(latestBlockNumber);
    const DISTRIBUTOR = await ethers.getContractFactory('Distributor');
    var distributor = await DISTRIBUTOR.deploy(
        treasury.address, quas.address, epochLength, latestBlock.timestamp);
    distributor = await distributor.deployed();
    console.log(`StakingDistributor: ${distributor.address}\n`);

    console.log('Deploying Staking...');
    const STAKING = await ethers.getContractFactory('QuasStaking');
    var staking = await STAKING.deploy(
        quas.address, squas.address, epochLength, firstEpochNumber, latestBlock.timestamp);
    staking = await staking.deployed();
    console.log(`Staking: ${staking.address}\n`);

    console.log('Deploying StakingWarmup...');
    const STAKING_WARMUP = await ethers.getContractFactory('StakingWarmup');
    var staking_warmup = await STAKING_WARMUP.deploy(staking.address, squas.address);
    staking_warmup = await staking_warmup.deployed();
    console.log(`StakingWarmup: ${staking_warmup.address}\n`);

    console.log('Deploying StakingHelper...');
    const STAKING_HELPER = await ethers.getContractFactory('StakingHelper');
    var staking_helper = await STAKING_HELPER.deploy(staking.address, quas.address);
    staking_helper = await staking_helper.deployed();
    console.log(`StakingHelper: ${staking_helper.address}\n`);

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
