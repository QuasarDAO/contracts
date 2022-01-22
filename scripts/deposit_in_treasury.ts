import { BigNumber } from 'ethers';
import hre from 'hardhat';
import { DAI__factory } from '../typechain/factories/DAI__factory';
import { QuasarTreasury__factory } from '../typechain/factories/QuasarTreasury__factory';
import { waitSuccess } from './utils';
import { CONTRACTS } from './constants';

const reserve_token_address = "0x4eD2BF1C1738f3320Cc3Fc36401a4083C4E25d0B";
const treasury_address = "0x7DCd50dd5e379A026068bE0b54895EBF21688689";
const deposit_amount = BigNumber.from("4000000000000000000000"); // 4000$
const profit = BigNumber.from("2000000000000"); // 2000$


async function depositInTreasury() {

    const { getNamedAccounts, deployments, ethers } = hre;
    const { deployer } = await getNamedAccounts();
    const signer = await ethers.provider.getSigner(deployer);

    console.log(deployer);

    const dai = DAI__factory.connect(reserve_token_address, signer);

    console.log("dai.approve");
    await waitSuccess(dai.approve(treasury_address, deposit_amount));

    const treasuryDeployment = await deployments.get(CONTRACTS.treasury);
    const treasury = QuasarTreasury__factory.connect(treasuryDeployment.address, signer);

    console.log("treasury.deposit");
    await waitSuccess(treasury.deposit(deposit_amount, reserve_token_address, profit));
}

depositInTreasury()
    .then(() => process.exit(0))
    .catch((error: Error) => {
        console.error(error);
        process.exit(1);
    });

