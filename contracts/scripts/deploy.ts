import { ethers, upgrades } from "hardhat";

async function main() {
  console.log("Starting deployment...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy PaymentProcessor
  const treasury = process.env.TREASURY_ADDRESS || deployer.address;
  const platformFee = 250; // 2.5%

  console.log("\n📝 Deploying PaymentProcessor...");
  const PaymentProcessor = await ethers.getContractFactory("PaymentProcessor");
  const paymentProcessor = await PaymentProcessor.deploy(treasury, platformFee);
  await paymentProcessor.waitForDeployment();
  const paymentProcessorAddress = await paymentProcessor.getAddress();
  console.log("✅ PaymentProcessor deployed to:", paymentProcessorAddress);

  // Deploy Escrow
  console.log("\n📝 Deploying Escrow...");
  const Escrow = await ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy(platformFee, treasury);
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log("✅ Escrow deployed to:", escrowAddress);

  // Deploy PaymentSplitter
  console.log("\n📝 Deploying PaymentSplitter...");
  const PaymentSplitter = await ethers.getContractFactory("PaymentSplitter");
  const paymentSplitter = await PaymentSplitter.deploy();
  await paymentSplitter.waitForDeployment();
  const paymentSplitterAddress = await paymentSplitter.getAddress();
  console.log("✅ PaymentSplitter deployed to:", paymentSplitterAddress);

  // Deploy BatchOperations
  console.log("\n📝 Deploying BatchOperations...");
  const BatchOperations = await ethers.getContractFactory("BatchOperations");
  const batchOperations = await BatchOperations.deploy();
  await batchOperations.waitForDeployment();
  const batchOperationsAddress = await batchOperations.getAddress();
  console.log("✅ BatchOperations deployed to:", batchOperationsAddress);

  // Deploy SubscriptionPayment
  console.log("\n📝 Deploying SubscriptionPayment...");
  const SubscriptionPayment = await ethers.getContractFactory("SubscriptionPayment");
  const subscriptionPayment = await SubscriptionPayment.deploy(platformFee, treasury);
  await subscriptionPayment.waitForDeployment();
  const subscriptionPaymentAddress = await subscriptionPayment.getAddress();
  console.log("✅ SubscriptionPayment deployed to:", subscriptionPaymentAddress);

  // Deploy PaymentStreaming
  console.log("\n📝 Deploying PaymentStreaming...");
  const PaymentStreaming = await ethers.getContractFactory("PaymentStreaming");
  const paymentStreaming = await PaymentStreaming.deploy();
  await paymentStreaming.waitForDeployment();
  const paymentStreamingAddress = await paymentStreaming.getAddress();
  console.log("✅ PaymentStreaming deployed to:", paymentStreamingAddress);

  // Deploy MilestonePayment
  console.log("\n📝 Deploying MilestonePayment...");
  const MilestonePayment = await ethers.getContractFactory("MilestonePayment");
  const milestonePayment = await MilestonePayment.deploy(platformFee, treasury);
  await milestonePayment.waitForDeployment();
  const milestonePaymentAddress = await milestonePayment.getAddress();
  console.log("✅ MilestonePayment deployed to:", milestonePaymentAddress);

  // Print summary
  console.log("\n🎉 Deployment Summary:");
  console.log("========================");
  console.log("PaymentProcessor:", paymentProcessorAddress);
  console.log("Escrow:", escrowAddress);
  console.log("PaymentSplitter:", paymentSplitterAddress);
  console.log("BatchOperations:", batchOperationsAddress);
  console.log("SubscriptionPayment:", subscriptionPaymentAddress);
  console.log("PaymentStreaming:", paymentStreamingAddress);
  console.log("MilestonePayment:", milestonePaymentAddress);
  console.log("========================");

  // Save deployment info
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    deployer: deployer.address,
    treasury,
    platformFee,
    contracts: {
      PaymentProcessor: paymentProcessorAddress,
      Escrow: escrowAddress,
      PaymentSplitter: paymentSplitterAddress,
      BatchOperations: batchOperationsAddress,
      SubscriptionPayment: subscriptionPaymentAddress,
      PaymentStreaming: paymentStreamingAddress,
      MilestonePayment: milestonePaymentAddress,
    },
    timestamp: new Date().toISOString(),
  };

  console.log("\n📄 Deployment info:", JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

