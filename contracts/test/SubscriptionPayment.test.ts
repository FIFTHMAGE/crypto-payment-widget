/**
 * Subscription Payment Contract Tests
 * Comprehensive tests for recurring payment functionality
 */

import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { SubscriptionPayment } from '../typechain-types';
import { time } from '@nomicfoundation/hardhat-network-helpers';

describe('SubscriptionPayment', function () {
  let SubscriptionPaymentFactory;
  let subscriptionPayment: SubscriptionPayment;
  let owner: SignerWithAddress;
  let merchant: SignerWithAddress;
  let subscriber: SignerWithAddress;
  let treasury: SignerWithAddress;
  let otherAccount: SignerWithAddress;

  const PLATFORM_FEE_PERCENTAGE = 250; // 2.5%
  const PLAN_PRICE = ethers.parseEther('10');
  const BILLING_INTERVAL = 30 * 24 * 60 * 60; // 30 days

  beforeEach(async function () {
    [owner, merchant, subscriber, treasury, otherAccount] = await ethers.getSigners();

    SubscriptionPaymentFactory = await ethers.getContractFactory('SubscriptionPayment');
    subscriptionPayment = await SubscriptionPaymentFactory.deploy(
      treasury.address,
      PLATFORM_FEE_PERCENTAGE,
    );
    await subscriptionPayment.waitForDeployment();
  });

  describe('Deployment', function () {
    it('Should set the correct treasury address', async function () {
      expect(await subscriptionPayment.treasury()).to.equal(treasury.address);
    });

    it('Should set the correct platform fee percentage', async function () {
      expect(await subscriptionPayment.platformFeePercentage()).to.equal(PLATFORM_FEE_PERCENTAGE);
    });

    it('Should revert if fee percentage is too high', async function () {
      await expect(
        SubscriptionPaymentFactory.deploy(treasury.address, 10001),
      ).to.be.revertedWithCustomError(subscriptionPayment, 'FeePercentageTooHigh');
    });

    it('Should revert if treasury is zero address', async function () {
      await expect(
        SubscriptionPaymentFactory.deploy(ethers.ZeroAddress, PLATFORM_FEE_PERCENTAGE),
      ).to.be.revertedWithCustomError(subscriptionPayment, 'ZeroAddressNotAllowed');
    });
  });

  describe('Subscription Plan Management', function () {
    it('Should allow merchant to create a subscription plan', async function () {
      await expect(
        subscriptionPayment
          .connect(merchant)
          .createPlan('Premium Plan', PLAN_PRICE, BILLING_INTERVAL),
      )
        .to.emit(subscriptionPayment, 'PlanCreated')
        .withArgs(0, merchant.address, PLAN_PRICE, BILLING_INTERVAL);

      const plan = await subscriptionPayment.getPlan(0);
      expect(plan.merchant).to.equal(merchant.address);
      expect(plan.name).to.equal('Premium Plan');
      expect(plan.price).to.equal(PLAN_PRICE);
      expect(plan.billingInterval).to.equal(BILLING_INTERVAL);
      expect(plan.isActive).to.be.true;
    });

    it('Should revert plan creation with zero price', async function () {
      await expect(
        subscriptionPayment.connect(merchant).createPlan('Free Plan', 0, BILLING_INTERVAL),
      ).to.be.revertedWithCustomError(subscriptionPayment, 'ZeroAmountNotAllowed');
    });

    it('Should revert plan creation with zero interval', async function () {
      await expect(
        subscriptionPayment.connect(merchant).createPlan('Invalid Plan', PLAN_PRICE, 0),
      ).to.be.revertedWithCustomError(subscriptionPayment, 'InvalidBillingInterval');
    });

    it('Should allow merchant to update plan', async function () {
      await subscriptionPayment
        .connect(merchant)
        .createPlan('Basic Plan', PLAN_PRICE, BILLING_INTERVAL);

      const newPrice = ethers.parseEther('15');
      await expect(subscriptionPayment.connect(merchant).updatePlan(0, newPrice, BILLING_INTERVAL))
        .to.emit(subscriptionPayment, 'PlanUpdated')
        .withArgs(0, newPrice, BILLING_INTERVAL);

      const plan = await subscriptionPayment.getPlan(0);
      expect(plan.price).to.equal(newPrice);
    });

    it('Should revert if non-merchant updates plan', async function () {
      await subscriptionPayment
        .connect(merchant)
        .createPlan('Basic Plan', PLAN_PRICE, BILLING_INTERVAL);

      await expect(
        subscriptionPayment
          .connect(otherAccount)
          .updatePlan(0, ethers.parseEther('20'), BILLING_INTERVAL),
      ).to.be.revertedWithCustomError(subscriptionPayment, 'UnauthorizedCaller');
    });

    it('Should allow merchant to deactivate plan', async function () {
      await subscriptionPayment
        .connect(merchant)
        .createPlan('Basic Plan', PLAN_PRICE, BILLING_INTERVAL);

      await expect(subscriptionPayment.connect(merchant).deactivatePlan(0))
        .to.emit(subscriptionPayment, 'PlanDeactivated')
        .withArgs(0);

      const plan = await subscriptionPayment.getPlan(0);
      expect(plan.isActive).to.be.false;
    });
  });

  describe('Subscription Management', function () {
    let planId: number;

    beforeEach(async function () {
      await subscriptionPayment
        .connect(merchant)
        .createPlan('Premium Plan', PLAN_PRICE, BILLING_INTERVAL);
      planId = 0;
    });

    it('Should allow subscriber to subscribe to a plan', async function () {
      await expect(
        subscriptionPayment.connect(subscriber).subscribe(planId, { value: PLAN_PRICE }),
      )
        .to.emit(subscriptionPayment, 'SubscriptionCreated')
        .withArgs(0, subscriber.address, planId, PLAN_PRICE);

      const subscription = await subscriptionPayment.getSubscription(0);
      expect(subscription.subscriber).to.equal(subscriber.address);
      expect(subscription.planId).to.equal(planId);
      expect(subscription.status).to.equal(1); // Active
    });

    it('Should revert subscription with incorrect payment', async function () {
      await expect(
        subscriptionPayment
          .connect(subscriber)
          .subscribe(planId, { value: ethers.parseEther('5') }),
      ).to.be.revertedWithCustomError(subscriptionPayment, 'IncorrectEthAmount');
    });

    it('Should revert subscription to inactive plan', async function () {
      await subscriptionPayment.connect(merchant).deactivatePlan(planId);

      await expect(
        subscriptionPayment.connect(subscriber).subscribe(planId, { value: PLAN_PRICE }),
      ).to.be.revertedWithCustomError(subscriptionPayment, 'PlanNotActive');
    });

    it('Should process subscription renewal', async function () {
      await subscriptionPayment.connect(subscriber).subscribe(planId, { value: PLAN_PRICE });

      // Move time forward
      await time.increase(BILLING_INTERVAL);

      await expect(subscriptionPayment.connect(subscriber).renew(0, { value: PLAN_PRICE }))
        .to.emit(subscriptionPayment, 'SubscriptionRenewed')
        .withArgs(0, PLAN_PRICE);

      const subscription = await subscriptionPayment.getSubscription(0);
      expect(subscription.paymentCount).to.equal(2);
    });

    it('Should not allow renewal before interval expires', async function () {
      await subscriptionPayment.connect(subscriber).subscribe(planId, { value: PLAN_PRICE });

      await expect(
        subscriptionPayment.connect(subscriber).renew(0, { value: PLAN_PRICE }),
      ).to.be.revertedWithCustomError(subscriptionPayment, 'RenewalNotDue');
    });

    it('Should allow subscriber to cancel subscription', async function () {
      await subscriptionPayment.connect(subscriber).subscribe(planId, { value: PLAN_PRICE });

      await expect(subscriptionPayment.connect(subscriber).cancel(0))
        .to.emit(subscriptionPayment, 'SubscriptionCancelled')
        .withArgs(0);

      const subscription = await subscriptionPayment.getSubscription(0);
      expect(subscription.status).to.equal(2); // Cancelled
    });

    it('Should revert if non-subscriber cancels subscription', async function () {
      await subscriptionPayment.connect(subscriber).subscribe(planId, { value: PLAN_PRICE });

      await expect(
        subscriptionPayment.connect(otherAccount).cancel(0),
      ).to.be.revertedWithCustomError(subscriptionPayment, 'UnauthorizedCaller');
    });
  });

  describe('Payment Distribution', function () {
    let planId: number;

    beforeEach(async function () {
      await subscriptionPayment
        .connect(merchant)
        .createPlan('Premium Plan', PLAN_PRICE, BILLING_INTERVAL);
      planId = 0;
    });

    it('Should distribute payment correctly on subscription', async function () {
      const feeAmount = (PLAN_PRICE * BigInt(PLATFORM_FEE_PERCENTAGE)) / 10000n;
      const merchantAmount = PLAN_PRICE - feeAmount;

      await expect(
        subscriptionPayment.connect(subscriber).subscribe(planId, { value: PLAN_PRICE }),
      ).to.changeEtherBalances(
        [subscriber, subscriptionPayment, merchant, treasury],
        [-PLAN_PRICE, 0, merchantAmount, feeAmount],
      );
    });

    it('Should distribute payment correctly on renewal', async function () {
      await subscriptionPayment.connect(subscriber).subscribe(planId, { value: PLAN_PRICE });

      await time.increase(BILLING_INTERVAL);

      const feeAmount = (PLAN_PRICE * BigInt(PLATFORM_FEE_PERCENTAGE)) / 10000n;
      const merchantAmount = PLAN_PRICE - feeAmount;

      await expect(
        subscriptionPayment.connect(subscriber).renew(0, { value: PLAN_PRICE }),
      ).to.changeEtherBalances(
        [subscriber, merchant, treasury],
        [-PLAN_PRICE, merchantAmount, feeAmount],
      );
    });
  });

  describe('Subscription Status Management', function () {
    let planId: number;

    beforeEach(async function () {
      await subscriptionPayment
        .connect(merchant)
        .createPlan('Premium Plan', PLAN_PRICE, BILLING_INTERVAL);
      planId = 0;
      await subscriptionPayment.connect(subscriber).subscribe(planId, { value: PLAN_PRICE });
    });

    it('Should mark subscription as expired after grace period', async function () {
      const gracePeriod = 7 * 24 * 60 * 60; // 7 days
      await time.increase(BILLING_INTERVAL + gracePeriod + 1);

      await expect(subscriptionPayment.markExpired(0))
        .to.emit(subscriptionPayment, 'SubscriptionExpired')
        .withArgs(0);

      const subscription = await subscriptionPayment.getSubscription(0);
      expect(subscription.status).to.equal(3); // Expired
    });

    it('Should allow pausing subscription', async function () {
      await expect(subscriptionPayment.connect(subscriber).pause(0))
        .to.emit(subscriptionPayment, 'SubscriptionPaused')
        .withArgs(0);

      const subscription = await subscriptionPayment.getSubscription(0);
      expect(subscription.status).to.equal(4); // Paused
    });

    it('Should allow resuming paused subscription', async function () {
      await subscriptionPayment.connect(subscriber).pause(0);

      await expect(subscriptionPayment.connect(subscriber).resume(0))
        .to.emit(subscriptionPayment, 'SubscriptionResumed')
        .withArgs(0);

      const subscription = await subscriptionPayment.getSubscription(0);
      expect(subscription.status).to.equal(1); // Active
    });
  });

  describe('Administrative Functions', function () {
    it('Should allow owner to update platform fee', async function () {
      const newFee = 300; // 3%
      await expect(subscriptionPayment.connect(owner).updatePlatformFee(newFee))
        .to.emit(subscriptionPayment, 'PlatformFeeUpdated')
        .withArgs(PLATFORM_FEE_PERCENTAGE, newFee);

      expect(await subscriptionPayment.platformFeePercentage()).to.equal(newFee);
    });

    it('Should revert if non-owner updates platform fee', async function () {
      await expect(
        subscriptionPayment.connect(otherAccount).updatePlatformFee(300),
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });

    it('Should allow owner to update treasury address', async function () {
      await expect(subscriptionPayment.connect(owner).updateTreasury(otherAccount.address))
        .to.emit(subscriptionPayment, 'TreasuryUpdated')
        .withArgs(treasury.address, otherAccount.address);

      expect(await subscriptionPayment.treasury()).to.equal(otherAccount.address);
    });
  });

  describe('View Functions', function () {
    it('Should return all plans for a merchant', async function () {
      await subscriptionPayment
        .connect(merchant)
        .createPlan('Plan 1', PLAN_PRICE, BILLING_INTERVAL);
      await subscriptionPayment
        .connect(merchant)
        .createPlan('Plan 2', ethers.parseEther('20'), BILLING_INTERVAL);

      const plans = await subscriptionPayment.getMerchantPlans(merchant.address);
      expect(plans.length).to.equal(2);
    });

    it('Should return all subscriptions for a subscriber', async function () {
      await subscriptionPayment
        .connect(merchant)
        .createPlan('Plan 1', PLAN_PRICE, BILLING_INTERVAL);
      await subscriptionPayment.connect(subscriber).subscribe(0, { value: PLAN_PRICE });

      await subscriptionPayment
        .connect(merchant)
        .createPlan('Plan 2', ethers.parseEther('20'), BILLING_INTERVAL);
      await subscriptionPayment
        .connect(subscriber)
        .subscribe(1, { value: ethers.parseEther('20') });

      const subscriptions = await subscriptionPayment.getSubscriberSubscriptions(subscriber.address);
      expect(subscriptions.length).to.equal(2);
    });

    it('Should check if subscription is active', async function () {
      await subscriptionPayment
        .connect(merchant)
        .createPlan('Plan 1', PLAN_PRICE, BILLING_INTERVAL);
      await subscriptionPayment.connect(subscriber).subscribe(0, { value: PLAN_PRICE });

      expect(await subscriptionPayment.isSubscriptionActive(0)).to.be.true;

      await subscriptionPayment.connect(subscriber).cancel(0);
      expect(await subscriptionPayment.isSubscriptionActive(0)).to.be.false;
    });
  });
});

