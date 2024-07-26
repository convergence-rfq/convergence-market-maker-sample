import {
  Convergence,
  keypairIdentity,
  RegisteredMint,
  BaseAsset,
  TokenClient,
  Mint,
  SpotLegInstrument,
} from "@convergence-rfq/sdk";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import * as bs58 from "bs58";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

const rpcUrl = process.env.RPC_URL || "https://api.mainnet-beta.solana.com";

export const connection = new Connection(rpcUrl, "confirmed");

export const WRAPPED_SOL_MINT_ADDRESS =
  "So11111111111111111111111111111111111111112";

export type TokenListItem = Omit<MenuItemType, "icon">;

export interface MenuItemType {
  id: string | number;
  imageUrl?: string;
  label: string;
  description?: string;
  registeredMintAddress?: string;
  mintAddress?: string;
  priceFeedAddress?: string;
  decimals?: number;
  type?: string;
  index?: number;
  mint?: Mint;
}

export const tokenNameList = [
  { ticker: "BTC", name: "bitcoin" },
  { ticker: "ETH", name: "ethereum" },
  { ticker: "SOL", name: "solana" },
  { ticker: "USDC", name: "usd-coin" },
  { ticker: "MSOL", name: "marinade-staked-sol" },
  { ticker: "WSOL", name: "wrapped-solana" },
  { ticker: "BONK", name: "bonk" },
];

export const getTokenFullName = (token: string) => {
  const tokenName = tokenNameList.find(
    (item) => item.ticker.toUpperCase() === token.toUpperCase(),
  );
  return tokenName?.name;
};

