const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying PaymentProcessor contract...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Fee collector address (can be changed later)
  const feeCollector = deployer.address;

  const PaymentProcessor = await hre.ethers.getContractFactory("PaymentProcessor");
  const paymentProcessor = await PaymentProcessor.deploy(feeCollector);

  await paymentProcessor.waitForDeployment();

  const address = await paymentProcessor.getAddress();
  console.log("✅ PaymentProcessor deployed to:", address);
  console.log("Fee Collector:", feeCollector);

  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: address,
    feeCollector: feeCollector,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
  };

  const deploymentsDir = "./deployments";
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  fs.writeFileSync(
    `${deploymentsDir}/${hre.network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log(`\n📝 Deployment info saved to deployments/${hre.network.name}.json`);

  // Export ABI for frontend
  const artifact = await hre.artifacts.readArtifact("PaymentProcessor");
  fs.writeFileSync(
    "./frontend/src/contracts/PaymentProcessor.json",
    JSON.stringify({ abi: artifact.abi, address }, null, 2)
  );

  console.log("✅ ABI exported to frontend/src/contracts/PaymentProcessor.json");

  // Verify on Etherscan (if not local network)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n⏳ Waiting for block confirmations...");
    await paymentProcessor.deploymentTransaction().wait(5);

    console.log("🔍 Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [feeCollector],
      });
      console.log("✅ Contract verified on Etherscan");
    } catch (error) {
      console.log("❌ Verification failed:", error.message);
    }
  }

  console.log("\n🎉 Deployment complete!");
  console.log("\nNext steps:");
  console.log("1. Update frontend/.env with:");
  console.log(`   VITE_CONTRACT_ADDRESS=${address}`);
  console.log("2. Restart your frontend dev server");
  console.log("3. Test the payment features!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
