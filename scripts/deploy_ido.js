const { ethers } = require("hardhat");
const { waitSuccess } = require("./wait_tx.js")

async function main() {

    const [deployer] = await ethers.getSigners();
    console.log('Deploying contracts with the account: ' + deployer.address);

    console.log('Deploying QuasarIDOAccessERC721...')
    const IDOAccessERC721 = await ethers.getContractFactory('QuasarIDOAccessERC721');
    const nft = await IDOAccessERC721.deploy();
    await nft.deployed();
    console.log(`IDOAccessERC721: ${nft.address}`)

    console.log('Deploying Minter...')
    const Minter = await ethers.getContractFactory('Minter');
    const minter = await Minter.deploy(nft.address);
    await minter.deployed();
    console.log(`Minter: ${minter.address}`)

    console.log('Transfer ownership of IDOAccessERC721 to Minter')
    await waitSuccess(await nft.transferOwnership(minter.address))
    console.log('Ownership transfered')

    console.log(`
        IDO NFT: ${nft.address}
        Minter:  ${minter.address}
    `)
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
