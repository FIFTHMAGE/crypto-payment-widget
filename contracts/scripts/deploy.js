const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  const platformFee = 25; // 0.25%
  const feeCollector = deployer.address;

  // Deploy AccessControl
  console.log("\n1. Deploying AccessControl...");
  const AccessControl = await hre.ethers.getContractFactory("AccessControl");
  const accessControl = await AccessControl.deploy();
  await accessControl.waitForDeployment();
  console.log("AccessControl deployed to:", await accessControl.getAddress());

  // Deploy PaymentRegistry
  console.log("\n2. Deploying PaymentRegistry...");
  const PaymentRegistry = await hre.ethers.getContractFactory("PaymentRegistry");
  const registry = await PaymentRegistry.deploy();
  await registry.waitForDeployment();
  console.log("PaymentRegistry deployed to:", await registry.getAddress());

  // Deploy Escrow
  console.log("\n3. Deploying Escrow...");
  const Escrow = await hre.ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy(feeCollector, platformFee);
  await escrow.waitForDeployment();
  console.log("Escrow deployed to:", await escrow.getAddress());

  // Deploy PaymentSplitter
  console.log("\n4. Deploying PaymentSplitter...");
  const PaymentSplitter = await hre.ethers.getContractFactory("PaymentSplitter");
  const splitter = await PaymentSplitter.deploy(feeCollector, platformFee);
  await splitter.waitForDeployment();
  console.log("PaymentSplitter deployed to:", await splitter.getAddress());

  // Deploy BatchOperations
  console.log("\n5. Deploying BatchOperations...");
  const BatchOperations = await hre.ethers.getContractFactory("BatchOperations");
  const batch = await BatchOperations.deploy(feeCollector, platformFee);
  await batch.waitForDeployment();
  console.log("BatchOperations deployed to:", await batch.getAddress());

  // Deploy PaymentFactory
  console.log("\n6. Deploying PaymentFactory...");
  const PaymentFactory = await hre.ethers.getContractFactory("PaymentFactory");
  const factory = await PaymentFactory.deploy(feeCollector, platformFee);
  await factory.waitForDeployment();
  console.log("PaymentFactory deployed to:", await factory.getAddress());

  // Deploy PaymentProcessorV2
  console.log("\n7. Deploying PaymentProcessorV2...");
  const PaymentProcessorV2 = await hre.ethers.getContractFactory("PaymentProcessorV2");
  const processor = await PaymentProcessorV2.deploy(
    await registry.getAddress(),
    feeCollector,
    platformFee
  );
  await processor.waitForDeployment();
  console.log("PaymentProcessorV2 deployed to:", await processor.getAddress());

  // Grant operator role to processor
  console.log("\n8. Granting roles...");
  const OPERATOR_ROLE = await registry.OPERATOR_ROLE();
  await registry.grantRole(OPERATOR_ROLE, await processor.getAddress());
  console.log("Granted OPERATOR_ROLE to PaymentProcessorV2");

  console.log("\n✅ Deployment complete!");
  console.log("\nContract Addresses:");
  console.log("==================");
  console.log("AccessControl:", await accessControl.getAddress());
  console.log("PaymentRegistry:", await registry.getAddress());
  console.log("Escrow:", await escrow.getAddress());
  console.log("PaymentSplitter:", await splitter.getAddress());
  console.log("BatchOperations:", await batch.getAddress());
  console.log("PaymentFactory:", await factory.getAddress());
  console.log("PaymentProcessorV2:", await processor.getAddress());

  // Save addresses to file
  const fs = require("fs");
  const addresses = {
    network: hre.network.name,
    accessControl: await accessControl.getAddress(),
    paymentRegistry: await registry.getAddress(),
    escrow: await escrow.getAddress(),
    paymentSplitter: await splitter.getAddress(),
    batchOperations: await batch.getAddress(),
    paymentFactory: await factory.getAddress(),
    paymentProcessorV2: await processor.getAddress(),
    feeCollector,
    platformFee,
  };

  fs.writeFileSync(
    "deployment-addresses.json",
    JSON.stringify(addresses, null, 2)
  );
  console.log("\n📄 Addresses saved to deployment-addresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

