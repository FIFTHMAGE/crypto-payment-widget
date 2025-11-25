import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { time } from '@nomicfoundation/hardhat-network-helpers';

import { PaymentStreaming } from '../typechain-types';

describe('PaymentStreaming', function () {
  let streaming: PaymentStreaming;
  let owner: SignerWithAddress;
  let sender: SignerWithAddress;
  let recipient: SignerWithAddress;
  let mockToken: any;

  const STREAM_DURATION = 3600; // 1 hour
  const STREAM_AMOUNT = ethers.utils.parseEther('100');

  beforeEach(async function () {
    [owner, sender, recipient] = await ethers.getSigners();

    const StreamingFactory = await ethers.getContractFactory('PaymentStreaming');
    streaming = await StreamingFactory.deploy();
    await streaming.deployed();

    // Deploy mock ERC20 token
    const MockToken = await ethers.getContractFactory('MockERC20');
    mockToken = await MockToken.deploy('Mock Token', 'MTK', 18);
    await mockToken.deployed();

    // Mint tokens to sender
    await mockToken.mint(sender.address, ethers.utils.parseEther('1000'));
  });

  describe('Stream Creation', function () {
    it('Should create ETH stream successfully', async function () {
      const startTime = (await time.latest()) + 60;

      await expect(
        streaming
          .connect(sender)
          .createStream(recipient.address, STREAM_AMOUNT, startTime, STREAM_DURATION, ethers.constants.AddressZero, {
            value: STREAM_AMOUNT,
          }),
      )
        .to.emit(streaming, 'StreamCreated')
        .withArgs(0, sender.address, recipient.address, STREAM_AMOUNT, startTime, STREAM_DURATION);
    });

    it('Should create ERC20 stream successfully', async function () {
      // Approve streaming contract
      await mockToken.connect(sender).approve(streaming.address, STREAM_AMOUNT);

      const startTime = (await time.latest()) + 60;

      await expect(
        streaming
          .connect(sender)
          .createStream(recipient.address, STREAM_AMOUNT, startTime, STREAM_DURATION, mockToken.address),
      )
        .to.emit(streaming, 'StreamCreated')
        .withArgs(0, sender.address, recipient.address, STREAM_AMOUNT, startTime, STREAM_DURATION);
    });

    it('Should reject stream with zero amount', async function () {
      const startTime = (await time.latest()) + 60;

      await expect(
        streaming
          .connect(sender)
          .createStream(recipient.address, 0, startTime, STREAM_DURATION, ethers.constants.AddressZero),
      ).to.be.revertedWith('Amount must be greater than zero');
    });

    it('Should reject stream with zero recipient', async function () {
      const startTime = (await time.latest()) + 60;

      await expect(
        streaming
          .connect(sender)
          .createStream(
            ethers.constants.AddressZero,
            STREAM_AMOUNT,
            startTime,
            STREAM_DURATION,
            ethers.constants.AddressZero,
            { value: STREAM_AMOUNT },
          ),
      ).to.be.revertedWith('Invalid recipient');
    });

    it('Should reject stream with past start time', async function () {
      const pastTime = (await time.latest()) - 60;

      await expect(
        streaming
          .connect(sender)
          .createStream(recipient.address, STREAM_AMOUNT, pastTime, STREAM_DURATION, ethers.constants.AddressZero, {
            value: STREAM_AMOUNT,
          }),
      ).to.be.revertedWith('Start time must be in the future');
    });

    it('Should reject stream with zero duration', async function () {
      const startTime = (await time.latest()) + 60;

      await expect(
        streaming
          .connect(sender)
          .createStream(recipient.address, STREAM_AMOUNT, startTime, 0, ethers.constants.AddressZero, {
            value: STREAM_AMOUNT,
          }),
      ).to.be.revertedWith('Duration must be greater than zero');
    });

    it('Should reject ETH stream with insufficient value', async function () {
      const startTime = (await time.latest()) + 60;

      await expect(
        streaming
          .connect(sender)
          .createStream(recipient.address, STREAM_AMOUNT, startTime, STREAM_DURATION, ethers.constants.AddressZero, {
            value: STREAM_AMOUNT.div(2),
          }),
      ).to.be.revertedWith('Insufficient ETH sent');
    });
  });

  describe('Stream Withdrawal', function () {
    let streamId: number;
    let startTime: number;

    beforeEach(async function () {
      startTime = (await time.latest()) + 10;
      const tx = await streaming
        .connect(sender)
        .createStream(recipient.address, STREAM_AMOUNT, startTime, STREAM_DURATION, ethers.constants.AddressZero, {
          value: STREAM_AMOUNT,
        });
      const receipt = await tx.wait();
      streamId = receipt.events?.[0].args?.streamId.toNumber();
    });

    it('Should calculate available balance correctly', async function () {
      // Move to 25% through stream
      await time.increaseTo(startTime + STREAM_DURATION / 4);

      const available = await streaming.availableBalance(streamId);
      const expected = STREAM_AMOUNT.mul(25).div(100);

      // Allow for small rounding difference
      expect(available).to.be.closeTo(expected, ethers.utils.parseEther('0.1'));
    });

    it('Should allow recipient to withdraw available balance', async function () {
      // Move to 50% through stream
      await time.increaseTo(startTime + STREAM_DURATION / 2);

      const initialBalance = await recipient.getBalance();
      const available = await streaming.availableBalance(streamId);

      const tx = await streaming.connect(recipient).withdrawStream(streamId, available);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);

      const finalBalance = await recipient.getBalance();
      expect(finalBalance.add(gasUsed).sub(initialBalance)).to.equal(available);
    });

    it('Should emit StreamWithdrawn event', async function () {
      await time.increaseTo(startTime + STREAM_DURATION / 2);
      const available = await streaming.availableBalance(streamId);

      await expect(streaming.connect(recipient).withdrawStream(streamId, available))
        .to.emit(streaming, 'StreamWithdrawn')
        .withArgs(streamId, recipient.address, available);
    });

    it('Should reject withdrawal before stream starts', async function () {
      await expect(streaming.connect(recipient).withdrawStream(streamId, 100)).to.be.revertedWith(
        'Stream not started yet',
      );
    });

    it('Should reject withdrawal of more than available', async function () {
      await time.increaseTo(startTime + STREAM_DURATION / 2);

      await expect(streaming.connect(recipient).withdrawStream(streamId, STREAM_AMOUNT)).to.be.revertedWith(
        'Insufficient available balance',
      );
    });

    it('Should reject withdrawal by non-recipient', async function () {
      await time.increaseTo(startTime + STREAM_DURATION / 2);
      const available = await streaming.availableBalance(streamId);

      await expect(streaming.connect(sender).withdrawStream(streamId, available)).to.be.revertedWith(
        'Only recipient can withdraw',
      );
    });

    it('Should allow full withdrawal after stream ends', async function () {
      await time.increaseTo(startTime + STREAM_DURATION + 1);

      const available = await streaming.availableBalance(streamId);
      expect(available).to.equal(STREAM_AMOUNT);

      await expect(streaming.connect(recipient).withdrawStream(streamId, available)).to.not.be.reverted;
    });

    it('Should update withdrawn amount correctly', async function () {
      await time.increaseTo(startTime + STREAM_DURATION / 2);
      const firstWithdraw = ethers.utils.parseEther('25');

      await streaming.connect(recipient).withdrawStream(streamId, firstWithdraw);

      const stream = await streaming.getStream(streamId);
      expect(stream.withdrawn).to.equal(firstWithdraw);

      await time.increase(STREAM_DURATION / 4);
      const secondWithdraw = ethers.utils.parseEther('25');

      await streaming.connect(recipient).withdrawStream(streamId, secondWithdraw);

      const updatedStream = await streaming.getStream(streamId);
      expect(updatedStream.withdrawn).to.equal(firstWithdraw.add(secondWithdraw));
    });
  });

  describe('Stream Cancellation', function () {
    let streamId: number;
    let startTime: number;

    beforeEach(async function () {
      startTime = (await time.latest()) + 10;
      const tx = await streaming
        .connect(sender)
        .createStream(recipient.address, STREAM_AMOUNT, startTime, STREAM_DURATION, ethers.constants.AddressZero, {
          value: STREAM_AMOUNT,
        });
      const receipt = await tx.wait();
      streamId = receipt.events?.[0].args?.streamId.toNumber();
    });

    it('Should allow sender to cancel stream', async function () {
      await expect(streaming.connect(sender).cancelStream(streamId))
        .to.emit(streaming, 'StreamCancelled')
        .withArgs(streamId);
    });

    it('Should refund remaining balance to sender on cancellation', async function () {
      await time.increaseTo(startTime + STREAM_DURATION / 2);

      // Recipient withdraws half
      const halfAmount = STREAM_AMOUNT.div(2);
      await streaming.connect(recipient).withdrawStream(streamId, halfAmount);

      const initialBalance = await sender.getBalance();

      // Sender cancels
      const tx = await streaming.connect(sender).cancelStream(streamId);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);

      const finalBalance = await sender.getBalance();
      const refund = finalBalance.add(gasUsed).sub(initialBalance);

      expect(refund).to.be.closeTo(halfAmount, ethers.utils.parseEther('0.01'));
    });

    it('Should reject cancellation by non-sender', async function () {
      await expect(streaming.connect(recipient).cancelStream(streamId)).to.be.revertedWith(
        'Only sender can cancel',
      );
    });

    it('Should reject double cancellation', async function () {
      await streaming.connect(sender).cancelStream(streamId);

      await expect(streaming.connect(sender).cancelStream(streamId)).to.be.revertedWith('Stream already cancelled');
    });

    it('Should reject withdrawal from cancelled stream', async function () {
      await streaming.connect(sender).cancelStream(streamId);
      await time.increaseTo(startTime + STREAM_DURATION / 2);

      await expect(
        streaming.connect(recipient).withdrawStream(streamId, ethers.utils.parseEther('1')),
      ).to.be.revertedWith('Stream already cancelled');
    });
  });

  describe('ERC20 Streams', function () {
    let streamId: number;
    let startTime: number;

    beforeEach(async function () {
      await mockToken.connect(sender).approve(streaming.address, STREAM_AMOUNT);
      startTime = (await time.latest()) + 10;

      const tx = await streaming
        .connect(sender)
        .createStream(recipient.address, STREAM_AMOUNT, startTime, STREAM_DURATION, mockToken.address);
      const receipt = await tx.wait();
      streamId = receipt.events?.[1].args?.streamId.toNumber();
    });

    it('Should withdraw ERC20 tokens correctly', async function () {
      await time.increaseTo(startTime + STREAM_DURATION / 2);

      const available = await streaming.availableBalance(streamId);
      await streaming.connect(recipient).withdrawStream(streamId, available);

      const balance = await mockToken.balanceOf(recipient.address);
      expect(balance).to.equal(available);
    });

    it('Should refund ERC20 tokens on cancellation', async function () {
      await time.increaseTo(startTime + STREAM_DURATION / 4);

      const initialBalance = await mockToken.balanceOf(sender.address);
      await streaming.connect(sender).cancelStream(streamId);

      const finalBalance = await mockToken.balanceOf(sender.address);
      const refund = finalBalance.sub(initialBalance);

      expect(refund).to.be.gt(0);
    });
  });

  describe('Stream Management', function () {
    it('Should get stream details correctly', async function () {
      const startTime = (await time.latest()) + 60;
      const tx = await streaming
        .connect(sender)
        .createStream(recipient.address, STREAM_AMOUNT, startTime, STREAM_DURATION, ethers.constants.AddressZero, {
          value: STREAM_AMOUNT,
        });
      const receipt = await tx.wait();
      const streamId = receipt.events?.[0].args?.streamId.toNumber();

      const stream = await streaming.getStream(streamId);

      expect(stream.sender).to.equal(sender.address);
      expect(stream.recipient).to.equal(recipient.address);
      expect(stream.totalAmount).to.equal(STREAM_AMOUNT);
      expect(stream.startTime).to.equal(startTime);
      expect(stream.duration).to.equal(STREAM_DURATION);
      expect(stream.withdrawn).to.equal(0);
      expect(stream.cancelled).to.equal(false);
    });

    it('Should list active streams for recipient', async function () {
      const startTime = (await time.latest()) + 60;

      // Create multiple streams
      await streaming
        .connect(sender)
        .createStream(recipient.address, STREAM_AMOUNT, startTime, STREAM_DURATION, ethers.constants.AddressZero, {
          value: STREAM_AMOUNT,
        });

      await streaming
        .connect(sender)
        .createStream(recipient.address, STREAM_AMOUNT, startTime, STREAM_DURATION, ethers.constants.AddressZero, {
          value: STREAM_AMOUNT,
        });

      const activeStreams = await streaming.getRecipientStreams(recipient.address);
      expect(activeStreams.length).to.equal(2);
    });

    it('Should list active streams for sender', async function () {
      const startTime = (await time.latest()) + 60;

      await streaming
        .connect(sender)
        .createStream(recipient.address, STREAM_AMOUNT, startTime, STREAM_DURATION, ethers.constants.AddressZero, {
          value: STREAM_AMOUNT,
        });

      const senderStreams = await streaming.getSenderStreams(sender.address);
      expect(senderStreams.length).to.equal(1);
    });
  });

  describe('Edge Cases', function () {
    it('Should handle very small stream amounts', async function () {
      const tinyAmount = ethers.utils.parseEther('0.000001');
      const startTime = (await time.latest()) + 10;

      await expect(
        streaming
          .connect(sender)
          .createStream(recipient.address, tinyAmount, startTime, STREAM_DURATION, ethers.constants.AddressZero, {
            value: tinyAmount,
          }),
      ).to.not.be.reverted;
    });

    it('Should handle very long duration', async function () {
      const longDuration = 365 * 24 * 60 * 60; // 1 year
      const startTime = (await time.latest()) + 10;

      await expect(
        streaming
          .connect(sender)
          .createStream(recipient.address, STREAM_AMOUNT, startTime, longDuration, ethers.constants.AddressZero, {
            value: STREAM_AMOUNT,
          }),
      ).to.not.be.reverted;
    });

    it('Should handle rounding in withdrawal calculations', async function () {
      const oddAmount = ethers.utils.parseEther('99.999999999');
      const oddDuration = 7777;
      const startTime = (await time.latest()) + 10;

      const tx = await streaming
        .connect(sender)
        .createStream(recipient.address, oddAmount, startTime, oddDuration, ethers.constants.AddressZero, {
          value: oddAmount,
        });
      const receipt = await tx.wait();
      const streamId = receipt.events?.[0].args?.streamId.toNumber();

      await time.increaseTo(startTime + oddDuration / 3);

      const available = await streaming.availableBalance(streamId);
      await expect(streaming.connect(recipient).withdrawStream(streamId, available)).to.not.be.reverted;
    });
  });

  describe('Gas Optimization', function () {
    it('Should use reasonable gas for stream creation', async function () {
      const startTime = (await time.latest()) + 60;

      const tx = await streaming
        .connect(sender)
        .createStream(recipient.address, STREAM_AMOUNT, startTime, STREAM_DURATION, ethers.constants.AddressZero, {
          value: STREAM_AMOUNT,
        });
      const receipt = await tx.wait();

      expect(receipt.gasUsed).to.be.lt(150000);
    });

    it('Should use reasonable gas for withdrawal', async function () {
      const startTime = (await time.latest()) + 10;
      const tx = await streaming
        .connect(sender)
        .createStream(recipient.address, STREAM_AMOUNT, startTime, STREAM_DURATION, ethers.constants.AddressZero, {
          value: STREAM_AMOUNT,
        });
      const receipt = await tx.wait();
      const streamId = receipt.events?.[0].args?.streamId.toNumber();

      await time.increaseTo(startTime + STREAM_DURATION / 2);
      const available = await streaming.availableBalance(streamId);

      const withdrawTx = await streaming.connect(recipient).withdrawStream(streamId, available);
      const withdrawReceipt = await withdrawTx.wait();

      expect(withdrawReceipt.gasUsed).to.be.lt(100000);
    });
  });
});

