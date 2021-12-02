const { EtherscanProvider } = require("@ethersproject/providers");
const { ethers } = require("hardhat");

// Ethereum 0 address, used when toggling changes in treasury
const zeroAddress = '0x0000000000000000000000000000000000000000';

async function waitSuccess(result) {
    console.log(`

    Transaction: ${result.hash}

    🕑 Waiting for it to be processed...
    `)
    result = await result.wait()
    checkSuccess(result) 
}

function checkSuccess(result) {

    if (result.status === 1) {
        console.log(`✅ Transaction [${result.transactionHash}] was successful\n\n`)
    } else {
        console.log(`❌ Transaction [${result.transactionHash}] failed\n\n`)
        throw 'Transaction failed'
    }
}

module.exports = {

    createUniswapPair: async function(reserve_token_address, amountA, amountB, skipApprove=true) {

        if (!skipApprove) {
            console.log("Approving reserve token...")
            await this.approveERC20(reserve_token_address, amountA, process.env.UNISWAP_V2_ROUTER)
    
            console.log("Approving QUAS...")
            await this.approveERC20(process.env.QUAS, amountB, process.env.UNISWAP_V2_ROUTER)    
        }

        console.log("Creating Uniswap pair...")
        const [owner] = await ethers.getSigners();

        const { V2_ROUTER_ABI } = require("./abi/v2_router_abi.js");

        const v2_router = new ethers.Contract(
            process.env.UNISWAP_V2_ROUTER, 
            V2_ROUTER_ABI, 
            owner);

        const timestampInFuture = 9999999999;
        console.log("v2_router.addLiquidity()")
        var result = await v2_router.addLiquidity(
            reserve_token_address,
            process.env.QUAS,
            amountA,
            amountB,
            amountA,
            amountB,
            owner.address,
            timestampInFuture,
            { gasLimit: 6000000 });
        await waitSuccess(result)
    },

    mintMockDai: async function(dai_address, amount, to) {

        console.log("Minting mock DAI...")
        if (!to) {
            const [owner] = await ethers.getSigners();
            to = owner.address;
        }

        const DAI = await ethers.getContractFactory('DAI')
        var dai = await DAI.attach(dai_address)

        console.log("dai.mint(to, amount)")
        await waitSuccess(await dai.mint(to, amount))
    },

    depositToTreasury: async function(token, amount, profit, skipApprove=true) {

        if (!skipApprove) {
            console.log("Approving token...")
            await this.approveERC20(token, amount, process.env.TREASURY)
        }

        console.log("Depositing to treasury...")
        const QUASAR_TREASURY = await ethers.getContractFactory('QuasarTreasury')
        var treasury = await QUASAR_TREASURY.attach(process.env.TREASURY)

        console.log("treasury.deposit(amount, token, profit)")
        await waitSuccess(await treasury.deposit(amount, token, profit, {gasLimit: 300000}))
    },

    deployMockDai: async function() {

        console.log('Deploying mock DAI...');
        const DAI = await ethers.getContractFactory('DAI');
        var dai = await DAI.deploy(0);
        dai = await dai.deployed();
        console.log(`
            Finished.

            Mock DAI: ${dai.address}
        
            `)
    },

    approveERC20: async function(token, amount, to) {

        console.log(`Approving [${token}]...`)
        const [owner] = await ethers.getSigners();
        const { ERC20_ABI } = require("./abi/erc20_abi.js");
        const erc20 = new ethers.Contract(
            token, 
            ERC20_ABI, 
            owner);
        console.log("erc20.approve(to, amount)")
        var result = await erc20.approve(to, amount, {gasLimit: 300000})
        await waitSuccess(result)
    },

    deployReserveBond: async function(reserve_token_address) {

        const BOND_DEPOSITORY = await ethers.getContractFactory('QuasarBondDepository');

        console.log('Deploying Reserve Bond...')
        var reserve_bond = await BOND_DEPOSITORY.deploy(
            process.env.QUAS,
            reserve_token_address,
            process.env.TREASURY, 
            process.env.DAO, 
            zeroAddress); 
        reserve_bond = await reserve_bond.deployed()

        //init reserve bond
        const daiBondBCV = '369';
        const bondVesting = '1800';
        const minBondPrice = '0';
        const maxBondPayout = '50'
        const bondFee = '0';
        const maxBondDebt = '1000000000000000';
        const intialBondDebt = '0'
        console.log("reserve_bond.initializeBondTerms")
        await waitSuccess(await reserve_bond.initializeBondTerms(
            daiBondBCV, minBondPrice, maxBondPayout, bondFee, maxBondDebt, intialBondDebt, bondVesting));
        
        const QUASAR_TREASURY = await ethers.getContractFactory('QuasarTreasury')
        var treasury = await QUASAR_TREASURY.attach(process.env.TREASURY)

        // queue and toggle reserve bond reserve depositor
        console.log("treasury.queue('0', reserve_bond.address)")
        await waitSuccess(await treasury.queue('0', reserve_bond.address, {gasLimit: 300000}))
        console.log("treasury.toggle('0', reserve_bond.address, zeroAddress)")
        await waitSuccess(await treasury.toggle('0', reserve_bond.address, zeroAddress, {gasLimit: 300000}))

        // Set staking for reserve bond
        console.log("reserve_bond.setStaking")
        await waitSuccess(await reserve_bond.setStaking(process.env.STAKING_HELPER, true))

        // Add new reserve token in treasury
        console.log("treasury.queue('2', reserve_token_address)")
        await waitSuccess(await treasury.queue('2', reserve_token_address, {gasLimit: 300000}))
        console.log("treasury.toggle('2', reserve_token_address, zeroAddress)")
        await waitSuccess(await treasury.toggle('2', reserve_token_address, zeroAddress, {gasLimit: 300000}))

        console.log(`
            Finished.

            Reserve token: ${reserve_token_address}
            Reserve Bond:  ${reserve_bond.address}
        
            `)
    },

    deployLpBond: async function(lp_token_address) {

        const BOND_DEPOSITORY = await ethers.getContractFactory('QuasarBondDepository');

        console.log('Deploying LP Bond...')
        var lp_bond = await BOND_DEPOSITORY.deploy(
            process.env.QUAS,
            lp_token_address,
            process.env.TREASURY,
            process.env.DAO,
            process.env.BONDING_CALCULATOR);
        lp_bond = await lp_bond.deployed()

        //init lp bond
        const daiBondBCV = '204';
        const bondVesting = '1800';
        const minBondPrice = '0';
        const maxBondPayout = '500'
        const bondFee = '0';
        const maxBondDebt = '1000000000000000';
        const intialBondDebt = '0'
        console.log('lp_bond.initializeBondTerms()')
        await waitSuccess(await lp_bond.initializeBondTerms(
            daiBondBCV, minBondPrice, maxBondPayout, bondFee, maxBondDebt, intialBondDebt, bondVesting
        ))
    
        const QUASAR_TREASURY = await ethers.getContractFactory('QuasarTreasury')
        var treasury = await QUASAR_TREASURY.attach(process.env.TREASURY)

        // queue and toggle lp bond depositor
        console.log("treasury.queue('4', lp_bond.address)")
        await waitSuccess(await treasury.queue('4', lp_bond.address, {gasLimit: 300000}))
        console.log("treasury.toggle('4', lp_bond.address, zeroAddress)")
        await waitSuccess(await treasury.toggle('4', lp_bond.address, zeroAddress, {gasLimit: 300000}))

        // Set staking for LP bond
        console.log("lp_bond.setStaking(process.env.STAKING_HELPER, true)")
        await waitSuccess(await lp_bond.setStaking(process.env.STAKING_HELPER, true))

        // Add new lp token in treasury
        console.log("treasury.queue('5', lp_token_address)")
        await waitSuccess(await treasury.queue('5', lp_token_address, {gasLimit: 300000}))
        console.log("treasury.toggle('5', lp_token_address, process.env.BONDING_CALCULATOR)")
        await waitSuccess(await treasury.toggle('5', lp_token_address, process.env.BONDING_CALCULATOR, {gasLimit: 300000}))

        console.log(`
            Finished.

            LP token: ${lp_token_address}
            LP Bond:  ${lp_bond.address}
            
            `)
    }
}
