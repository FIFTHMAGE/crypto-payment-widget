import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { expect } from 'chai';

import { PaymentProcessor } from '../typechain-types';

describe('PaymentProcessor', function () {
  let paymentProcessor: PaymentProcessor;
  let owner: SignerWithAddress;
  let merchant: SignerWithAddress;
  let customer: SignerWithAddress;

  beforeEach(async function () {
    [owner, merchant, customer] = await ethers.getSigners();

    const PaymentProcessor = await ethers.getContractFactory('PaymentProcessor');
    paymentProcessor = await PaymentProcessor.deploy();
    await paymentProcessor.waitForDeployment();
  });

  describe('Deployment', function () {
    it('Should set the right owner', async function () {
      expect(await paymentProcessor.owner()).to.equal(owner.address);
    });

    it('Should set default platform fee', async function () {
      const platformFee = await paymentProcessor.platformFee();
      expect(platformFee).to.be.gte(0);
    });
  });

  describe('ETH Payments', function () {
    it('Should process ETH payment', async function () {
      const paymentAmount = ethers.parseEther('1.0');
      const paymentId = ethers.keccak256(ethers.toUtf8Bytes('payment1'));

      await expect(
        paymentProcessor
          .connect(customer)
          .processEthPayment(paymentId, merchant.address, ethers.keccak256(ethers.toUtf8Bytes('merchant1')), '0x', {
            value: paymentAmount,
          })
      ).to.not.be.reverted;
    });

    it('Should fail with zero amount', async function () {
      const paymentId = ethers.keccak256(ethers.toUtf8Bytes('payment2'));

      await expect(
        paymentProcessor
          .connect(customer)
          .processEthPayment(paymentId, merchant.address, ethers.keccak256(ethers.toUtf8Bytes('merchant1')), '0x', {
            value: 0,
          })
      ).to.be.reverted;
    });
  });

  describe('Platform Fee', function () {
    it('Should allow owner to update fee', async function () {
      const newFee = 500;
      await paymentProcessor.connect(owner).setPlatformFee(newFee);
      expect(await paymentProcessor.platformFee()).to.equal(newFee);
    });

    it('Should reject fee updates from non-owner', async function () {
      await expect(paymentProcessor.connect(customer).setPlatformFee(500)).to.be.reverted;
    });
  });
});

