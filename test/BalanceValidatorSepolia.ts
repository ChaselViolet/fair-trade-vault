import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm, deployments } from "hardhat";
import { BalanceValidator } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  alice: HardhatEthersSigner;
};

describe("BalanceValidatorSepolia", function () {
  let signers: Signers;
  let balanceValidatorContract: BalanceValidator;
  let balanceValidatorContractAddress: string;
  let step: number;
  let steps: number;

  function progress(message: string) {
    console.log(`${++step}/${steps} ${message}`);
  }

  before(async function () {
    if (fhevm.isMock) {
      console.warn(`This hardhat test suite can only run on Sepolia Testnet`);
      this.skip();
    }

    try {
      const BalanceValidatorDeployment = await deployments.get("BalanceValidator");
      balanceValidatorContractAddress = BalanceValidatorDeployment.address;
      balanceValidatorContract = await ethers.getContractAt(
        "BalanceValidator",
        BalanceValidatorDeployment.address
      );
    } catch (e) {
      (e as Error).message += ". Call 'npx hardhat deploy --network sepolia'";
      throw e;
    }

    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { alice: ethSigners[0] };
  });

  beforeEach(async () => {
    step = 0;
    steps = 0;
  });

  it("should set balance and validate transfer", async function () {
    steps = 10;

    this.timeout(4 * 40000);

    const clearBalance = 1000;
    const transferAmount = 500;

    progress(`Encrypting balance ${clearBalance}...`);
    const encryptedBalance = await fhevm
      .createEncryptedInput(balanceValidatorContractAddress, signers.alice.address)
      .add32(clearBalance)
      .encrypt();

    progress(
      `Call setBalance() BalanceValidator=${balanceValidatorContractAddress} handle=${ethers.hexlify(encryptedBalance.handles[0])} signer=${signers.alice.address}...`,
    );
    let tx = await balanceValidatorContract
      .connect(signers.alice)
      .setBalance(encryptedBalance.handles[0], encryptedBalance.inputProof);
    await tx.wait();

    progress(`Check hasBalance()...`);
    const hasBal = await balanceValidatorContract.hasBalance(signers.alice.address);
    expect(hasBal).to.eq(true);

    progress(`Encrypting transfer amount ${transferAmount}...`);
    const encryptedAmount = await fhevm
      .createEncryptedInput(balanceValidatorContractAddress, signers.alice.address)
      .add32(transferAmount)
      .encrypt();

    progress(
      `Call validateTransfer() BalanceValidator=${balanceValidatorContractAddress} handle=${ethers.hexlify(encryptedAmount.handles[0])} signer=${signers.alice.address}...`,
    );
    
    // Get the encrypted result
    const encryptedResult = await balanceValidatorContract
      .connect(signers.alice)
      .validateTransfer.staticCall(encryptedAmount.handles[0], encryptedAmount.inputProof);

    progress(`Decrypting validateTransfer result=${encryptedResult}...`);
    const clearResult = await fhevm.userDecryptEbool(
      encryptedResult,
      balanceValidatorContractAddress,
      signers.alice,
    );
    progress(`Clear validateTransfer result=${clearResult}`);

    expect(clearResult).to.eq(true);
  });

  it("should return false when balance is insufficient", async function () {
    steps = 10;

    this.timeout(4 * 40000);

    const clearBalance = 100;
    const transferAmount = 500;

    progress(`Encrypting balance ${clearBalance}...`);
    const encryptedBalance = await fhevm
      .createEncryptedInput(balanceValidatorContractAddress, signers.alice.address)
      .add32(clearBalance)
      .encrypt();

    progress(
      `Call setBalance() BalanceValidator=${balanceValidatorContractAddress} handle=${ethers.hexlify(encryptedBalance.handles[0])} signer=${signers.alice.address}...`,
    );
    let tx = await balanceValidatorContract
      .connect(signers.alice)
      .setBalance(encryptedBalance.handles[0], encryptedBalance.inputProof);
    await tx.wait();

    progress(`Encrypting transfer amount ${transferAmount}...`);
    const encryptedAmount = await fhevm
      .createEncryptedInput(balanceValidatorContractAddress, signers.alice.address)
      .add32(transferAmount)
      .encrypt();

    progress(
      `Call validateTransfer() BalanceValidator=${balanceValidatorContractAddress} handle=${ethers.hexlify(encryptedAmount.handles[0])} signer=${signers.alice.address}...`,
    );
    
    // Get the encrypted result
    const encryptedResult = await balanceValidatorContract
      .connect(signers.alice)
      .validateTransfer.staticCall(encryptedAmount.handles[0], encryptedAmount.inputProof);

    progress(`Decrypting validateTransfer result=${encryptedResult}...`);
    const clearResult = await fhevm.userDecryptEbool(
      encryptedResult,
      balanceValidatorContractAddress,
      signers.alice,
    );
    progress(`Clear validateTransfer result=${clearResult}`);

    expect(clearResult).to.eq(false);
  });
});
