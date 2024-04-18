import { Command } from "commander";
import {
  ICreateRFQ,
  IStrategyData,
  broadcastTransaction,
} from "../../helpers/utils";
import { createRFQ } from "../../helpers/rfq";
import { getUserBalances } from "../../helpers/sdk-helper";
import readline from "readline";
const inquirer = require("inquirer");

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
      strategyData: [],
      optionStyle: "",
      counterParties: [],
    };

    try {
      // Ask for RFQ type using inquirer prompt
      const rfqTypeAnswer = await inquirer.prompt({
        type: "list",
        name: "rfqType",
        message: "Select RFQ type: ",
        choices: ["spot", "options"],
      });
      createRFQData.rfqType = rfqTypeAnswer.rfqType;

      // Ask for baseMint and validate
      const tokens = await getSupportedTokens();
      const baseMintAnswer = await inquirer.prompt({
        type: "list",
        name: "baseMint",
        message: "Select Base mint: ",
        choices: tokens.map(
          (token) => `${token.iconKey} - ${token.mintAddress}`,
        ),
      });
      createRFQData.baseMint = baseMintAnswer.baseMint.split("-")[0].trim();

      // Ask for quoteMint and validate
      const quoteMintAnswer = await inquirer.prompt({
        type: "list",
        name: "quoteMint",
        message: "Select quote mint: ",
        choices: ["usdc"],
      });
      createRFQData.quoteMint = quoteMintAnswer.quoteMint;

      const supportedTokens = await validateMintAddress(
        createRFQData.baseMint,
        createRFQData.quoteMint,
        tokens,
      );
      createRFQData.quoteMint = supportedTokens.quoteMintAddress;
      createRFQData.baseMint = supportedTokens.baseMintAddress;

      // Ask for orderType and validate
      const orderTypeAnswer = await inquirer.prompt({
        type: "list",
        name: "orderType",
        message: "Select order type: ",
        choices: ["buy", "sell", "two-way"],
      });
      createRFQData.orderType = orderTypeAnswer.orderType;

      // Ask for rfqSize and validate
      const rfqSizeAnswer = await inquirer.prompt({
        type: "list",
        name: "rfqSize",
        message: "Select RFQ size: ",
        choices: ["fixed-base", "fixed-quote", "open"],
      });
      createRFQData.rfqSize = rfqSizeAnswer.rfqSize;

      // Ask for rfqExpiry time and validate
      createRFQData.rfqExpiry = await askAndValidatePositiveNumber(
        "Enter RFQ expiry time in seconds (3600 = 1hour): ",
      );

      // Ask for settlementWindow time and validate
      createRFQData.settlementWindow = await askAndValidatePositiveNumber(
        "Enter settlement window time in seconds (60 = 1min): ",
      );

      let message = "";
      const text =
        createRFQData.orderType.toUpperCase() === "TWO-WAY"
          ? "Trade two-way"
          : createRFQData.orderType.toUpperCase();
      // Ask for amount and validate
      if (createRFQData.rfqSize.toLowerCase() === "fixed-quote")
        message = `Enter total ${quoteMintAnswer.quoteMint.toUpperCase()} amount to spend in order to ${text} ${baseMintAnswer.baseMint
          .split("-")[0]
          .trim()
          .toUpperCase()}`;
      else
        message = `Enter amount of ${baseMintAnswer.baseMint
          .split("-")[0]
          .trim()
          .toUpperCase()} you want to ${text}`;
      createRFQData.amount = await askAndValidatePositiveNumber(`${message}: `);

      // Ask if the user wants to add counterparty selection
      const addCounterpartyAnswer = await inquirer.prompt({
        type: "list",
        name: "addCounterparty",
        message: "Do you want to add counterparty selection?",
        choices: ["No", "Yes"],
      });

      if (addCounterpartyAnswer.addCounterparty === "Yes") {
        const counterParties: string[] = [];

        let addMoreCounterparties = true;
        while (addMoreCounterparties) {
          const counterpartyAnswer = await inquirer.prompt({
            type: "input",
            name: "counterparty",
            message: "Enter counterparty wallet address: ",
          });

          counterParties.push(counterpartyAnswer.counterparty);

          const addAnotherAnswer = await inquirer.prompt({
            type: "list",
            name: "addAnother",
            message: "Do you want to add more?",
            choices: ["No", "Yes"],
          });

          addMoreCounterparties = addAnotherAnswer.addAnother === "Yes";
        }

        createRFQData.counterParties = counterParties;
      }

      // If rfqType is "options," ask for IStrategyData
      if (createRFQData.rfqType === "options") {
        // Ask for rfqSize and validate
        const optionStyleAnswer = await inquirer.prompt({
          type: "list",
          name: "optionStyle",
          message: "Select style: ",
          choices: ["american", "european"],
        });
        createRFQData.optionStyle = optionStyleAnswer.optionStyle;

        let addAnotherStrategy = true;
        while (addAnotherStrategy) {
          const directionAnswer = await inquirer.prompt({
            type: "list",
            name: "direction",
            message: "Select direction: ",
            choices: ["short", "long"],
          });
          const direction = directionAnswer.direction;

          const instrumentAnswer = await inquirer.prompt({
            type: "list",
            name: "instrument",
            message: "Select instrument: ",
            choices: ["put", "call"],
          });
          const instrument = instrumentAnswer.instrument;

          // Ask for IStrategyData fields and validate
          const strategyData: IStrategyData = {
            baseAsset: supportedTokens.baseMint.toUpperCase(),
            quoteAsset: supportedTokens.quoteMint.toUpperCase(),
            direction: direction === "long" ? true : false,
            instrument: instrument.toUpperCase(),
            screen: await askAndValidatePositiveNumber("Enter screen price: "),
            strike: await askAndValidatePositiveNumber("Enter strike price: "),
            expiry: 0,
            quantity: 0,
            size: await askAndValidatePositiveNumber("Enter size: "),
            id: `data-${createRFQData.strategyData.length + 1}`,
            legNumber: createRFQData.strategyData.length + 1,
            mintedInstrument: null,
            oracle: 0,
          };

          // Calculating leg expiry dates and timestamps
          const dates = getNextNFridaysTimestamps(5);
          const legExpirtyAnswer = await inquirer.prompt({
            type: "list",
            name: "instrument",
            message: "Select leg expiry date: ",
            choices: dates.map((x) => x.date),
          });
          strategyData.expiry =
            dates.find((x) => x.date == legExpirtyAnswer.instrument)
              ?.timestamp || 0;
          strategyData.quantity = strategyData.size;

          // Add IStrategyData to the strategyData array
          createRFQData.strategyData.push(strategyData);

          // Ask if the user wants to add another strategyData
          const addAnotherStrategyAnswer = await inquirer.prompt({
            type: "list",
            name: "addAnotherStrategy",
            message: "Add another strategy data? ",
            choices: ["No", "Yes"],
          });

          addAnotherStrategy =
            addAnotherStrategyAnswer.addAnotherStrategy === "Yes";
        }
      }

      // Creating base64 transaction
      const result = await createRFQ(createRFQData);

      const tempSinger = result.tempSinger;
      for (const [index, base64Tx] of result.response.entries()) {
        const signature =
          tempSinger && index === 0
            ? await broadcastTransaction(base64Tx, tempSinger)
            : await broadcastTransaction(base64Tx);

        console.info("Tx Signature.", signature);
      }
    } catch (error: any) {
      console.error("An error occurred:", error);
      process.exit(1);
    }
  });

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

