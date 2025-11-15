const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("PaymentProcessorV2", function () {
  async function deployFixture() {
    const [owner, feeCollector, payer, payee] = await ethers.getSigners();

    const PaymentRegistry = await ethers.getContractFactory("PaymentRegistry");
    const registry = await PaymentRegistry.deploy(owner.address);

    const PaymentProcessorV2 = await ethers.getContractFactory("PaymentProcessorV2");
    const processor = await PaymentProcessorV2.deploy(
      feeCollector.address,
      await registry.getAddress(),
      owner.address
    );

    // Grant processor role to register payments
    await registry.transferOwnership(await processor.getAddress());

    return { processor, registry, owner, feeCollector, payer, payee };
  }

  describe("Process Payment with Registry", function () {
    it("Should process payment and register in registry", async function () {
      const { processor, registry, payer, payee } = await loadFixture(deployFixture);

      const amount = ethers.parseEther("1.0");

      const tx = await processor.connect(payer).processPayment(
        payee.address,
        ethers.ZeroAddress,
        amount,
        "test payment",
        { value: amount }
      );

      await expect(tx).to.emit(processor, "PaymentProcessed");

      const paymentCount = await registry.getPaymentCount();
      expect(paymentCount).to.be.greaterThan(0);
    });
  });

  describe("Fee Management", function () {
    it("Should allow FEE_MANAGER to update fees", async function () {
      const { processor, owner } = await loadFixture(deployFixture);

      const FEE_MANAGER_ROLE = await processor.FEE_MANAGER_ROLE();
      await processor.connect(owner).grantRole(FEE_MANAGER_ROLE, owner.address);

      await processor.connect(owner).updatePlatformFee(50);

      expect(await processor.platformFee()).to.equal(50);
    });
  });
});

