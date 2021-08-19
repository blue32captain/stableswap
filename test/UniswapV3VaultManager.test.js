const { BN } = require("web3-utils");
const { time } = require('@openzeppelin/test-helpers')
require('@openzeppelin/test-helpers/configure')({
    provider: 'http://localhost:9545',
  });

const UniswapV3Vault = artifacts.require("UniswapV3Vault");
const UniswapV3VaultManager = artifacts.require("UniswapV3VaultManager");
const UniswapV3Factory = artifacts.require("UniswapV3Factory");
const UniswapV3Pool = artifacts.require("UniswapV3Pool");
const MockToken = artifacts.require("MockToken");
const Router = artifacts.require("Router");

contract("UniswapV3VaultManager", (accounts) => {
    var uniswapv3factory_instance;
    var token0, token1;
    var mockPoolAddress;
    var mockPoolInstance;
    var v3vault_instance;
    var v3vaultmanager_instance;
    var router_instance;
    const governance = accounts[0];
    const keeper = accounts[2];
  
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

        mockPoolInstance = await UniswapV3Pool.at(
            mockPoolAddress
        );        

        const price = parseInt(Math.sqrt(100) * 75555555546);
        await mockPoolInstance.initialize(
            price,
            { from: governance }
        );

        await mockPoolInstance.increaseObservationCardinalityNext(
            100,
            { from: governance }
        );

        const tickSpacing = await mockPoolInstance.tickSpacing(
            { from: governance }
        );

        const { tick } = await mockPoolInstance.slot0(
            { from: governance }
        );

        console.log(new BN(tickSpacing).toString());
        console.log(new BN(tick).toString());

        let latest = await time.latest();
        await time.increaseTo(latest.add(time.duration.minutes(10)));

        await UniswapV3Vault.new(
            mockPoolAddress,
            1000,
            1000000000,
            governance,
            { from: accounts[0] }
        ).then((instance) => {
            v3vault_instance = instance;
        });

        await UniswapV3VaultManager.new(
            v3vault_instance.address,
            2400,
            1200,
            0,
            0,
            200000,
            600,
            keeper,
            { from: accounts[0] }
        ).then((instance) => {
            v3vaultmanager_instance = instance;
        });

        await v3vault_instance.setManager(
            v3vaultmanager_instance.address,
            { from: governance }
        );

        await Router.new(
            { from: accounts[0] }
        ).then((instance) => {
            router_instance = instance;
        });

    });

    describe("Config Standard Vault Manager Test", () => {

        it("Vault Config Test", async () => {

            const poolAddress = await v3vaultmanager_instance.pool(
                { from: accounts[0] }
            );
            assert.equal(poolAddress, mockPoolAddress, "Manager Pool is not matched at Mock Pool");
            
        });

        it("Manager Properties Test", async () => {

            const baseThreshold = await v3vaultmanager_instance.baseThreshold(
                { from: accounts[0] }
            );

            const limitThreshold = await v3vaultmanager_instance.limitThreshold(
                { from: accounts[0] }
            );

            const period = await v3vaultmanager_instance.period(
                { from: accounts[0] }
            );

            const minTickMove = await v3vaultmanager_instance.minTickMove(
                { from: accounts[0] }
            );

            const maxTwapDeviation = await v3vaultmanager_instance.maxTwapDeviation(
                { from: accounts[0] }
            );

            const twapDuration = await v3vaultmanager_instance.twapDuration(
                { from: accounts[0] }
            );

            assert.equal(baseThreshold, new BN('2400').toString(),"BaseThreshold property is not correct!");
            assert.equal(limitThreshold, new BN('1200').toString(), "LimitThreshold propery is not correct!");
            assert.equal(period, new BN('0').toString(), "Period property is not correct!");
            assert.equal(minTickMove, new BN('0').toString(), "MinTickMove property is not matched as defined!");
            assert.equal(maxTwapDeviation, new BN('200000').toString(), "MaxTwapDeviation is not correct!");
            assert.equal(twapDuration, new BN('600').toString(), "TwapDuration is not correct!");
        });

    });

    describe("Deposit & Withdraw works successfully!", () => {

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

        it("Withdraw works successfully", async () => {

            let totalShares = 0;

            const amount0Desired = 100000;
            const amount1Desired = 100000;
            const recipient = accounts[2];

            await token0.approve(
                v3vault_instance.address,
                (amount0Desired + amount0Desired),
                { from: accounts[1] }
            );

            await token1.approve(
                v3vault_instance.address,
                amount1Desired + amount1Desired,
                { from: accounts[1] }
            );

            let depositValue = await v3vault_instance.deposit.call(
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

            totalShares += parseInt(depositValue.shares);

            depositValue = await v3vault_instance.deposit.call(
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

            totalShares += parseInt(depositValue.shares);

            await v3vault_instance.withdraw(
                totalShares,
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

            const approved = await token0.allowance(
                accounts[1],
                v3vault_instance.address,
                { from: accounts[2] }
            );

            assert.equal(approved, new BN('0').toString());
            assert.equal(balance1, new BN("200000").toString());
            assert.equal(balance2, new BN("200000").toString());
        })
    });

    describe("Rebalance works successfully!", () => {

        it("1 hour forward & Rebalance function works successfully!", async () => {
            const amount0Desired = 100000;
            const amount1Desired = 100000;
            const recipient = accounts[2];

            await token0.approve(
                v3vault_instance.address,
                (amount0Desired + amount0Desired),
                { from: accounts[1] }
            );

            await token1.approve(
                v3vault_instance.address,
                amount1Desired + amount1Desired,
                { from: accounts[1] }
            );

            await token1.approve(
                router_instance.address,
                amount1Desired + amount1Desired,
                { from: accounts[1] }
            );

            await v3vault_instance.deposit(
                amount0Desired,
                amount1Desired,
                0,
                0,
                recipient,
                { from: accounts[1]}
            );

            const { total0, total1 } = await v3vault_instance.getTotalAmounts.call(
                { from: accounts[0] }
            );

            const totalSupply = await v3vault_instance.totalSupply(
                { from: accounts[0] }
            );          

            await v3vaultmanager_instance.rebalance(
                { from: keeper }
            );

            await router_instance.swap(
                mockPoolAddress,
                true,
                10000,
                { from: accounts[1] }
            ); 

            totalAmounts =  await v3vault_instance.getTotalAmounts.call(
                { from: accounts[0] }
            );

            assert.equal(total0, new BN('200000').toString());
            assert.equal(total1, new BN('200000').toString());
            assert.equal(totalSupply, new BN('200000').toString());
        });

    });
})