async function validateMintAddress(
  baseMint: string,
  quoteMint: string,
  tokens: any[],
) {
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

async function getSupportedTokens() {
  const res = await getUserBalances("");
  const supportedTokens = ["msol", "btc", "usdc"];
  const tokens = Object.keys(res.balances)
    .map((key) => ({
      //@ts-ignore
      iconKey: res.balances[key].iconKey.toLowerCase(),
      //@ts-ignore
      mintAddress: res.balances[key].mintAddress,
    }))
    .filter((token) => supportedTokens.includes(token.iconKey));
  console.log(tokens);
  return tokens;
}

function getNextNFridaysTimestamps(n: number) {
  const currentDate = new Date();
  const fridayTimestamps = [];

  for (let i = 0; i < n; i++) {
    // Calculate days until the next Friday (5 = Friday)
    const daysUntilNextFriday = ((5 - currentDate.getDay() + 7) % 7) + i * 7;

    // Set time to 8:00 PM local time
    const nextFriday = new Date(currentDate);

    nextFriday.setDate(currentDate.getDate() + daysUntilNextFriday);
    nextFriday.setHours(20, 0, 0, 0);

    // Format date as desired (15-Dec-2023)
    const formattedNextFriday = `${nextFriday.getFullYear()}-${(
      nextFriday.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${nextFriday.getDate().toString().padStart(2, "0")}`;

    const fridayDate = new Date(`${formattedNextFriday}T08:00:00.000Z`);
    const fridayTimestampInSeconds = Math.floor(fridayDate.getTime() / 1000);

    fridayTimestamps.push({
      date: formattedNextFriday,
      timestamp: fridayTimestampInSeconds,
    });
  }

  return fridayTimestamps;
}
