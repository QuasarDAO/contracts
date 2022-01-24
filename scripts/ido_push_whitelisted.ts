import hre from 'hardhat';
import { QuasarIDOBondDepository__factory } from '../typechain/factories/QuasarIDOBondDepository__factory';
import { waitSuccess } from './utils';
import { CONTRACTS } from './constants';

const whitelisted = ["0xA8D98f7a37574dc43e78818F70f7861d42749BA6"]

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
