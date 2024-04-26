import { Command } from "commander";
import { PublicKey } from "@solana/web3.js";
import { getRFQs } from "../../helpers/rfq";
import readline from "readline";

export interface IGetRFQ {
  page: number;
  limit: number;
  instrument: string;
  paginationToken: string;
  rfqAccountAddress: string;
  onlyMyRFQs: boolean;
}

export const getRfqsCommand = new Command("get-rfqs")
  .description("Get RFQs by wallet address")
  .action(async () => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const getRfq: IGetRFQ = {
      page: 0,
      limit: 0,
      instrument: "",
      paginationToken: "",
      rfqAccountAddress: "",
      onlyMyRFQs: false,
    };

    try {
      // Ask the user if they want to specify a specific RFQ
      rl.question(
        "Do you want to get a specific RFQ?\nEnter public key or press Enter to continue: ",
        async (publicKey) => {
          if (publicKey.trim()) {
            // If the user entered a public key, validate it
            while (!validatePublicKey(publicKey)) {
              publicKey = await askForValidInput(
                "Enter a valid RFQ public key: ",
              );
            }

            // If the user entered a specific RFQ address
            getRfq.rfqAccountAddress = publicKey.trim();

            // Skip all questions and validations, directly call getRFQs
            const rfqs = await getRFQs(getRfq);
            console.log("RFQs =>", rfqs);

            // Close the readline interface
            rl.close();
          } else {
            // User wants all RFQs
            getRfq.onlyMyRFQs = await askForValidBoolean(
              "Do you want only own RFQs? (Yes/No): ",
            );

            // Ask for page limit
            getRfq.limit = await askForValidInteger(
              "Please enter page limit: ",
            );

            // Ask for page number
            getRfq.page = await askForValidInteger(
              "Please enter page number: ",
            );

            // Ask for pagination token
            getRfq.paginationToken = await askForValidInput(
              "If you have a pagination token, enter it, otherwise leave it empty: ",
            );

            // Ask for instrument
            getRfq.instrument = await askForValidInstrument(
              "If you want to enter instrumet, enter it [spot, options], otherwise leave it empty: ",
            );

            // Get the BASE_URL from environment variables
            const rfqs = await getRFQs(getRfq);
            console.log("RFQs =>", rfqs);

            // Close the readline interface
            rl.close();
          }
        },
      );
    } catch (error: any) {
      console.error("An error occurred:", error);
      rl.close(); // Make sure to close the readline interface in case of an error
    }
  });

// Function to validate a public key
function validatePublicKey(publicKey: string): boolean {
  try {
    if (new PublicKey(publicKey)) {
      return true;
    }
    return false;
  } catch (ex) {
    return false;
  }
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

// Function to ask the user for a valid integer input
async function askForValidInteger(prompt: string): Promise<number> {
  return new Promise<number>(async (resolve) => {
    let input = await askForValidInput(prompt);

    // Validate integer input
    while (!Number.isInteger(Number(input))) {
      console.error("Error: Please enter a valid integer.");
      // Ask again for a valid integer input
      input = await askForValidInput("Enter a valid integer: ");
    }

    resolve(Number(input));
  });
}

// Function to ask the user for a yes/no input
async function askForValidBoolean(prompt: string): Promise<boolean> {
  return new Promise<boolean>(async (resolve) => {
    let input = await askForValidInput(prompt);

    // Validate boolean input
    while (input.toLowerCase() !== "yes" && input.toLowerCase() !== "no") {
      // Ask again for a valid input
      input = await askForValidInput("Error! Enter Yes/No: ");
    }

    resolve(input.toLowerCase() === "yes");
  });
}

// Function to ask the user for a instrument input
async function askForValidInstrument(prompt: string): Promise<string> {
  return new Promise<string>(async (resolve) => {
    let input = await askForValidInput(prompt);

    // Validate instrument input
    while (
      input.toLowerCase() !== "spot" &&
      input.toLowerCase() !== "options" &&
      input.trim() !== ""
    ) {
      // Ask again for a valid input
      input = await askForValidInput(
        "Error! Please enter valid instrument [spot, options]: ",
      );
    }

    resolve(input.toLowerCase());
  });
}
