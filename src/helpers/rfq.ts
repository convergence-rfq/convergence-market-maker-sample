import axios from "axios";
import { getAddressByTokenName } from "./utils";
import { calcCollateral, getUserBalances } from "./sdk-helper";

export async function getRFQs(getRFQJsonData: any) {
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

    // Create an array to hold query parameters
    const queryParams: string[] = [];

    // Add parameters with values to the array if they are defined
    if (getRFQJsonData.page) queryParams.push(`page=${getRFQJsonData.page}`);
    if (getRFQJsonData.limit) queryParams.push(`limit=${getRFQJsonData.limit}`);
    if (getRFQJsonData.instrument)
      queryParams.push(`instrument=${getRFQJsonData.instrument}`);
    if (getRFQJsonData.paginationToken)
      queryParams.push(`paginationToken=${getRFQJsonData.paginationToken}`);
    if (getRFQJsonData.rfqAccountAddress)
      queryParams.push(`rfqAccountAddress=${getRFQJsonData.rfqAccountAddress}`);

    // Construct the query string
    const queryString = queryParams.join("&");

    const apiUrl = `${baseUrl}rfqs?address=${walletAddress}&${queryString}`;

    // Make a GET request to the API
    const response = await axios.get(apiUrl);
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

export async function createRFQ(createRFQJasonData: any) {
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

    const apiUrl = `${baseUrl}rfqs`;

    // Prepare the request body
    const requestBody = {
      rfqType: createRFQJasonData.rfqType,
      amount: createRFQJasonData.amount,
      quoteMint: getAddressByTokenName(
        createRFQJasonData?.quoteMint?.toLowerCase(),
      ),
      baseMint: getAddressByTokenName(
        createRFQJasonData?.baseMint?.toLowerCase(),
      ),
      address: walletAddress,
      orderType: createRFQJasonData.orderType,
      rfqSize: createRFQJasonData.rfqSize,
      rfqExpiry: createRFQJasonData.rfqExpiry,
      settlementWindow: createRFQJasonData.settlementWindow,
    };

    const balances = await getUserBalances(process.env.PRIVATE_KEY || "");
    const reqCollateral = await calcCollateral(requestBody);

    if (balances?.freeCollateral < reqCollateral?.requiredCollateral) {
      console.error("Low collateral balance, please add collateral first");
      process.exit(1);
    }

    // Make a POST request to the API
    const response = await axios.post(apiUrl, requestBody);
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
    const response = await axios.get(apiUrl);
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
    const response = await axios.put(apiUrl, requestBody);
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
