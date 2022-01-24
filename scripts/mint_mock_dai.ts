import { BigNumber } from 'ethers';
import hre from 'hardhat';
import { DAI__factory } from '../typechain/factories/DAI__factory';
import { waitSuccess } from './utils';

const mint_amount = BigNumber.from("100000000000000000000000000"); // 100000000$

const mock_dai_address = "0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1";
async function mintMockDai() {

    const { getNamedAccounts, ethers } = hre;
    const { deployer } = await getNamedAccounts();
    console.log(deployer);
    const signer = await ethers.provider.getSigner(deployer);

    const dai = DAI__factory.connect(mock_dai_address, signer);

    console.log("dai.mint");
    await waitSuccess(dai.mint("0xA8D98f7a37574dc43e78818F70f7861d42749BA6", mint_amount));
}

mintMockDai()
    .then(() => process.exit(0))
    .catch((error: Error) => {
        console.error(error);
        process.exit(1);
    });
