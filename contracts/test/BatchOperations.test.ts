import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BatchOperations } from '../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

describe('BatchOperations', function () {
  let batchOperations: BatchOperations;
  let sender: SignerWithAddress;
  let recipient1: SignerWithAddress;
  let recipient2: SignerWithAddress;
  let recipient3: SignerWithAddress;

  beforeEach(async function () {
    [sender, recipient1, recipient2, recipient3] = await ethers.getSigners();

    const BatchOperations = await ethers.getContractFactory('BatchOperations');
    batchOperations = await BatchOperations.deploy();
    await batchOperations.waitForDeployment();
  });

  describe('Batch ETH Transfers', function () {
    it('Should process batch ETH payments', async function () {
      const recipients = [recipient1.address, recipient2.address, recipient3.address];
      const amounts = [ethers.parseEther('0.5'), ethers.parseEther('0.3'), ethers.parseEther('0.2')];
      const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0n);

      await expect(
        batchOperations.connect(sender).batchTransferEth(recipients, amounts, { value: totalAmount })
      ).to.not.be.reverted;
    });

    it('Should fail with mismatched arrays', async function () {
      const recipients = [recipient1.address, recipient2.address];
      const amounts = [ethers.parseEther('0.5')];

      await expect(
        batchOperations.connect(sender).batchTransferEth(recipients, amounts, {
          value: ethers.parseEther('0.5'),
        })
      ).to.be.reverted;
    });

    it('Should fail with insufficient funds', async function () {
      const recipients = [recipient1.address, recipient2.address];
      const amounts = [ethers.parseEther('0.5'), ethers.parseEther('0.5')];

      await expect(
        batchOperations.connect(sender).batchTransferEth(recipients, amounts, {
          value: ethers.parseEther('0.8'),
        })
      ).to.be.reverted;
    });
  });

  describe('Batch Validation', function () {
    it('Should reject empty recipient arrays', async function () {
      await expect(batchOperations.connect(sender).batchTransferEth([], [], { value: 0 })).to.be.reverted;
    });

    it('Should reject zero address recipients', async function () {
      const recipients = [ethers.ZeroAddress];
      const amounts = [ethers.parseEther('1.0')];

      await expect(
        batchOperations.connect(sender).batchTransferEth(recipients, amounts, {
          value: ethers.parseEther('1.0'),
        })
      ).to.be.reverted;
    });
  });
});

