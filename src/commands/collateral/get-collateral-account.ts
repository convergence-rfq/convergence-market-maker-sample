import { Command } from "commander";
import { getCollateralAccount } from "../../helpers/collateral";
import { getUserBalances } from "../../helpers/sdk-helper";

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

      const { freeCollateral } = await getUserBalances(
        process.env.PRIVATE_KEY || "",
      );
      Object.assign(collateralAccount, {
        freeTokenAmount: freeCollateral || 0,
      });
      console.log("Collateral account:", collateralAccount);
    } catch (error: any) {
      console.error("An error occurred:", error);
    }
  });
