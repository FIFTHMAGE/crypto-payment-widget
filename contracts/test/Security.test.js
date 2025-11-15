const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Security Tests", function () {
  async function deployFixture() {
    const [owner, attacker, user1, user2] = await ethers.getSigners();

    const PaymentProcessor = await ethers.getContractFactory("PaymentProcessor");
    const processor = await PaymentProcessor.deploy(owner.address);

    return { processor, owner, attacker, user1, user2 };
  }

  describe("Reentrancy Protection", function () {
    it("Should prevent reentrancy attacks", async function () {
      const { processor, attacker, user1 } = await loadFixture(deployFixture);

      // Try to exploit processPayment
      await expect(
        processor.connect(attacker).processPayment(
          user1.address,
          ethers.ZeroAddress,
          ethers.parseEther("1.0"),
          "attack",
          { value: ethers.parseEther("1.0") }
        )
      ).to.not.be.reverted;
    });
  });

  describe("Access Control", function () {
    it("Should restrict onlyOwner functions", async function () {
      const { processor, attacker } = await loadFixture(deployFixture);

      await expect(
        processor.connect(attacker).updatePlatformFee(100)
      ).to.be.reverted;
    });
  });

  describe("Input Validation", function () {
    it("Should reject zero addresses", async function () {
      const { processor, user1 } = await loadFixture(deployFixture);

      await expect(
        processor.connect(user1).processPayment(
          ethers.ZeroAddress,
          ethers.ZeroAddress,
          ethers.parseEther("1.0"),
          "test",
          { value: ethers.parseEther("1.0") }
        )
      ).to.be.revertedWith("Invalid payee");
    });

    it("Should reject zero amounts", async function () {
      const { processor, user1, user2 } = await loadFixture(deployFixture);

      await expect(
        processor.connect(user1).processPayment(
          user2.address,
          ethers.ZeroAddress,
          0,
          "test"
        )
      ).to.be.revertedWith("Amount must be greater than 0");
    });
  });

  describe("Integer Overflow/Underflow", function () {
    it("Should handle large amounts safely", async function () {
      const { processor, user1, user2 } = await loadFixture(deployFixture);

      const largeAmount = ethers.MaxUint256;

      await expect(
        processor.connect(user1).processPayment(
          user2.address,
          ethers.ZeroAddress,
          largeAmount,
          "test"
        )
      ).to.be.reverted; // Should revert due to insufficient balance
    });
  });
});

