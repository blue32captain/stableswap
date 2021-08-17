const { BN } = require("web3-utils");

const UniswapV3Vault = artifacts.require("UniswapV3Vault");
const MockToken = artifacts.require("MockToken");
const UniswapV3Factory = artifacts.require("UniswapV3Factory");

contract("UniswapV3Vault", (accounts) => {
    var uniswapv3factory_instance;
    var token0, token1;
    var mockPoolAddress;
    var v3vault_instance;

    before(async () => {

        await MockToken.new(
            { from: accounts[1] }
        ).then((instance) => {
            token0 = instance;
        }); 

        await MockToken.new(
            { from: accounts[1] }
        ).then ((instance) => {
            token1 = instance;
        })

        await UniswapV3Factory.new(
            { from: accounts[0] }
        ).then((instance) => {
            uniswapv3factory_instance = instance;
        }); 
        
        await uniswapv3factory_instance.createPool(
            token0.address,
            token1.address,
            3000,
            { from: accounts[0] }
        );

        mockPoolAddress = await uniswapv3factory_instance.getPool(
            token0.address,
            token1.address,
            3000,
            { from: accounts[0] }
        );

        await UniswapV3Vault.new(
            mockPoolAddress,
            1000,
            1000000000,
            accounts[0],
            { from: accounts[0] }
        ).then((instance) => {
            v3vault_instance = instance;
        });

    });

    describe("Config Vault Test", () => {

        it("MaxTotalSupply Test", async () => {
            const maxTotalSupply = await v3vault_instance.maxTotalSupply(
                { from: accounts[0] }
            );
            assert.equal(maxTotalSupply, new BN('1000000000').toString())
        });

        it("ProtocolFee Test", async () => {
            const ProtocolFee = await v3vault_instance.protocolFee(
                { from: accounts[0] }
            );
            assert.equal(ProtocolFee, new BN('1000').toString())
        });

    });

    describe("Deposit Assets to UniswapV3 Vault", () => {

        it("Deposit works successfully", async () => {

            const amount0Desired = 100000;
            const amount1Desired = 100000;
            const recipient = accounts[2];

            await token0.approve(
                v3vault_instance.address,
                amount0Desired,
                { from: accounts[1] }
            );

            await token1.approve(
                v3vault_instance.address,
                amount1Desired,
                { from: accounts[1] }
            );

            const {shares, amount0, amount1} = await v3vault_instance.deposit.call(
                amount0Desired,
                amount1Desired,
                0,
                0,
                recipient,
                { from: accounts[1]}
            );
            

            await v3vault_instance.deposit(
                amount0Desired,
                amount1Desired,
                0,
                0,
                recipient,
                { from: accounts[1]}
            );

            const balance = await v3vault_instance.balanceOf(recipient);
            assert.equal(shares.toString(), balance.toString(), "Shares of recipient is incorrect.");
            /// Check amounts don't exceed desired
            assert(amount0 <= amount0Desired, "Distribution token0 amount works unsuccessfully!");
            assert(amount1 <= amount1Desired, "Distribution token1 amount works unsuccessfully!");
        });

        it("Deposit works not successfully when the user didn't approve the vault", async () => {

            const amount0Desired = 100000;
            const amount1Desired = 100000;
            const recipient = accounts[2];
            let thrownError;

            try {
                await v3vault_instance.deposit(
                    amount0Desired,
                    amount1Desired,
                    0,
                    0,
                    recipient,
                    { from: accounts[1]}
                );
            } catch (error) {
                thrownError = error;                
            }            

            assert.include(thrownError.message, "ERC20: transfer amount exceeds allowance");

        });
    });

    describe("Withdraw Assets", () => {

        it("Withdraw works successfully", async () => {

            const amount0Desired = 100000;
            const amount1Desired = 100000;
            const recipient = accounts[2];

            await token0.approve(
                v3vault_instance.address,
                amount0Desired,
                { from: accounts[1] }
            );

            await token1.approve(
                v3vault_instance.address,
                amount1Desired,
                { from: accounts[1] }
            );

            const { shares } = await v3vault_instance.deposit.call(
                amount0Desired,
                amount1Desired,
                0,
                0,
                recipient,
                { from: accounts[1]}
            );

            await v3vault_instance.withdraw(
                shares,
                0,
                0,
                accounts[2],
                { from: recipient }
            );

            const balance1 = await token0.balanceOf(
                accounts[2],
                { from: accounts[1] }
            );

            const balance2 = await token0.balanceOf(
                accounts[2],
                { from: accounts[1] }
            );

            assert.equal(balance1, new BN("100000").toString());
            assert.equal(balance2, new BN("100000").toString());
        })
    })
    
});