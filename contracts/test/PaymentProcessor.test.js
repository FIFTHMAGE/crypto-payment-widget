const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("PaymentProcessor", function () {
  async function deployFixture() {
    const [owner, feeCollector, payer, payee] = await ethers.getSigners();

    const PaymentProcessor = await ethers.getContractFactory("PaymentProcessor");
    const processor = await PaymentProcessor.deploy(feeCollector.address);

    return { processor, owner, feeCollector, payer, payee };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { processor, owner } = await loadFixture(deployFixture);
      expect(await processor.owner()).to.equal(owner.address);
    });

    it("Should set the right fee collector", async function () {
      const { processor, feeCollector } = await loadFixture(deployFixture);
      expect(await processor.feeCollector()).to.equal(feeCollector.address);
    });

    it("Should set default platform fee", async function () {
      const { processor } = await loadFixture(deployFixture);
      expect(await processor.platformFee()).to.equal(25); // 0.25%
    });
  });

  describe("Process Payment", function () {
    it("Should process ETH payment", async function () {
      const { processor, payer, payee } = await loadFixture(deployFixture);

      const amount = ethers.parseEther("1.0");

      await expect(
        processor.connect(payer).processPayment(
          payee.address,
          ethers.ZeroAddress,
          amount,
          "test payment",
          { value: amount }
        )
      ).to.emit(processor, "PaymentProcessed");
    });

    it("Should deduct platform fee", async function () {
      const { processor, payer, payee, feeCollector } = await loadFixture(deployFixture);

      const amount = ethers.parseEther("1.0");
      const expectedFee = amount * 25n / 10000n; // 0.25%
      const expectedNet = amount - expectedFee;

      const payeeBalanceBefore = await ethers.provider.getBalance(payee.address);
      const feeCollectorBalanceBefore = await ethers.provider.getBalance(feeCollector.address);

      await processor.connect(payer).processPayment(
        payee.address,
        ethers.ZeroAddress,
        amount,
        "test",
        { value: amount }
      );

      const payeeBalanceAfter = await ethers.provider.getBalance(payee.address);
      const feeCollectorBalanceAfter = await ethers.provider.getBalance(feeCollector.address);

      expect(payeeBalanceAfter - payeeBalanceBefore).to.equal(expectedNet);
      expect(feeCollectorBalanceAfter - feeCollectorBalanceBefore).to.equal(expectedFee);
    });

    it("Should reject invalid payee", async function () {
      const { processor, payer } = await loadFixture(deployFixture);

      await expect(
        processor.connect(payer).processPayment(
          ethers.ZeroAddress,
          ethers.ZeroAddress,
          ethers.parseEther("1"),
          "test",
          { value: ethers.parseEther("1") }
        )
      ).to.be.revertedWith("Invalid payee");
    });
  });

  describe("Platform Fee Management", function () {
    it("Should allow owner to update fee", async function () {
      const { processor, owner } = await loadFixture(deployFixture);

      await processor.connect(owner).updatePlatformFee(50); // 0.5%
      expect(await processor.platformFee()).to.equal(50);
    });

    it("Should reject fee above maximum", async function () {
      const { processor, owner } = await loadFixture(deployFixture);

      await expect(
        processor.connect(owner).updatePlatformFee(501) // > 5%
      ).to.be.revertedWith("Fee too high");
    });

    it("Should reject non-owner fee updates", async function () {
      const { processor, payer } = await loadFixture(deployFixture);

      await expect(
        processor.connect(payer).updatePlatformFee(50)
      ).to.be.reverted;
    });
  });
});

