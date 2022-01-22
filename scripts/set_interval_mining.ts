import hre from 'hardhat';

async function setIntervalMining() {
    
    const {  ethers } = hre;
    await ethers.provider.send("evm_setIntervalMining", [1000]);
}

setIntervalMining()
    .then(() => process.exit(0))
    .catch((error: Error) => {
        console.error(error);
        process.exit(1);
    });
