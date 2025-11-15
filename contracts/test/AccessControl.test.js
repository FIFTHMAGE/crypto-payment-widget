const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("AccessControl", function () {
  async function deployFixture() {
    const [owner, admin, pauser, user] = await ethers.getSigners();

    const AccessControl = await ethers.getContractFactory("AccessControl");
    const accessControl = await AccessControl.deploy(owner.address);

    return { accessControl, owner, admin, pauser, user };
  }

  describe("Role Management", function () {
    it("Should grant admin role", async function () {
      const { accessControl, owner, admin } = await loadFixture(deployFixture);

      const ADMIN_ROLE = await accessControl.ADMIN_ROLE();

      await accessControl.connect(owner).grantAdminRole(admin.address);

      expect(await accessControl.hasRole(ADMIN_ROLE, admin.address)).to.be.true;
    });

    it("Should grant pauser role", async function () {
      const { accessControl, owner, admin, pauser } = await loadFixture(deployFixture);

      await accessControl.connect(owner).grantAdminRole(admin.address);

      const PAUSER_ROLE = await accessControl.PAUSER_ROLE();
      await accessControl.connect(admin).grantPauserRole(pauser.address);

      expect(await accessControl.hasRole(PAUSER_ROLE, pauser.address)).to.be.true;
    });

    it("Should revoke roles", async function () {
      const { accessControl, owner, admin } = await loadFixture(deployFixture);

      const ADMIN_ROLE = await accessControl.ADMIN_ROLE();

      await accessControl.connect(owner).grantAdminRole(admin.address);
      await accessControl.connect(owner).revokeAdminRole(admin.address);

      expect(await accessControl.hasRole(ADMIN_ROLE, admin.address)).to.be.false;
    });

    it("Should restrict role granting to authorized accounts", async function () {
      const { accessControl, user, admin } = await loadFixture(deployFixture);

      await expect(
        accessControl.connect(user).grantAdminRole(admin.address)
      ).to.be.reverted;
    });
  });
});

