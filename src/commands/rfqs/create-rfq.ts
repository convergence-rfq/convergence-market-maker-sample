import { Command } from "commander";
import { broadcastTransaction } from "../../helpers/utils";
import { createRFQ } from "../../helpers/rfq";
import { getUserBalances } from "../../helpers/sdk-helper";
import readline from "readline";

export interface ICreateRFQ {
  rfqType: string;
  amount: number;
  quoteMint: string;
  baseMint: string;
  orderType: string;
  rfqSize: string;
  rfqExpiry: number;
  settlementWindow: number;
}

export const createRfqCommand = new Command("create-rfq")
  .description("Create a new RFQ")
  .action(async () => {
    const createRFQData: ICreateRFQ = {
      rfqType: "",
      amount: 0,
      quoteMint: "",
      baseMint: "",
      orderType: "",
      rfqSize: "",
      rfqExpiry: 0,
      settlementWindow: 0,
    };
    try {
      // Ask for RFQ type and validate
      createRFQData.rfqType = await askAndValidate(
        "Enter RFQ type (spot/options): ",
        ["spot", "options"],
      );

      // Ask for amount and validate
      createRFQData.amount =
        await askAndValidatePositiveNumber("Enter amount: ");

      // Ask for quoteMint and validate
      const quoteMint = await askAndValidate("Enter quote mint (usdc): ", [
        "usdc",
      ]);

      // Ask for baseMint and validate
      const baseMint = await askAndValidate(
        "Enter base mint (msol, btc, sol): ",
        ["msol", "btc", "sol"],
      );

      const supportedTokens = await validateMintAddress(baseMint, quoteMint);
      createRFQData.quoteMint = supportedTokens.quoteMintAddress;
      createRFQData.baseMint = supportedTokens.baseMintAddress;

      // Ask for orderType and validate
      createRFQData.orderType = await askAndValidate(
        "Enter order type (buy, sell, 2-way): ",
        ["buy", "sell", "2-way"],
      );

      // Ask for rfqSize and validate
      createRFQData.rfqSize = await askAndValidate(
        "Enter RFQ size (fixed-base, fixed-quote, open): ",
        ["fixed-base", "fixed-quote", "open"],
      );

      // Ask for rfqExpiry time and validate
      createRFQData.rfqExpiry = await askAndValidatePositiveNumber(
        "Enter RFQ expiry time in seconds (3600 = 1hour): ",
      );

      // Ask for settlementWindow time and validate
      createRFQData.settlementWindow = await askAndValidatePositiveNumber(
        "Enter settlement window time in seconds (120 = 2min): ",
      );

      // Creating base64 transaction
      const base64Tx = await createRFQ(createRFQData);

      // Broadcasting transaction on chain
      const signature = await broadcastTransaction(base64Tx);

      console.info("RFQ created successfully.", signature);
    } catch (error: any) {
      console.error("An error occurred:", error);
      process.exit(1);
    }
  });

// Function to ask the user for input and validate against an array of valid options
async function askAndValidate(
  prompt: string,
  validOptions: string[],
): Promise<string> {
  return new Promise<string>(async (resolve) => {
    let input = await askForValidInput(prompt);

    // Validate input against valid options
    while (!validOptions.includes(input.toLowerCase())) {
      // Ask again for a valid input
      input = await askForValidInput(
        `Error! Enter a valid option (${validOptions.join("/")}): `,
      );
    }

    resolve(input.toLowerCase());
  });
}

// Function to ask the user for a positive number input
async function askAndValidatePositiveNumber(prompt: string): Promise<number> {
  return new Promise<number>(async (resolve) => {
    let input = await askForValidInput(prompt);

    // Validate positive number input
    while (isNaN(parseFloat(input)) || parseFloat(input) <= 0) {
      // Ask again for a valid positive number input
      input = await askForValidInput("Error! Enter a valid positive number: ");
    }

    resolve(parseFloat(input));
  });
}

// Function to ask the user for a valid input
async function askForValidInput(prompt: string): Promise<string> {
  return new Promise<string>((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false, // Set terminal to false to handle line endings correctly
    });

    rl.question(prompt, (input) => {
      rl.close();
      resolve(input.trim()); // Trim the input to remove leading/trailing whitespaces
    });
  });
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
