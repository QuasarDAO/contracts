const { ethers } = require("hardhat");

// const epochLength = 28800; // 8 hours
const epochLength = 120; // 2 mins
// first epoch number
const firstEpochNumber = 1;

// Ethereum 0 address, used when toggling changes in treasury
const zeroAddress = '0x0000000000000000000000000000000000000000';

// Initial staking index
const initialIndex = '7675210820';
// Initial reward rate for epoch
const initialRewardRate = '3000';

// DAI bond BCV
const daiBondBCV = '369';
// Bond vesting length in seconds
const bondVesting = '1800';
// Min bond price
const minBondPrice = '10000';
// Max bond payout
const maxBondPayout = '50'
// DAO fee for bond
const bondFee = '10000';
// Max debt bond can take on
const maxBondDebt = '1000000000000000';
// Initial Bond debt
const intialBondDebt = '0'

// Large number for approval for DAI
const largeApproval = '100000000000000000000000000000000';
// Initial mint for DAI (10,000,000)
const initialMint = '10000000000000000000000000';

async function main() {

    const [deployer, MockDAO] = await ethers.getSigners();
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

    console.log('Deploying mock DAI...');
    const DAI = await ethers.getContractFactory('DAI');
    var dai = await DAI.deploy(0);
    dai = await dai.deployed();
    console.log(`mock DAI: ${dai.address}\n`);

    console.log('Deploying Treasury...');
    const TREASURY = await ethers.getContractFactory('QuasarTreasury');
    var treasury = await TREASURY.deploy(quas.address, dai.address, 0);
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

    console.log('Deploying DaiBond...');
    const BOND_DEPOSITORY = await ethers.getContractFactory('QuasarBondDepository');
    var dai_bond = await BOND_DEPOSITORY.deploy(
        quas.address, dai.address, treasury.address, MockDAO.address, zeroAddress); 
    dai_bond = await dai_bond.deployed();
    console.log(`DaiBond: ${dai_bond.address}`);

    // INITIALIZE
    console.log("Initializing protocol...")

    // Initialize sQUAS and set the index
    console.log('squas.initialize(staking.address)')
    await squas.initialize(staking.address);
    console.log('squas.setIndex(initialIndex)')
    await squas.setIndex(initialIndex);

    // Set distributor contract and warmup contract
    console.log("staking.setContract('0', distributor.address)");
    await staking.setContract('0', distributor.address);
    console.log("staking.setContract('1', staking_warmup.address)");
    await staking.setContract('1', staking_warmup.address);

    // Set treasury for QUAS token
    console.log("quas.setVault(treasury.address)")
    await quas.setVault(treasury.address);

    // Add staking contract as distributor recipient
    console.log("distributor.addRecipient(staking.address, initialRewardRate)")
    await distributor.addRecipient(staking.address, initialRewardRate);

    // queue and toggle reward manager
    console.log("treasury.queue('8', distributor.address)")
    await treasury.queue('8', distributor.address);
    console.log("treasury.toggle('8', distributor.address, zeroAddress)")
    await treasury.toggle('8', distributor.address, zeroAddress, {gasLimit: 300000});
    // queue and toggle deployer reserve depositor
    console.log("treasury.queue('0', deployer.address)")
    await treasury.queue('0', deployer.address, {gasLimit: 300000});
    console.log("reasury.toggle('0', deployer.address, zeroAddress)")
    await treasury.toggle('0', deployer.address, zeroAddress, {gasLimit: 300000});
    // queue and toggle liquidity depositor
    console.log("treasury.queue('4', deployer.address)")
    await treasury.queue('4', deployer.address, {gasLimit: 300000});
    console.log("treasury.toggle('4', deployer.address, zeroAddress)")
    await treasury.toggle('4', deployer.address, zeroAddress, {gasLimit: 300000});
    // queue and toggle DAI bond reserve depositor
    console.log("treasury.queue('0', dai_bond.address)")
    await treasury.queue('0', dai_bond.address, {gasLimit: 300000});
    console.log("treasury.toggle('0', dai_bond.address, zeroAddress)")
    await treasury.toggle('0', dai_bond.address, zeroAddress, {gasLimit: 300000});

    //deposit in treasury
    console.log("dai.mint(deployer.address, initialMint)")
    await dai.mint(deployer.address, initialMint);
    // await dai.approve(treasury.address, largeApproval );
    // await treasury.deposit('9000000000000000000000000', dai.address, '8400000000000000');

    //init dai bond
    console.log("dai_bond.initializeBondTerms")
    await dai_bond.initializeBondTerms(
        daiBondBCV, minBondPrice, maxBondPayout, bondFee, maxBondDebt, intialBondDebt, bondVesting);
    console.log("dai_bond.setStaking")
    await dai_bond.setStaking(staking_helper.address, true);
    console.log("dai.approve")
    await dai.approve(dai_bond.address, largeApproval);

    console.log(`
        QUAS:           ${quas.address}
        sQUAS:          ${squas.address}
        Staking:        ${staking.address}
        StakingWarmup:  ${staking_warmup.address}
        StakingHelper:  ${staking_helper.address}
        Distributor:    ${distributor.address}
        Treasury:       ${treasury.address}
        DAI:            ${dai.address}
        DAI Bond:       ${dai_bond.address}
    `);
}

async function main2() {

    const [deployer, MockDAO] = await ethers.getSigners();

    const SQUAS = await ethers.getContractFactory('sQuasarERC20Token');
    var squas = await SQUAS.attach("0xF0126d5E8E95F6B8Ea215e63f455AD5Ca1DB0684")

    console.log('squas.initialize(staking.address)')
    await squas.initialize("0x87f152348F6463a274E02F65a8f65cd2271ED6b1");
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
