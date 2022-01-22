import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS } from "../constants";


const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const bondDepoDeployment = await deployments.get(CONTRACTS.bondDepo);
    const idoBondDepoDeployment = await deployments.get(CONTRACTS.idoBondDepo);
    const stakingDeployment = await deployments.get(CONTRACTS.staking);
    const treasuryDeployment = await deployments.get(CONTRACTS.treasury);
    const quasDeployment = await deployments.get(CONTRACTS.QUAS);
    const sQuasDeployment = await deployments.get(CONTRACTS.sQUAS);
    const authorityDeployment = await deployments.get(CONTRACTS.authority);

    await deploy(CONTRACTS.teller, {
        from: deployer,
        args: [
            bondDepoDeployment.address,
            idoBondDepoDeployment.address,
            stakingDeployment.address,
            treasuryDeployment.address,
            quasDeployment.address,
            sQuasDeployment.address,
            authorityDeployment.address
        ],
        log: true,
    });
};

func.tags = ["bonding"];
func.dependencies = [
    CONTRACTS.bondDepo,
    CONTRACTS.staking,
    CONTRACTS.treasury,
    CONTRACTS.QUAS,
    CONTRACTS.sQUAS,
    CONTRACTS.authority,
];

export default func;
