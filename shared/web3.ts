import "dotenv/config";
import Web3 from "web3";
import { HTTP_PROVIDER_ETH } from "./constants";

const web3 = new Web3(
  new Web3.providers.HttpProvider(process.env.HTTP_PROVIDER_ETH)
);

export { web3 };
