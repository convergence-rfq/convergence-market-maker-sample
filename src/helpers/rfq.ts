import axios from "axios";
import {
  calcCollateral,
  createCvg,
  getKeypair,
  getUserBalances,
  initializeCollateralAccount,
} from "./sdk-helper";
import { IGetRFQ } from "../commands/rfqs/get-rfqs";
import { ICreateRFQ } from "./utils";

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
      queryParams.push(`address=${process.env.PUBLIC_KEY}`);

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
      address: walletAddress,
      orderType: createRFQData.orderType,
      rfqSize: createRFQData.rfqSize,
      rfqExpiry: createRFQData.rfqExpiry,
      settlementWindow: createRFQData.settlementWindow,
      strategyData: createRFQData.strategyData,
      optionStyle: createRFQData.optionStyle,
    };

    const balances = await getUserBalances(process.env.PRIVATE_KEY || "");

    if (balances?.balances?.dSOL?.tokenBalance === 0) {
      console.error("Low SOL balance, please deposite first");
      process.exit(1);
    }
    //@ts-ignore
    if (balances?.balances?.USDC?.tokenBalance === 0) {
      console.error("Low USDC balance, please deposite first.");
      process.exit(1);
    }

    const user = getKeypair(privateKeyBase58 || "");
    const cvg = await createCvg(user);

    if (!balances.collateralAccount) {
      await initializeCollateralAccount(cvg, user);
    }

    const reqCollateral = await calcCollateral(requestBody);

    if (balances?.freeCollateral < reqCollateral?.requiredCollateral) {
      console.error(
        `Low collateral balance, please add at least ${reqCollateral?.requiredCollateral.toFixed(
          5,
        )} collateral first`,
      );
      process.exit(1);
    }

    // Make a POST request to the API
    const response = await axios.post(apiUrl, requestBody, config);

    if (response.data.status === "success") {
      console.info("Base64 transaction.", response.data.response);

      return response.data.response.response;
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
      address: walletAddress,
      responseAccount,
      responseSide,
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
