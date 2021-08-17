const { BN } = require("web3-utils");

const UniswapV3Vault = artifacts.require("UniswapV3Vault");
const UniswapV3VaultManager = artifacts.require("UniswapV3VaultManager");
const MockToken = artifacts.require("MockToken");
const UniswapV3Factory = artifacts.require("UniswapV3Factory");

contract("UniswapV3VaultManager", (accounts) => {
    var uniswapv3factory_instance;
    var token0, token1;
    var mockPoolAddress;
    var v3vault_instance;
    var v3vaultmanager_instance;
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

    })
})
