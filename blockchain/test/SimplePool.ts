import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import hre from "hardhat"


describe("SimplePool", function () {
    const ONE_TENTH_ETHER = hre.ethers.parseEther("0.1")
    const ONE_ETHER = hre.ethers.parseEther("1")
    const TWO_ETHER = hre.ethers.parseEther("2")
    const THREE_ETHER = hre.ethers.parseEther("3")

    async function deployPoolFixture() {
        const SimplePool = await hre.ethers.getContractFactory("SimplePool")
        const simplePool = await SimplePool.deploy()

        const [owner, alice, bob] = await hre.ethers.getSigners();

        return { simplePool, owner, alice, bob }
    }

    async function deployPoolAndTokenFixture() {
        const SimpleToken = await hre.ethers.getContractFactory("SimpleToken")
        const simpleToken = await SimpleToken.deploy()

        return { ...await deployPoolFixture(), simpleToken }
    }

    async function initializePoolFixture() {
        const fixture = await deployPoolAndTokenFixture()

        const { simplePool, simpleToken } = fixture

        await simpleToken.initialize(simplePool)
        await simplePool.initialize(simpleToken)

        return fixture
    }

    describe("Deployment", async function () {
        it("Should have the right owner", async function () {
            const { simplePool, owner } = await loadFixture(deployPoolFixture)

            expect(await simplePool.owner()).to.equal(owner.address)
        })

        it("Should return zero when totalSupply is called", async function () {
            const { simplePool } = await loadFixture(deployPoolFixture)

            expect(await simplePool.totalSupply()).to.equal(0)
        })

        it("Should fail when deposit is called", async function () {
            const { simplePool } = await loadFixture(deployPoolFixture)

            await expect(simplePool.deposit({ value: ONE_ETHER })).to.be.revertedWithCustomError(simplePool, ("NotInitialized"))
        })

        it("Should fail when withdraw is called", async function () {
            const { simplePool } = await loadFixture(deployPoolFixture)

            await expect(simplePool.withdraw(ONE_ETHER)).to.be.revertedWithCustomError(simplePool, ("NotInitialized"))
        })

        it("Should succeed when reward is called and return the correct amount when calling totalSupply", async function () {
            const { simplePool } = await loadFixture(deployPoolFixture)

            await expect(simplePool.reward({ value: ONE_ETHER })).to.not.be.reverted
            expect(await simplePool.totalSupply()).to.equal(ONE_ETHER)
        })

        it("Should accept incoming transfers and return the correct amount when calling totalSupply", async function () {
            const { simplePool, alice, bob } = await loadFixture(deployPoolFixture)
            
            await expect(alice.sendTransaction({ to: simplePool, value: ONE_ETHER })).to.not.be.reverted
            expect(await simplePool.totalSupply()).to.equal(ONE_ETHER)
            await expect(bob.sendTransaction({ to: simplePool, value: TWO_ETHER })).to.not.be.reverted
            expect(await simplePool.totalSupply()).to.equal(THREE_ETHER)
        })
    })

    describe("Initialization", async function () {
        it("Should fail if initialized by a non-owner", async function () {
            const { simpleToken, simplePool, alice } = await loadFixture(deployPoolAndTokenFixture)

            await expect(simplePool.connect(alice).initialize(simpleToken)).to.be.revertedWithCustomError(simpleToken, ("OwnableUnauthorizedAccount"))
        })

        it("Should succeed if initialized by the owner", async function () {
            const { simpleToken, simplePool } = await loadFixture(deployPoolAndTokenFixture)

            await expect(simplePool.initialize(simpleToken)).to.not.be.reverted
        })
    })

    describe("Deposits, Withdrawals and Rewards", async function () {
        it("Should succeed when deposit is called", async function () {
            const { simplePool, alice } = await loadFixture(initializePoolFixture)

            await expect(simplePool.connect(alice).deposit({ value: ONE_ETHER })).to.not.be.reverted
        })

        it("Should fail when withdrawal amount is too high", async function () {
            const { simplePool, alice } = await loadFixture(initializePoolFixture)

            await expect(simplePool.connect(alice).deposit({ value: ONE_ETHER })).to.not.be.reverted
            await expect(simplePool.connect(alice).withdraw(TWO_ETHER)).to.be.revertedWithCustomError(simplePool, ("InsufficientLiquidity"))
        })

        it("Should succeed when withdrawal amount less or equal to the amount deposited", async function () {
            const { simplePool, alice } = await loadFixture(initializePoolFixture)

            await expect(simplePool.connect(alice).deposit({ value: TWO_ETHER })).to.not.be.reverted
            await expect(simplePool.connect(alice).withdraw(ONE_ETHER)).to.not.be.reverted
            await expect(simplePool.connect(alice).withdraw(ONE_ETHER)).to.not.be.reverted
        })

        it("Should let the user withdraw the entire pooled amount with rewards if he is the only shareholder", async function () {
            const { simplePool, alice } = await loadFixture(initializePoolFixture)

            await expect(simplePool.connect(alice).deposit({ value: ONE_ETHER })).to.not.be.reverted
            await expect(simplePool.reward({ value: ONE_TENTH_ETHER })).to.not.be.reverted

            const expectedAmount = hre.ethers.parseEther("1.1")
            expect(await simplePool.totalSupply()).to.equal(expectedAmount)
            expect(await simplePool.balanceOf(alice.address)).to.equal(expectedAmount)
            await expect(simplePool.connect(alice).withdraw(expectedAmount)).to.not.be.reverted
        })
    })
})
