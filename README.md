# Fair Trade Vault - Encrypted Transfer Amount Validation System

A privacy-preserving balance validation system that uses Fully Homomorphic Encryption (FHE) to validate transfer amounts without revealing the actual balance or transfer amount. Only YES/NO results are revealed.

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

## Technical Details

- **FHE Type**: euint32 for encrypted amounts, ebool for encrypted boolean results
- **Network Support**: Localhost (31337) and Sepolia Testnet (11155111)
- **Wallet**: Rainbow Wallet integration via RainbowKit
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn-ui

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
