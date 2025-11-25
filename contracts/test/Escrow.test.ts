import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { expect } from 'chai';

import { Escrow } from '../typechain-types';

describe('Escrow', function () {
  let escrow: Escrow;
  let depositor: SignerWithAddress;
  let beneficiary: SignerWithAddress;
  let arbiter: SignerWithAddress;

  beforeEach(async function () {
    [depositor, beneficiary, arbiter] = await ethers.getSigners();

    const Escrow = await ethers.getContractFactory('Escrow');
    escrow = await Escrow.deploy();
    await escrow.waitForDeployment();
  });

  describe('Escrow Creation', function () {
    it('Should create escrow with ETH', async function () {
      const escrowAmount = ethers.parseEther('1.0');
      const escrowId = ethers.keccak256(ethers.toUtf8Bytes('escrow1'));

      await expect(
        escrow
          .connect(depositor)
          .createEscrow(escrowId, beneficiary.address, arbiter.address, { value: escrowAmount })
      ).to.not.be.reverted;
    });

    it('Should fail with zero amount', async function () {
      const escrowId = ethers.keccak256(ethers.toUtf8Bytes('escrow2'));

      await expect(
        escrow.connect(depositor).createEscrow(escrowId, beneficiary.address, arbiter.address, { value: 0 })
      ).to.be.reverted;
    });
  });

  describe('Escrow Release', function () {
    it('Should allow arbiter to release funds', async function () {
      const escrowAmount = ethers.parseEther('1.0');
      const escrowId = ethers.keccak256(ethers.toUtf8Bytes('escrow3'));

      await escrow
        .connect(depositor)
        .createEscrow(escrowId, beneficiary.address, arbiter.address, { value: escrowAmount });

      await expect(escrow.connect(arbiter).releaseEscrow(escrowId)).to.not.be.reverted;
    });

    it('Should fail if non-arbiter tries to release', async function () {
      const escrowAmount = ethers.parseEther('1.0');
      const escrowId = ethers.keccak256(ethers.toUtf8Bytes('escrow4'));

      await escrow
        .connect(depositor)
        .createEscrow(escrowId, beneficiary.address, arbiter.address, { value: escrowAmount });

      await expect(escrow.connect(depositor).releaseEscrow(escrowId)).to.be.reverted;
    });
  });
});

