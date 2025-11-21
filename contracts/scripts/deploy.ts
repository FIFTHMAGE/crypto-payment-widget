/**
 * Deployment script for payment contracts
 */

import { ethers } from 'hardhat';

async function main() {
  console.log('Starting deployment...');

  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('Account balance:', ethers.formatEther(balance), 'ETH');

  // Deploy PaymentProcessor
  console.log('\nDeploying PaymentProcessor...');
  const PaymentProcessor = await ethers.getContractFactory('PaymentProcessor');
  const paymentProcessor = await PaymentProcessor.deploy();
  await paymentProcessor.waitForDeployment();
  const paymentProcessorAddress = await paymentProcessor.getAddress();
  console.log('PaymentProcessor deployed to:', paymentProcessorAddress);

  // Deploy Escrow
  console.log('\nDeploying Escrow...');
  const Escrow = await ethers.getContractFactory('Escrow');
  const escrow = await Escrow.deploy();
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log('Escrow deployed to:', escrowAddress);

  // Deploy PaymentSplitter
  console.log('\nDeploying PaymentSplitter...');
  const PaymentSplitter = await ethers.getContractFactory('PaymentSplitter');
  const paymentSplitter = await PaymentSplitter.deploy();
  await paymentSplitter.waitForDeployment();
  const paymentSplitterAddress = await paymentSplitter.getAddress();
  console.log('PaymentSplitter deployed to:', paymentSplitterAddress);

  // Deploy BatchOperations
  console.log('\nDeploying BatchOperations...');
  const BatchOperations = await ethers.getContractFactory('BatchOperations');
  const batchOperations = await BatchOperations.deploy();
  await batchOperations.waitForDeployment();
  const batchOperationsAddress = await batchOperations.getAddress();
  console.log('BatchOperations deployed to:', batchOperationsAddress);

  console.log('\n=== Deployment Summary ===');
  console.log('PaymentProcessor:', paymentProcessorAddress);
  console.log('Escrow:', escrowAddress);
  console.log('PaymentSplitter:', paymentSplitterAddress);
  console.log('BatchOperations:', batchOperationsAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
