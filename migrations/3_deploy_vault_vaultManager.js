const UniswapV3Vault = artifacts.require("UniswapV3Vault");
const UniswapV3VaultManager = artifacts.require("UniswapV3VaultManager");
const vaultConfig = require("../vault.config.json");
const secret = require("../secret.json");
const secretTestnet = require("../secret.testnet.json");

module.exports = async function (deployer, network) {
    if (network == "mainnet") {
        await deployer.deploy(
            UniswapV3Vault,
            vaultConfig.PoolAddress,
            vaultConfig.ProtocolFee,
            vaultConfig.MaxTotalSupply
        );
        const vaultInstance = await UniswapV3Vault.deployed();
        console.log('vault address: ', vaultInstance.address);

        await deployer.deploy(
            UniswapV3VaultManager,
            vaultInstance.address,
            vaultConfig.BaseThreshold,
            vaultConfig.LimitThreshold,
            vaultConfig.Period,
            vaultConfig.MinTickMove,
            vaultConfig.MaxTwapDeviation,
            vaultConfig.TwapDuration,
            secret.Keeper
        );

    } else {
        await deployer.deploy(
            UniswapV3Vault,
            vaultConfig.PoolAddress,
            vaultConfig.ProtocolFee,
            vaultConfig.MaxTotalSupply
        );
        const vaultInstance = await UniswapV3Vault.deployed();
        console.log('vault address: ', vaultInstance.address);

        await deployer.deploy(
            UniswapV3VaultManager,
            vaultInstance.address,
            vaultConfig.BaseThreshold,
            vaultConfig.LimitThreshold,
            vaultConfig.Period,
            vaultConfig.MinTickMove,
            vaultConfig.MaxTwapDeviation,
            vaultConfig.TwapDuration,
            secretTestnet.Keeper
        );

    }
}