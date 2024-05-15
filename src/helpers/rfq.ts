import axios from "axios";
import {
  createCvg,
  getKeypair,
  getUserBalances,
  initializeCollateralAccount,
} from "./sdk-helper";
import { IGetRFQ } from "../commands/rfqs/get-rfqs";
import { ICreateRFQ } from "./utils";
import dexterity, { DexterityWallet } from "@hxronetwork/dexterity-ts";
import { getTrgs } from "./hxro";

const CONVERGENCE_API_KEY = process.env.CONVERGENCE_API_KEY;
const config = {
  headers: {
    Authorization: CONVERGENCE_API_KEY,
  },
};

export async function getRFQs(getRFQJsonData: IGetRFQ) {
  try {
    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) {
      console.error("BASE_URL is not defined in the .env file.");
      process.exit(1);
    }

    // Create an array to hold query parameters
    const queryParams: string[] = [];

    // Add parameters with values to the array if they are defined
    if (getRFQJsonData.page > 0)
      queryParams.push(`page=${getRFQJsonData.page}`);
    if (getRFQJsonData.limit > 0)
      queryParams.push(`limit=${getRFQJsonData.limit}`);
    if (getRFQJsonData.instrument)
      queryParams.push(`instrument=${getRFQJsonData.instrument}`);
    if (getRFQJsonData.paginationToken)
      queryParams.push(`paginationToken=${getRFQJsonData.paginationToken}`);
    if (getRFQJsonData.rfqAccountAddress)
      queryParams.push(`rfqAccountAddress=${getRFQJsonData.rfqAccountAddress}`);
    if (getRFQJsonData.onlyMyRFQs)
      queryParams.push(`userAddress=${process.env.PUBLIC_KEY}`);

    queryParams.push(`cluster=${process.env.CLUSTER}`);

    // Construct the query string
    const queryString = queryParams.join("&");

    const apiUrl = `${baseUrl}rfqs?${queryString}`;

    // Make a GET request to the API
    const response = await axios.get(apiUrl, config);

    if (response.data.status === "success") {
      return response.data.response;
    } else {
      console.error("API request failed.", response);
      process.exit(1);
    }
  } catch (error: any) {
    console.error("An error occurred:", error?.response?.data || error);
    process.exit(1);
  }
}

export async function createRFQ(createRFQData: ICreateRFQ) {
  try {
    const walletAddress = process.env.PUBLIC_KEY;
    if (!walletAddress) {
      console.error("PUBLIC_KEY is not defined in the .env file.");
      process.exit(1);
    }
    const privateKeyBase58 = process.env.PRIVATE_KEY;
    if (!walletAddress) {
      console.error("PRIVATE_KEY is not defined in the .env file.");
      process.exit(1);
    }

    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) {
      console.error("BASE_URL is not defined in the .env file.");
      process.exit(1);
    }

    const apiUrl = `${baseUrl}rfqs`;

    // Prepare the request body
    const requestBody = {
      rfqType: createRFQData.rfqType,
      amount: createRFQData.amount,
      quoteMint: createRFQData?.quoteMint,
      baseMint: createRFQData?.baseMint,
      userAddress: walletAddress,
      orderType: createRFQData.orderType,
      rfqSize: createRFQData.rfqSize,
      rfqExpiry: createRFQData.rfqExpiry,
      settlementWindow: createRFQData.settlementWindow,
      strategyData: createRFQData.strategyData,
      optionStyle: createRFQData.optionStyle,
      counterParties: createRFQData.counterParties,
      cluster: process.env.CLUSTER,
    };

    const balances = await getUserBalances(process.env.PRIVATE_KEY || "");

    if (balances?.balances?.dSOL?.tokenBalance === 0) {
      console.error("Low SOL balance, please deposite first");
      process.exit(1);
    }

    const user = getKeypair(privateKeyBase58 || "");
    const cvg = await createCvg(user);

    if (!balances.collateralAccount) {
      await initializeCollateralAccount(cvg, user);
    }

    if (createRFQData.rfqType == "futures") {
      console.log("checking trgs...");
      const tmpManifest = await dexterity.getManifest(
        cvg.connection.rpcEndpoint,
        true,
        cvg.identity() as DexterityWallet,
      );

      const trgs = await getTrgs(tmpManifest);
      
      if (!trgs || trgs.length == 0) {
        console.log("No collateral account found, please create first");
        process.exit(1);
      }
    }
    // Make a POST request to the API
    const response = await axios.post(apiUrl, requestBody, config);

    if (response.data.status === "success") {
      console.info("Base64 transaction.", response.data.response);

      return response.data.response;
    } else {
      console.error("API request failed.", response);
      process.exit(1);
    }
  } catch (error: any) {
    console.error("An error occurred:", error?.response?.data || error);
    process.exit(1);
  }
}

export async function getOrdersByRFQId(rfqId: string) {
  try {
    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) {
      console.error("BASE_URL is not defined in the .env file.");
      process.exit(1);
    }

    const apiUrl = `${baseUrl}rfqs/${rfqId}/orders`;

    const requestBody = {
      cluster: process.env.CLUSTER,
    };
    // Make a GET request to the API
    const response = await axios.get(apiUrl, {
      ...config,
      data: requestBody,
    });

    if (response.data.status === "success") {
      return response.data.response;
    } else {
      console.error("API request failed.", response);
      process.exit(1);
    }
  } catch (error: any) {
    console.error("An error occurred:", error?.response?.data || error);
    process.exit(1);
  }
}

export async function confirmOrder(
  rfqId: string,
  responseAccount: string,
  responseSide: string,
) {
  try {
    const walletAddress = process.env.PUBLIC_KEY;
    if (!walletAddress) {
      console.error("PUBLIC_KEY is not defined in the .env file.");
      process.exit(1);
    }

    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) {
      console.error("BASE_URL is not defined in the .env file.");
      process.exit(1);
    }

    const apiUrl = `${baseUrl}rfqs/${rfqId}/orders `;

    // Prepare the request body
    const requestBody = {
      userAddress: walletAddress,
      responseAccount,
      responseSide,
      cluster: process.env.CLUSTER,
    };

    // Make a POST request to the API
    const response = await axios.put(apiUrl, requestBody, config);

    if (response.data.status === "success") {
      return response.data.response;
    } else {
      console.error("API request failed.", response);
      process.exit(1);
    }
  } catch (error: any) {
    console.error("An error occurred:", error?.response?.data || error);
    process.exit(1);
  }
}
