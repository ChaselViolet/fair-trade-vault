// FHEVM SDK utilities for frontend
import { ethers, JsonRpcProvider } from "ethers";

// Import @zama-fhe/relayer-sdk
// Note: We import createInstance and SepoliaConfig directly
// initSDK will be imported dynamically when needed (only for Sepolia)
// We use a function to safely import these to avoid issues when they're undefined
let createInstance: any;
let SepoliaConfig: any;

// Lazy load the SDK to avoid initialization errors
async function loadRelayerSDK() {
  if (createInstance && SepoliaConfig) {
    return { createInstance, SepoliaConfig };
  }
  
  try {
    const sdk = await import("@zama-fhe/relayer-sdk/bundle");
    createInstance = sdk.createInstance;
    SepoliaConfig = sdk.SepoliaConfig;
    return { createInstance, SepoliaConfig };
  } catch (error) {
    console.error("[FHEVM] Failed to load relayer SDK:", error);
    throw new Error("Failed to load @zama-fhe/relayer-sdk");
  }
}

import type { FhevmInstance } from "@zama-fhe/relayer-sdk/bundle";

// Import @fhevm/mock-utils for localhost mock FHEVM
let MockFhevmInstance: any = null;
let userDecryptHandleBytes32: any = null;
let userDecryptEbool: any = null;

export interface EncryptedInput {
  handles: string[];
  inputProof: string;
}

let fhevmInstance: FhevmInstance | null = null;
let isSDKInitialized = false;

/**
 * Initialize FHEVM instance
 * Local network (31337): Uses @fhevm/mock-utils + Hardhat plugin
 * Sepolia (11155111): Uses @zama-fhe/relayer-sdk
 */
