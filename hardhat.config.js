require("dotenv").config();

require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");
require('@openzeppelin/hardhat-upgrades');
require('@nomiclabs/hardhat-truffle5');
require("@nomiclabs/hardhat-ethers");
require("hardhat-deploy"); 
require("chai");



// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const infuraKey = process.env.INFURA_KEY; 
const Private_Key = process.env.PRIVATE_KEY; 

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  networks: {
    hardhat: {
      forking: {
        url: "https://eth-mainnet.alchemyapi.io/v2/1vbm3MpHH9ogWHiARz3yZe7M3oizuEEQ",
        blockNumber: 11099000
      }
    },
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/de9d5932c6ee4831b35f73b1b64bad51", //Infura url with projectId
      accounts: ["0xe0f28d12b2d98b93f2d623a1f0fff3bdff05f7312928733cfb6c5d26cf7923fc"],
      network_id: 4,       
      gas: 5500000,
      confirmations: 2,
      timeoutBlocks: 200,
      networkCheckTimeout: 50000, 
      skipDryRun: true   // add the account that will deploy the contract (private key)
     },
   },etherscan: {
     apiKey:"BIWZIIKQEAWJH99I5ZSMZIGC2U8HFVFSMR",
   },namedAccounts: {
    deployer: 0,
    feeRecipient: 1,
    user: 2,
  },gasReporter: {
    currency: "USD",
    gasPrice: 50,
    enabled: process.env.REPORT_GAS ? true : false,
    coinmarketcap: process.env.CMC_API_KEY,
    excludeContracts: ["mocks/"],
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
































