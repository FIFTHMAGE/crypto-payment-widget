const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("BatchOperations", function () {
  async function deployFixture() {
    const [owner, sender, recipient1, recipient2, recipient3] = await ethers.getSigners();

    const BatchOperations = await ethers.getContractFactory("BatchOperations");
    const batchOps = await BatchOperations.deploy(owner.address);

    return { batchOps, owner, sender, recipient1, recipient2, recipient3 };
  }

  describe("Batch ETH Transfer", function () {
    it("Should send ETH to multiple recipients", async function () {
      const { batchOps, sender, recipient1, recipient2, recipient3 } = await loadFixture(deployFixture);

      const recipients = [recipient1.address, recipient2.address, recipient3.address];
      const amounts = [
        ethers.parseEther("1.0"),
        ethers.parseEther("0.5"),
        ethers.parseEther("0.3")
      ];

      const totalAmount = amounts.reduce((a, b) => a + b, 0n);

      const recipient1BalanceBefore = await ethers.provider.getBalance(recipient1.address);

      await batchOps.connect(sender).batchEthTransfer(recipients, amounts, {
        value: totalAmount
      });

      const recipient1BalanceAfter = await ethers.provider.getBalance(recipient1.address);

      expect(recipient1BalanceAfter - recipient1BalanceBefore).to.equal(ethers.parseEther("1.0"));
    });

    it("Should revert on incorrect total amount", async function () {
      const { batchOps, sender, recipient1, recipient2 } = await loadFixture(deployFixture);

      const recipients = [recipient1.address, recipient2.address];
      const amounts = [ethers.parseEther("1.0"), ethers.parseEther("0.5")];

      await expect(
        batchOps.connect(sender).batchEthTransfer(recipients, amounts, {
          value: ethers.parseEther("1.0") // Should be 1.5
        })
      ).to.be.revertedWith("Incorrect ETH amount sent");
    });
  });
});

