import { Connection } from "@solana/web3.js";

const rpcUrl =
  process.env.RPC_URL ||
  "https://muddy-white-morning.solana-devnet.quiknode.pro/637131a6924513d7c83c65efc75e55a9ba2517e9/";

export const connection = new Connection(rpcUrl, "confirmed");
