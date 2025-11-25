import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { expect } from 'chai';

import { PaymentSplitter } from '../typechain-types';

describe('PaymentSplitter', function () {
  let paymentSplitter: PaymentSplitter;
  let owner: SignerWithAddress;
  let payee1: SignerWithAddress;
  let payee2: SignerWithAddress;
  let payee3: SignerWithAddress;
  let nonPayee: SignerWithAddress;

  const shares = [50, 30, 20]; // 50%, 30%, 20%
  const paymentAmount = ethers.utils.parseEther('1.0');

  beforeEach(async function () {
    [owner, payee1, payee2, payee3, nonPayee] = await ethers.getSigners();

    const PaymentSplitterFactory = await ethers.getContractFactory('PaymentSplitter');
    paymentSplitter = await PaymentSplitterFactory.deploy();
    await paymentSplitter.deployed();
  });

  describe('Split Creation', function () {
    it('Should create a payment split successfully', async function () {
      const payees = [payee1.address, payee2.address, payee3.address];

      await expect(paymentSplitter.createSplit(payees, shares))
        .to.emit(paymentSplitter, 'SplitCreated')
        .withArgs(0, payees, shares);
    });

    it('Should reject split with mismatched arrays', async function () {
      const payees = [payee1.address, payee2.address];
      const invalidShares = [50, 30, 20]; // More shares than payees

      await expect(paymentSplitter.createSplit(payees, invalidShares)).to.be.revertedWith(
        'Payees and shares length mismatch',
      );
    });

    it('Should reject split with zero shares', async function () {
      const payees = [payee1.address, payee2.address];
      const invalidShares = [50, 0];

      await expect(paymentSplitter.createSplit(payees, invalidShares)).to.be.revertedWith(
        'Share cannot be zero',
      );
    });

    it('Should reject split with zero address', async function () {
      const payees = [payee1.address, ethers.constants.AddressZero];

      await expect(paymentSplitter.createSplit(payees, [50, 50])).to.be.revertedWith(
        'Invalid payee address',
      );
    });

    it('Should reject split with duplicate payees', async function () {
      const payees = [payee1.address, payee1.address];

      await expect(paymentSplitter.createSplit(payees, [50, 50])).to.be.revertedWith(
        'Duplicate payee',
      );
    });
  });

  describe('ETH Payment Distribution', function () {
    let splitId: number;

    beforeEach(async function () {
      const payees = [payee1.address, payee2.address, payee3.address];
      const tx = await paymentSplitter.createSplit(payees, shares);
      const receipt = await tx.wait();
      splitId = receipt.events?.[0].args?.splitId.toNumber();
    });

    it('Should distribute ETH payment correctly', async function () {
      const initialBalances = await Promise.all([
        payee1.getBalance(),
        payee2.getBalance(),
        payee3.getBalance(),
      ]);

      await paymentSplitter.splitPayment(splitId, { value: paymentAmount });

      const finalBalances = await Promise.all([
        payee1.getBalance(),
        payee2.getBalance(),
        payee3.getBalance(),
      ]);

      // Verify each payee received correct share
      expect(finalBalances[0].sub(initialBalances[0])).to.equal(paymentAmount.mul(50).div(100));
      expect(finalBalances[1].sub(initialBalances[1])).to.equal(paymentAmount.mul(30).div(100));
      expect(finalBalances[2].sub(initialBalances[2])).to.equal(paymentAmount.mul(20).div(100));
    });

    it('Should emit PaymentSplit event', async function () {
      await expect(paymentSplitter.splitPayment(splitId, { value: paymentAmount }))
        .to.emit(paymentSplitter, 'PaymentSplit')
        .withArgs(splitId, paymentAmount, ethers.constants.AddressZero);
    });

    it('Should reject zero payment', async function () {
      await expect(paymentSplitter.splitPayment(splitId, { value: 0 })).to.be.revertedWith(
        'Payment amount is zero',
      );
    });

    it('Should reject invalid split ID', async function () {
      await expect(
        paymentSplitter.splitPayment(999, { value: paymentAmount }),
      ).to.be.revertedWith('Invalid split ID');
    });
  });

  describe('ERC20 Payment Distribution', function () {
    let splitId: number;
    let mockToken: any;

    beforeEach(async function () {
      const payees = [payee1.address, payee2.address, payee3.address];
      const tx = await paymentSplitter.createSplit(payees, shares);
      const receipt = await tx.wait();
      splitId = receipt.events?.[0].args?.splitId.toNumber();

      // Deploy mock ERC20 token
      const MockToken = await ethers.getContractFactory('MockERC20');
      mockToken = await MockToken.deploy('Mock Token', 'MTK', 18);
      await mockToken.deployed();

      // Mint tokens to owner
      await mockToken.mint(owner.address, ethers.utils.parseEther('1000'));

      // Approve payment splitter
      await mockToken.approve(paymentSplitter.address, paymentAmount);
    });

    it('Should distribute ERC20 payment correctly', async function () {
      await paymentSplitter.splitTokenPayment(splitId, mockToken.address, paymentAmount);

      const payee1Balance = await mockToken.balanceOf(payee1.address);
      const payee2Balance = await mockToken.balanceOf(payee2.address);
      const payee3Balance = await mockToken.balanceOf(payee3.address);

      expect(payee1Balance).to.equal(paymentAmount.mul(50).div(100));
      expect(payee2Balance).to.equal(paymentAmount.mul(30).div(100));
      expect(payee3Balance).to.equal(paymentAmount.mul(20).div(100));
    });

    it('Should emit PaymentSplit event for token', async function () {
      await expect(paymentSplitter.splitTokenPayment(splitId, mockToken.address, paymentAmount))
        .to.emit(paymentSplitter, 'PaymentSplit')
        .withArgs(splitId, paymentAmount, mockToken.address);
    });

    it('Should reject insufficient allowance', async function () {
      const largeAmount = ethers.utils.parseEther('2000');
      await expect(
        paymentSplitter.splitTokenPayment(splitId, mockToken.address, largeAmount),
      ).to.be.revertedWith('ERC20: insufficient allowance');
    });
  });

  describe('Split Management', function () {
    let splitId: number;

    beforeEach(async function () {
      const payees = [payee1.address, payee2.address, payee3.address];
      const tx = await paymentSplitter.createSplit(payees, shares);
      const receipt = await tx.wait();
      splitId = receipt.events?.[0].args?.splitId.toNumber();
    });

    it('Should get split details correctly', async function () {
      const split = await paymentSplitter.getSplit(splitId);

      expect(split.payees).to.deep.equal([payee1.address, payee2.address, payee3.address]);
      expect(split.shares.map((s: any) => s.toNumber())).to.deep.equal(shares);
      expect(split.totalShares).to.equal(100);
    });

    it('Should calculate payee share correctly', async function () {
      const payee1Share = await paymentSplitter.calculateShare(splitId, paymentAmount, 0);
      const payee2Share = await paymentSplitter.calculateShare(splitId, paymentAmount, 1);
      const payee3Share = await paymentSplitter.calculateShare(splitId, paymentAmount, 2);

      expect(payee1Share).to.equal(paymentAmount.mul(50).div(100));
      expect(payee2Share).to.equal(paymentAmount.mul(30).div(100));
      expect(payee3Share).to.equal(paymentAmount.mul(20).div(100));
    });

    it('Should update split payees', async function () {
      const newPayees = [payee2.address, payee3.address];
      const newShares = [60, 40];

      await paymentSplitter.updateSplit(splitId, newPayees, newShares);

      const split = await paymentSplitter.getSplit(splitId);
      expect(split.payees).to.deep.equal(newPayees);
      expect(split.shares.map((s: any) => s.toNumber())).to.deep.equal(newShares);
    });

    it('Should deactivate split', async function () {
      await paymentSplitter.deactivateSplit(splitId);

      await expect(
        paymentSplitter.splitPayment(splitId, { value: paymentAmount }),
      ).to.be.revertedWith('Split is not active');
    });
  });

  describe('Edge Cases', function () {
    it('Should handle rounding correctly', async function () {
      // Create split with shares that don't divide evenly
      const payees = [payee1.address, payee2.address, payee3.address];
      const unevenShares = [33, 33, 34]; // Total 100

      const tx = await paymentSplitter.createSplit(payees, unevenShares);
      const receipt = await tx.wait();
      const splitId = receipt.events?.[0].args?.splitId.toNumber();

      // Use amount that will have remainder
      const oddAmount = ethers.utils.parseEther('1.001');

      await expect(paymentSplitter.splitPayment(splitId, { value: oddAmount })).to.not.be.reverted;
    });

    it('Should handle very small payments', async function () {
      const payees = [payee1.address, payee2.address];
      const tx = await paymentSplitter.createSplit(payees, [50, 50]);
      const receipt = await tx.wait();
      const splitId = receipt.events?.[0].args?.splitId.toNumber();

      const tinyAmount = ethers.utils.parseEther('0.000001');

      await expect(paymentSplitter.splitPayment(splitId, { value: tinyAmount })).to.not.be
        .reverted;
    });

    it('Should handle maximum number of payees', async function () {
      // Create split with many payees (test gas limits)
      const signers = await ethers.getSigners();
      const maxPayees = signers.slice(0, 10); // Test with 10 payees
      const equalShares = Array(10).fill(10); // Equal 10% shares

      await expect(
        paymentSplitter.createSplit(
          maxPayees.map(s => s.address),
          equalShares,
        ),
      ).to.not.be.reverted;
    });
  });

  describe('Security', function () {
    let splitId: number;

    beforeEach(async function () {
      const payees = [payee1.address, payee2.address];
      const tx = await paymentSplitter.createSplit(payees, [50, 50]);
      const receipt = await tx.wait();
      splitId = receipt.events?.[0].args?.splitId.toNumber();
    });

    it('Should protect against reentrancy', async function () {
      // Deploy malicious receiver
      const MaliciousReceiver = await ethers.getContractFactory('MaliciousReceiver');
      const malicious = await MaliciousReceiver.deploy(paymentSplitter.address);
      await malicious.deployed();

      const payees = [malicious.address, payee2.address];
      const tx = await paymentSplitter.createSplit(payees, [50, 50]);
      const receipt = await tx.wait();
      const maliciousSplitId = receipt.events?.[0].args?.splitId.toNumber();

      // Attempt reentrancy attack
      await expect(
        paymentSplitter.splitPayment(maliciousSplitId, { value: paymentAmount }),
      ).to.be.revertedWith('ReentrancyGuard: reentrant call');
    });

    it('Should only allow split creator to update', async function () {
      await expect(
        paymentSplitter.connect(nonPayee).updateSplit(splitId, [payee3.address], [100]),
      ).to.be.revertedWith('Not split creator');
    });

    it('Should only allow split creator to deactivate', async function () {
      await expect(paymentSplitter.connect(nonPayee).deactivateSplit(splitId)).to.be.revertedWith(
        'Not split creator',
      );
    });
  });

  describe('Gas Optimization', function () {
    it('Should use reasonable gas for split creation', async function () {
      const payees = [payee1.address, payee2.address, payee3.address];
      const tx = await paymentSplitter.createSplit(payees, shares);
      const receipt = await tx.wait();

      // Gas should be reasonable (< 200k for 3 payees)
      expect(receipt.gasUsed).to.be.lt(200000);
    });

    it('Should use reasonable gas for payment distribution', async function () {
      const payees = [payee1.address, payee2.address, payee3.address];
      const tx = await paymentSplitter.createSplit(payees, shares);
      const receipt = await tx.wait();
      const splitId = receipt.events?.[0].args?.splitId.toNumber();

      const paymentTx = await paymentSplitter.splitPayment(splitId, { value: paymentAmount });
      const paymentReceipt = await paymentTx.wait();

      // Payment distribution gas should be reasonable
      expect(paymentReceipt.gasUsed).to.be.lt(150000);
    });
  });
});

