const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("PaymentFactory", function () {
  async function deployFixture() {
    const [owner] = await ethers.getSigners();

    const PaymentFactory = await ethers.getContractFactory("PaymentFactory");
    const factory = await PaymentFactory.deploy(owner.address);

    return { factory, owner };
  }

  describe("Deploy Contracts", function () {
    it("Should deploy PaymentRegistry", async function () {
      const { factory, owner } = await loadFixture(deployFixture);

      await expect(
        factory.connect(owner).deployPaymentRegistry()
      ).to.emit(factory, "PaymentRegistryDeployed");
    });

    it("Should deploy Escrow", async function () {
      const { factory, owner } = await loadFixture(deployFixture);

      await expect(
        factory.connect(owner).deployEscrow()
      ).to.emit(factory, "EscrowDeployed");
    });

    it("Should deploy PaymentSplitter", async function () {
      const { factory, owner } = await loadFixture(deployFixture);

      const [, addr1, addr2] = await ethers.getSigners();
      const payees = [addr1.address, addr2.address];
      const shares = [70, 30];

      await expect(
        factory.connect(owner).deployPaymentSplitter(payees, shares)
      ).to.emit(factory, "PaymentSplitterDeployed");
    });

    it("Should deploy BatchOperations", async function () {
      const { factory, owner } = await loadFixture(deployFixture);

      await expect(
        factory.connect(owner).deployBatchOperations()
      ).to.emit(factory, "BatchOperationsDeployed");
    });
  });
});

