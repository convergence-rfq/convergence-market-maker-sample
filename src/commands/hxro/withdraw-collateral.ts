import { Command } from "commander";
import readline from "readline";
import { withdrawHxroCollateralFund } from "../../helpers/hxro";

export const withdrawHxroCollateralFundCommand = new Command(
  "withdraw-hxro-collateral",
)
  .description("withdraw collateral fund to account")
  .action(async () => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    async function promptForAmount() {
      rl.question(
        "Enter the amount to withdraw collateral: ",
        async (amount) => {
          try {
            const addFund = {
              amount: "0",
            };
            addFund.amount = amount;

            // validating file inputs
            if (validateInputs(addFund)) {
              const signature = await withdrawHxroCollateralFund(amount);
              if (signature) {
                console.log("Tx signature", signature);
              }
              rl.close();
            } else {
              // If validation fails, prompt again
              await promptForAmount();
            }
          } catch (error: any) {
            console.error("An error occurred:", error);
            rl.close();
          }
        },
      );
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
