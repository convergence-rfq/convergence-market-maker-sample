import { createCvg, getKeypair, getUserBalances } from "./sdk-helper";
import dexterity, { DexterityWallet, Manifest, Trader } from "@hxronetwork/dexterity-ts";
import { PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

export async function addHxroCollateralAccount(amount: string) {
  try {
    const walletAddress = process.env.PUBLIC_KEY || "";
    if (!walletAddress) {
      console.error("PUBLIC_KEY is not defined in the .env file.");
      process.exit(1);
    }
    const privateKeyBase58 = process.env.PRIVATE_KEY;
    if (!walletAddress) {
      console.error("PRIVATE_KEY is not defined in the .env file.");
      process.exit(1);
    }

    // Get the NODE_ENV from environment variables
    const cluster = process.env.CLUSTER;
    if (!cluster) {
      console.error("NODE_ENV is not defined in the .env file.");
      process.exit(1);
    }

    const userKeypair = getKeypair(privateKeyBase58 || "");
    const cvg = await createCvg(userKeypair);

    const tmpManifest = await dexterity.getManifest(
      cvg.connection.rpcEndpoint,
      false,
      cvg.identity() as DexterityWallet,
    );

    console.log("checking trgs...");

    const trgs = await getTrgs(tmpManifest);

    if (!trgs || trgs.length == 0) {
      console.log("No collateral account found, please create first");
      process.exit(1);
    }

    console.log("trg pubkey", trgs[0].pubkey);

    const mpg = await tmpManifest.getMPG(
      new PublicKey(process.env.HXRO_MPG_DEVNET || ""),
    );
    console.log("mpg", mpg.vaultMint);

    const tokenAccounts = await cvg.connection.getParsedTokenAccountsByOwner(
      cvg.rpc().getDefaultFeePayer().publicKey,
      { programId: TOKEN_PROGRAM_ID },
      "confirmed",
    );

    const account = tokenAccounts.value.find((token) => {
      const mintAddress = token.account.data.parsed.info.mint;
      return mpg?.vaultMint?.toBase58() === mintAddress.toString();
    });
    const tokenBalance = account?.account.data.parsed.info.tokenAmount.uiAmount;
    const tmpWalletBalance = Number(tokenBalance) ? Number(tokenBalance) : 0;
    console.log("UXDC balance", tmpWalletBalance);

    if (tmpWalletBalance === 0) {
      console.error("Low UXDC balance");
      process.exit(1);
    }
    if (tmpWalletBalance < Number(amount)) {
      console.log("Deposit amount exceeds the current balance.");
      process.exit(1);
    }

    const trader: Trader = new dexterity.Trader(tmpManifest, trgs[0].pubkey);
    try {
      const onSubaccountUpdate = () => trader?.getNetCash();
      trader?.connect(onSubaccountUpdate, null);
      await tmpManifest.fetchOrderbooks();
      const depositTx = await trader.deposit(
        dexterity.Fractional.New(Number(amount), 0),
        () => { },
      );
      console.log("depositTx", depositTx);
      return depositTx;
    } catch (error) {
      console.error("API request failed.", error);
      process.exit(1);
    } finally {
      trader.disconnect();
    }
  } catch (error: any) {
    console.error("An error occurred:", error?.response?.data || error);
    process.exit(1);
  }
}

export async function withdrawHxroCollateralFund(amount: string) {
  try {
    const walletAddress = process.env.PUBLIC_KEY || "";
    if (!walletAddress) {
      console.error("PUBLIC_KEY is not defined in the .env file.");
      process.exit(1);
    }
    const privateKeyBase58 = process.env.PRIVATE_KEY;
    if (!walletAddress) {
      console.error("PRIVATE_KEY is not defined in the .env file.");
      process.exit(1);
    }

    // Get the NODE_ENV from environment variables
    const cluster = process.env.CLUSTER;
    if (!cluster) {
      console.error("NODE_ENV is not defined in the .env file.");
      process.exit(1);
    }

    const userKeypair = getKeypair(privateKeyBase58 || "");
    const cvg = await createCvg(userKeypair);

    const tmpManifest = await dexterity.getManifest(
      cvg.connection.rpcEndpoint,
      false,
      cvg.identity() as DexterityWallet,
    );

    console.log("checking trgs...");

    const trgs = await getTrgs(tmpManifest);

    if (!trgs || trgs.length == 0) {
      console.log("No collateral account found, please create first");
      process.exit(1);
    }

    console.log("trg pubkey", trgs[0].pubkey);

    const mpg = await tmpManifest.getMPG(
      new PublicKey(process.env.HXRO_MPG_DEVNET || ""),
    );
    console.log("mpg", mpg.vaultMint);

    const tokenAccounts = await cvg.connection.getParsedTokenAccountsByOwner(
      cvg.rpc().getDefaultFeePayer().publicKey,
      { programId: TOKEN_PROGRAM_ID },
      "confirmed",
    );

    const account = tokenAccounts.value.find((token) => {
      const mintAddress = token.account.data.parsed.info.mint;
      return mpg?.vaultMint?.toBase58() === mintAddress.toString();
    });
    const tokenBalance = account?.account.data.parsed.info.tokenAmount.uiAmount;
    const tmpWalletBalance = Number(tokenBalance) ? Number(tokenBalance) : 0;
    console.log("UXDC balance", tmpWalletBalance);

    if (tmpWalletBalance === 0) {
      console.error("Low UXDC balance");
      process.exit(1);
    }
    if (tmpWalletBalance < Number(amount)) {
      console.log("Deposit amount exceeds the current balance.");
      process.exit(1);
    }

    const trader: Trader = new dexterity.Trader(tmpManifest, trgs[0].pubkey);
    try {
      const onSubaccountUpdate = () => trader?.getNetCash();
      trader?.connect(onSubaccountUpdate, null);
      await tmpManifest.fetchOrderbooks();
      const withdrawTx = await trader.withdraw(
        dexterity.Fractional.New(Number(amount), 0),
        () => { },
      );
      console.log("withdrawTx", withdrawTx);
      return withdrawTx;
    } catch (error) {
      console.error("API request failed.", error);
      process.exit(1);
    } finally {
      trader.disconnect();
    }
  } catch (error: any) {
    console.error("An error occurred:", error?.response?.data || error);
    process.exit(1);
  }
}

export async function getHxroCollateralAccount() {
  try {
    const walletAddress = process.env.PUBLIC_KEY || "";
    if (!walletAddress) {
      console.error("PUBLIC_KEY is not defined in the .env file.");
      process.exit(1);
    }
    const privateKeyBase58 = process.env.PRIVATE_KEY;
    if (!walletAddress) {
      console.error("PRIVATE_KEY is not defined in the .env file.");
      process.exit(1);
    }

    // Get the NODE_ENV from environment variables
    const cluster = process.env.CLUSTER;
    if (!cluster) {
      console.error("NODE_ENV is not defined in the .env file.");
      process.exit(1);
    }

    const userKeypair = getKeypair(privateKeyBase58 || "");
    const cvg = await createCvg(userKeypair);
    const tmpManifest = await dexterity.getManifest(
      cvg.connection.rpcEndpoint,
      false,
      cvg.identity() as DexterityWallet,
    );

    return await getTrgs(tmpManifest);
  } catch (error: any) {
    console.error("An error occurred:", error?.response?.data || error);
    process.exit(1);
  }
}

export async function createHxroCollateralAccount() {
  try {
    const walletAddress = process.env.PUBLIC_KEY || "";
    if (!walletAddress) {
      console.error("PUBLIC_KEY is not defined in the .env file.");
      process.exit(1);
    }
    const privateKeyBase58 = process.env.PRIVATE_KEY;
    if (!walletAddress) {
      console.error("PRIVATE_KEY is not defined in the .env file.");
      process.exit(1);
    }

    // Get the NODE_ENV from environment variables
    const cluster = process.env.CLUSTER;
    if (!cluster) {
      console.error("NODE_ENV is not defined in the .env file.");
      process.exit(1);
    }

    const userKeypair = getKeypair(privateKeyBase58 || "");
    const cvg = await createCvg(userKeypair);

    const balances = await getUserBalances(process.env.PRIVATE_KEY || "");

    console.log("SOL balance", balances?.balances?.dSOL?.tokenBalance);
    if (balances?.balances?.dSOL?.tokenBalance < 0.54) {
      console.error(
        "Unable to create Hxro trader account. Requires 0.54 SOL, refundable upon closure.",
      );
      process.exit(1);
    }

    const tmpManifest = await dexterity.getManifest(
      cvg.connection.rpcEndpoint,
      false,
      cvg.identity() as DexterityWallet,
    );

    const trgPubkey = await tmpManifest.createTrg(
      new PublicKey(process.env.HXRO_MPG_DEVNET || ""),
    );
    return trgPubkey
  } catch (error: any) {
    console.error("An error occurred:", error?.response?.data || error);
    process.exit(1);
  }
}

// helper fucntion
export const getTrgs = async (manifest: Manifest) => {
  return await manifest.getTRGsOfWallet(
    new PublicKey(process.env.HXRO_MPG_DEVNET || ""),
  );
}
