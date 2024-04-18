import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import bs58 from "bs58";
import { connection } from "./connections";

// FbvYXyY3jue5iBXdUyogfUBGM4nnuYSVU93aTM3nACKg
const MIN_AUTHORITY = Keypair.fromSecretKey(
  new Uint8Array([
    220, 47, 130, 197, 215, 178, 169, 49, 161, 166, 195, 194, 13, 33, 118, 177,
    205, 232, 165, 225, 111, 237, 243, 23, 164, 140, 218, 11, 38, 152, 124, 194,
    216, 245, 232, 17, 199, 220, 155, 56, 15, 254, 105, 128, 77, 228, 166, 157,
    187, 228, 242, 36, 146, 207, 187, 65, 26, 99, 60, 44, 116, 139, 178, 63,
  ]),
);

const privateKeyBase58 = process.env.PRIVATE_KEY || "";

export const broadcastTransaction = async (
  base64Response: string,
  tempSinger?: string,
) => {
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
    const singers = [Keypair.fromSecretKey(privateKeyBytes)];
    if (tempSinger) {
      const tempSingerPrivateKeyBytes = bs58.decode(tempSinger || "");
      singers.push(Keypair.fromSecretKey(tempSingerPrivateKeyBytes));
    }

    return await sendAndConfirmTransaction(
      connection,
      Transaction.from(txn),
      singers,
    );
  } catch (error) {
    console.error("Error broadcastTransaction:", error);
    process.exit(1);
  }
};

export const airDropSol = async (publicKey: string) => {
  try {
    const airdropSignature = await connection.requestAirdrop(
      new PublicKey(publicKey),
      LAMPORTS_PER_SOL,
    );
    console.log("air drop signature", airdropSignature);
  } catch (error) {
    // Error while solana airdrip, trying with registerNewSolanaAddress method
    await registerNewSolanaAddress();
  }
};

export const registerNewSolanaAddress = async () => {
  try {
    const privateKeyBytes = bs58.decode(privateKeyBase58);
    const keypair = Keypair.fromSecretKey(privateKeyBytes);

    // amount of space to reserve for the account. system accounts are 0 space
    const space = 0;

    // Get the rent, in lamports, for exemption
    const rentExemptionAmount =
      await connection.getMinimumBalanceForRentExemption(space);

    const createAccountParams = {
      fromPubkey: MIN_AUTHORITY.publicKey,
      newAccountPubkey: keypair.publicKey,
      lamports: rentExemptionAmount * 100,
      space,
      programId: SystemProgram.programId,
    };

    const createAccountTransaction = new Transaction().add(
      SystemProgram.createAccount(createAccountParams),
    );

    const signature = await sendAndConfirmTransaction(
      connection,
      createAccountTransaction,
      [MIN_AUTHORITY, keypair],
    );
    console.log("Register new solana address", signature);
  } catch (error) {
    console.log(error);
  }
};

type TokenAddresses = {
  msol: string;
  usdc: string;
  btc: string;
  wsol: string;
};

const tokenAddresses: TokenAddresses = {
  msol: "FYQ5MgByxnkfGAUzNcbaD734VK8CdEUX49ioTkokypRc",
  usdc: "BREWDGvXEQKx9FkZrSCajzjy4cpm9hofzze3b41Z3V4p",
  btc: "A3c9ThQZTUruMm56Eu4fxVwRosg4nBTpJe2B1pxBMYK7",
  wsol: "So11111111111111111111111111111111111111112",
};

export const getAddressByTokenName = (tokenName: keyof TokenAddresses) => {
  if (tokenAddresses.hasOwnProperty(tokenName)) {
    return tokenAddresses[tokenName];
  } else {
    return "Token not found";
  }
};

export interface ICreateRFQ {
  rfqType: string;
  amount: number;
  quoteMint: string;
  baseMint: string;
  orderType: string;
  rfqSize: string;
  rfqExpiry: number;
  settlementWindow: number;
  strategyData: IStrategyData[];
  optionStyle: string;
  counterParties: string[];
}

export interface IStrategyData {
  baseAsset: string;
  direction: boolean;
  id: string;
  instrument: string;
  legNumber: number;
  mintedInstrument: null;
  oracle: number;
  quantity: number;
  quoteAsset: string;
  //screen: number;
  size: number;
  strike: number;
  expiry: number;
}
