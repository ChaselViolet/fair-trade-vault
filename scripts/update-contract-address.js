// Script to update contract address in frontend config from deployment files
const fs = require('fs');
const path = require('path');

const deploymentFile = path.join(__dirname, '../deployments/localhost/BalanceValidator.json');
const configFile = path.join(__dirname, '../ui/src/config/contracts.ts');

try {
  const deployment = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  const address = deployment.address;
  
  console.log(`Found deployed contract address: ${address}`);
  
  // Read config file
  let config = fs.readFileSync(configFile, 'utf8');
  
  // Update localhost address
  config = config.replace(
    /"31337":\s*\{[^}]*"address":\s*"0x[a-fA-F0-9]{40}"/,
    `"31337": {
    "address": "${address}"`
  );
  
  // Write back
  fs.writeFileSync(configFile, config, 'utf8');
  
  console.log(`✅ Updated contract address in ${configFile}`);
  console.log(`   New address: ${address}`);
} catch (error) {
  console.error('❌ Error updating contract address:', error.message);
  process.exit(1);
}

