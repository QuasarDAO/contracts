import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS } from "../constants";


const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const treasuryDeployment = await deployments.get(CONTRACTS.treasury);
    const authorityDeployment = await deployments.get(CONTRACTS.authority);

    await deploy(CONTRACTS.idoBondDepo, {
        from: deployer,
        args: [
            treasuryDeployment.address,
            authorityDeployment.address,
        ],
        log: true,
    });
};

func.tags = ["bonding"];
func.dependencies = [
    CONTRACTS.QUAS,
    CONTRACTS.treasury,
    CONTRACTS.authority,
];

export default func;
