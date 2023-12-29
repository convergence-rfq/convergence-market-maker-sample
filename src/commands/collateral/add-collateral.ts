import { Command } from "commander";
import {
  addCollateralFund,
  createCollateralAccount,
  getCollateralAccount,
} from "../../helpers/collateral";
import { broadcastTransaction } from "../../helpers/utils";
import readline from "readline";

export const addCollateralFundCommand = new Command("add-collateral")
  .description("Add collateral fund to account")
  .action(async () => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    async function promptForAmount() {
      rl.question("Enter the amount to add as collateral: ", async (amount) => {
        try {
          const addFund = {
            amount: "0",
          };
          addFund.amount = amount;

          const collateralAccount = await getCollateralAccount();
          if (!collateralAccount) {
            // if no collateral account found, setup new one
            await createCollateralAccount();
          }

          // validating file inputs
          if (validateInputs(addFund)) {
            const base64Tx = await addCollateralFund(addFund);
            const signature = await broadcastTransaction(base64Tx);

            console.log("Fund added successfully");
            console.log("Tx signature =>", signature);
            rl.close();
          } else {
            // If validation fails, prompt again
            await promptForAmount();
          }
        } catch (error: any) {
          console.error("An error occurred:", error);
          rl.close();
        }
      });
    }

    // Start the prompt
    await promptForAmount();
  });

function validateInputs(data: any) {
  return validateAmount(data.amount);
}

function validateAmount(value: string) {
  const amount = parseFloat(value);
  if (isNaN(amount) || amount <= 0) {
    console.error("Invalid amount. Amount must be a positive number.");
    return false;
  }
  return true;
}
