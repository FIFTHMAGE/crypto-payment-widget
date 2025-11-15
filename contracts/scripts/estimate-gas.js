const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();

  console.log("Estimating gas costs...\n");

  // Deploy contracts
  console.log("Deployment Costs:");

  const PaymentRegistry = await hre.ethers.getContractFactory("PaymentRegistry");
  const registryDeploy = await PaymentRegistry.getDeployTransaction(signer.address);
  const registryGas = await hre.ethers.provider.estimateGas(registryDeploy);
  console.log(`PaymentRegistry: ${registryGas.toString()} gas`);

  const PaymentProcessorV2 = await hre.ethers.getContractFactory("PaymentProcessorV2");
  const processorDeploy = await PaymentProcessorV2.getDeployTransaction(
    signer.address,
    signer.address,
    signer.address
  );
  const processorGas = await hre.ethers.provider.estimateGas(processorDeploy);
  console.log(`PaymentProcessorV2: ${processorGas.toString()} gas`);

  const Escrow = await hre.ethers.getContractFactory("Escrow");
  const escrowDeploy = await Escrow.getDeployTransaction(signer.address);
  const escrowGas = await hre.ethers.provider.estimateGas(escrowDeploy);
  console.log(`Escrow: ${escrowGas.toString()} gas`);

  // Operation costs (using deployed contracts)
  console.log("\nOperation Costs:");

  const processor = await PaymentProcessorV2.deploy(
    signer.address,
    signer.address,
    signer.address
  );
  await processor.waitForDeployment();

  const paymentTx = await processor.processPayment.populateTransaction(
    signer.address,
    hre.ethers.ZeroAddress,
    hre.ethers.parseEther("1.0"),
    "test"
  );
  const paymentGas = await hre.ethers.provider.estimateGas({
    ...paymentTx,
    from: signer.address,
    value: hre.ethers.parseEther("1.0"),
  });
  console.log(`Process Payment: ${paymentGas.toString()} gas`);

  // Calculate costs at different gas prices
  console.log("\nCost Estimates:");
  const gasPrices = [20, 50, 100]; // Gwei

  gasPrices.forEach(gwei => {
    const gasPrice = hre.ethers.parseUnits(gwei.toString(), "gwei");
    const cost = (paymentGas * gasPrice) / hre.ethers.parseEther("1");
    console.log(`At ${gwei} Gwei: ${cost.toString()} ETH`);
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

