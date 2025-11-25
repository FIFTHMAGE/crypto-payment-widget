import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { time } from '@nomicfoundation/hardhat-network-helpers';

import { MilestonePayment } from '../typechain-types';

describe('MilestonePayment', function () {
  let milestonePayment: MilestonePayment;
  let owner: SignerWithAddress;
  let client: SignerWithAddress;
  let contractor: SignerWithAddress;
  let mockToken: any;

  const PROJECT_AMOUNT = ethers.utils.parseEther('100');

  beforeEach(async function () {
    [owner, client, contractor] = await ethers.getSigners();

    const MilestoneFactory = await ethers.getContractFactory('MilestonePayment');
    milestonePayment = await MilestoneFactory.deploy();
    await milestonePayment.deployed();

    // Deploy mock ERC20 token
    const MockToken = await ethers.getContractFactory('MockERC20');
    mockToken = await MockToken.deploy('Mock Token', 'MTK', 18);
    await mockToken.deployed();

    // Mint tokens to client
    await mockToken.mint(client.address, ethers.utils.parseEther('1000'));
  });

  describe('Project Creation', function () {
    it('Should create a project with milestones', async function () {
      const milestoneAmounts = [
        ethers.utils.parseEther('30'),
        ethers.utils.parseEther('40'),
        ethers.utils.parseEther('30'),
      ];

      await expect(
        milestonePayment
          .connect(client)
          .createProject(contractor.address, milestoneAmounts, ethers.constants.AddressZero, {
            value: PROJECT_AMOUNT,
          }),
      )
        .to.emit(milestonePayment, 'ProjectCreated')
        .withArgs(0, client.address, contractor.address, PROJECT_AMOUNT);
    });

    it('Should reject project with mismatched amount', async function () {
      const milestoneAmounts = [
        ethers.utils.parseEther('30'),
        ethers.utils.parseEther('40'),
        ethers.utils.parseEther('40'), // Total = 110, but sent 100
      ];

      await expect(
        milestonePayment
          .connect(client)
          .createProject(contractor.address, milestoneAmounts, ethers.constants.AddressZero, {
            value: PROJECT_AMOUNT,
          }),
      ).to.be.revertedWith('Total milestone amounts mismatch');
    });

    it('Should reject project with no milestones', async function () {
      await expect(
        milestonePayment
          .connect(client)
          .createProject(contractor.address, [], ethers.constants.AddressZero, {
            value: PROJECT_AMOUNT,
          }),
      ).to.be.revertedWith('Must have at least one milestone');
    });

    it('Should reject project with zero contractor address', async function () {
      const milestoneAmounts = [PROJECT_AMOUNT];

      await expect(
        milestonePayment
          .connect(client)
          .createProject(ethers.constants.AddressZero, milestoneAmounts, ethers.constants.AddressZero, {
            value: PROJECT_AMOUNT,
          }),
      ).to.be.revertedWith('Invalid contractor address');
    });

    it('Should create project with ERC20 tokens', async function () {
      const milestoneAmounts = [
        ethers.utils.parseEther('50'),
        ethers.utils.parseEther('50'),
      ];

      await mockToken.connect(client).approve(milestonePayment.address, PROJECT_AMOUNT);

      await expect(
        milestonePayment
          .connect(client)
          .createProject(contractor.address, milestoneAmounts, mockToken.address),
      ).to.not.be.reverted;
    });
  });

  describe('Milestone Approval', function () {
    let projectId: number;

    beforeEach(async function () {
      const milestoneAmounts = [
        ethers.utils.parseEther('30'),
        ethers.utils.parseEther('30'),
        ethers.utils.parseEther('40'),
      ];

      const tx = await milestonePayment
        .connect(client)
        .createProject(contractor.address, milestoneAmounts, ethers.constants.AddressZero, {
          value: PROJECT_AMOUNT,
        });
      const receipt = await tx.wait();
      projectId = receipt.events?.[0].args?.projectId.toNumber();
    });

    it('Should allow client to approve milestone', async function () {
      await expect(milestonePayment.connect(client).approveMilestone(projectId, 0))
        .to.emit(milestonePayment, 'MilestoneApproved')
        .withArgs(projectId, 0);
    });

    it('Should release payment on milestone approval', async function () {
      const initialBalance = await contractor.getBalance();

      await milestonePayment.connect(client).approveMilestone(projectId, 0);

      const finalBalance = await contractor.getBalance();
      const payment = finalBalance.sub(initialBalance);

      expect(payment).to.equal(ethers.utils.parseEther('30'));
    });

    it('Should reject approval by non-client', async function () {
      await expect(
        milestonePayment.connect(contractor).approveMilestone(projectId, 0),
      ).to.be.revertedWith('Only client can approve');
    });

    it('Should reject double approval', async function () {
      await milestonePayment.connect(client).approveMilestone(projectId, 0);

      await expect(
        milestonePayment.connect(client).approveMilestone(projectId, 0),
      ).to.be.revertedWith('Milestone already approved');
    });

    it('Should approve milestones in any order', async function () {
      await milestonePayment.connect(client).approveMilestone(projectId, 2);
      await milestonePayment.connect(client).approveMilestone(projectId, 0);
      await milestonePayment.connect(client).approveMilestone(projectId, 1);

      const project = await milestonePayment.getProject(projectId);
      expect(project.completed).to.be.true;
    });

    it('Should mark project as completed when all milestones approved', async function () {
      await milestonePayment.connect(client).approveMilestone(projectId, 0);
      await milestonePayment.connect(client).approveMilestone(projectId, 1);
      await milestonePayment.connect(client).approveMilestone(projectId, 2);

      const project = await milestonePayment.getProject(projectId);
      expect(project.completed).to.be.true;
    });
  });

  describe('Milestone Rejection', function () {
    let projectId: number;

    beforeEach(async function () {
      const milestoneAmounts = [
        ethers.utils.parseEther('50'),
        ethers.utils.parseEther('50'),
      ];

      const tx = await milestonePayment
        .connect(client)
        .createProject(contractor.address, milestoneAmounts, ethers.constants.AddressZero, {
          value: PROJECT_AMOUNT,
        });
      const receipt = await tx.wait();
      projectId = receipt.events?.[0].args?.projectId.toNumber();
    });

    it('Should allow client to reject milestone', async function () {
      await expect(milestonePayment.connect(client).rejectMilestone(projectId, 0, 'Poor quality'))
        .to.emit(milestonePayment, 'MilestoneRejected')
        .withArgs(projectId, 0, 'Poor quality');
    });

    it('Should reject by non-client', async function () {
      await expect(
        milestonePayment.connect(contractor).rejectMilestone(projectId, 0, 'Test'),
      ).to.be.revertedWith('Only client can reject');
    });

    it('Should reject already approved milestone', async function () {
      await milestonePayment.connect(client).approveMilestone(projectId, 0);

      await expect(
        milestonePayment.connect(client).rejectMilestone(projectId, 0, 'Too late'),
      ).to.be.revertedWith('Milestone already approved');
    });

    it('Should allow contractor to resubmit after rejection', async function () {
      await milestonePayment.connect(client).rejectMilestone(projectId, 0, 'Needs improvement');

      // Contractor can signal completion again
      await expect(milestonePayment.connect(contractor).requestApproval(projectId, 0)).to.not.be
        .reverted;
    });
  });

  describe('Project Cancellation', function () {
    let projectId: number;

    beforeEach(async function () {
      const milestoneAmounts = [
        ethers.utils.parseEther('30'),
        ethers.utils.parseEther('30'),
        ethers.utils.parseEther('40'),
      ];

      const tx = await milestonePayment
        .connect(client)
        .createProject(contractor.address, milestoneAmounts, ethers.constants.AddressZero, {
          value: PROJECT_AMOUNT,
        });
      const receipt = await tx.wait();
      projectId = receipt.events?.[0].args?.projectId.toNumber();
    });

    it('Should allow client to cancel project', async function () {
      await expect(milestonePayment.connect(client).cancelProject(projectId))
        .to.emit(milestonePayment, 'ProjectCancelled')
        .withArgs(projectId);
    });

    it('Should refund remaining funds on cancellation', async function () {
      // Approve first milestone
      await milestonePayment.connect(client).approveMilestone(projectId, 0);

      const initialBalance = await client.getBalance();

      const tx = await milestonePayment.connect(client).cancelProject(projectId);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);

      const finalBalance = await client.getBalance();
      const refund = finalBalance.add(gasUsed).sub(initialBalance);

      // Should refund 70 ETH (remaining milestones)
      expect(refund).to.equal(ethers.utils.parseEther('70'));
    });

    it('Should reject cancellation by non-client', async function () {
      await expect(
        milestonePayment.connect(contractor).cancelProject(projectId),
      ).to.be.revertedWith('Only client can cancel');
    });

    it('Should reject cancellation of completed project', async function () {
      // Approve all milestones
      await milestonePayment.connect(client).approveMilestone(projectId, 0);
      await milestonePayment.connect(client).approveMilestone(projectId, 1);
      await milestonePayment.connect(client).approveMilestone(projectId, 2);

      await expect(
        milestonePayment.connect(client).cancelProject(projectId),
      ).to.be.revertedWith('Project already completed');
    });

    it('Should reject new approvals after cancellation', async function () {
      await milestonePayment.connect(client).cancelProject(projectId);

      await expect(
        milestonePayment.connect(client).approveMilestone(projectId, 0),
      ).to.be.revertedWith('Project cancelled');
    });
  });

  describe('Dispute Handling', function () {
    let projectId: number;

    beforeEach(async function () {
      const milestoneAmounts = [
        ethers.utils.parseEther('50'),
        ethers.utils.parseEther('50'),
      ];

      const tx = await milestonePayment
        .connect(client)
        .createProject(contractor.address, milestoneAmounts, ethers.constants.AddressZero, {
          value: PROJECT_AMOUNT,
        });
      const receipt = await tx.wait();
      projectId = receipt.events?.[0].args?.projectId.toNumber();
    });

    it('Should allow contractor to raise dispute', async function () {
      await expect(milestonePayment.connect(contractor).raiseDispute(projectId, 'Payment delayed'))
        .to.emit(milestonePayment, 'DisputeRaised')
        .withArgs(projectId, contractor.address);
    });

    it('Should reject dispute by unauthorized party', async function () {
      await expect(
        milestonePayment.connect(owner).raiseDispute(projectId, 'Not involved'),
      ).to.be.revertedWith('Only client or contractor');
    });

    it('Should allow admin to resolve dispute', async function () {
      await milestonePayment.connect(contractor).raiseDispute(projectId, 'Issue');

      await expect(
        milestonePayment.connect(owner).resolveDispute(projectId, contractor.address, true),
      )
        .to.emit(milestonePayment, 'DisputeResolved')
        .withArgs(projectId, contractor.address);
    });
  });

  describe('ERC20 Projects', function () {
    let tokenProjectId: number;

    beforeEach(async function () {
      const milestoneAmounts = [
        ethers.utils.parseEther('40'),
        ethers.utils.parseEther('60'),
      ];

      await mockToken.connect(client).approve(milestonePayment.address, PROJECT_AMOUNT);

      const tx = await milestonePayment
        .connect(client)
        .createProject(contractor.address, milestoneAmounts, mockToken.address);
      const receipt = await tx.wait();
      tokenProjectId = receipt.events?.[1].args?.projectId.toNumber();
    });

    it('Should approve milestone with ERC20 payment', async function () {
      await milestonePayment.connect(client).approveMilestone(tokenProjectId, 0);

      const balance = await mockToken.balanceOf(contractor.address);
      expect(balance).to.equal(ethers.utils.parseEther('40'));
    });

    it('Should refund ERC20 tokens on cancellation', async function () {
      await milestonePayment.connect(client).approveMilestone(tokenProjectId, 0);

      const initialBalance = await mockToken.balanceOf(client.address);
      await milestonePayment.connect(client).cancelProject(tokenProjectId);
      const finalBalance = await mockToken.balanceOf(client.address);

      const refund = finalBalance.sub(initialBalance);
      expect(refund).to.equal(ethers.utils.parseEther('60'));
    });
  });

  describe('Project Queries', function () {
    it('Should get client projects', async function () {
      const milestoneAmounts = [ethers.utils.parseEther('100')];

      await milestonePayment
        .connect(client)
        .createProject(contractor.address, milestoneAmounts, ethers.constants.AddressZero, {
          value: ethers.utils.parseEther('100'),
        });

      await milestonePayment
        .connect(client)
        .createProject(contractor.address, milestoneAmounts, ethers.constants.AddressZero, {
          value: ethers.utils.parseEther('100'),
        });

      const projects = await milestonePayment.getClientProjects(client.address);
      expect(projects.length).to.equal(2);
    });

    it('Should get contractor projects', async function () {
      const milestoneAmounts = [ethers.utils.parseEther('100')];

      await milestonePayment
        .connect(client)
        .createProject(contractor.address, milestoneAmounts, ethers.constants.AddressZero, {
          value: ethers.utils.parseEther('100'),
        });

      const projects = await milestonePayment.getContractorProjects(contractor.address);
      expect(projects.length).to.equal(1);
    });

    it('Should get milestone details', async function () {
      const milestoneAmounts = [
        ethers.utils.parseEther('30'),
        ethers.utils.parseEther('70'),
      ];

      const tx = await milestonePayment
        .connect(client)
        .createProject(contractor.address, milestoneAmounts, ethers.constants.AddressZero, {
          value: PROJECT_AMOUNT,
        });
      const receipt = await tx.wait();
      const projectId = receipt.events?.[0].args?.projectId.toNumber();

      const milestone = await milestonePayment.getMilestone(projectId, 0);
      expect(milestone.amount).to.equal(ethers.utils.parseEther('30'));
      expect(milestone.approved).to.be.false;
    });
  });

  describe('Gas Optimization', function () {
    it('Should use reasonable gas for project creation', async function () {
      const milestoneAmounts = [
        ethers.utils.parseEther('25'),
        ethers.utils.parseEther('25'),
        ethers.utils.parseEther('25'),
        ethers.utils.parseEther('25'),
      ];

      const tx = await milestonePayment
        .connect(client)
        .createProject(contractor.address, milestoneAmounts, ethers.constants.AddressZero, {
          value: PROJECT_AMOUNT,
        });
      const receipt = await tx.wait();

      expect(receipt.gasUsed).to.be.lt(300000);
    });

    it('Should use reasonable gas for milestone approval', async function () {
      const milestoneAmounts = [ethers.utils.parseEther('100')];

      const createTx = await milestonePayment
        .connect(client)
        .createProject(contractor.address, milestoneAmounts, ethers.constants.AddressZero, {
          value: ethers.utils.parseEther('100'),
        });
      const createReceipt = await createTx.wait();
      const projectId = createReceipt.events?.[0].args?.projectId.toNumber();

      const approveTx = await milestonePayment.connect(client).approveMilestone(projectId, 0);
      const approveReceipt = await approveTx.wait();

      expect(approveReceipt.gasUsed).to.be.lt(100000);
    });
  });

  describe('Edge Cases', function () {
    it('Should handle many milestones', async function () {
      const numMilestones = 10;
      const amountPerMilestone = PROJECT_AMOUNT.div(numMilestones);
      const milestoneAmounts = Array(numMilestones).fill(amountPerMilestone);

      await expect(
        milestonePayment
          .connect(client)
          .createProject(contractor.address, milestoneAmounts, ethers.constants.AddressZero, {
            value: PROJECT_AMOUNT,
          }),
      ).to.not.be.reverted;
    });

    it('Should handle very small milestone amounts', async function () {
      const tinyAmount = ethers.utils.parseEther('0.000001');
      const milestoneAmounts = [tinyAmount];

      await expect(
        milestonePayment
          .connect(client)
          .createProject(contractor.address, milestoneAmounts, ethers.constants.AddressZero, {
            value: tinyAmount,
          }),
      ).to.not.be.reverted;
    });

    it('Should handle uneven milestone distribution', async function () {
      const milestoneAmounts = [
        ethers.utils.parseEther('5'),
        ethers.utils.parseEther('15'),
        ethers.utils.parseEther('80'),
      ];

      await expect(
        milestonePayment
          .connect(client)
          .createProject(contractor.address, milestoneAmounts, ethers.constants.AddressZero, {
            value: PROJECT_AMOUNT,
          }),
      ).to.not.be.reverted;
    });
  });
});

