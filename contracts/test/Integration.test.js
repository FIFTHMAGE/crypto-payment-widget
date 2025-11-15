const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Integration Tests", function () {
  async function deployAllFixture() {
    const [owner, payer, payee1, payee2, payee3] = await ethers.getSigners();

    // Deploy Registry
    const PaymentRegistry = await ethers.getContractFactory("PaymentRegistry");
    const registry = await PaymentRegistry.deploy(owner.address);

    // Deploy PaymentProcessorV2
    const PaymentProcessorV2 = await ethers.getContractFactory("PaymentProcessorV2");
    const processor = await PaymentProcessorV2.deploy(
      owner.address,
      await registry.getAddress(),
      owner.address
    );

    // Deploy Escrow
    const Escrow = await ethers.getContractFactory("Escrow");
    const escrow = await Escrow.deploy(owner.address);

    // Deploy PaymentSplitter
    const payees = [payee1.address, payee2.address, payee3.address];
    const shares = [50, 30, 20];
    const PaymentSplitter = await ethers.getContractFactory("PaymentSplitter");
    const splitter = await PaymentSplitter.deploy(payees, shares, owner.address);

    // Deploy BatchOperations
    const BatchOperations = await ethers.getContractFactory("BatchOperations");
    const batchOps = await BatchOperations.deploy(owner.address);

    return { processor, registry, escrow, splitter, batchOps, owner, payer, payee1, payee2, payee3 };
  }

  describe("Complete Payment Flow", function () {
    it("Should process payment through processor to registry", async function () {
      const { processor, registry, payer, payee1 } = await loadFixture(deployAllFixture);

      // Grant processor permission to register
      await registry.transferOwnership(await processor.getAddress());

      const amount = ethers.parseEther("1.0");

      await processor.connect(payer).processPayment(
        payee1.address,
        ethers.ZeroAddress,
        amount,
        "integration test",
        { value: amount }
      );

      const paymentCount = await registry.getPaymentCount();
      expect(paymentCount).to.equal(1);
    });

    it("Should create escrow and release to splitter", async function () {
      const { escrow, splitter, payer, payee1, payee2, payee3 } = await loadFixture(deployAllFixture);

      const amount = ethers.parseEther("3.0");
      const releaseTime = (await time.latest()) + 3600;

      // Create escrow to splitter
      const tx = await escrow.connect(payer).createEscrow(
        await splitter.getAddress(),
        ethers.ZeroAddress,
        amount,
        releaseTime,
        "escrow to splitter",
        { value: amount }
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(log => {
        try {
          return escrow.interface.parseLog(log).name === 'EscrowCreated';
        } catch (e) {
          return false;
        }
      });
      const escrowId = escrow.interface.parseLog(event).args.escrowId;

      // Fast forward time
      await time.increaseTo(releaseTime + 1);

      // Release escrow
      await escrow.releaseEscrow(escrowId);

      // Check splitter balance
      const splitterBalance = await ethers.provider.getBalance(await splitter.getAddress());
      expect(splitterBalance).to.equal(amount);

      // Release from splitter
      await splitter.releaseEth(payee1.address);
      await splitter.releaseEth(payee2.address);
      await splitter.releaseEth(payee3.address);
    });
  });

  describe("Batch Operations with Multiple Contracts", function () {
    it("Should batch payments through processor", async function () {
      const { batchOps, payer, payee1, payee2, payee3 } = await loadFixture(deployAllFixture);

      const recipients = [payee1.address, payee2.address, payee3.address];
      const amounts = [
        ethers.parseEther("1.0"),
        ethers.parseEther("0.5"),
        ethers.parseEther("0.3")
      ];

      const totalAmount = amounts.reduce((a, b) => a + b, 0n);

      await expect(
        batchOps.connect(payer).batchEthTransfer(recipients, amounts, {
          value: totalAmount
        })
      ).to.not.be.reverted;
    });
  });
});

