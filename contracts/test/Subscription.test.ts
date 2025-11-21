import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SubscriptionPayment } from '../typechain-types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { time } from '@nomicfoundation/hardhat-network-helpers';

describe('SubscriptionPayment', function () {
  let subscription: SubscriptionPayment;
  let owner: SignerWithAddress;
  let merchant: SignerWithAddress;
  let subscriber: SignerWithAddress;
  let mockToken: any;

  const MONTHLY_AMOUNT = ethers.utils.parseEther('10');
  const SUBSCRIPTION_DURATION = 30 * 24 * 60 * 60; // 30 days

  beforeEach(async function () {
    [owner, merchant, subscriber] = await ethers.getSigners();

    const SubscriptionFactory = await ethers.getContractFactory('SubscriptionPayment');
    subscription = await SubscriptionFactory.deploy();
    await subscription.deployed();

    // Deploy mock ERC20 token
    const MockToken = await ethers.getContractFactory('MockERC20');
    mockToken = await MockToken.deploy('Mock Token', 'MTK', 18);
    await mockToken.deployed();

    // Mint tokens to subscriber
    await mockToken.mint(subscriber.address, ethers.utils.parseEther('1000'));
  });

  describe('Plan Creation', function () {
    it('Should create subscription plan successfully', async function () {
      await expect(
        subscription
          .connect(merchant)
          .createPlan('Premium Plan', MONTHLY_AMOUNT, SUBSCRIPTION_DURATION, ethers.constants.AddressZero),
      )
        .to.emit(subscription, 'PlanCreated')
        .withArgs(0, merchant.address, 'Premium Plan', MONTHLY_AMOUNT, SUBSCRIPTION_DURATION);
    });

    it('Should create ERC20 subscription plan', async function () {
      await expect(
        subscription
          .connect(merchant)
          .createPlan('Premium Plan', MONTHLY_AMOUNT, SUBSCRIPTION_DURATION, mockToken.address),
      )
        .to.emit(subscription, 'PlanCreated')
        .withArgs(0, merchant.address, 'Premium Plan', MONTHLY_AMOUNT, SUBSCRIPTION_DURATION);
    });

    it('Should reject plan with zero amount', async function () {
      await expect(
        subscription.connect(merchant).createPlan('Premium Plan', 0, SUBSCRIPTION_DURATION, ethers.constants.AddressZero),
      ).to.be.revertedWith('Amount must be greater than zero');
    });

    it('Should reject plan with zero duration', async function () {
      await expect(
        subscription
          .connect(merchant)
          .createPlan('Premium Plan', MONTHLY_AMOUNT, 0, ethers.constants.AddressZero),
      ).to.be.revertedWith('Duration must be greater than zero');
    });

    it('Should reject plan with empty name', async function () {
      await expect(
        subscription.connect(merchant).createPlan('', MONTHLY_AMOUNT, SUBSCRIPTION_DURATION, ethers.constants.AddressZero),
      ).to.be.revertedWith('Plan name cannot be empty');
    });
  });

  describe('Subscription Management', function () {
    let planId: number;

    beforeEach(async function () {
      const tx = await subscription
        .connect(merchant)
        .createPlan('Premium Plan', MONTHLY_AMOUNT, SUBSCRIPTION_DURATION, ethers.constants.AddressZero);
      const receipt = await tx.wait();
      planId = receipt.events?.[0].args?.planId.toNumber();
    });

    it('Should subscribe to plan with ETH', async function () {
      await expect(
        subscription.connect(subscriber).subscribe(planId, { value: MONTHLY_AMOUNT }),
      )
        .to.emit(subscription, 'Subscribed')
        .withArgs(0, subscriber.address, planId);
    });

    it('Should subscribe to plan with ERC20', async function () {
      // Create ERC20 plan
      const tx = await subscription
        .connect(merchant)
        .createPlan('Premium Plan', MONTHLY_AMOUNT, SUBSCRIPTION_DURATION, mockToken.address);
      const receipt = await tx.wait();
      const tokenPlanId = receipt.events?.[0].args?.planId.toNumber();

      // Approve subscription contract
      await mockToken.connect(subscriber).approve(subscription.address, MONTHLY_AMOUNT);

      await expect(subscription.connect(subscriber).subscribe(tokenPlanId))
        .to.emit(subscription, 'Subscribed')
        .withArgs(1, subscriber.address, tokenPlanId);
    });

    it('Should reject subscription with insufficient payment', async function () {
      await expect(
        subscription.connect(subscriber).subscribe(planId, { value: MONTHLY_AMOUNT.div(2) }),
      ).to.be.revertedWith('Insufficient ETH sent');
    });

    it('Should reject duplicate subscription', async function () {
      await subscription.connect(subscriber).subscribe(planId, { value: MONTHLY_AMOUNT });

      await expect(
        subscription.connect(subscriber).subscribe(planId, { value: MONTHLY_AMOUNT }),
      ).to.be.revertedWith('Already subscribed');
    });

    it('Should update subscription details correctly', async function () {
      await subscription.connect(subscriber).subscribe(planId, { value: MONTHLY_AMOUNT });

      const sub = await subscription.getSubscription(0);
      expect(sub.subscriber).to.equal(subscriber.address);
      expect(sub.planId).to.equal(planId);
      expect(sub.active).to.be.true;
      expect(sub.lastPayment).to.be.closeTo(await time.latest(), 5);
      expect(sub.nextPayment).to.be.closeTo((await time.latest()) + SUBSCRIPTION_DURATION, 5);
    });
  });

  describe('Subscription Renewal', function () {
    let planId: number;
    let subId: number;

    beforeEach(async function () {
      const tx = await subscription
        .connect(merchant)
        .createPlan('Premium Plan', MONTHLY_AMOUNT, SUBSCRIPTION_DURATION, ethers.constants.AddressZero);
      const receipt = await tx.wait();
      planId = receipt.events?.[0].args?.planId.toNumber();

      const subTx = await subscription.connect(subscriber).subscribe(planId, { value: MONTHLY_AMOUNT });
      const subReceipt = await subTx.wait();
      subId = subReceipt.events?.[1].args?.subscriptionId.toNumber();
    });

    it('Should allow renewal when due', async function () {
      // Fast forward to renewal time
      await time.increase(SUBSCRIPTION_DURATION);

      await expect(subscription.connect(subscriber).renew(subId, { value: MONTHLY_AMOUNT }))
        .to.emit(subscription, 'Renewed')
        .withArgs(subId, subscriber.address);
    });

    it('Should update next payment date on renewal', async function () {
      await time.increase(SUBSCRIPTION_DURATION);

      const beforeSub = await subscription.getSubscription(subId);
      await subscription.connect(subscriber).renew(subId, { value: MONTHLY_AMOUNT });
      const afterSub = await subscription.getSubscription(subId);

      expect(afterSub.nextPayment).to.equal(beforeSub.nextPayment + SUBSCRIPTION_DURATION);
    });

    it('Should reject early renewal', async function () {
      await expect(
        subscription.connect(subscriber).renew(subId, { value: MONTHLY_AMOUNT }),
      ).to.be.revertedWith('Renewal not due yet');
    });

    it('Should allow early renewal with grace period', async function () {
      // Fast forward to 90% of duration (within grace period)
      await time.increase((SUBSCRIPTION_DURATION * 90) / 100);

      await expect(subscription.connect(subscriber).renew(subId, { value: MONTHLY_AMOUNT })).to.not.be
        .reverted;
    });

    it('Should auto-renew if enabled and balance available', async function () {
      // Enable auto-renew
      await subscription.connect(subscriber).setAutoRenew(subId, true);

      // Deposit funds for auto-renewal
      await subscription.connect(subscriber).deposit(subId, { value: MONTHLY_AMOUNT.mul(3) });

      // Fast forward past renewal
      await time.increase(SUBSCRIPTION_DURATION + 100);

      // Trigger auto-renewal check
      await subscription.processAutoRenewals([subId]);

      const sub = await subscription.getSubscription(subId);
      expect(sub.active).to.be.true;
    });

    it('Should deactivate subscription if auto-renewal fails', async function () {
      await subscription.connect(subscriber).setAutoRenew(subId, true);

      // Fast forward past renewal without depositing funds
      await time.increase(SUBSCRIPTION_DURATION + 100);

      // Attempt to renew should fail
      await subscription.processAutoRenewals([subId]);

      const sub = await subscription.getSubscription(subId);
      expect(sub.active).to.be.false;
    });
  });

  describe('Subscription Cancellation', function () {
    let planId: number;
    let subId: number;

    beforeEach(async function () {
      const tx = await subscription
        .connect(merchant)
        .createPlan('Premium Plan', MONTHLY_AMOUNT, SUBSCRIPTION_DURATION, ethers.constants.AddressZero);
      const receipt = await tx.wait();
      planId = receipt.events?.[0].args?.planId.toNumber();

      const subTx = await subscription.connect(subscriber).subscribe(planId, { value: MONTHLY_AMOUNT });
      const subReceipt = await subTx.wait();
      subId = subReceipt.events?.[1].args?.subscriptionId.toNumber();
    });

    it('Should allow subscriber to cancel', async function () {
      await expect(subscription.connect(subscriber).cancel(subId))
        .to.emit(subscription, 'Cancelled')
        .withArgs(subId, subscriber.address);
    });

    it('Should deactivate subscription on cancellation', async function () {
      await subscription.connect(subscriber).cancel(subId);

      const sub = await subscription.getSubscription(subId);
      expect(sub.active).to.be.false;
    });

    it('Should reject cancellation by non-subscriber', async function () {
      await expect(subscription.connect(merchant).cancel(subId)).to.be.revertedWith(
        'Only subscriber can cancel',
      );
    });

    it('Should reject renewal of cancelled subscription', async function () {
      await subscription.connect(subscriber).cancel(subId);

      await time.increase(SUBSCRIPTION_DURATION);

      await expect(
        subscription.connect(subscriber).renew(subId, { value: MONTHLY_AMOUNT }),
      ).to.be.revertedWith('Subscription not active');
    });

    it('Should refund unused deposit on cancellation', async function () {
      // Deposit extra funds
      const depositAmount = MONTHLY_AMOUNT.mul(2);
      await subscription.connect(subscriber).deposit(subId, { value: depositAmount });

      const initialBalance = await subscriber.getBalance();

      // Cancel and get refund
      const tx = await subscription.connect(subscriber).cancel(subId);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);

      const finalBalance = await subscriber.getBalance();
      const refund = finalBalance.add(gasUsed).sub(initialBalance);

      expect(refund).to.be.closeTo(depositAmount, ethers.utils.parseEther('0.01'));
    });
  });

  describe('Plan Management', function () {
    let planId: number;

    beforeEach(async function () {
      const tx = await subscription
        .connect(merchant)
        .createPlan('Premium Plan', MONTHLY_AMOUNT, SUBSCRIPTION_DURATION, ethers.constants.AddressZero);
      const receipt = await tx.wait();
      planId = receipt.events?.[0].args?.planId.toNumber();
    });

    it('Should allow merchant to update plan', async function () {
      const newAmount = MONTHLY_AMOUNT.mul(2);
      await subscription.connect(merchant).updatePlan(planId, newAmount, SUBSCRIPTION_DURATION);

      const plan = await subscription.getPlan(planId);
      expect(plan.amount).to.equal(newAmount);
    });

    it('Should allow merchant to deactivate plan', async function () {
      await subscription.connect(merchant).deactivatePlan(planId);

      const plan = await subscription.getPlan(planId);
      expect(plan.active).to.be.false;
    });

    it('Should reject subscription to deactivated plan', async function () {
      await subscription.connect(merchant).deactivatePlan(planId);

      await expect(
        subscription.connect(subscriber).subscribe(planId, { value: MONTHLY_AMOUNT }),
      ).to.be.revertedWith('Plan not active');
    });

    it('Should only allow merchant to update plan', async function () {
      await expect(
        subscription.connect(subscriber).updatePlan(planId, MONTHLY_AMOUNT, SUBSCRIPTION_DURATION),
      ).to.be.revertedWith('Only merchant can update');
    });

    it('Should get merchant plans correctly', async function () {
      // Create multiple plans
      await subscription.connect(merchant).createPlan('Basic Plan', MONTHLY_AMOUNT.div(2), SUBSCRIPTION_DURATION, ethers.constants.AddressZero);
      await subscription.connect(merchant).createPlan('Pro Plan', MONTHLY_AMOUNT.mul(2), SUBSCRIPTION_DURATION, ethers.constants.AddressZero);

      const plans = await subscription.getMerchantPlans(merchant.address);
      expect(plans.length).to.equal(3);
    });
  });

  describe('Deposits and Withdrawals', function () {
    let planId: number;
    let subId: number;

    beforeEach(async function () {
      const tx = await subscription
        .connect(merchant)
        .createPlan('Premium Plan', MONTHLY_AMOUNT, SUBSCRIPTION_DURATION, ethers.constants.AddressZero);
      const receipt = await tx.wait();
      planId = receipt.events?.[0].args?.planId.toNumber();

      const subTx = await subscription.connect(subscriber).subscribe(planId, { value: MONTHLY_AMOUNT });
      const subReceipt = await subTx.wait();
      subId = subReceipt.events?.[1].args?.subscriptionId.toNumber();
    });

    it('Should allow depositing funds for subscription', async function () {
      const depositAmount = MONTHLY_AMOUNT.mul(3);

      await expect(subscription.connect(subscriber).deposit(subId, { value: depositAmount }))
        .to.emit(subscription, 'Deposited')
        .withArgs(subId, depositAmount);
    });

    it('Should allow merchant to withdraw collected fees', async function () {
      // Create multiple subscriptions
      const signers = await ethers.getSigners();
      for (let i = 0; i < 5; i++) {
        await subscription.connect(signers[i]).subscribe(planId, { value: MONTHLY_AMOUNT });
      }

      const initialBalance = await merchant.getBalance();

      const tx = await subscription.connect(merchant).withdrawMerchantFunds(planId);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);

      const finalBalance = await merchant.getBalance();
      const withdrawn = finalBalance.add(gasUsed).sub(initialBalance);

      expect(withdrawn).to.be.gt(0);
    });

    it('Should track deposit balance correctly', async function () {
      const depositAmount = MONTHLY_AMOUNT.mul(2);
      await subscription.connect(subscriber).deposit(subId, { value: depositAmount });

      const sub = await subscription.getSubscription(subId);
      expect(sub.depositBalance).to.equal(depositAmount);
    });
  });

  describe('ERC20 Subscriptions', function () {
    let tokenPlanId: number;

    beforeEach(async function () {
      const tx = await subscription
        .connect(merchant)
        .createPlan('Premium Plan', MONTHLY_AMOUNT, SUBSCRIPTION_DURATION, mockToken.address);
      const receipt = await tx.wait();
      tokenPlanId = receipt.events?.[0].args?.planId.toNumber();
    });

    it('Should subscribe with ERC20 tokens', async function () {
      await mockToken.connect(subscriber).approve(subscription.address, MONTHLY_AMOUNT);

      await expect(subscription.connect(subscriber).subscribe(tokenPlanId)).to.not.be.reverted;

      const merchantBalance = await mockToken.balanceOf(merchant.address);
      expect(merchantBalance).to.equal(MONTHLY_AMOUNT);
    });

    it('Should renew with ERC20 tokens', async function () {
      await mockToken.connect(subscriber).approve(subscription.address, MONTHLY_AMOUNT.mul(2));

      const subTx = await subscription.connect(subscriber).subscribe(tokenPlanId);
      const subReceipt = await subTx.wait();
      const subId = subReceipt.events?.[2].args?.subscriptionId.toNumber();

      await time.increase(SUBSCRIPTION_DURATION);

      await expect(subscription.connect(subscriber).renew(subId)).to.not.be.reverted;
    });
  });

  describe('Gas Optimization', function () {
    it('Should use reasonable gas for plan creation', async function () {
      const tx = await subscription
        .connect(merchant)
        .createPlan('Premium Plan', MONTHLY_AMOUNT, SUBSCRIPTION_DURATION, ethers.constants.AddressZero);
      const receipt = await tx.wait();

      expect(receipt.gasUsed).to.be.lt(200000);
    });

    it('Should use reasonable gas for subscription', async function () {
      const createTx = await subscription
        .connect(merchant)
        .createPlan('Premium Plan', MONTHLY_AMOUNT, SUBSCRIPTION_DURATION, ethers.constants.AddressZero);
      const createReceipt = await createTx.wait();
      const planId = createReceipt.events?.[0].args?.planId.toNumber();

      const subTx = await subscription.connect(subscriber).subscribe(planId, { value: MONTHLY_AMOUNT });
      const subReceipt = await subTx.wait();

      expect(subReceipt.gasUsed).to.be.lt(150000);
    });
  });
});

