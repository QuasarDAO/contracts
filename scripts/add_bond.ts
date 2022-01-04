import hre from 'hardhat';
import { CONTRACTS } from './constants';
import { QuasarBondDepository__factory } from '../typechain/factories/QuasarBondDepository__factory'
import { waitSuccess } from './utils';

// Add bond parameters
const principal = '0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1';
const capacity = '100000000000'; //1000 in QUAS
const capacityIsPayout = true;

//
const bid = 0; // Bond ID
const bond_bcv = 369; // controll variable
const fixed_term = true;
const vesting_term = 1800;
const expiration = 0; // not used
const conclusion = 1750013156; // some point in future (2025)
const minimum_price = 0;
const max_bond_payout = 500; // in thousandths of a %. i.e. 500 = 0.5%
const max_debt = 1000000000000000;
const initial_debt = 0;

export async function addBond(): Promise<void> {

    const { ethers, getNamedAccounts, deployments } = hre;
    const { deployer } = await getNamedAccounts();
    const signer = ethers.provider.getSigner(deployer);

    const bondDepoDeployment = await deployments.get(CONTRACTS.bondDepo);
    const bondDepo = QuasarBondDepository__factory.connect(bondDepoDeployment.address, signer);

    console.log('bondDepo.addBond')
    await waitSuccess(bondDepo.addBond(principal, ethers.constants.AddressZero, capacity, capacityIsPayout));

    console.log('bondDepo.setTerms')
    await waitSuccess(bondDepo.setTerms(
      bid, bond_bcv, fixed_term, vesting_term, 
      expiration, conclusion, minimum_price, max_bond_payout, 
      max_debt, initial_debt));
}

addBond()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
