const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("PaymentSplitter", function () {
  async function deployFixture() {
    const [owner, payee1, payee2, payee3] = await ethers.getSigners();

    const payees = [payee1.address, payee2.address, payee3.address];
    const shares = [70, 20, 10]; // 70%, 20%, 10%

    const PaymentSplitter = await ethers.getContractFactory("PaymentSplitter");
    const splitter = await PaymentSplitter.deploy(payees, shares, owner.address);

    return { splitter, owner, payee1, payee2, payee3, payees, shares };
  }

  describe("Deployment", function () {
    it("Should set correct shares", async function () {
      const { splitter, payee1, payee2, payee3 } = await loadFixture(deployFixture);

      expect(await splitter.getShares(payee1.address)).to.equal(70);
      expect(await splitter.getShares(payee2.address)).to.equal(20);
      expect(await splitter.getShares(payee3.address)).to.equal(10);
    });

    it("Should calculate correct total shares", async function () {
      const { splitter } = await loadFixture(deployFixture);

      expect(await splitter.getTotalShares()).to.equal(100);
    });

    it("Should store all payees", async function () {
      const { splitter, payees } = await loadFixture(deployFixture);

      const storedPayees = await splitter.getPayees();
      expect(storedPayees).to.deep.equal(payees);
    });
  });

  describe("Release ETH", function () {
    it("Should release correct shares of ETH", async function () {
      const { splitter, payee1, payee2, payee3 } = await loadFixture(deployFixture);

      // Send 1 ETH to splitter
      const amount = ethers.parseEther("1.0");
      await payee1.sendTransaction({ to: await splitter.getAddress(), value: amount });

      const payee1BalanceBefore = await ethers.provider.getBalance(payee1.address);
      const payee2BalanceBefore = await ethers.provider.getBalance(payee2.address);

      await splitter.releaseEth(payee1.address);
      await splitter.releaseEth(payee2.address);

      const payee1BalanceAfter = await ethers.provider.getBalance(payee1.address);
      const payee2BalanceAfter = await ethers.provider.getBalance(payee2.address);

      const expected1 = amount * 70n / 100n;
      const expected2 = amount * 20n / 100n;

      expect(payee1BalanceAfter - payee1BalanceBefore).to.be.closeTo(expected1, ethers.parseEther("0.01"));
      expect(payee2BalanceAfter - payee2BalanceBefore).to.be.closeTo(expected2, ethers.parseEther("0.01"));
    });

    it("Should reject release for non-payee", async function () {
      const { splitter, owner } = await loadFixture(deployFixture);

      await expect(
        splitter.releaseEth(owner.address)
      ).to.be.revertedWith("payee has no shares");
    });
  });
});

