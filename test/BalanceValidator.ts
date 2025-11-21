import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm, deployments } from "hardhat";
import { BalanceValidator } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const BalanceValidatorDeployment = await deployments.get("BalanceValidator");
  const balanceValidatorContract = await ethers.getContractAt(
    "BalanceValidator",
    BalanceValidatorDeployment.address
  );
  const balanceValidatorContractAddress = BalanceValidatorDeployment.address;

  return { balanceValidatorContract, balanceValidatorContractAddress };
}

describe("BalanceValidator", function () {
  let signers: Signers;
  let balanceValidatorContract: BalanceValidator;
  let balanceValidatorContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ balanceValidatorContract, balanceValidatorContractAddress } = await deployFixture());
  });

  it("should have no balance after deployment", async function () {
    const hasBal = await balanceValidatorContract.hasBalance(signers.alice.address);
    expect(hasBal).to.eq(false);
  });

  it("should set encrypted balance for user", async function () {
    const clearBalance = 1000;
    
    // Encrypt balance as euint32
    const encryptedBalance = await fhevm
      .createEncryptedInput(balanceValidatorContractAddress, signers.alice.address)
      .add32(clearBalance)
      .encrypt();

    const tx = await balanceValidatorContract
      .connect(signers.alice)
      .setBalance(encryptedBalance.handles[0], encryptedBalance.inputProof);
    await tx.wait();

    const hasBal = await balanceValidatorContract.hasBalance(signers.alice.address);
    expect(hasBal).to.eq(true);
  });

  it("should validate transfer when balance is sufficient", async function () {
    const clearBalance = 1000;
    const transferAmount = 500;
    
    // Set balance
    const encryptedBalance = await fhevm
      .createEncryptedInput(balanceValidatorContractAddress, signers.alice.address)
      .add32(clearBalance)
      .encrypt();

    let tx = await balanceValidatorContract
      .connect(signers.alice)
      .setBalance(encryptedBalance.handles[0], encryptedBalance.inputProof);
    await tx.wait();

    // Validate transfer
    const encryptedAmount = await fhevm
      .createEncryptedInput(balanceValidatorContractAddress, signers.alice.address)
      .add32(transferAmount)
      .encrypt();

    tx = await balanceValidatorContract
      .connect(signers.alice)
      .validateTransfer(encryptedAmount.handles[0], encryptedAmount.inputProof);
    const receipt = await tx.wait();

    // Get the encrypted result from the transaction
    // Note: validateTransfer returns ebool, we need to read it from the contract
    // Since validateTransfer is nonpayable and returns a value, we need to call it as a view
    const encryptedResult = await balanceValidatorContract
      .connect(signers.alice)
      .validateTransfer.staticCall(encryptedAmount.handles[0], encryptedAmount.inputProof);

    // Decrypt the result
    const clearResult = await fhevm.userDecryptEbool(
      encryptedResult,
      balanceValidatorContractAddress,
      signers.alice
    );

    expect(clearResult).to.eq(true);
  });

  it("should validate transfer when balance is insufficient", async function () {
    const clearBalance = 100;
    const transferAmount = 500;
    
    // Set balance
    const encryptedBalance = await fhevm
      .createEncryptedInput(balanceValidatorContractAddress, signers.alice.address)
      .add32(clearBalance)
      .encrypt();

    let tx = await balanceValidatorContract
      .connect(signers.alice)
      .setBalance(encryptedBalance.handles[0], encryptedBalance.inputProof);
    await tx.wait();

    // Validate transfer
    const encryptedAmount = await fhevm
      .createEncryptedInput(balanceValidatorContractAddress, signers.alice.address)
      .add32(transferAmount)
      .encrypt();

    // Get the encrypted result
    const encryptedResult = await balanceValidatorContract
      .connect(signers.alice)
      .validateTransfer.staticCall(encryptedAmount.handles[0], encryptedAmount.inputProof);

    // Decrypt the result
    const clearResult = await fhevm.userDecryptEbool(
      encryptedResult,
      balanceValidatorContractAddress,
      signers.alice
    );

    expect(clearResult).to.eq(false);
  });

  it("should not reveal actual balance or amount values", async function () {
    const clearBalance = 1000;
    const transferAmount = 500;
    
    // Set balance
    const encryptedBalance = await fhevm
      .createEncryptedInput(balanceValidatorContractAddress, signers.alice.address)
      .add32(clearBalance)
      .encrypt();

    let tx = await balanceValidatorContract
      .connect(signers.alice)
      .setBalance(encryptedBalance.handles[0], encryptedBalance.inputProof);
    await tx.wait();

    // Get encrypted balance from contract
    const storedEncryptedBalance = await balanceValidatorContract.getEncryptedBalance(signers.alice.address);
    
    // Verify it's encrypted (not zero hash and not the plaintext value)
    expect(storedEncryptedBalance).to.not.eq(ethers.ZeroHash);
    expect(storedEncryptedBalance).to.not.eq(ethers.hexlify(ethers.toUtf8Bytes(clearBalance.toString())));
    
    // Validate transfer
    const encryptedAmount = await fhevm
      .createEncryptedInput(balanceValidatorContractAddress, signers.alice.address)
      .add32(transferAmount)
      .encrypt();

    // Get the encrypted result
    const encryptedResult = await balanceValidatorContract
      .connect(signers.alice)
      .validateTransfer.staticCall(encryptedAmount.handles[0], encryptedAmount.inputProof);

    // Verify result is encrypted (not plaintext boolean)
    expect(encryptedResult).to.not.eq(ethers.ZeroHash);
    
    // Decrypt to verify it works
    const clearResult = await fhevm.userDecryptEbool(
      encryptedResult,
      balanceValidatorContractAddress,
      signers.alice
    );
    
    expect(clearResult).to.eq(true);
  });
});
