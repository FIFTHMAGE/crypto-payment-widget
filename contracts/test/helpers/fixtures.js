const { ethers } = require("hardhat");

async function getSigners() {
  return await ethers.getSigners();
}

async function deployPaymentProcessor() {
  const [owner, feeCollector] = await getSigners();
  const PaymentProcessor = await ethers.getContractFactory("PaymentProcessor");
  return await PaymentProcessor.deploy(feeCollector.address);
}

async function deployEscrow() {
  const [owner] = await getSigners();
  const Escrow = await ethers.getContractFactory("Escrow");
  return await Escrow.deploy(owner.address);
}

async function deployPaymentSplitter(payees, shares) {
  const [owner] = await getSigners();
  const PaymentSplitter = await ethers.getContractFactory("PaymentSplitter");
  return await PaymentSplitter.deploy(payees, shares, owner.address);
}

async function deployAll() {
  const [owner, feeCollector] = await getSigners();

  const registry = await ethers.deployContract("PaymentRegistry", [owner.address]);
  const processor = await ethers.deployContract("PaymentProcessorV2", [
    feeCollector.address,
    await registry.getAddress(),
    owner.address
  ]);
  const escrow = await ethers.deployContract("Escrow", [owner.address]);
  const batchOps = await ethers.deployContract("BatchOperations", [owner.address]);

  return { registry, processor, escrow, batchOps, owner, feeCollector };
}

module.exports = {
  getSigners,
  deployPaymentProcessor,
  deployEscrow,
  deployPaymentSplitter,
  deployAll,
};

