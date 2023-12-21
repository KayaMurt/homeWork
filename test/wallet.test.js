const chai = require("chai");
const { expect } = chai;
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

describe("Wallet", function () {
    let Wallet;
    let wallet;
    let owner;
    let addr1;
    let addr2;
    let addrs;

    beforeEach(async function () {
        Wallet = await ethers.getContractFactory("Wallet");
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

        wallet = await Wallet.deploy();
        await wallet.deployed();
    });

    it("Should set the right owner", async function () {
        expect(await wallet.owner()).to.equal(owner.address);
    });

    it("Should transfer funds to another address", async function () {
        const initialBalance = await wallet.getBalance();
        const transferAmount = ethers.utils.parseEther("0.1");

        await owner.sendTransaction({
            to: wallet.address,
            value: transferAmount,
        });

        const finalBalance = await wallet.getBalance();
        const expectedFinalBalance = initialBalance.add(transferAmount);

        expect(finalBalance.toString()).to.equal(expectedFinalBalance.toString());
    });

    it("Should not allow non-owners to transfer funds", async function () {
        const transferAmount = ethers.utils.parseEther("0.1");

        await expect(wallet.connect(addr1).transferFunds(addr2.address, transferAmount))
            .to.be.rejectedWith("Not the owner");
    });

    it("Should not allow transfers exceeding the balance", async function () {
        const initialBalance = await wallet.getBalance();
        const transferAmount = initialBalance.add(ethers.utils.parseEther("1.0"));

        await expect(wallet.connect(owner).transferFunds(addr1.address, transferAmount))
            .to.be.rejectedWith("Insufficient funds");
    });
});
