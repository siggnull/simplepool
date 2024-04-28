import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import hre from "hardhat"
import { ethers } from "ethers"


describe("SimpleToken", function () {
    async function deploySimpleTokenFixture() {
        const SimpleToken = await hre.ethers.getContractFactory("SimpleToken")
        const simpleToken = await SimpleToken.deploy()

        const SimplePool = await hre.ethers.getContractFactory("SimplePool")
        const simplePool = await SimplePool.deploy()

        const [owner, alice] = await hre.ethers.getSigners();

        return { simpleToken, simplePool, owner, alice }
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

        it("Should have zero total supply", async function () {
            const { simpleToken } = await loadFixture(deploySimpleTokenFixture)

            expect(await simpleToken.totalSupply()).to.equal(0)
        })

        it("Should have zero total shares", async function () {
            const { simpleToken } = await loadFixture(deploySimpleTokenFixture)

            expect(await simpleToken.totalShares()).to.equal(0)
        })
    })

    describe("Initialization", function () {
        it("Should be reverted if initialized by a non-owner", async function () {
            const { simpleToken, simplePool, alice } = await loadFixture(deploySimpleTokenFixture)

            await expect(simpleToken.connect(alice).initialize(simplePool)).to.be.revertedWithCustomError(simpleToken, ("OwnableUnauthorizedAccount"))
        })

        it("Should not be reverted if initialized by the owner", async function () {
            const { simpleToken, simplePool } = await loadFixture(deploySimpleTokenFixture)

            await expect(simpleToken.initialize(simplePool)).to.not.be.reverted
        })

        it ("Should not fail when calling mint as pool", async function () {
            const { simpleToken, simplePool, alice } = await loadFixture(deploySimpleTokenFixture)

            const simplePoolAddress = await simplePool.getAddress()

            await hre.network.provider.send("hardhat_setBalance", [simplePoolAddress, "0x100000000000000", ]);

            const simplePoolSigner = await hre.ethers.getImpersonatedSigner(simplePoolAddress)

            await expect(simpleToken.initialize(simplePool)).to.not.be.reverted
            await expect(simpleToken.connect(simplePoolSigner).mint(alice.address, 1)).to.not.be.reverted
        })
    })
})