export async function initializeFHEVM(chainId?: number): Promise<FhevmInstance> {
  if (!fhevmInstance) {
    // Check window.ethereum
    if (typeof window === "undefined" || !(window as any).ethereum) {
      throw new Error("window.ethereum is not available. Please install MetaMask or Rainbow Wallet.");
    }

    // Get chainId first
    let currentChainId = chainId;
    if (!currentChainId) {
      try {
        const chainIdHex = await (window as any).ethereum.request({ method: "eth_chainId" });
        currentChainId = parseInt(chainIdHex, 16);
      } catch (error) {
        console.error("[FHEVM] Failed to get chainId:", error);
        currentChainId = 31337;
      }
    }

    console.log("[FHEVM] Current chain ID:", currentChainId);

    // Initialize SDK for Sepolia only
    if (currentChainId === 11155111 && !isSDKInitialized) {
      console.log("[FHEVM] Initializing FHE SDK for Sepolia...");
      
      try {
        // Load relayer SDK first
        await loadRelayerSDK();
        
        // Try to get initSDK dynamically
        try {
          const sdk = await import("@zama-fhe/relayer-sdk/bundle");
          if (sdk && typeof sdk.initSDK === 'function') {
            await sdk.initSDK();
            isSDKInitialized = true;
            console.log("[FHEVM] ✅ SDK initialized successfully");
          } else {
            console.warn("[FHEVM] initSDK not available, continuing without initialization...");
            isSDKInitialized = true; // Mark as initialized to avoid retrying
          }
        } catch (e) {
          console.warn("[FHEVM] Could not load initSDK:", e);
          isSDKInitialized = true; // Mark as initialized to avoid retrying
        }
      } catch (error: any) {
        console.error("[FHEVM] SDK initialization failed:", error);
        console.warn("[FHEVM] Continuing with createInstance...");
        isSDKInitialized = true; // Mark as initialized to avoid retrying
      }
    }

    // Local network: Use Mock FHEVM
    if (currentChainId === 31337) {
      const localhostRpcUrl = "http://localhost:8545";
      
      try {
        console.log("[FHEVM] Fetching FHEVM metadata from Hardhat node...");
        const provider = new JsonRpcProvider(localhostRpcUrl);
        const metadata = await provider.send("fhevm_relayer_metadata", []);
        
        console.log("[FHEVM] Metadata:", metadata);
        
        if (metadata && metadata.ACLAddress && metadata.InputVerifierAddress && metadata.KMSVerifierAddress) {
          // Use @fhevm/mock-utils to create mock instance
          if (!MockFhevmInstance || !userDecryptHandleBytes32 || !userDecryptEbool) {
            const mockUtils = await import("@fhevm/mock-utils");
            MockFhevmInstance = mockUtils.MockFhevmInstance;
            userDecryptHandleBytes32 = mockUtils.userDecryptHandleBytes32;
            userDecryptEbool = mockUtils.userDecryptEbool;
            console.log("[FHEVM] ✅ Loaded mock-utils");
          }
          
          console.log("[FHEVM] Creating MockFhevmInstance...");
          
          const mockInstance = await MockFhevmInstance.create(provider, provider, {
            aclContractAddress: metadata.ACLAddress,
            chainId: 31337,
            gatewayChainId: 55815,
            inputVerifierContractAddress: metadata.InputVerifierAddress,
            kmsContractAddress: metadata.KMSVerifierAddress,
            verifyingContractAddressDecryption: "0x5ffdaAB0373E62E2ea2944776209aEf29E631A64",
            verifyingContractAddressInputVerification: "0x812b06e1CDCE800494b79fFE4f925A504a9A9810",
          });
          
          fhevmInstance = mockInstance;
          console.log("[FHEVM] ✅ Mock FHEVM instance created successfully!");
          return mockInstance;
        } else {
          throw new Error("FHEVM metadata is incomplete");
        }
      } catch (error: any) {
        console.error("[FHEVM] Failed to create Mock instance:", error);
        throw new Error(
          `Local Hardhat node FHEVM initialization failed: ${error.message}\n\n` +
          `Please ensure:\n` +
          `1. Hardhat node is running (npx hardhat node)\n` +
          `2. @fhevm/hardhat-plugin is imported in hardhat.config.ts\n` +
          `3. Restart Hardhat node and retry`
        );
      }
    }
    
    // Sepolia network: Use official SDK with MetaMask provider to avoid CORS
    else if (currentChainId === 11155111) {
      try {
        console.log("[FHEVM] Creating Sepolia FHEVM instance...");
        
        if (typeof window === "undefined" || !(window as any).ethereum) {
          throw new Error("MetaMask not detected. Please install MetaMask to use Sepolia network.");
        }
        
        // Load relayer SDK if not already loaded
        const sdk = await loadRelayerSDK();
        
        // Create config using MetaMask provider (no CORS issues)
        const config = {
          ...sdk.SepoliaConfig,
          network: (window as any).ethereum,  // Use MetaMask provider
        };
        
        fhevmInstance = await sdk.createInstance(config);
        console.log("[FHEVM] ✅ Sepolia FHEVM instance created successfully!");
      } catch (error: any) {
        console.error("[FHEVM] ❌ Sepolia instance creation failed:", error);
        throw new Error(
          `Failed to create Sepolia FHEVM instance: ${error.message || "Unknown error"}`
        );
      }
    }
    
    else {
      throw new Error(`Unsupported network (Chain ID: ${currentChainId}). Please switch to local network (31337) or Sepolia (11155111).`);
    }
  }
  
  return fhevmInstance;
}

/**
 * Get or initialize FHEVM instance
 */
export async function getFHEVMInstance(chainId?: number): Promise<FhevmInstance> {
  return initializeFHEVM(chainId);
}

/**
 * Encrypt input data
 */
export async function encryptInput(
  fhevm: FhevmInstance,
  contractAddress: string,
  userAddress: string,
  value: number
): Promise<EncryptedInput> {
  try {
    const encryptedInput = fhevm
      .createEncryptedInput(contractAddress, userAddress)
      .add32(value);
    
    const encrypted = await encryptedInput.encrypt();
    
    // Convert to format required by contract
    const handles = encrypted.handles.map(handle => {
      const hexHandle = ethers.hexlify(handle);
      if (hexHandle.length < 66) {
        const padded = hexHandle.slice(2).padStart(64, '0');
        return `0x${padded}`;
      }
      if (hexHandle.length > 66) {
        return hexHandle.slice(0, 66);
      }
      return hexHandle;
    });
    
    return {
      handles,
      inputProof: ethers.hexlify(encrypted.inputProof),
    };
  } catch (error: any) {
    console.error("[FHEVM] Encryption failed:", error);
    throw new Error(`Encryption failed: ${error.message || "Unknown error"}`);
  }
}

