// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title BalanceValidator - Encrypted Transfer Amount Validation System
/// @notice Validates if user balance is sufficient for transfer without revealing actual amounts
/// @dev Uses FHE to compare encrypted balance with encrypted transfer amount
/// @dev Returns only YES/NO result without revealing actual values
contract BalanceValidator is SepoliaConfig {
    // Mapping from user address to encrypted balance
    mapping(address => euint32) private _encryptedBalances;
    
    // Events
    event BalanceSet(address indexed user, uint256 timestamp);
    event BalanceCleared(address indexed user, uint256 timestamp);
    event ValidationRequested(address indexed user, uint256 timestamp);
    
    /// @notice Set encrypted balance for a user
    /// @param encryptedBalance The encrypted balance value
    /// @param inputProof The Zama FHE input proof for the encrypted balance
    function setBalance(externalEuint32 encryptedBalance, bytes calldata inputProof) external {
        euint32 balance = FHE.fromExternal(encryptedBalance, inputProof);
        _encryptedBalances[msg.sender] = balance;
        
        // Grant access: contract and user can decrypt
        FHE.allowThis(balance);
        FHE.allow(balance, msg.sender);
        
        emit BalanceSet(msg.sender, block.timestamp);
    }
    
    /// @notice Get encrypted balance for a user
    /// @param user The user address
    /// @return The encrypted balance
    function getEncryptedBalance(address user) external view returns (euint32) {
        return _encryptedBalances[user];
    }
    
    /// @notice Validate if user balance is sufficient for transfer amount
    /// @param encryptedAmount The encrypted transfer amount
    /// @param inputProof The Zama FHE input proof for the encrypted amount
    /// @return result Encrypted boolean: true if balance >= amount, false otherwise
    /// @dev This function performs homomorphic comparison without revealing actual values
    /// @dev The result is encrypted and can only be decrypted by the user
    function validateTransfer(externalEuint32 encryptedAmount, bytes calldata inputProof) 
        external 
        returns (ebool) 
    {
        euint32 amount = FHE.fromExternal(encryptedAmount, inputProof);
        euint32 balance = _encryptedBalances[msg.sender];
        
        // Grant access for amount
        FHE.allowThis(amount);
        FHE.allow(amount, msg.sender);
        
        // Perform homomorphic comparison: balance >= amount
        // Use FHE.ge (greater than or equal) which returns an encrypted boolean (ebool)
        ebool result = FHE.ge(balance, amount);
        
        // Grant access for result so user can decrypt
        FHE.allowThis(result);
        FHE.allow(result, msg.sender);
        
        emit ValidationRequested(msg.sender, block.timestamp);
        
        return result;
    }
    
    /// @notice Clear encrypted balance for the caller
    /// @dev Sets the balance to encrypted zero
    /// @dev Only the balance owner can clear their own balance
    /// @param encryptedZero Encrypted zero value (must be 0)
    /// @param inputProof The Zama FHE input proof for the encrypted zero
    function clearBalance(externalEuint32 encryptedZero, bytes calldata inputProof) external {
        euint32 zero = FHE.fromExternal(encryptedZero, inputProof);
        
        // Set balance to encrypted zero
        _encryptedBalances[msg.sender] = zero;
        
        // Grant access: contract and user can decrypt
        FHE.allowThis(zero);
        FHE.allow(zero, msg.sender);
        
        emit BalanceCleared(msg.sender, block.timestamp);
    }
    
    /// @notice Check if balance exists for a user
    /// @param user The user address
    /// @return exists True if balance has been set
    function hasBalance(address user) external view returns (bool) {
        // Check if balance is initialized (not zero hash)
        bytes32 balanceBytes = FHE.toBytes32(_encryptedBalances[user]);
        return balanceBytes != bytes32(0);
    }
}

