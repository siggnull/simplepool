import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import hre from "hardhat"
import { ethers } from "ethers"


describe("SimpleToken", function () {
    async function deploySimpleTokenFixture() {
        const SimpleToken = await hre.ethers.getContractFactory("SimpleToken")
        const simpleToken = await SimpleToken.deploy()

        const [owner] = await hre.ethers.getSigners();

        return { simpleToken, owner }
    }

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            const { simpleToken, owner } = await loadFixture(deploySimpleTokenFixture)

            expect(await simpleToken.owner()).to.equal(owner.address)
        });

        it("Should fail when calling mint", async function () {
            const { simpleToken } = await loadFixture(deploySimpleTokenFixture)

            let wallet = ethers.Wallet.createRandom()

            await expect(simpleToken.mint(wallet.address, 1)).to.be.revertedWithCustomError(simpleToken, ("UnauthorizedAccount"))
        })

        it("Should fail when calling burn", async function () {
            const { simpleToken } = await loadFixture(deploySimpleTokenFixture)

            let wallet = ethers.Wallet.createRandom()

            await expect(simpleToken.burn(wallet.address, 1)).to.be.revertedWithCustomError(simpleToken, ("UnauthorizedAccount"))
        })
    })
})
