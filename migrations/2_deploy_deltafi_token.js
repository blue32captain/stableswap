const DeltafiToken = artifacts.require("DeltafiToken");
const secret = require("../secret.json");
const secretTestnet = require("../secret.testnet.json");

module.exports = async function (deployer, network) {
    if (network == "mainnet") {
        await deployer.deploy(
            DeltafiToken,
            secret.tokenHolder
        );
    } else {
        await deployer.deploy(
            DeltafiToken,
            secretTestnet.tokenHolder
        );
    }
}