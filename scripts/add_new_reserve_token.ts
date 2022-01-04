import hre from 'hardhat';
import { CONTRACTS } from './constants';
import { QuasarTreasury__factory } from '../typechain/factories/QuasarTreasury__factory'
import { waitSuccess } from './utils';

// treasury.enable parameters
const reserve_token_address = '0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1';

async function addNewReserveToken() {
    const { ethers, getNamedAccounts, deployments } = hre;
    const { deployer } = await getNamedAccounts();
    const signer = await ethers.provider.getSigner(deployer);

    const treasuryDeployment = await deployments.get(CONTRACTS.treasury);
    const treasury = QuasarTreasury__factory.connect(treasuryDeployment.address, signer);

    console.log('treasury.enable(2, reserve_token_address, ethers.constants.AddressZero)');
    await waitSuccess(treasury.enable(2, reserve_token_address, ethers.constants.AddressZero));
}

addNewReserveToken()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
