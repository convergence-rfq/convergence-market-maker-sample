import { Command } from "commander";
import {
  createCollateralAccount,
  getCollateralAccount,
} from "../../helpers/collateral";
import { broadcastTransaction } from "../../helpers/utils";

export const createCollateralCommand = new Command("create-collateral-account")
  .description("Create collateral account by wallet address")
  .action(async () => {
    try {
      // checking if already exists
      const collateralAccount = await getCollateralAccount();
      if (collateralAccount) {
        console.log("Collateral account already exists:", collateralAccount);
        return;
      }

      // creating new collateral account
      const base64Tx = await createCollateralAccount();

      // broadcasting transaction on chain
      const signature = await broadcastTransaction(base64Tx);
      console.log("Tx signature =>", signature);
    } catch (error: any) {
      console.error("An error occurred:", error);
    }
  });
