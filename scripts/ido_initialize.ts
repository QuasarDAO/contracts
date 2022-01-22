import { BigNumber } from 'ethers';
import hre from 'hardhat';
import { QuasarIDOBondDepository__factory } from '../typechain/factories/QuasarIDOBondDepository__factory';
import { waitSuccess } from './utils';
import { CONTRACTS } from './constants';

const bid = 9999;
const principal = "0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1";
const vesting_term = 600; // 10 mins
const price = BigNumber.from("100000000000"); // 100$
const priceInUSD = BigNumber.from("100000000000000000000"); // 100$
const maxPurchase = 10; // in QUAS
const capacity = 5000; // in QUAS

async function initializeIdo() {

    const { getNamedAccounts, deployments, ethers } = hre;
    const { deployer } = await getNamedAccounts();
    const signer = await ethers.provider.getSigner(deployer);

    const idoBondDepoDeployment = await deployments.get(CONTRACTS.idoBondDepo);
    const idoBondDepo = QuasarIDOBondDepository__factory.connect(idoBondDepoDeployment.address, signer);

    console.log("idoBondDepo.initializeBond")
    await waitSuccess(idoBondDepo.initializeBond(bid, principal, vesting_term, price, priceInUSD, maxPurchase, capacity));
}

initializeIdo()
    .then(() => process.exit(0))
    .catch((error: Error) => {
        console.error(error);
        process.exit(1);
    });
