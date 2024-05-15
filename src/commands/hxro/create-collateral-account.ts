import { Command } from "commander";
import { createHxroCollateralAccount, getHxroCollateralAccount } from "../../helpers/hxro";

export const createHxroCollateralFundCommand = new Command(
  "create-hxro-collateral-account",
)
  .description("create collateral account")
  .action(async () => {
    try {
      // getting collateral account
      const collateralAccount = await getHxroCollateralAccount();
      if (collateralAccount && collateralAccount.length > 0) {
        console.log("Collateral account already exists:", collateralAccount[0]?.pubkey.toBase58());
        process.exit(1);
      }
      const newCollateralAccount = await createHxroCollateralAccount()
      console.log('Hxro account', newCollateralAccount.toBase58());
    } catch (error) {
      console.error("An error occurred:", error);
      process.exit(1);
    }
  });
