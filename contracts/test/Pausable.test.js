const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Pausable", function () {
  async function deployFixture() {
    const [owner, pauser, user] = await ethers.getSigners();

    const Pausable = await ethers.getContractFactory("Pausable");
    const pausable = await Pausable.deploy(owner.address);

    // Grant pauser role
    const PAUSER_ROLE = await pausable.PAUSER_ROLE();
    await pausable.connect(owner).grantRole(PAUSER_ROLE, pauser.address);

    return { pausable, owner, pauser, user };
  }

  describe("Pause/Unpause", function () {
    it("Should pause contract", async function () {
      const { pausable, pauser } = await loadFixture(deployFixture);

      await pausable.connect(pauser).pause();

      expect(await pausable.paused()).to.be.true;
    });

    it("Should unpause contract", async function () {
      const { pausable, pauser } = await loadFixture(deployFixture);

      await pausable.connect(pauser).pause();
      await pausable.connect(pauser).unpause();

      expect(await pausable.paused()).to.be.false;
    });

    it("Should restrict pause to pauser role", async function () {
      const { pausable, user } = await loadFixture(deployFixture);

      await expect(
        pausable.connect(user).pause()
      ).to.be.reverted;
    });
  });
});

