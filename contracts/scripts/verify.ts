/**
 * Verification script for deployed contracts
 */

import { run } from 'hardhat';

async function main() {
  console.log('Starting contract verification...');

  const contracts = [
    {
      name: 'PaymentProcessor',
      address: process.env.PAYMENT_PROCESSOR_ADDRESS,
      constructorArguments: [],
    },
    {
      name: 'Escrow',
      address: process.env.ESCROW_ADDRESS,
      constructorArguments: [],
    },
    {
      name: 'PaymentSplitter',
      address: process.env.PAYMENT_SPLITTER_ADDRESS,
      constructorArguments: [],
    },
    {
      name: 'BatchOperations',
      address: process.env.BATCH_OPERATIONS_ADDRESS,
      constructorArguments: [],
    },
  ];

  for (const contract of contracts) {
    if (!contract.address) {
      console.log(`Skipping ${contract.name}: address not set`);
      continue;
    }

    try {
      console.log(`\nVerifying ${contract.name} at ${contract.address}...`);
      await run('verify:verify', {
        address: contract.address,
        constructorArguments: contract.constructorArguments,
      });
      console.log(`${contract.name} verified successfully`);
    } catch (error: any) {
      if (error.message.includes('Already Verified')) {
        console.log(`${contract.name} already verified`);
      } else {
        console.error(`Error verifying ${contract.name}:`, error);
      }
    }
  }

  console.log('\nVerification complete!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

