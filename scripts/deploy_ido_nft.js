const { ethers } = require("hardhat");
const { waitSuccess, deployContract } = require("./utils.js")

async function main() {

    const [deployer] = await ethers.getSigners();
    console.log('Deploying contracts with the account: ' + deployer.address);

    const nft = await deployContract('QuasarIDOAccessERC721');

    const minter = await deployContract('Minter', nft.address);

    console.log('Transfer ownership of IDOAccessERC721 to Minter')
    await waitSuccess(await nft.transferOwnership(minter.address))
    console.log('Ownership transfered')

    console.log(`
        IDO NFT: ${nft.address}
        Minter:  ${minter.address}

        export NFT=${nft.address}
        export MINTER=${minter.address}
    `);
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
    })
