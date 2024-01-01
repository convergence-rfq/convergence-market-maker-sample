import { Command } from "commander";
import { PublicKey } from "@solana/web3.js";
import { getRFQs } from "../../helpers/rfq";
import readline from "readline";
const getRFQJsonData = require("../../../api-inputs/get-rfqs.json");

export const getRfqsCommand = new Command("get-rfqs")
  .description("Get RFQs by wallet address")
  .action(async () => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    try {
      if (!getRFQJsonData) {
        console.error("Please provide get RFQs api-input Json file");
        return;
      }

      // Ask the user if they want only their RFQs
      rl.question("Do you want only My RFQs? (Yes/No): ", async (answer) => {
        if (answer.toLowerCase() === "yes" || answer.toLowerCase() === "y") {
          // User wants only their RFQs
          getRFQJsonData.onlyMyRFQs = true;
        } else {
          // User wants all RFQs
          getRFQJsonData.onlyMyRFQs = false;
        }

        // validating file inputs
        validateInputs(getRFQJsonData);

        // Get the BASE_URL from environment variables
        const rfqs = await getRFQs(getRFQJsonData);
        console.log("RFQs =>", rfqs);

        // Close the readline interface
        rl.close();
      });
    } catch (error: any) {
      console.error("An error occurred:", error);
      rl.close(); // Make sure to close the readline interface in case of an error
    }
  });

function validateInputs(data: any) {
  const { page, limit, instrument, rfqAccountAddress, paginationToken } = data;

  if (page && !isPositive(page)) {
    console.error(
      "Invalid page number. Allowed values are: [positive numbers]",
    );
    process.exit(1);
  }
  if (limit && !isPositive(limit)) {
    console.error(
      "Invalid limit number. Allowed values are: [positive numbers]",
    );
    process.exit(1);
  }
  if (instrument && !validateInstrument(instrument)) {
    console.error(
      "Invalid instrument. Allowed values are: [spot, options, all]",
    );
    process.exit(1);
  }
  if (
    rfqAccountAddress &&
    !validateSolanaPublicKey(rfqAccountAddress, "rfqAccountAddress")
  ) {
    console.error(
      "Invalid rfqAccountAddress. Address must be valid solana public key.",
    );
    process.exit(1);
  }
  if (paginationToken && typeof paginationToken !== "string") {
    console.error("Invalid paginationToken. Allowed values are: [string]");
    process.exit(1);
  }
}

function isPositive(value: string) {
  const amount = parseFloat(value);
  if (isNaN(amount) || amount <= 0) {
    console.error("Invalid amount. Amount must be a positive number.");
    process.exit(1);
  }
  return amount;
}

function validateInstrument(instrument: string): boolean {
  try {
    const validInstruments = ["spot", "options", "all"];
    return validInstruments.includes(instrument.toLowerCase());
  } catch (ex) {
    return false;
  }
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
