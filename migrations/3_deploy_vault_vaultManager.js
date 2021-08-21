const UniswapV3Vault = artifacts.require("UniswapV3Vault");
const UniswapV3VaultManager = artifacts.require("UniswapV3VaultManager");
const vaultConfig = require("../vault.config.json");
const secret = require("../secret.json");
const secretTestnet = require("../secret.testnet.json");

module.exports = function (deployer, network) {
    if (network == "mainnet") {

        deployer.deployer(
            UniswapV3Vault,
            vaultConfig.PoolAddress,
            vaultConfig.ProtocolFee,
            vaultConfig.MaxTotalSupply
        );

        vaultInstance = await UniswapV3Vault.deployed();

        deployer.deployer(
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

        deployer.deployer(
            UniswapV3Vault,
            vaultConfig.PoolAddress,
            vaultConfig.ProtocolFee,
            vaultConfig.MaxTotalSupply
        );

        vaultInstance = await UniswapV3Vault.deployed();

        deployer.deployer(
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