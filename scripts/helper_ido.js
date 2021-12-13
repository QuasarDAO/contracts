const { ethers } = require("hardhat");
const { waitSuccess } = require("./wait_tx.js")

// Ethereum 0 address, used when toggling changes in treasury
const zeroAddress = '0x0000000000000000000000000000000000000000';

module.exports = {

    pushAnswers: async function (number) {

        console.log(`Generating ${number} secrets...`)
        secrets = []
        for (i = 0; i < number; i++) {
            secrets.push(ethers.utils.randomBytes(32))
        }

        console.log('Calculating answers...')
        answers = []
        secrets.forEach(secret => {
            answers.push(ethers.utils.keccak256(secret))
        });

        const MINTER = await ethers.getContractFactory('Minter')
        var minter = await MINTER.attach(process.env.MINTER)

        console.log('minter.pushAnswers(answers, true)')
        await waitSuccess(await minter.pushAnswers(answers, true));

        console.log("Secrets:")
        secrets.forEach(secret => {
            console.log(ethers.utils.hexlify(secret))
        })
    },

    deployIdoBond: async function(reserve_token_address) {

        const IDO_BOND_DEPOSITORY = await ethers.getContractFactory('QuasarIDOBondDepository');

        console.log('Deploying IDO Bond...')
        var ido_bond = await IDO_BOND_DEPOSITORY.deploy(
            process.env.QUAS,
            process.env.NFT,
            reserve_token_address,
            process.env.TREASURY, 
            process.env.DAO); 
        ido_bond = await ido_bond.deployed()

        //init ido bond
        const price = '15000';
        const priceInUSD = '150000000000000000000'
        const maxPurchase = '5000000000';
        const bondFee = '1500';
        const vesting = '1800';
        console.log("ido_bond.initializeBondTerms")
        await waitSuccess(await ido_bond.initializeBondTerms(price, priceInUSD, maxPurchase, bondFee, vesting));
        
        const QUASAR_TREASURY = await ethers.getContractFactory('QuasarTreasury')
        var treasury = await QUASAR_TREASURY.attach(process.env.TREASURY)

        // queue and toggle ido bond reserve depositor
        console.log("treasury.queue('0', ido_bond.address)")
        await waitSuccess(await treasury.queue('0', ido_bond.address, {gasLimit: 300000}))
        console.log("treasury.toggle('0', ido_bond.address, zeroAddress)")
        await waitSuccess(await treasury.toggle('0', ido_bond.address, zeroAddress, {gasLimit: 300000}))

        // Set staking for ido bond
        console.log("ido_bond.setStaking")
        await waitSuccess(await ido_bond.setStaking(process.env.STAKING_HELPER, true))

        // Add new reserve token in treasury
        console.log("treasury.queue('2', reserve_token_address)")
        await waitSuccess(await treasury.queue('2', reserve_token_address, {gasLimit: 300000}))
        console.log("treasury.toggle('2', reserve_token_address, zeroAddress)")
        await waitSuccess(await treasury.toggle('2', reserve_token_address, zeroAddress, {gasLimit: 300000}))

        console.log(`
            Finished.

            Reserve token: ${reserve_token_address}
            IDO Bond:  ${ido_bond.address}
        
            `)
    },
}
