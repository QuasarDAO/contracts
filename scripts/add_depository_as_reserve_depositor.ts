import hre from 'hardhat';
import { CONTRACTS } from './constants';
import { QuasarTreasury__factory } from '../typechain/factories/QuasarTreasury__factory'
import { waitSuccess } from './utils';

async function addReserveDepositor() {

    const { getNamedAccounts, deployments, ethers } = hre;
    const { deployer } = await getNamedAccounts();
    console.log(deployer);
    const signer = await ethers.provider.getSigner(deployer);
    const treasuryDeployment = await deployments.get(CONTRACTS.treasury);
    const bondDepo = await deployments.get(CONTRACTS.bondDepo);

    const treasury = QuasarTreasury__factory.connect(treasuryDeployment.address, signer);
    console.log("treasury.enable");
    await waitSuccess(treasury.enable(0, bondDepo.address, ethers.constants.AddressZero));
}

addReserveDepositor()
    .then(() => process.exit(0))
    .catch((error: Error) => {
        console.error(error);
        process.exit(1);
    });
