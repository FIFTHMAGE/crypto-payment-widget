const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Escrow", function () {
  async function deployFixture() {
    const [owner, payer, payee] = await ethers.getSigners();

    const Escrow = await ethers.getContractFactory("Escrow");
    const escrow = await Escrow.deploy(owner.address);

    return { escrow, owner, payer, payee };
  }

  describe("Create Escrow", function () {
    it("Should create escrow with future release time", async function () {
      const { escrow, payer, payee } = await loadFixture(deployFixture);

      const amount = ethers.parseEther("1.0");
      const releaseTime = (await time.latest()) + 3600; // 1 hour

      await expect(
        escrow.connect(payer).createEscrow(
          payee.address,
          ethers.ZeroAddress,
          amount,
          releaseTime,
          "test escrow",
          { value: amount }
        )
      ).to.emit(escrow, "EscrowCreated");
    });

    it("Should reject past release time", async function () {
      const { escrow, payer, payee } = await loadFixture(deployFixture);

      const amount = ethers.parseEther("1.0");
      const releaseTime = (await time.latest()) - 3600; // Past time

      await expect(
        escrow.connect(payer).createEscrow(
          payee.address,
          ethers.ZeroAddress,
          amount,
          releaseTime,
          "test",
          { value: amount }
        )
      ).to.be.revertedWith("Release time must be in the future");
    });
  });

  describe("Release Escrow", function () {
    it("Should release after time passes", async function () {
      const { escrow, payer, payee } = await loadFixture(deployFixture);

      const amount = ethers.parseEther("1.0");
      const releaseTime = (await time.latest()) + 3600;

      const tx = await escrow.connect(payer).createEscrow(
        payee.address,
        ethers.ZeroAddress,
        amount,
        releaseTime,
        "test",
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

      const payeeBalanceBefore = await ethers.provider.getBalance(payee.address);

      await escrow.releaseEscrow(escrowId);

      const payeeBalanceAfter = await ethers.provider.getBalance(payee.address);

      expect(payeeBalanceAfter - payeeBalanceBefore).to.equal(amount);
    });

    it("Should allow payer to release early", async function () {
      const { escrow, payer, payee } = await loadFixture(deployFixture);

      const amount = ethers.parseEther("1.0");
      const releaseTime = (await time.latest()) + 3600;

      const tx = await escrow.connect(payer).createEscrow(
        payee.address,
        ethers.ZeroAddress,
        amount,
        releaseTime,
        "test",
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

      await expect(
        escrow.connect(payer).releaseEscrow(escrowId)
      ).to.emit(escrow, "EscrowReleased");
    });
  });

  describe("Refund Escrow", function () {
    it("Should refund to payer", async function () {
      const { escrow, payer, payee } = await loadFixture(deployFixture);

      const amount = ethers.parseEther("1.0");
      const releaseTime = (await time.latest()) + 3600;

      const tx = await escrow.connect(payer).createEscrow(
        payee.address,
        ethers.ZeroAddress,
        amount,
        releaseTime,
        "test",
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

      await expect(
        escrow.connect(payer).refundEscrow(escrowId)
      ).to.emit(escrow, "EscrowRefunded");
    });

    it("Should reject refund from non-payer", async function () {
      const { escrow, payer, payee } = await loadFixture(deployFixture);

      const amount = ethers.parseEther("1.0");
      const releaseTime = (await time.latest()) + 3600;

      const tx = await escrow.connect(payer).createEscrow(
        payee.address,
        ethers.ZeroAddress,
        amount,
        releaseTime,
        "test",
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

      await expect(
        escrow.connect(payee).refundEscrow(escrowId)
      ).to.be.revertedWith("Only payer can refund");
    });
  });
});

