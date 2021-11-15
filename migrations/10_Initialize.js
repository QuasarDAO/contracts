const Quasar = artifacts.require("QuasarERC20Token");
const sQuasar = artifacts.require("sQuasarERC20Token");
const Staking = artifacts.require("QuasStaking");
const Distributor = artifacts.require("Distributor");
const StakingWarmup = artifacts.require("StakingWarmup");
const Treasury = artifacts.require("QuasarTreasury");
const StakingHelper = artifacts.require("StakingHelper");
const DAIERC20 = artifacts.require("DAI");
const QuasarBondDepository = artifacts.require("QuasarBondDepository");

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


module.exports = async function (deployer, network, accounts) {

    const owner = accounts[0];

    const sQUAS = await sQuasar.deployed();
    // Initialize sQUAS and set the index
    await sQUAS.initialize(Staking.address);
    await sQUAS.setIndex(initialIndex);


    const staking = await Staking.deployed();
    // Set distributor contract and warmup contract
    await staking.setContract('0', Distributor.address);
    await staking.setContract('1', StakingWarmup.address);


    const quas = await Quasar.deployed();
    // Set treasury for QUAS token
    await quas.setVault(Treasury.address);


    const distributor = await Distributor.deployed();
    // Add staking contract as distributor recipient
    await distributor.addRecipient(staking.address, initialRewardRate);


    //configure treasury
    const treasury = await Treasury.deployed();
    // queue and toggle reward manager
    await treasury.queue('8', Distributor.address);
    await treasury.toggle('8', Distributor.address, zeroAddress);
    // queue and toggle deployer reserve depositor
    await treasury.queue('0', owner);
    await treasury.toggle('0', owner, zeroAddress);
    // queue and toggle liquidity depositor
    await treasury.queue('4', owner);
    await treasury.toggle('4', owner, zeroAddress);
    // queue and toggle DAI bond reserve depositor
    const daiBond = await QuasarBondDepository.deployed();
    await treasury.queue('0', daiBond.address);
    await treasury.toggle('0', daiBond.address, zeroAddress);


    //deposit in treasury
    const dai = await DAIERC20.deployed();
    await dai.mint( owner, initialMint );
    // await dai.approve(treasury.address, largeApproval );
    // await treasury.deposit('9000000000000000000000000', dai.address, '8400000000000000');


    //init dai bond
    await daiBond.initializeBondTerms(
        daiBondBCV, minBondPrice, maxBondPayout, bondFee, maxBondDebt, intialBondDebt, bondVesting);
    await daiBond.setStaking(StakingHelper.address, true);
    await dai.approve(daiBond.address, largeApproval );

    console.log(`
        QUAS:           ${Quasar.address}
        sQUAS:          ${sQuasar.address}
        Staking:        ${Staking.address}
        StakingWarmup:  ${StakingWarmup.address}
        StakingHelper:  ${StakingHelper.address}
        Distributor:    ${Distributor.address}
        Treasury:       ${Treasury.address}
        DAI:            ${DAIERC20.address}
        DAI Bond:       ${daiBond.address}
    `)
  };
