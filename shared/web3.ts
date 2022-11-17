import "dotenv/config";
import Web3 from "web3";

const web3 = new Web3(process.env.HTTP_PROVIDER_ETH);

export { web3 };
