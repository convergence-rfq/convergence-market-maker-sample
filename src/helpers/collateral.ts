import axios from "axios";
import { airDropSol } from "./utils";
import { getUserBalances } from "./sdk-helper";

const CONVERGENCE_API_KEY = process.env.CONVERGENCE_API_KEY;
const config = {
  headers: {
    Authorization: CONVERGENCE_API_KEY,
  },
};

export async function getCollateralAccount() {
  try {
    const walletAddress = process.env.PUBLIC_KEY || "";
    if (!walletAddress) {
      console.error("PUBLIC_KEY is not defined in the .env file.");
      process.exit(1);
    }

    // Get the BASE_URL from environment variables
    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) {
      console.error("BASE_URL is not defined in the .env file.");
      process.exit(1);
    }

    const apiUrl = `${baseUrl}collateral?address=${walletAddress}`;

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

export async function createCollateralAccount() {
  try {
    // Get the BASE_URL from environment variables
    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) {
      console.error("BASE_URL is not defined in the .env file.");
      process.exit(1);
    }
    const apiUrl = `${baseUrl}collateral`;

    const walletAddress = process.env.PUBLIC_KEY || "";
    if (!walletAddress) {
      console.error("PUBLIC_KEY is not defined in the .env file.");
      process.exit(1);
    }

    const balances = await getUserBalances(process.env.PRIVATE_KEY || "");

    if (balances?.balances?.dSOL?.tokenBalance === 0) {
      if (process.env.NODE_ENV === "devnet") {
        // airdrop before creating account
        await airDropSol(walletAddress);
      } else {
        console.error("Low SOL balance, please deposite first");
        process.exit(1);
      }
    }
    //@ts-ignore
    if (balances?.balances?.USDC?.tokenBalance === 0) {
      console.error("Low USDC balance, please deposite first.");
      process.exit(1);
    }

    // Prepare the request body
    const requestBody = {
      address: walletAddress,
    };

    // Make a POST request to the API
    const response = await axios.post(apiUrl, requestBody, config);

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

export async function addCollateralFund(addCollateralJsonData: any) {
  try {
    // Get the BASE_URL from environment variables
    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) {
      console.error("BASE_URL is not defined in the .env file.");
      process.exit(1);
    }

    // Getting wallet address from environment variables
    const walletAddress = process.env.PUBLIC_KEY || "";
    if (!walletAddress) {
      console.error("PUBLIC_KEY is not defined in the .env file.");
      process.exit(1);
    }

    // Prepare the request body
    const requestBody = {
      address: walletAddress,
      amount: addCollateralJsonData.amount,
    };

    // Make a POST request to the API
    const apiUrl = `${baseUrl}collateral/fund`;
    const response = await axios.post(apiUrl, requestBody, config);

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

export async function withdrawCollateralFund(addCollateralJsonData: any) {
  try {
    // Get the BASE_URL from environment variables
    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) {
      console.error("BASE_URL is not defined in the .env file.");
      process.exit(1);
    }

    // Getting wallet address from environment variables
    const walletAddress = process.env.PUBLIC_KEY || "";
    if (!walletAddress) {
      console.error("PUBLIC_KEY is not defined in the .env file.");
      process.exit(1);
    }

    // Prepare the request body
    const requestBody = {
      address: walletAddress,
      amount: addCollateralJsonData.amount,
    };

    // Make a POST request to the API
    const apiUrl = `${baseUrl}collateral/withdraw`;
    const response = await axios.post(apiUrl, requestBody, config);

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
