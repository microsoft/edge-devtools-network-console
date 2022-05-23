/**
 * @type import('hardhat/config').HardhatUserConfig
 */

require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
require("./scripts/deploy.js");
require("./scripts/mint.js");
require("@nomiclabs/hardhat-etherscan");

const { INFURA_KEY, ACCOUNT_PRIVATE_KEY, ETHERSCAN_API_KEY } = process.env;

module.exports = {
    solidity: "0.8.14",
    version: "0.8.14",
    settings: {
        optimizer: true,
        runs: 200
    },
    defaultNetwork: "rinkeby",
    networks: {
        hardhat: {},
        rinkeby: {
            url: `https://eth-rinkeby.alchemyapi.io/v2/${INFURA_KEY}`,
            accounts: [`0x${ACCOUNT_PRIVATE_KEY}`]
        },
        ethereum: {
            chainId: 1,
            url: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
            accounts: [`0x${ACCOUNT_PRIVATE_KEY}`]
        },
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
}