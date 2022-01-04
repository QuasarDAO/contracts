import hre from 'hardhat';
import { DAI__factory } from '../typechain/factories/DAI__factory'

async function deployMockDAI() {

    const { getNamedAccounts, ethers } = hre;
    const { deployer } = await getNamedAccounts();
    const signer = await ethers.provider.getSigner(deployer);

    const factory = new DAI__factory(signer);
    const dai = await factory.deploy(await hre.getChainId());

    console.log(`DAI address: ${dai.address}`)
}

deployMockDAI()
    .then(() => process.exit(0))
    .catch((error: Error) => {
        console.error(error);
        process.exit(1);
    });
