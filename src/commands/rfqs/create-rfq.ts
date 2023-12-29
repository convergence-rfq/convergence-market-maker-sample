import { Command } from "commander";
import { PublicKey } from "@solana/web3.js";
import { broadcastTransaction } from "../../helpers/utils";
import { createRFQ } from "../../helpers/rfq";
import { getUserBalances } from "../../helpers/sdk-helper";
const createRFQJasonData = require("../../../api-inputs/create-rfq.json");

export const createRfqCommand = new Command("create-rfq")
  .description("Create a new RFQ")
  .action(async () => {
    try {
      if (!createRFQJasonData) {
        console.error("Please provide create RFQ api-input Json file");
        return;
      }

      // validating file inputs
      await validateInputs(createRFQJasonData);

      // creating base64 transaction
      const base64Tx = await createRFQ(createRFQJasonData);

      // broadcasting transaction on chain
      const signature = await broadcastTransaction(base64Tx);

      console.info("RFQ created successfully.", signature);
    } catch (error: any) {
      console.error("An error occurred:", error);
      process.exit(1);
    }
  });

function validateRfqType(value: string) {
  const validRfqTypes = ["spot", "options"];
  if (!validRfqTypes.includes(value)) {
    console.error("Invalid RFQ Type. Allowed values are: [spot, options]");
    process.exit(1);
  }
  return value;
}

function validateOrderType(value: string) {
  const orderTypes = ["buy", "sell"];
  if (!orderTypes.includes(value)) {
    console.error("Invalid Order Type. Allowed values are: [buy, sell]");
    process.exit(1);
  }
  return value;
}

function validateRfqSize(value: string) {
  const rfqSize = ["fixed-base", "fixed-quote", "open"];
  if (!rfqSize.includes(value)) {
    console.error(
      `Invalid RFQ size. Allowed values are: ${rfqSize.map((x) => x)}`,
    );
    process.exit(1);
  }
  return value;
}

function validateAmount(value: string) {
  const amount = parseFloat(value);
  if (isNaN(amount) || amount <= 0) {
    console.error("Invalid amount. Amount must be a positive number.");
    process.exit(1);
  }
  return amount;
}

function validateSolanaPublicKey(address: string, arg: string) {
  try {
    if (new PublicKey(address)) {
      return address;
    }
  } catch (ex) {
    console.error(
      `Invalid ${arg} address: Address must be valid solana public key.`,
    );
    process.exit(1);
  }
}

async function validateMintAddress(baseMint: string, quoteMint: string) {
  const res = await getUserBalances("");

  const tokens = Object.keys(res.balances).map((key) => ({
    //@ts-ignore
    iconKey: res.balances[key].iconKey.toLowerCase(),
    //@ts-ignore
    mintAddress: res.balances[key].mintAddress,
  }));

  if (baseMint.toLowerCase() === quoteMint.toLowerCase()) {
    console.error(`Base and quote mints cannot be the same.`);
    process.exit(1);
  }

  const allowedTokens = tokens.map((x) => x.iconKey);
  if (!allowedTokens.includes(baseMint.toLowerCase())) {
    console.error(
      `Invalid base mint: ${baseMint}, allowed [${allowedTokens.map(
        (x) => x,
      )}]`,
    );
    process.exit(1);
  }
  if (!allowedTokens.includes(quoteMint.toLowerCase())) {
    console.error(
      `Invalid quote mint: ${quoteMint}, allowed [${allowedTokens.map(
        (x) => x,
      )}]`,
    );
    process.exit(1);
  }

  // Find the token with the specified baseMint
  const baseMintToken = tokens.find(
    (token) => token.iconKey.toLowerCase() === baseMint.toLowerCase(),
  );

  if (!baseMintToken) {
    console.error(`Token with baseMint ${baseMint} not found.`);
    process.exit(1);
  }

  // Find the token with the specified quoteMint
  const quoteMintToken = tokens.find(
    (token) => token.iconKey.toLowerCase() === quoteMint.toLowerCase(),
  );

  if (!quoteMintToken) {
    console.error(`Token with quoteMint ${quoteMint} not found.`);
    process.exit(1);
  }

  // Return baseMint, quoteMint, iconKey, and mintAddress if found
  return {
    baseMint: baseMint.toLowerCase(),
    baseMintAddress: baseMintToken.mintAddress,
    quoteMint: quoteMint.toLowerCase(),
    quoteMintAddress: quoteMintToken.mintAddress,
  };
}

function validateTime(value: string, arg: string) {
  const amount = parseFloat(value);
  if (isNaN(amount) || amount <= 0) {
    console.error(
      `Invalid ${arg}. ${arg} must be a positive number. [Time in seconds (3600 = 1hour)]`,
    );
    process.exit(1);
  }
  return amount;
}

async function validateInputs(data: any) {
  validateRfqType(data.rfqType);
  validateOrderType(data.orderType);
  validateRfqSize(data.rfqSize);
  validateAmount(data.amount);
  const res = await validateMintAddress(data.baseMint, data.quoteMint);
  data.baseMint = res.baseMintAddress;
  data.quoteMint = res.quoteMintAddress;
  validateTime(data.rfqExpiry, "rfqExpiry");
  validateTime(data.settlementWindow, "settlementWindow");
}
