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

        const messageVaule = new BN("1025000000000000000");

        await MockToken.new(
            { from: accounts[1] }
        ).then((instance) => {
            token0 = instance;
        }); 

        await MockToken.new(
            { from: accounts[2] }
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
            100000000000,
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
            assert.equal(maxTotalSupply, new BN('100000000000').toString())
        });

        it("ProtocolFee Test", async () => {
            const ProtocolFee = await v3vault_instance.protocolFee(
                { from: accounts[0] }
            );
            assert.equal(ProtocolFee, new BN('1000').toString())
        });

    });    
    
});