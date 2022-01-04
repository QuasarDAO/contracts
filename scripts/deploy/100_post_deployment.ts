import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS, INITIAL_REWARD_RATE, INITIAL_INDEX } from "../constants";
import { waitSuccess } from "../utils";

// TODO: Shouldn't run setup methods if the contracts weren't redeployed.
const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, ethers } = hre;

    const authorityDeployment = await deployments.get(CONTRACTS.authority);
    const quasDeployment = await deployments.get(CONTRACTS.QUAS);
    const sQuasDeployment = await deployments.get(CONTRACTS.sQUAS);
    const gQuasDeployment = await deployments.get(CONTRACTS.gQUAS);
    const distributorDeployment = await deployments.get(CONTRACTS.distributor);
    const stakingDeployment = await deployments.get(CONTRACTS.staking);
    const treasuryDeployment = await deployments.get(CONTRACTS.treasury);
    const bondDepoDeployment = await deployments.get(CONTRACTS.bondDepo);
    const bondTellerDeployment = await deployments.get(CONTRACTS.teller);

    const authorityContractFactory = await ethers.getContractFactory(CONTRACTS.authority);
    const quasContractFactory = await ethers.getContractFactory(CONTRACTS.QUAS);
    const sQuasContractFactory = await ethers.getContractFactory(CONTRACTS.sQUAS);
    const gQuasContractFactory = await ethers.getContractFactory(CONTRACTS.gQUAS);
    const distributorContractFactory = await ethers.getContractFactory(CONTRACTS.distributor);
    const stakingContractFactory = await ethers.getContractFactory(CONTRACTS.staking);
    const treasuryContractFactory = await ethers.getContractFactory(CONTRACTS.treasury);
    const bondDepoFactory = await ethers.getContractFactory(CONTRACTS.bondDepo);
    const bondTellerFactory = await ethers.getContractFactory(CONTRACTS.teller);

    const authority = await authorityContractFactory.attach(authorityDeployment.address);
    const quas = await quasContractFactory.attach(quasDeployment.address);
    const sQuas = await sQuasContractFactory.attach(sQuasDeployment.address);
    const gQuas = await gQuasContractFactory.attach(gQuasDeployment.address);
    const distributor = await distributorContractFactory.attach(distributorDeployment.address);
    const staking = await stakingContractFactory.attach(stakingDeployment.address);
    const treasury = await treasuryContractFactory.attach(treasuryDeployment.address);
    const bondDepo = await bondDepoFactory.attach(bondDepoDeployment.address);
    const bondTeller = await bondTellerFactory.attach(bondTellerDeployment.address);

    // Step 1: Set treasury as vault on authority
    console.log("Setup -- authority.pushVault: set vault on authority");
    await waitSuccess(authority.pushVault(treasury.address, true));

    // Step 2: Set distributor as minter on treasury
    console.log("Setup -- treasury.enable(8):  distributor enabled to mint ohm on treasury");
    await waitSuccess(treasury.enable(8, distributor.address, ethers.constants.AddressZero)); // Allows distributor to mint ohm.

    // Step 3: Set distributor on staking
    console.log("Setup -- staking.setDistributor:  distributor set on staking");
    await waitSuccess(staking.setDistributor(distributor.address));

    // Step 4: Initialize sOHM and set the index
    console.log("Setup -- sQuas.setIndex(INITIAL_INDEX):  set index");
    await waitSuccess(sQuas.setIndex(INITIAL_INDEX)); // TODO
    console.log("Setup -- setgQUAS(gQuas.address):  set gQUAS");
    await waitSuccess(sQuas.setgQUAS(gQuas.address));
    console.log("Setup -- sQuas.initialize(staking.address, treasury.address):  set sQUAS");
    await waitSuccess(sQuas.initialize(staking.address, treasury.address));

    // Step 5: Set up distributor with recipient
    console.log("Setup -- distributor.addRecipient");
    await waitSuccess(distributor.addRecipient(staking.address, INITIAL_REWARD_RATE));

    // Step 6: Set teller in Bond Depository
    console.log('Setup -- bondDepo.setTeller')
    await waitSuccess(bondDepo.setTeller(bondTeller.address))

    // Step 7: Set Bond Depository as reserve depositor and liquidity depositor in treasury
    console.log('Setup -- treasury.enable(0): Bond Depository enabled to deposit reserves')
    await waitSuccess(treasury.enable(0, bondDepo.address, ethers.constants.AddressZero))
    console.log('Setup -- treasury.enable(4): Bond Depository enabled to deposit liquidity')
    await waitSuccess(treasury.enable(4, bondDepo.address, ethers.constants.AddressZero))

    // Approve staking contact to spend deployer's OHM
    // TODO: Is this needed?
    // await ohm.approve(staking.address, LARGE_APPROVAL);

    console.log(`
    Authority:         ${authorityDeployment.address}
    QUAS:              ${quasDeployment.address}
    sQUAS:             ${sQuasDeployment.address}
    gQUAS:             ${gQuasDeployment.address}
    Distributor:       ${distributorDeployment.address}
    Staking:           ${stakingDeployment.address}
    Treasury:          ${treasuryDeployment.address}
    Bond Depository:   ${bondDepoDeployment.address}
    Bond Teller:       ${bondTeller.address}

    export AUTHORITY=${authorityDeployment.address}
    export QUAS=${quasDeployment.address}
    export SQUAS=${sQuasDeployment.address}
    export GQUAS=${gQuasDeployment.address}
    export DISTRIBUTOR=${distributorDeployment.address}
    export STAKING=${stakingDeployment.address}
    export TREASURY=${treasuryDeployment.address}
    export DEPOSITORY=${bondDepoDeployment.address}
    export TELLER=${bondTellerDeployment.address}
    `);
};

func.tags = ["setup"];
func.dependencies = [CONTRACTS.QUAS, CONTRACTS.sQUAS, CONTRACTS.gQUAS];
func.skip = () => Promise.resolve(false)

export default func;
