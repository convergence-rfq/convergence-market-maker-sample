import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import bs58 from "bs58";
import { connection } from "./connections";

const privateKeyBase58 = process.env.PRIVATE_KEY || "";

export const broadcastTransaction = async (base64Response: string) => {
  if (!base64Response) {
    console.error(`Base64 transaction is missing`);
    process.exit(1);
  }

  const txn = Buffer.from(base64Response, "base64");

  if (!privateKeyBase58) {
    console.error(`Please provide your private key in .env file`);
    process.exit(1);
  }

  try {
    const privateKeyBytes = bs58.decode(privateKeyBase58);
    return await sendAndConfirmTransaction(connection, Transaction.from(txn), [
      Keypair.fromSecretKey(privateKeyBytes),
    ]);
  } catch (error) {
    console.error("Error decoding private key:", error);
    process.exit(1);
  }
};

export const airDropSol = async (publicKey: string) => {
  try {
    const airdropSignature = await connection.requestAirdrop(
      new PublicKey(publicKey),
      LAMPORTS_PER_SOL
    );
    console.log('air drop signature', airdropSignature)
  } catch (error) {
    console.error("Error decoding private key:", error);
  }
};
