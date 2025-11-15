const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("PaymentRegistry", function () {
  async function deployFixture() {
    const [owner, payer, payee] = await ethers.getSigners();

    const PaymentRegistry = await ethers.getContractFactory("PaymentRegistry");
    const registry = await PaymentRegistry.deploy(owner.address);

    return { registry, owner, payer, payee };
  }

  describe("Register Payment", function () {
    it("Should register new payment", async function () {
      const { registry, owner, payer, payee } = await loadFixture(deployFixture);

      const paymentId = ethers.id("payment1");
      const amount = ethers.parseEther("1.0");

      await expect(
        registry.connect(owner).registerPayment(
          paymentId,
          payer.address,
          payee.address,
          amount,
          ethers.ZeroAddress,
          Math.floor(Date.now() / 1000),
          "test payment",
          1 // Completed status
        )
      ).to.emit(registry, "PaymentRegistered");
    });

    it("Should prevent duplicate payment IDs", async function () {
      const { registry, owner, payer, payee } = await loadFixture(deployFixture);

      const paymentId = ethers.id("payment1");
      const amount = ethers.parseEther("1.0");

      await registry.connect(owner).registerPayment(
        paymentId,
        payer.address,
        payee.address,
        amount,
        ethers.ZeroAddress,
        Math.floor(Date.now() / 1000),
        "test",
        1
      );

      await expect(
        registry.connect(owner).registerPayment(
          paymentId,
          payer.address,
          payee.address,
          amount,
          ethers.ZeroAddress,
          Math.floor(Date.now() / 1000),
          "test",
          1
        )
      ).to.be.revertedWith("Payment ID already exists");
    });
  });

  describe("Update Payment Status", function () {
    it("Should update payment status", async function () {
      const { registry, owner, payer, payee } = await loadFixture(deployFixture);

      const paymentId = ethers.id("payment1");
      const amount = ethers.parseEther("1.0");

      await registry.connect(owner).registerPayment(
        paymentId,
        payer.address,
        payee.address,
        amount,
        ethers.ZeroAddress,
        Math.floor(Date.now() / 1000),
        "test",
        0 // Pending
      );

      await expect(
        registry.connect(owner).updatePaymentStatus(paymentId, 1) // Completed
      ).to.emit(registry, "PaymentStatusUpdated");
    });
  });

  describe("Query Payments", function () {
    it("Should return payment count", async function () {
      const { registry, owner, payer, payee } = await loadFixture(deployFixture);

      expect(await registry.getPaymentCount()).to.equal(0);

      const paymentId = ethers.id("payment1");
      await registry.connect(owner).registerPayment(
        paymentId,
        payer.address,
        payee.address,
        ethers.parseEther("1.0"),
        ethers.ZeroAddress,
        Math.floor(Date.now() / 1000),
        "test",
        1
      );

      expect(await registry.getPaymentCount()).to.equal(1);
    });
  });
});

