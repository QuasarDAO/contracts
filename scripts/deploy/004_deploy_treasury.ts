import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS, TREASURY_TIMELOCK } from "../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;

    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const quasDeployment = await deployments.get(CONTRACTS.QUAS);
    const authorityDeployment = await deployments.get(CONTRACTS.authority);

    // TODO: TIMELOCK SET TO 0 FOR NOW, CHANGE FOR ACTUAL DEPLOYMENT
    await deploy(CONTRACTS.treasury, {
        from: deployer,
        args: [quasDeployment.address, TREASURY_TIMELOCK, authorityDeployment.address],
        log: true,
        skipIfAlreadyDeployed: true,
    });
};

func.tags = [CONTRACTS.treasury, "treasury"];
func.dependencies = [CONTRACTS.QUAS, CONTRACTS.authority];

export default func;
