const { ethers } = require("hardhat");

async function main() {
    console.log('Deploying mock DAI...');
    const DAI = await ethers.getContractFactory('DAI');
    var dai = await DAI.deploy(0);
    dai = await dai.deployed();
    console.log(`
        Finished.

        Mock DAI: ${dai.address}
    
        `)

    console.log('Deploying mock FRAX...');
    const FRAX = await ethers.getContractFactory('FRAX');
    var frax = await FRAX.deploy(0);
    frax = await frax.deployed();
    console.log(`
        Finished.

        Mock FRAX: ${frax.address}
    
        `)

    console.log(`
        DAI:       ${dai.address}
        FRAX:      ${frax.address}

        export DAI=${dai.address}
        export FRAX=${frax.address}
    `);
}

main()
    .then(() => process.exit())
    .catch(error => {
        console.error(error);
        process.exit(1);
})
