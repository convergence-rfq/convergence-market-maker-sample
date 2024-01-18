import { Connection } from "@solana/web3.js";

const rpcUrl = process.env.RPC_URL || "https://api.mainnet-beta.solana.com/";

export const connection = new Connection(rpcUrl, "confirmed");
