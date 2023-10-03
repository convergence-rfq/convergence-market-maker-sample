import { Command } from "commander";
import {
  createCollateralAccount,
  getCollateralAccount,
} from "../../helpers/collateral";

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
      const newCollateralAccount = await createCollateralAccount();

      console.log("New collateral account:", newCollateralAccount);
    } catch (error: any) {
      console.error("An error occurred:", error);
    }
  });
