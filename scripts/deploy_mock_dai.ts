import { BigNumber } from 'ethers';
import hre from 'hardhat';
import { DAI__factory } from '../typechain/factories/DAI__factory';
import { waitSuccess } from './utils';


const mint_amount = BigNumber.from("100000000000000000000000000"); // 10000$

async function deployMockDAI() {

    const { getNamedAccounts, ethers } = hre;
    const { deployer } = await getNamedAccounts();
    const signer = await ethers.provider.getSigner(deployer);

    const factory = new DAI__factory(signer);
    const dai = await factory.deploy(await hre.getChainId());

    console.log("dai.mint");
    await waitSuccess(dai.mint(deployer, mint_amount));

    console.log(`DAI address: ${dai.address}`);
}

deployMockDAI()
    .then(() => process.exit(0))
    .catch((error: Error) => {
        console.error(error);
        process.exit(1);
    });
