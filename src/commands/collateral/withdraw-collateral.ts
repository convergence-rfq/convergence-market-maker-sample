import { Command } from "commander";
import {
  getCollateralAccount,
  withdrawCollateralFund,
} from "../../helpers/collateral";
import { broadcastTransaction } from "../../helpers/utils";
import readline from "readline";

export const withdrawCollateralFundCommand = new Command("withdraw-collateral")
  .description("Withdraw collateral fund to account")
  .action(async () => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      "Enter the amount to withdraw as collateral: ",
      async (amount) => {
        try {
          const withdrawFund = {
            amount: "0",
          };
          withdrawFund.amount = amount;

          const collateralAccount = await getCollateralAccount();
          if (!collateralAccount) {
            console.log("No collateral account found, please create first");
            return;
          }

          // validating file inputs
          validateInputs(withdrawFund);

          const base64Tx = await withdrawCollateralFund(withdrawFund);
          const signature = await broadcastTransaction(base64Tx);

          console.log("Withdraw fund successfully");
          console.log("Tx signature =>", signature);
        } catch (error: any) {
          console.error("An error occurred:", error);
        } finally {
          rl.close();
        }
      },
    );
  });

function validateInputs(data: any) {
  validateAmount(data.amount);
}

function validateAmount(value: string) {
  const amount = parseFloat(value);
  if (isNaN(amount) || amount <= 0) {
    console.error("Invalid amount. Amount must be a positive number.");
    process.exit(1);
  }
  return amount;
}
