# Fair Trade Vault - Encrypted Transfer Amount Validation System

A privacy-preserving balance validation system that uses Fully Homomorphic Encryption (FHE) to validate transfer amounts without revealing the actual balance or transfer amount. Only YES/NO results are revealed.

## 🚀 Live Demo

**Try it now**: [https://fair-trade-vault.vercel.app/](https://fair-trade-vault.vercel.app/)

Connect your Rainbow wallet and experience encrypted balance validation in action!

## 📹 Demo Video

Watch the system in action: [Demo Video](https://github.com/ChaselViolet/fair-trade-vault/blob/main/fair-trade-vault.mp4)

The video demonstrates:
- Setting encrypted balance
- Validating transfer amounts
- Viewing YES/NO results without revealing actual values
- Clearing balance for demonstration

## Features

- **Encrypted Balance Storage**: User balances are encrypted using FHE before being stored on-chain
- **Private Validation**: Transfer amounts are validated without revealing actual values
- **Privacy First**: Only YES/NO validation results are revealed, not the balance or amount
- **Rainbow Wallet Integration**: Connect using Rainbow wallet for a seamless experience
- **FHEVM Protocol**: Built on Zama's FHEVM for fully homomorphic encryption

## Business Use Cases

- **Private Wallets**: Validate transfers without exposing wallet balances
- **Enterprise Billing Systems**: Internal billing validation with privacy protection
- **Financial Privacy**: Secure financial operations without revealing sensitive amounts

## Project Structure

```
fair-trade-vault/
├── contracts/              # Solidity smart contracts
│   └── BalanceValidator.sol # Main FHE balance validator contract
├── test/                   # Hardhat tests
│   ├── BalanceValidator.ts # Local network tests
│   └── BalanceValidatorSepolia.ts # Sepolia testnet tests
├── deploy/                 # Deployment scripts
│   └── deployBalanceValidator.ts
├── ui/                     # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   └── BalanceValidatorForm.tsx
│   │   ├── hooks/
│   │   │   ├── useBalanceValidator.ts
│   │   │   └── useZamaInstance.ts
│   │   └── lib/
│   │       └── fhevm.ts
│   └── package.json
├── hardhat.config.ts       # Hardhat configuration
└── package.json            # Dependencies and scripts
```

## Getting Started

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm**: Version 7.0.0 or higher
- **Rainbow Wallet**: Browser extension for wallet connection

### Installation

1. **Install dependencies**

   ```bash
   npm install
   cd ui
   npm install
   ```

2. **Set up environment variables**

   ```bash
   npx hardhat vars set MNEMONIC

   # Set your Infura API key for network access
   npx hardhat vars set INFURA_API_KEY

   # Optional: Set Etherscan API key for contract verification
   npx hardhat vars set ETHERSCAN_API_KEY
   ```

3. **Compile contracts**

   ```bash
   npm run compile
   ```

4. **Run tests**

   ```bash
   # Local network tests
   npm test

   # Sepolia testnet tests (after deployment)
   npm run test:sepolia
   ```

### Deployment

#### Local Development

1. **Start Hardhat node**

   ```bash
   npx hardhat node
   ```

2. **Deploy contract**

   ```bash
   npx hardhat deploy --network localhost
   ```

3. **Update contract address in frontend**

   After deployment, update the contract address in `ui/src/config/contracts.ts`:
   ```typescript
   "31337": {
     "address": "<DEPLOYED_ADDRESS>",
     "chainId": 31337,
     "chainName": "hardhat"
   }
   ```

4. **Start frontend**

   ```bash
   cd ui
   npm run dev
   ```

#### Sepolia Testnet

1. **Deploy contract**

   ```bash
   npx hardhat deploy --network sepolia
   ```

2. **Update contract address in frontend**

   Update the contract address in `ui/src/config/contracts.ts`:
   ```typescript
   "11155111": {
     "address": "<DEPLOYED_ADDRESS>",
     "chainId": 11155111,
     "chainName": "sepolia"
   }
   ```

3. **Verify contract on Etherscan** (optional)

   ```bash
   npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
   ```

4. **Start frontend**

   ```bash
   cd ui
   npm run dev
   ```

## Usage

### Setting Encrypted Balance

1. Connect your Rainbow wallet
2. Enter your balance amount
3. Click "Set Encrypted Balance"
4. The balance will be encrypted and stored on-chain

### Validating Transfer Amount

1. Ensure you have set your encrypted balance
2. Enter the transfer amount you want to validate
3. Click "Validate Transfer"
4. The system will return YES/NO without revealing actual values

## How It Works

1. **Encryption**: User inputs (balance and transfer amount) are encrypted on the frontend using FHEVM
2. **On-Chain Storage**: Only encrypted data is stored on the blockchain
3. **Homomorphic Comparison**: The contract performs encrypted comparison (balance >= amount) using FHE
4. **Decryption**: Only the validation result (YES/NO) is decrypted and revealed to the user

## Smart Contract Code

### BalanceValidator Contract

The core contract implements encrypted balance validation using FHE operations:

```solidity
contract BalanceValidator is SepoliaConfig {
    mapping(address => euint32) private _encryptedBalances;
    
    // Set encrypted balance
    function setBalance(externalEuint32 encryptedBalance, bytes calldata inputProof) external {
        euint32 balance = FHE.fromExternal(encryptedBalance, inputProof);
        _encryptedBalances[msg.sender] = balance;
        FHE.allowThis(balance);
        FHE.allow(balance, msg.sender);
        emit BalanceSet(msg.sender, block.timestamp);
    }
    
    // Validate transfer amount
    function validateTransfer(externalEuint32 encryptedAmount, bytes calldata inputProof) 
        external 
        returns (ebool) 
    {
        euint32 amount = FHE.fromExternal(encryptedAmount, inputProof);
        euint32 balance = _encryptedBalances[msg.sender];
        
        FHE.allowThis(amount);
        FHE.allow(amount, msg.sender);
        
        // Homomorphic comparison: balance >= amount
        ebool result = FHE.ge(balance, amount);
        
        FHE.allowThis(result);
        FHE.allow(result, msg.sender);
        
        emit ValidationRequested(msg.sender, block.timestamp);
        return result;
    }
    
    // Clear balance (set to encrypted zero)
    function clearBalance(externalEuint32 encryptedZero, bytes calldata inputProof) external {
        euint32 zero = FHE.fromExternal(encryptedZero, inputProof);
        _encryptedBalances[msg.sender] = zero;
        FHE.allowThis(zero);
        FHE.allow(zero, msg.sender);
        emit BalanceCleared(msg.sender, block.timestamp);
    }
}
```

### Key Contract Functions

- **`setBalance(encryptedBalance, inputProof)`**: Stores encrypted balance on-chain. The balance is encrypted as `euint32` and can only be decrypted by the contract and the user.
- **`validateTransfer(encryptedAmount, inputProof)`**: Performs homomorphic comparison `balance >= amount` without revealing actual values. Returns encrypted boolean (`ebool`) result.
- **`clearBalance(encryptedZero, inputProof)`**: Resets user's encrypted balance to zero for demonstration purposes.
- **`hasBalance(user)`**: Checks if a user has set their balance (view function).

## Encryption & Decryption Logic

### Frontend Encryption Flow

The encryption process happens on the client side before sending data to the contract:

```typescript
// Encrypt euint32 value (balance or transfer amount)
async function encryptEuint32(
  fhevm: FhevmInstance,
  contractAddress: string,
  userAddress: string,
  value: number
): Promise<EncryptedInput> {
  const encryptedInput = fhevm
    .createEncryptedInput(contractAddress, userAddress)
    .add32(value);
  
  const encrypted = await encryptedInput.encrypt();
  
  return {
    handles: encrypted.handles.map(handle => ethers.hexlify(handle)),
    inputProof: ethers.hexlify(encrypted.inputProof),
  };
}
```

**Process:**
1. Create encrypted input using FHEVM instance
2. Add 32-bit integer value to the input
3. Encrypt the value with input proof
4. Convert handles and proof to hex format for contract interaction

### Frontend Decryption Flow

The decryption process retrieves the encrypted result from the contract:

```typescript
// Decrypt ebool value (validation result)
async function decryptEbool(
  fhevm: FhevmInstance,
  handle: string,
  contractAddress: string,
  userAddress: string,
  signer: any,
  chainId?: number
): Promise<boolean> {
  // Generate keypair for decryption
  const keypair = fhevm.generateKeypair();
  const contractAddresses = [contractAddress];
  
  // Create EIP712 signature for decryption request
  const eip712 = fhevm.createEIP712(
    keypair.publicKey,
    contractAddresses,
    startTimeStamp,
    durationDays
  );
  
  const signature = await signer.signTypedData(
    eip712.domain,
    { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
    eip712.message
  );
  
  // Decrypt the result
  const result = await fhevm.userDecrypt(
    [{ handle, contractAddress }],
    keypair.privateKey,
    keypair.publicKey,
    signature.replace("0x", ""),
    contractAddresses,
    userAddress,
    startTimeStamp,
    durationDays
  );
  
  // For ebool: 0 is false, non-zero is true
  return Number(result[handle]) !== 0;
}
```

**Process:**
1. Generate keypair for decryption request
2. Create EIP712 typed data signature
3. Sign the decryption request with user's wallet
4. Call `userDecrypt` with signature and encrypted handle
5. Interpret result: 0 = false (NO), non-zero = true (YES)

### Network-Specific Implementation

- **Localhost (31337)**: Uses `@fhevm/mock-utils` for local testing without relayer
- **Sepolia (11155111)**: Uses `@zama-fhe/relayer-sdk` with Zama's FHE relayer network

### Security Features

1. **Input Proof Verification**: All encrypted inputs include cryptographic proofs verified by the contract
2. **Access Control**: Only authorized parties (contract and user) can decrypt encrypted values using `FHE.allow()`
3. **Privacy Preservation**: Actual balance and transfer amounts are never revealed on-chain
4. **EIP712 Signatures**: Decryption requests require cryptographic signatures to prevent unauthorized access

## Technical Details

### FHE Types

- **`euint32`**: Encrypted 32-bit unsigned integer for balance and transfer amounts
- **`ebool`**: Encrypted boolean for validation results (YES/NO)
- **`externalEuint32`**: External encrypted input format with proof for contract interaction

### Network Support

- **Localhost (31337)**: Local development with Hardhat and mock FHEVM
- **Sepolia Testnet (11155111)**: Production testing with Zama's FHE relayer network

### Technology Stack

- **Smart Contracts**: Solidity ^0.8.24 with FHEVM
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn-ui
- **Wallet**: Rainbow Wallet integration via RainbowKit and Wagmi
- **FHE Libraries**: 
  - `@fhevm/solidity` for contract FHE operations
  - `@zama-fhe/relayer-sdk` for Sepolia network
  - `@fhevm/mock-utils` for localhost testing

## Available Scripts

| Script             | Description              |
| ------------------ | ------------------------ |
| `npm run compile`  | Compile all contracts    |
| `npm run test`     | Run all tests            |
| `npm run test:sepolia` | Run Sepolia tests    |
| `npm run coverage` | Generate coverage report |
| `npm run lint`     | Run linting checks       |
| `npm run clean`    | Clean build artifacts    |

## 📚 Documentation

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Hardhat Setup Guide](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup)
- [FHEVM Testing Guide](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat/write_test)
- [RainbowKit Documentation](https://rainbowkit.com)

## 📄 License

This project is licensed under the BSD-3-Clause-Clear License. See the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/zama-ai/fhevm/issues)
- **Documentation**: [FHEVM Docs](https://docs.zama.ai)
- **Community**: [Zama Discord](https://discord.gg/zama)

---

**Built with ❤️ using Zama FHEVM**
