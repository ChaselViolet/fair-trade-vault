// BalanceValidator contract addresses by network
export const BalanceValidatorAddresses: Record<string, { address: `0x${string}`, chainId: number, chainName: string }> = {
  "31337": {
    "address": "0x610178dA211FEF7D417bC0e6FeD39F05609AD788", // Deployed on localhost
    "chainId": 31337,
    "chainName": "hardhat"
  },
  "11155111": {
    "address": "0x0000000000000000000000000000000000000000", // Will be set after deployment
    "chainId": 11155111,
    "chainName": "sepolia"
  }
};

// Get contract info for current network
export function getContractInfo(chainId?: number) {
  const effectiveChainId = chainId?.toString() || "31337";
  return BalanceValidatorAddresses[effectiveChainId];
}

// Check if contract is deployed on current network
export function isContractDeployed(chainId?: number): boolean {
  const contractInfo = getContractInfo(chainId);
  const isDeployed = contractInfo && contractInfo.address !== "0x0000000000000000000000000000000000000000";
  
  // Debug logging
  if (typeof window !== 'undefined') {
    console.log('[Contract] ChainId:', chainId, 'ContractInfo:', contractInfo, 'IsDeployed:', isDeployed);
  }
  
  return isDeployed;
}

// Get contract address for current network
export function getContractAddress(chainId?: number): `0x${string}` {
  const contractInfo = getContractInfo(chainId);
  return contractInfo?.address || "0x0000000000000000000000000000000000000000";
}

// Contract ABI - Generated from BalanceValidator.sol
export const CONTRACT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "BalanceSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "BalanceCleared",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "ValidationRequested",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getEncryptedBalance",
    "outputs": [
      {
        "internalType": "euint32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "hasBalance",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "externalEuint32",
        "name": "encryptedBalance",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "inputProof",
        "type": "bytes"
      }
    ],
    "name": "setBalance",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "externalEuint32",
        "name": "encryptedZero",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "inputProof",
        "type": "bytes"
      }
    ],
    "name": "clearBalance",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "externalEuint32",
        "name": "encryptedAmount",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "inputProof",
        "type": "bytes"
      }
    ],
    "name": "validateTransfer",
    "outputs": [
      {
        "internalType": "ebool",
        "name": "result",
        "type": "bytes32"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

