const HDWalletProvider = require("@truffle/hdwallet-provider");
const secret = require("./secret.json");
const secretTestnet = require("./secret.testnet.json");
const secretDevelopment = require("./secret.development.json");

module.exports = {
  // Uncommenting the defaults below
  // provides for an easier quick-start with Ganache.
  // You can also follow this format for other networks;
  // see <http://truffleframework.com/docs/advanced/configuration>
  // for more details on how to specify configuration options!
  //
  networks: {
    development: {
      provider: () =>
        new HDWalletProvider(
          secretDevelopment.mnemonic,
          `http://localhost:8545`
        ),
      host: "127.0.0.1", // Localhost (default: none)
      port: 8545, // Standard BSC port (default: none)
      network_id: "*", // Any network (default: none)
      timeoutBlocks: 400,
    },
    testnet: {
      provider: () =>
        new HDWalletProvider(
          secretTestnet.mnemonic,
          `https://ropsten.infura.io/v3/${secretTestnet.API_KEY}`
        ),
        network_id: 3,       // Ropsten's id
        gas: 5500000,        // Ropsten has a lower block limit than mainnet
        confirmations: 2,    // # of confs to wait between deployments. (default: 0)
        timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
        skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    },
    mainnet: {
      provider: () =>
        new HDWalletProvider(
          secret.mnemonic,
          `https://mainnet.infura.io/v3/${secret.API_KEY}`
        ),
        network_id: 1,       // mainnet
        gas: 5500000,  
        gasPrice: 2000000000,  // check https://ethgasstation.info/
        confirmations: 2,    // # of confs to wait between deployments. (default: 0)
        timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
        skipDryRun: false     // Skip dry run before migrations? (default: false for public nets )
    },
  },
  compilers: {
    solc: {
      version: "0.7.6",
    },
  },
};
