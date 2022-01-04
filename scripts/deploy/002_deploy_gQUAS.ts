import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS } from "../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const sQuasDeployment = await deployments.get(CONTRACTS.sQUAS);

    await deploy(CONTRACTS.gQUAS, {
        from: deployer,
        args: [deployer, sQuasDeployment.address],
        log: true,
        skipIfAlreadyDeployed: true,
    });
};

func.tags = [CONTRACTS.gQUAS, "migration", "tokens"];
func.dependencies = [CONTRACTS.sQUAS];

export default func;
