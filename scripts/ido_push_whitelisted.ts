import hre from 'hardhat';
import { QuasarIDOBondDepository__factory } from '../typechain/factories/QuasarIDOBondDepository__factory';
import { waitSuccess } from './utils';
import { CONTRACTS } from './constants';

const whitelisted = ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"]

async function setStage() {

    const { getNamedAccounts, deployments, ethers } = hre;
    const { deployer } = await getNamedAccounts();
    const signer = await ethers.provider.getSigner(deployer);

    const idoBondDepoDeployment = await deployments.get(CONTRACTS.idoBondDepo);
    const idoBondDepo = QuasarIDOBondDepository__factory.connect(idoBondDepoDeployment.address, signer);

    console.log("idoBondDepo.setStage")
    await waitSuccess(idoBondDepo.pushWhitelisted(whitelisted, true));
}

setStage()
    .then(() => process.exit(0))
    .catch((error: Error) => {
        console.error(error);
        process.exit(1);
    });
