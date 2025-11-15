const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Gas Optimization Tests", function () {
  async function deployFixture() {
    const [owner, payer, payee] = await ethers.getSigners();

    const PaymentProcessor = await ethers.getContractFactory("PaymentProcessor");
    const processor = await PaymentProcessor.deploy(owner.address);

    const BatchOperations = await ethers.getContractFactory("BatchOperations");
    const batchOps = await BatchOperations.deploy(owner.address);

    return { processor, batchOps, owner, payer, payee };
  }

  describe("Single vs Batch Operations", function () {
    it("Should use less gas for batch operations", async function () {
      const { batchOps, payer } = await loadFixture(deployFixture);

      const [, r1, r2, r3, r4, r5] = await ethers.getSigners();
      const recipients = [r1.address, r2.address, r3.address, r4.address, r5.address];
      const amounts = Array(5).fill(ethers.parseEther("0.1"));

      const totalAmount = ethers.parseEther("0.5");

      const tx = await batchOps.connect(payer).batchEthTransfer(recipients, amounts, {
        value: totalAmount
      });

      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed;

      // Batch should use less than 5 individual transfers
      expect(gasUsed).to.be.lessThan(21000n * 5n);
    });
  });

  describe("Storage Efficiency", function () {
    it("Should efficiently store payment data", async function () {
      const { processor, payer, payee } = await loadFixture(deployFixture);

      const amount = ethers.parseEther("1.0");

      const tx = await processor.connect(payer).processPayment(
        payee.address,
        ethers.ZeroAddress,
        amount,
        "test",
        { value: amount }
      );

      const receipt = await tx.wait();

      // Should use reasonable gas for storage
      expect(receipt.gasUsed).to.be.lessThan(200000n);
    });
  });
});

