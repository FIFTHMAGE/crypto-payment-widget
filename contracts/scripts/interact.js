const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();

  console.log("Interacting with contracts using account:", signer.address);

  const processorAddress = process.env.PROCESSOR_ADDRESS || "";
  const processor = await hre.ethers.getContractAt("PaymentProcessorV2", processorAddress);

  // Get current fee
  const platformFee = await processor.platformFee();
  console.log("Current platform fee:", platformFee.toString(), "basis points");

  // Get fee collector
  const feeCollector = await processor.feeCollector();
  console.log("Fee collector:", feeCollector);

  // Example: Process a payment
  if (process.env.PROCESS_PAYMENT === "true") {
    const payee = process.env.PAYEE_ADDRESS;
    const amount = hre.ethers.parseEther(process.env.AMOUNT || "0.01");

    console.log(`Processing payment of ${amount} to ${payee}...`);

    const tx = await processor.processPayment(
      payee,
      hre.ethers.ZeroAddress,
      amount,
      "CLI payment",
      { value: amount }
    );

    const receipt = await tx.wait();
    console.log("Payment processed in tx:", receipt.hash);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