/**
 * Decrypt euint32 value (single value)
 */
export async function decryptEuint32(
  fhevm: FhevmInstance,
  handle: string,
  contractAddress: string,
  userAddress: string,
  signer: any,
  chainId?: number
): Promise<number> {
  const isLocalNetwork = chainId === 31337;
  const isSepoliaNetwork = chainId === 11155111;
  
  if (isLocalNetwork) {
    // For local mock network
    if (!userDecryptHandleBytes32) {
      const mockUtils = await import("@fhevm/mock-utils");
      userDecryptHandleBytes32 = mockUtils.userDecryptHandleBytes32;
    }
    
    const provider = new JsonRpcProvider("http://localhost:8545");
    const value = await userDecryptHandleBytes32(
      provider,
      signer,
      contractAddress,
      handle,
      userAddress
    );
    return Number(value);
  } else if (isSepoliaNetwork) {
    // For Sepolia network, use userDecrypt with signature
    const keypair = fhevm.generateKeypair();
    const contractAddresses = [contractAddress];
    
    const startTimeStamp = Math.floor(Date.now() / 1000).toString();
    const durationDays = "10";
    
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
    
    return Number(result[handle] || 0);
  } else {
    throw new Error(`Unsupported network for decryption. ChainId: ${chainId}`);
  }
}

/**
 * Decrypt ebool value
 */
export async function decryptEbool(
  fhevm: FhevmInstance,
  handle: string,
  contractAddress: string,
  userAddress: string,
  signer: any,
  chainId?: number
): Promise<boolean> {
  const isLocalNetwork = chainId === 31337;
  const isSepoliaNetwork = chainId === 11155111;
  
  if (isLocalNetwork) {
    // For local mock network, use mock instance's userDecrypt method
    // Similar to how privateself project handles it
    try {
      const keypair = fhevm.generateKeypair();
      const contractAddresses = [contractAddress];
      
      const startTimeStamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = "10";
      
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
      
      // For ebool, the result should be 0 or 1 (false or true)
      const value = result[handle];
      return Boolean(value && value !== 0);
    } catch (error: any) {
      console.error("[FHEVM] Error decrypting ebool with mock instance:", error);
      // Fallback: try userDecryptEbool if available
      if (!userDecryptEbool) {
        try {
          const mockUtils = await import("@fhevm/mock-utils");
          if (mockUtils.userDecryptEbool) {
            userDecryptEbool = mockUtils.userDecryptEbool;
          }
        } catch (e) {
          console.warn("[FHEVM] userDecryptEbool not available in mock-utils");
        }
      }
      
      if (userDecryptEbool) {
        const provider = new JsonRpcProvider("http://localhost:8545");
        const value = await userDecryptEbool(
          provider,
          signer,
          contractAddress,
          handle,
          userAddress
        );
        return Boolean(value);
      }
      
      throw new Error(`Failed to decrypt ebool: ${error.message}`);
    }
  } else if (isSepoliaNetwork) {
    // For Sepolia network, use userDecrypt with signature
    const keypair = fhevm.generateKeypair();
    const contractAddresses = [contractAddress];
    
    const startTimeStamp = Math.floor(Date.now() / 1000).toString();
    const durationDays = "10";
    
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
    
    return Boolean(result[handle] || false);
  } else {
    throw new Error(`Unsupported network for decryption. ChainId: ${chainId}`);
  }
}

/**
 * Reset FHEVM instance (for network switching)
 */
export function resetFHEVMInstance() {
  fhevmInstance = null;
  console.log("[FHEVM] Instance reset");
}

