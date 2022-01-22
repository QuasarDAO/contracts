import { BigNumber } from 'ethers';
import hre from 'hardhat';
import { DAI__factory } from '../typechain/factories/DAI__factory';
import { waitSuccess } from './utils';

const mint_amount = BigNumber.from("100000000000000000000000000"); // 100000000$

const mock_dai_address = "0x6129B9bAc8735679c6b3f13f0671187880853A2B";
async function mintMockDai() {

    const { getNamedAccounts, ethers } = hre;
    const { deployer } = await getNamedAccounts();
    console.log(deployer);
    const signer = await ethers.provider.getSigner(deployer);

    const dai = DAI__factory.connect(mock_dai_address, signer);

    console.log("dai.mint");
    await waitSuccess(dai.mint(deployer, mint_amount));
}

mintMockDai()
    .then(() => process.exit(0))
    .catch((error: Error) => {
        console.error(error);
        process.exit(1);
    });
