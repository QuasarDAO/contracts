import hre from 'hardhat';
import { QuasarStaking, QuasarStaking__factory } from '../typechain';
import { CONTRACTS } from './constants';
import { waitSuccess } from './utils';

async function rebase() {

    const { getNamedAccounts, deployments, ethers } = hre;
    const { deployer } = await getNamedAccounts();
    const signer = await ethers.provider.getSigner(deployer);

    const stakingDeployment = await deployments.get(CONTRACTS.staking);
    const staking = QuasarStaking__factory.connect(stakingDeployment.address, signer);

    while (await isRebasePossible(staking)) {
        console.log('rebasing...')
        await waitSuccess(staking.rebase());
    }
}

async function isRebasePossible(staking: QuasarStaking): Promise<boolean> {
    try {
        await staking.secondsToNextEpoch();
    } catch (e) {
        return true;
    }
    return false;
}

rebase()
    .then(() => process.exit(0))
    .catch((error: Error) => {
        console.error(error);
        process.exit(1);
    });