export async function getBaseAssets(
  registeredMints: RegisteredMint[],
  baseAssets: BaseAsset[],
  tokenClient: TokenClient,
  network: string,
): Promise<TokenListItem[]> {
  return (
    await Promise.all<TokenListItem | null>( // Specify the expected type here
      registeredMints.map(async (mint) => {
        const mintType = mint.mintType?.__kind.toString().toLowerCase();
        const mintByAddress = await tokenClient.findMintByAddress({
          address: mint.mintAddress,
        });

        // @ts-ignore
        const baseAssetIndex = mint.mintType?.baseAssetIndex;
        if (baseAssetIndex) {
          const baseAssetInfo = baseAssets[baseAssetIndex.value];
          const label = baseAssetInfo.ticker.toUpperCase();
          if (label === "USDT") return null;
          if (label === "USDC") return null;
          const oracleSource = baseAssetInfo.oracleSource;
          // @ts-ignore
          const oracleAddress =
            oracleSource === "switchboard"
              ? baseAssetInfo.switchboardOracle?.toBase58()
              : oracleSource === "pyth"
                ? baseAssetInfo.pythOracle?.toBase58()
                : "";
          if (label === "SOL") {
            if (network.toLowerCase() === "devnet") {
              if (mint.mintAddress.toBase58() === WRAPPED_SOL_MINT_ADDRESS) {
                return {
                  id: "wsol",
                  label: "WSOL",
                  description: getTokenFullName("WSOL"),
                  mintAddress: mint.mintAddress.toString(),
                  priceFeedAddress: oracleAddress,
                  inPlacePrice:
                    oracleSource === "in-place"
                      ? baseAssetInfo.inPlacePrice?.toString()
                      : "",
                  decimals: mint.decimals,
                  type: mintType,
                  index: baseAssetIndex.value,
                  mint: mintByAddress,
                  extendedInformation: {
                    oracleSource: oracleSource,
                    riskCategory: baseAssetInfo.riskCategory,
                    tradeable: baseAssetInfo.enabled,
                    stablecoin: mint.mintType.__kind === "Stablecoin",
                  },
                };
              }
              return {
                id: "msol",
                label: "MSOL",
                description: getTokenFullName("MSOL"),
                mintAddress: mint.mintAddress.toString(),
                priceFeedAddress: oracleAddress,
                inPlacePrice:
                  oracleSource === "in-place"
                    ? baseAssetInfo.inPlacePrice?.toString()
                    : "",
                decimals: mint.decimals,
                type: mintType,
                index: baseAssetIndex.value,
                mint: mintByAddress,
                extendedInformation: {
                  oracleSource: oracleSource,
                  riskCategory: baseAssetInfo.riskCategory,
                  tradeable: baseAssetInfo.enabled,
                  stablecoin: mint.mintType.__kind === "Stablecoin",
                },
              };
            } else {
              return {
                id: "wsol",
                label: "WSOL",
                description: getTokenFullName("WSOL"),
                mintAddress: mint.mintAddress.toString(),
                priceFeedAddress: oracleAddress,
                inPlacePrice:
                  oracleSource === "in-place"
                    ? baseAssetInfo.inPlacePrice?.toString()
                    : "",
                decimals: mint.decimals,
                type: mintType,
                index: baseAssetIndex.value,
                mint: mintByAddress,
                extendedInformation: {
                  oracleSource: oracleSource,
                  riskCategory: baseAssetInfo.riskCategory,
                  tradeable: baseAssetInfo.enabled,
                  stablecoin: mint.mintType.__kind === "Stablecoin",
                },
              };
            }
          } else {
            return {
              id: baseAssetInfo.ticker.toLowerCase(),
              label,
              description: getTokenFullName(label),
              mintAddress: mint.mintAddress.toString(),
              priceFeedAddress: oracleAddress,
              inPlacePrice:
                oracleSource === "in-place"
                  ? baseAssetInfo.inPlacePrice?.toString()
                  : "",
              decimals: mint.decimals,
              type: mintType,
              index: baseAssetIndex.value,
              mint: mintByAddress,
              extendedInformation: {
                oracleSource,
                riskCategory: baseAssetInfo.riskCategory,
                tradeable: baseAssetInfo.enabled,
                stablecoin: mint.mintType.__kind === "Stablecoin",
              },
            };
          }
        } else {
          return {
            id: "usdc", // Ensure this is a string
            label: "USDC",
            description: getTokenFullName("USDC"),
            mintAddress: mint.mintAddress.toString(),
            priceFeedAddress: "BjUgj6YCnFBZ49wF54ddBVA9qu8TeqkFtkbqmZcee8uW",
            decimals: mint.decimals,
            type: mintType,
            mint: mintByAddress,
          };
        }
      }),
    )
  ).filter((token): token is TokenListItem => token !== null);
}

export const getKeypair = (privateKey: string) => {
  if (privateKey) {
    const privateKeyBytes = bs58.decode(privateKey);
    return Keypair.fromSecretKey(privateKeyBytes);
  }
  return Keypair.generate();
};

export const createCvg = async (user: Keypair): Promise<Convergence> => {
  const cvg = new Convergence(connection, { skipPreflight: false });
  cvg.use(keypairIdentity(user));
  return cvg;
};

export const initializeCollateralAccount = async (
  cvg: Convergence,
  keypair: Keypair,
) => {
  const newAccount = await cvg.collateral().initialize({
    user: keypair,
  });
  console.log("New collateral account created", newAccount);
  return newAccount;
};

