import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import hre from "hardhat"


function eth(value: number | string): bigint {
    if (typeof value === "number") {
        value = value.toString()
    }
    return hre.ethers.parseEther(value)
}

describe("SimplePool", function () {
    async function deployPoolFixture() {
        const SimplePool = await hre.ethers.getContractFactory("SimplePool")
        const simplePool = await SimplePool.deploy()

        const [owner, alice, bob, carol] = await hre.ethers.getSigners();

        return { simplePool, owner, alice, bob, carol }
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

            await expect(simplePool.deposit({ value: eth(1) })).to.be.revertedWithCustomError(simplePool, ("NotInitialized"))
        })

        it("Should fail when withdraw is called", async function () {
            const { simplePool } = await loadFixture(deployPoolFixture)

            await expect(simplePool.withdraw(eth(1))).to.be.revertedWithCustomError(simplePool, ("NotInitialized"))
        })

        it("Should succeed when reward is called and return the correct amount when calling totalSupply", async function () {
            const { simplePool } = await loadFixture(deployPoolFixture)

            await expect(simplePool.reward({ value: eth(1) })).to.not.be.reverted
            expect(await simplePool.totalSupply()).to.equal(eth(1))
        })

        it("Should accept incoming transfers and return the correct amount when calling totalSupply", async function () {
            const { simplePool, alice, bob } = await loadFixture(deployPoolFixture)
            
            await expect(alice.sendTransaction({ to: simplePool, value: eth(1) })).to.not.be.reverted
            expect(await simplePool.totalSupply()).to.equal(eth(1))
            await expect(bob.sendTransaction({ to: simplePool, value: eth(2) })).to.not.be.reverted
            expect(await simplePool.totalSupply()).to.equal(eth(3))
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

            await expect(simplePool.connect(alice).deposit({ value: eth(1) })).to.not.be.reverted
        })

        it("Should fail when withdrawal amount is too high", async function () {
            const { simplePool, alice } = await loadFixture(initializePoolFixture)

            await expect(simplePool.connect(alice).deposit({ value: eth(1) })).to.not.be.reverted
            await expect(simplePool.connect(alice).withdraw(eth(2))).to.be.revertedWithCustomError(simplePool, ("InsufficientLiquidity"))
        })

        it("Should succeed when withdrawal amount less or equal to the amount deposited", async function () {
            const { simplePool, alice } = await loadFixture(initializePoolFixture)

            await expect(simplePool.connect(alice).deposit({ value: eth(2) })).to.not.be.reverted
            await expect(simplePool.connect(alice).withdraw(eth(1))).to.not.be.reverted
            await expect(simplePool.connect(alice).withdraw(eth(1))).to.not.be.reverted
        })

        it("Should let the user withdraw the entire pooled amount with rewards if he is the only shareholder", async function () {
            const { simplePool, alice } = await loadFixture(initializePoolFixture)

            await expect(simplePool.connect(alice).deposit({ value: eth(1) })).to.not.be.reverted
            await expect(simplePool.reward({ value: eth(0.1) })).to.not.be.reverted

            const expectedAmount = eth(1.1)
            expect(await simplePool.totalSupply()).to.equal(expectedAmount)
            expect(await simplePool.balanceOf(alice)).to.equal(expectedAmount)
            await expect(simplePool.connect(alice).withdraw(expectedAmount)).to.not.be.reverted
        })

        it("Should let the users withdraw their share of the pool", async function () {
            const { simplePool, alice, bob, carol } = await loadFixture(initializePoolFixture)

            interface Registry {
                [key: string]: bigint
            }

            interface ContractState {
                shares: Registry,
                totalSupply: bigint,
                totalShares(): bigint,
                balanceOf(account: string): bigint,
                deposit(account: string, amount: bigint): void,
                withdraw(account: string, amount: bigint): void,
                reward(amount: bigint): void,
                sharesForDepositAmount(amount: bigint): bigint,
                sharesForWithdrawalAmount(amount: bigint): bigint,
            }

            let contractState : ContractState = {
                totalSupply: 0n,

                shares : {
                    alice: 0n,
                    bob: 0n,
                    carol: 0n,
                },

                totalShares() {
                    return this.shares.alice + this.shares.bob + this.shares.carol
                },

                balanceOf(account: string) {
                    const shares = this.totalShares()
                    if (shares == 0n) {
                        return 0n
                    }

                    return (this.totalSupply * this.shares[account]) / shares
                },

                deposit(account: string, amount: bigint) {
                    this.shares[account] += this.sharesForDepositAmount(amount)
                    this.totalSupply += amount
                },

                withdraw(account: string, amount: bigint) {
                    this.shares[account] -= this.sharesForWithdrawalAmount(amount)
                    this.totalSupply -= amount
                },

                reward(amount: bigint) {
                    this.totalSupply += amount
                },

                sharesForDepositAmount(amount: bigint) {
                    if (this.totalSupply == 0n) {
                        return amount;
                    }
            
                    return amount * this.totalShares() / this.totalSupply;
                },
    
                sharesForWithdrawalAmount(amount: bigint) {
                    if (this.totalSupply == 0n) {
                        return 0n;
                    }
            
                    return (amount * this.totalShares() + this.totalSupply - 1n) / this.totalSupply;
                }
            }

            async function expectBalances() {
                // console.log(
                //     "Balance: alice = %d, bob = %d, carol = %d, total = %d",
                //     await simplePool.balanceOf(alice),
                //     await simplePool.balanceOf(bob),
                //     await simplePool.balanceOf(carol),
                //     await simplePool.totalSupply()
                // )

                expect(await simplePool.balanceOf(alice)).to.equal(contractState.balanceOf("alice"))
                expect(await simplePool.balanceOf(bob)).to.equal(contractState.balanceOf("bob"))
                expect(await simplePool.balanceOf(carol)).to.equal(contractState.balanceOf("carol"))
                expect(await simplePool.totalSupply()).to.equal(contractState.totalSupply)
            }

            async function expectShares() {
                // console.log(
                //     "Shares: alice = %d, bob = %d, carol = %d, total = %d",
                //     await simplePool.sharesOf(alice),
                //     await simplePool.sharesOf(bob),
                //     await simplePool.sharesOf(carol),
                //     await simplePool.totalShares()
                // )

                expect(await simplePool.sharesOf(alice)).to.equal(contractState.shares.alice)
                expect(await simplePool.sharesOf(bob)).to.equal(contractState.shares.bob)
                expect(await simplePool.sharesOf(carol)).to.equal(contractState.shares.carol)
                expect(await simplePool.totalShares()).to.equal(contractState.totalShares())
            }

            async function expectBalancesAndShares() {
                await expectBalances()
                await expectShares()
            }

            await expect(simplePool.connect(alice).deposit({ value: eth(7) })).to.not.be.reverted
            contractState.deposit("alice", eth(7))
            await expectBalancesAndShares()

            await expect(simplePool.connect(bob).deposit({ value: eth(11) })).to.not.be.reverted
            contractState.deposit("bob", eth(11))
            await expectBalancesAndShares()

            await expect(simplePool.reward({ value: eth(1) })).to.not.be.reverted
            contractState.reward(eth(1))
            await expectBalancesAndShares()

            await expect(simplePool.connect(alice).withdraw(eth(2))).to.not.be.reverted
            contractState.withdraw("alice", eth(2))
            await expectBalancesAndShares()

            await expect(simplePool.connect(carol).deposit({ value: eth(2) })).to.not.be.reverted
            contractState.deposit("carol", eth(2))
            await expectBalancesAndShares()

            await expect(simplePool.reward({ value: eth(1) })).to.not.be.reverted
            contractState.reward(eth(1))
            await expectBalancesAndShares()

            await expect(simplePool.connect(carol).withdraw(eth(2))).to.not.be.reverted
            contractState.withdraw("carol", eth(2))
            await expectBalancesAndShares()

            await expect(simplePool.reward({ value: eth(1) })).to.not.be.reverted
            contractState.reward(eth(1))
            await expectBalancesAndShares()

            await expect(simplePool.connect(carol).deposit({ value: eth(3) })).to.not.be.reverted
            contractState.deposit("carol", eth(3))
            await expectBalancesAndShares()

            await expect(simplePool.connect(bob).withdraw(eth(11))).to.not.be.reverted
            contractState.withdraw("bob", eth(11))
            await expectBalancesAndShares()

            const remainingBalanceOfAlice = await simplePool.balanceOf(alice)
            await expect(simplePool.connect(alice).withdraw(remainingBalanceOfAlice)).to.not.be.reverted
            contractState.withdraw("alice", remainingBalanceOfAlice)
            await expectBalancesAndShares()

            await expect(simplePool.connect(bob).deposit({ value: eth(2) })).to.not.be.reverted
            contractState.deposit("bob", eth(2))
            await expectBalancesAndShares()

            await expect(simplePool.reward({ value: eth(1) })).to.not.be.reverted
            contractState.reward(eth(1))
            await expectBalancesAndShares()

            const remainingBalanceOfCarol = await simplePool.balanceOf(carol)
            await expect(simplePool.connect(carol).withdraw(remainingBalanceOfCarol)).to.not.be.reverted
            contractState.withdraw("carol", remainingBalanceOfCarol)
            await expectBalancesAndShares()

            const remainingBalanceOfBob = await simplePool.balanceOf(bob)
            await expect(simplePool.connect(bob).withdraw(remainingBalanceOfBob)).to.not.be.reverted
            contractState.withdraw("bob", remainingBalanceOfBob)
            await expectBalancesAndShares()
        })
    })
})
