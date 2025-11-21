import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedBalanceValidator = await deploy("BalanceValidator", {
    from: deployer,
    log: true,
  });

  console.log(`BalanceValidator contract: `, deployedBalanceValidator.address);
};
export default func;
func.id = "deploy_balanceValidator"; // id required to prevent reexecution
func.tags = ["BalanceValidator"];

