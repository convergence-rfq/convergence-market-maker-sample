import { Command } from "commander";
import { getHxroCollateralAccount } from "../../helpers/hxro";

export const getHxroCollateralFundCommand = new Command(
  "get-hxro-collateral-account",
)
  .description("get collateral account")
  .action(async () => {
    try {
      // getting collateral account
      const collateralAccount = await getHxroCollateralAccount();
      if (!collateralAccount || collateralAccount.length === 0) {
        console.log("No collateral account found, please create first");
        process.exit(1);
      }
      console.log('Hxro account', collateralAccount[0]?.pubkey.toBase58());
    } catch (error) {
      console.error("An error occurred:", error);
      process.exit(1);
    }
  });
