import { Command } from "commander";
import { PublicKey } from "@solana/web3.js";
import { broadcastTransaction } from "../../helpers/utils";
import { createRFQ } from "../../helpers/rfq";
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
      validateInputs(createRFQJasonData);

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

function validateMintAddress(baseMint: string, quoteMint: string) {
  if (baseMint.toLowerCase() === quoteMint.toLowerCase()) {
    console.error(`Base and quote mints can not be same.`);
    process.exit(1);
  }

  const allowedTokens = ["msol", "wsol", "btc", "usdc"];
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

function validateInputs(data: any) {
  validateRfqType(data.rfqType);
  validateOrderType(data.orderType);
  validateRfqSize(data.rfqSize);
  validateAmount(data.amount);
  validateMintAddress(data.baseMint, data.quoteMint);
  validateTime(data.rfqExpiry, "rfqExpiry");
  validateTime(data.settlementWindow, "settlementWindow");
}
