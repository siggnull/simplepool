import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import hre from "hardhat"
import { ethers } from "ethers"


describe("SimpleToken", function () {
    async function deployTokenFixture() {
        const SimpleToken = await hre.ethers.getContractFactory("SimpleToken")
        const simpleToken = await SimpleToken.deploy()

        const [owner, alice, bob] = await hre.ethers.getSigners();

        return { simpleToken, owner, alice, bob }
    }

    async function deployTokenAndPoolFixture() {
        const SimplePool = await hre.ethers.getContractFactory("SimplePool")
        const simplePool = await SimplePool.deploy()

        return { ...await deployTokenFixture(), simplePool }
    }

    async function initializeTokenFixture() {
        const fixture = await deployTokenAndPoolFixture()

        const { simplePool, simpleToken } = fixture

        simpleToken.initialize(simplePool)

        const simplePoolAddress = await simplePool.getAddress()
        await hre.network.provider.send("hardhat_setBalance", [simplePoolAddress, "0x100000000000000", ]);
        const simplePoolSigner = await hre.ethers.getImpersonatedSigner(simplePoolAddress)

        return { ...fixture, simplePoolSigner }
    }

    describe("Deployed", function () {
        it("Should have the right owner", async function () {
            const { simpleToken, owner } = await loadFixture(deployTokenFixture)

            expect(await simpleToken.owner()).to.equal(owner.address)
        });

        it("Should fail when mint is called", async function () {
            const { simpleToken } = await loadFixture(deployTokenFixture)

            const wallet = ethers.Wallet.createRandom()

            await expect(simpleToken.mint(wallet.address, 1)).to.be.revertedWithCustomError(simpleToken, ("UnauthorizedAccount"))
        })

        it("Should fail when burn is called", async function () {
            const { simpleToken } = await loadFixture(deployTokenFixture)

            const wallet = ethers.Wallet.createRandom()

            await expect(simpleToken.burn(wallet.address, 1)).to.be.revertedWithCustomError(simpleToken, ("UnauthorizedAccount"))
        })

        it("Should have zero total supply", async function () {
            const { simpleToken } = await loadFixture(deployTokenFixture)

            expect(await simpleToken.totalSupply()).to.equal(0)
        })

        it("Should have zero total shares", async function () {
            const { simpleToken } = await loadFixture(deployTokenFixture)

            expect(await simpleToken.totalShares()).to.equal(0)
        })
    })

    describe("Initialization", function () {
        it("Should fail if initialized by a non-owner", async function () {
            const { simpleToken, simplePool, alice } = await loadFixture(deployTokenAndPoolFixture)

            await expect(simpleToken.connect(alice).initialize(simplePool)).to.be.revertedWithCustomError(simpleToken, ("OwnableUnauthorizedAccount"))
        })

        it("Should succeed if initialized by the owner", async function () {
            const { simpleToken, simplePool } = await loadFixture(deployTokenAndPoolFixture)

            await expect(simpleToken.initialize(simplePool)).to.not.be.reverted
        })
    })

    describe("Initialized", function () {
        it("Should fail when a stranger calls mint", async function () {
            const { simpleToken, alice } = await loadFixture(initializeTokenFixture)

            await expect(simpleToken.connect(alice).mint(alice.address, 1)).to.be.revertedWithCustomError(simpleToken, ("UnauthorizedAccount"))
        })

        it("Should fail when the owner calls mint", async function () {
            const { simpleToken, alice } = await loadFixture(initializeTokenFixture)

            await expect(simpleToken.mint(alice.address, 1)).to.be.revertedWithCustomError(simpleToken, ("UnauthorizedAccount"))
        })

        it("Should succeed when the pool calls mint", async function () {
            const { simpleToken, simplePoolSigner, alice } = await loadFixture(initializeTokenFixture)

            await expect(simpleToken.connect(simplePoolSigner).mint(alice.address, 1)).to.not.be.reverted
        })

        it("Should fail when a stranger calls burn", async function () {
            const { simpleToken, alice } = await loadFixture(initializeTokenFixture)

            await expect(simpleToken.connect(alice).burn(alice.address, 1)).to.be.revertedWithCustomError(simpleToken, ("UnauthorizedAccount"))
        })

        it("Should fail when the owner calls burn", async function () {
            const { simpleToken, alice } = await loadFixture(initializeTokenFixture)

            await expect(simpleToken.burn(alice.address, 1)).to.be.revertedWithCustomError(simpleToken, ("UnauthorizedAccount"))
        })

        it("Should fail when the pool calls burn with zero shares to burn", async function () {
            const { simpleToken, simplePoolSigner, alice } = await loadFixture(initializeTokenFixture)

            await expect(simpleToken.connect(simplePoolSigner).burn(alice.address, 1)).to.be.revertedWithCustomError(simpleToken, ("ERC20InsufficientBalance"))
        })

        it("Should fail when the pool calls burn with not enough shares to burn", async function () {
            const { simpleToken, simplePoolSigner, alice } = await loadFixture(initializeTokenFixture)

            await expect(simpleToken.connect(simplePoolSigner).mint(alice.address, 1)).to.not.be.reverted
            await expect(simpleToken.connect(simplePoolSigner).burn(alice.address, 2)).to.be.revertedWithCustomError(simpleToken, ("ERC20InsufficientBalance"))
        })

        it("Should succeed when the pool calls burn with enough shares to burn", async function () {
            const { simpleToken, simplePoolSigner, alice } = await loadFixture(initializeTokenFixture)

            await expect(simpleToken.connect(simplePoolSigner).mint(alice.address, 2)).to.not.be.reverted
            await expect(simpleToken.connect(simplePoolSigner).burn(alice.address, 1)).to.not.be.reverted
            await expect(simpleToken.connect(simplePoolSigner).burn(alice.address, 1)).to.not.be.reverted
        })

        it("Should return correct amount when calliing sharesOf after mint and burn", async function () {
            const { simpleToken, simplePoolSigner, alice } = await loadFixture(initializeTokenFixture)

            await expect(simpleToken.connect(simplePoolSigner).mint(alice.address, 10)).to.not.be.reverted
            expect(await simpleToken.sharesOf(alice.address)).to.equal(10)

            await expect(simpleToken.connect(simplePoolSigner).burn(alice.address, 7)).to.not.be.reverted
            expect(await simpleToken.sharesOf(alice.address)).to.equal(3)
        })

        it("Should return correct amount when calliing totalShares after mint and burn for multiple accounts", async function () {
            const { simpleToken, simplePoolSigner, alice, bob } = await loadFixture(initializeTokenFixture)

            await expect(simpleToken.connect(simplePoolSigner).mint(alice.address, 10)).to.not.be.reverted
            expect(await simpleToken.totalShares()).to.equal(10)

            await expect(simpleToken.connect(simplePoolSigner).mint(bob.address, 20)).to.not.be.reverted
            expect(await simpleToken.totalShares()).to.equal(30)

            await expect(simpleToken.connect(simplePoolSigner).burn(alice.address, 7)).to.not.be.reverted
            expect(await simpleToken.totalShares()).to.equal(23)

            await expect(simpleToken.connect(simplePoolSigner).burn(bob.address, 11)).to.not.be.reverted
            expect(await simpleToken.totalShares()).to.equal(12)
        })
    })
})
