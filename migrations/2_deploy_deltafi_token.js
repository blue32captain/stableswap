const DeltafiToken = artifacts.require("DeltafiToken");
const secret = require("../secret.json");
const secretTestnet = require("../secret.testnet.json");

module.exports = function(deployer, network) {
    if (network == "mainnet") {
        deployer.deployer(
            DeltafiToken,
            secret.tokenHolder 
        );
    } else {
        deployer.deployer(
            DeltafiToken,
            secretTestnet.tokenHolder 
        );
    }
}