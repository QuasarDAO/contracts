import type { ethers } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import {
    CONTRACTS,
    EPOCH_LENGTH_IN_SECONDS,
    FIRST_EPOCH_NUMBER,
} from "../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const authorityDeployment = await deployments.get(CONTRACTS.authority);
    const quasDeployment = await deployments.get(CONTRACTS.QUAS);
    const sQuasDeployment = await deployments.get(CONTRACTS.sQUAS);
    const gQuasDeployment = await deployments.get(CONTRACTS.gQUAS);

    const firstEpochStartTime = await getLatestBlockTimestamp(hre)

    await deploy(CONTRACTS.staking, {
        from: deployer,
        args: [
            quasDeployment.address,
            sQuasDeployment.address,
            gQuasDeployment.address,
            EPOCH_LENGTH_IN_SECONDS,
            FIRST_EPOCH_NUMBER,
            firstEpochStartTime,
            authorityDeployment.address,
        ],
        log: true,
    });
};

async function getLatestBlockTimestamp(hre: HardhatRuntimeEnvironment) {
    const { ethers } = hre;
    const latestBlockNumber = await ethers.getDefaultProvider().getBlockNumber();
    const latestBlock = await ethers.getDefaultProvider().getBlock(latestBlockNumber);
    return latestBlock.timestamp;
}

func.tags = [CONTRACTS.staking, "staking"];
func.dependencies = [CONTRACTS.QUAS, CONTRACTS.sQUAS, CONTRACTS.gQUAS, CONTRACTS.authority];

export default func;