export const getUserBalances = async (privateKeyBase58: string) => {
  const user = getKeypair(privateKeyBase58);
  const cvg = await createCvg(user);

  const collateralAccount = await cvg
    .collateral()
    .findByUser({ user: user.publicKey });

  // getting tokenList
  const [baseAssets, registeredMints] = await Promise.all([
    cvg.protocol().getBaseAssets(),
    cvg.protocol().getRegisteredMints(),
  ]);

  const network = process.env.CLUSTER || "devnet";
  const tokenList = await getBaseAssets(
    registeredMints,
    baseAssets,
    cvg.tokens(),
    network,
  );

  const protocol = await cvg.protocol().get();
  const collateralDecimals = tokenList?.find(
    (token) => token.mintAddress === protocol.collateralMint.toBase58(),
  )?.decimals;

  const walletCollateralAta = cvg
    .collateral()
    .pdas()
    .collateralToken({ user: user?.publicKey });

  const walletCollateralTotal = await cvg
    .tokens()
    .findTokenByAddress({ address: walletCollateralAta })
    .catch(() => undefined);

  const total = walletCollateralTotal
    ? Number(walletCollateralTotal.amount?.basisPoints) /
      Math.pow(10, collateralDecimals || 9)
    : 0;

  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
    user.publicKey,
    { programId: TOKEN_PROGRAM_ID },
    "confirmed",
  );

  // SOL Balance
  const walletBalance = await connection.getBalance(user.publicKey);
  const solBalance = walletBalance / LAMPORTS_PER_SOL;

  const tokenBalances = tokenList.reduce(
    (acc, tokenInList) => {
      const account = tokenAccounts.value.find((token) => {
        const mintAddress = token.account.data.parsed.info.mint;
        return tokenInList?.mintAddress?.toString() === mintAddress.toString();
      });

      if (account) {
        const tokenAta = account.pubkey.toBase58();
        const tokenPriceFeed = tokenInList.priceFeedAddress;
        const tokenMintAddress = tokenInList.mintAddress;
        const tokenBalance = Number(
          account.account.data.parsed.info.tokenAmount.uiAmount,
        );
        return {
          ...acc,
          [tokenInList.label]: {
            iconName: tokenInList.label,
            iconKey: tokenInList.label,
            tokenBalance,
            priceFeed: tokenPriceFeed,
            mintAddress: tokenMintAddress,
            ataAddress: tokenAta,
          },
        };
      }

      return {
        ...acc,
        [tokenInList.label]: {
          iconName: tokenInList.label,
          iconKey: tokenInList.label,
          tokenBalance: 0,
          priceFeed: tokenInList.priceFeedAddress,
          mintAddress: tokenInList.mintAddress,
          ataAddress: "",
        },
      };
    },
    {
      dSOL: {
        iconName: "dSOL",
        iconKey: "SOL",
        tokenBalance: solBalance,
        priceFeed: tokenList
          ?.find((token) => token.label === "SOL")
          ?.priceFeedAddress?.toString(),
        mintAddress: "So11111111111111111111111111111111111111112",
        ataAddress: user.publicKey.toBase58(),
      },
    },
  );

  return {
    balances: tokenBalances,
    freeCollateral: total - collateralAccount?.lockedTokensAmount,
    total,
    collateralAccount,
  };
};

export const calcCollateral = async (data: any) => {
  const user = getKeypair(process.env.PRIVATE_KEY || "");
  const cvg = await createCvg(user);

  const fixedSize =
    data.rfqSize === "fixed-base"
      ? { type: "fixed-base", amount: 1 }
      : data.rfqSize === "fixed-quote"
        ? { type: "fixed-quote", amount: data.amount }
        : { type: "open" };

  const quoteMint = await cvg
    .tokens()
    .findMintByAddress({ address: new PublicKey(data.quoteMint) });

  const baseMint = await cvg
    .tokens()
    .findMintByAddress({ address: new PublicKey(data.baseMint) });

  const amount =
    fixedSize.type === "open" || fixedSize.type === "fixed-quote"
      ? 1
      : data.amount;

  const instruments = await SpotLegInstrument.create(
    cvg,
    baseMint,
    amount,
    "short",
  );

  const calcCollateral = await cvg.riskEngine().calculateCollateralForRfq({
    //@ts-ignore
    size: fixedSize,
    orderType: data.orderType,
    //@ts-ignore
    quoteAsset: quoteMint,
    legs: [instruments],
    settlementPeriod: data.settlementWindow,
  });
  return calcCollateral;
};
