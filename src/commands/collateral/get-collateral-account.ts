import { Command } from "commander";
import { getCollateralAccount } from "../../helpers/collateral";

export const getCollateralCommand = new Command("get-collateral-account")
  .description("Get collateral account by wallet address")
  .action(async () => {
    try {
      // getting collateral account
      const collateralAccount = await getCollateralAccount();
      if (!collateralAccount) {
        console.log("No collateral account found, please create first");
        return;
      }
      console.log("Collateral account:", collateralAccount);
    } catch (error: any) {
      console.error("An error occurred:", error);
    }
  });
