import { useAccount, usePublicClient, useWalletClient, useChainId } from 'wagmi';
import { getContractAddress, isContractDeployed, CONTRACT_ABI } from '../config/contracts';
import { useZamaInstance } from './useZamaInstance';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export function useBalanceValidator() {
  const chainId = useChainId();
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { zamaInstance, encrypt, decryptBool, isLoading: zamaLoading } = useZamaInstance();
  const [isLoading, setIsLoading] = useState(false);

  // Get contract info for current network
  const contractAddress = getContractAddress(chainId);
  const contractDeployed = isContractDeployed(chainId);

  // Check if user has balance set
  const hasBalance = useCallback(async (): Promise<boolean> => {
    if (!publicClient || !address || !contractDeployed) return false;
    try {
      const hasBal = await publicClient.readContract({
        address: contractAddress,
        abi: CONTRACT_ABI,
        functionName: 'hasBalance',
        args: [address],
      }) as boolean;
      return hasBal;
    } catch (error) {
      console.error('Error checking balance:', error);
      return false;
    }
  }, [publicClient, address, contractDeployed, contractAddress]);

  // Set encrypted balance
  const setBalance = async (balance: number) => {
    if (!walletClient || !address || !zamaInstance || !contractDeployed) {
      toast.error('Please connect your wallet and wait for encryption to initialize');
      return false;
    }

    setIsLoading(true);
    try {
      if (!encrypt) {
        throw new Error('Encryption not ready');
      }

      const encryptedInput = await encrypt(contractAddress, address, balance);

      const isLocalhost = chainId === 31337;

      if (isLocalhost) {
        const hash = await walletClient.writeContract({
          address: contractAddress,
          abi: CONTRACT_ABI,
          functionName: 'setBalance',
          args: [encryptedInput.handles[0], encryptedInput.inputProof],
          gas: 5000000n,
        });
        await publicClient!.waitForTransactionReceipt({ hash });
      } else {
        const { request } = await publicClient!.simulateContract({
          address: contractAddress,
          abi: CONTRACT_ABI,
          functionName: 'setBalance',
          args: [encryptedInput.handles[0], encryptedInput.inputProof],
          account: address,
        });

        const hash = await walletClient.writeContract(request);
        await publicClient!.waitForTransactionReceipt({ hash });
      }

      toast.success('Balance set successfully!');
      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error('Error setting balance:', error);
      toast.error(error.message || 'Failed to set balance');
      setIsLoading(false);
      return false;
    }
  };

  // Validate transfer amount
  const validateTransfer = async (amount: number): Promise<boolean | null> => {
    if (!walletClient || !address || !zamaInstance || !contractDeployed) {
      toast.error('Please connect your wallet and wait for encryption to initialize');
      return null;
    }

    setIsLoading(true);
    try {
      if (!encrypt) {
        throw new Error('Encryption not ready');
      }

      const encryptedInput = await encrypt(contractAddress, address, amount);

      const isLocalhost = chainId === 31337;

      let hash: `0x${string}`;
      if (isLocalhost) {
        hash = await walletClient.writeContract({
          address: contractAddress,
          abi: CONTRACT_ABI,
          functionName: 'validateTransfer',
          args: [encryptedInput.handles[0], encryptedInput.inputProof],
          gas: 5000000n,
        });
      } else {
        const { request } = await publicClient!.simulateContract({
          address: contractAddress,
          abi: CONTRACT_ABI,
          functionName: 'validateTransfer',
          args: [encryptedInput.handles[0], encryptedInput.inputProof],
          account: address,
        });

        hash = await walletClient.writeContract(request);
      }
      
      const receipt = await publicClient!.waitForTransactionReceipt({ hash });

      // Get the encrypted result by calling the function as a static call
      // This simulates the function call without executing a transaction
      const encryptedResult = await publicClient!.simulateContract({
        address: contractAddress,
        abi: CONTRACT_ABI,
        functionName: 'validateTransfer',
        args: [encryptedInput.handles[0], encryptedInput.inputProof],
        account: address,
      });

      // Decrypt the result (encryptedResult.result is the ebool handle)
      const clearResult = await decryptBool(encryptedResult.result as `0x${string}`, contractAddress, address);

      setIsLoading(false);
      return clearResult;
    } catch (error: any) {
      console.error('Error validating transfer:', error);
      toast.error(error.message || 'Failed to validate transfer');
      setIsLoading(false);
      return null;
    }
  };

  // Clear encrypted balance (set to encrypted zero)
  const clearBalance = async () => {
    if (!walletClient || !address || !zamaInstance || !contractDeployed) {
      toast.error('Please connect your wallet and wait for encryption to initialize');
      return false;
    }

    setIsLoading(true);
    try {
      if (!encrypt) {
        throw new Error('Encryption not ready');
      }

      // Encrypt zero value
      const encryptedZero = await encrypt(contractAddress, address, 0);

      const isLocalhost = chainId === 31337;

      if (isLocalhost) {
        const hash = await walletClient.writeContract({
          address: contractAddress,
          abi: CONTRACT_ABI,
          functionName: 'clearBalance',
          args: [encryptedZero.handles[0], encryptedZero.inputProof],
          gas: 500000n,
        });
        await publicClient!.waitForTransactionReceipt({ hash });
      } else {
        const { request } = await publicClient!.simulateContract({
          address: contractAddress,
          abi: CONTRACT_ABI,
          functionName: 'clearBalance',
          args: [encryptedZero.handles[0], encryptedZero.inputProof],
          account: address,
        });

        const hash = await walletClient.writeContract(request);
        await publicClient!.waitForTransactionReceipt({ hash });
      }

      toast.success('Balance cleared successfully!');
      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error('Error clearing balance:', error);
      toast.error(error.message || 'Failed to clear balance');
      setIsLoading(false);
      return false;
    }
  };

  return {
    hasBalance,
    setBalance,
    clearBalance,
    validateTransfer,
    contractDeployed,
    isLoading: isLoading || zamaLoading,
  };
}

