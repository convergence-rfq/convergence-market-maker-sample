import axios from "axios";
import { createCvg, getKeypair, getUserBalances } from "./sdk-helper";
import { PublicKey } from "@solana/web3.js";
import dexterity, { DexterityWallet } from "@hxronetwork/dexterity-ts";
import { getTrgs } from "./hxro";

const CONVERGENCE_API_KEY = process.env.CONVERGENCE_API_KEY;
const config = {
  headers: {
    Authorization: CONVERGENCE_API_KEY,
  },
};

export async function getOrders() {
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

    const apiUrl = `${baseUrl}orders?userAddress=${walletAddress}&cluster=${process.env.CLUSTER}`;

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

export async function getOrderById(orderId: string) {
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

    const apiUrl = `${baseUrl}orders/${orderId}`;

    // Prepare the request body
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

export async function cancelOrderById(orderId: string) {
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

    const apiUrl = `${baseUrl}orders/${orderId}`;

    // Prepare the request body
    const requestBody = {
      userAddress: walletAddress,
      cluster: process.env.CLUSTER,
    };

    // Make a GET request to the API
    const response = await axios.delete(apiUrl, {
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

export async function cancelOrders() {
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

    const apiUrl = `${baseUrl}orders?userAddress=${walletAddress}&cluster=${process.env.CLUSTER}`;

    // Make a GET request to the API
    const response = await axios.delete(apiUrl, config);

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

export async function respondOrder(orderId: string, amount: number) {
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

    const apiUrl = `${baseUrl}orders/`;

    // Prepare the request body
    const requestBody = {
      userAddress: walletAddress,
      rfq: orderId,
      amount,
      cluster: process.env.CLUSTER,
    };

    const user = getKeypair(privateKeyBase58 || "");
    const cvg = await createCvg(user);
    const rfqModel = await cvg
      .rfqs()
      .findRfqByAddress({ address: new PublicKey(orderId) });

    const balances = await getUserBalances(process.env.PRIVATE_KEY || "");
    if (balances?.balances?.dSOL?.tokenBalance === 0) {
      console.error("Low SOL balance, please deposite first");
      process.exit(1);
    }

    if (rfqModel.taker.toBase58() === walletAddress) {
      console.error("Unauthorized: You Cannot Respond to your own RFQ");
      process.exit(1);
    }
    if (rfqModel.model === "printTradeRfq") {
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

    // Make a GET request to the API
    const response = await axios.post(apiUrl, requestBody, config);

    if (response.data.status === "success") {
      return response.data.response;
    } else {
      console.error("API request failed.", response);
      process.exit(1);
    }
  } catch (error) {
    console.error("An error occurred:", error);
    process.exit(1);
  }
}

export async function fundOrderById(orderId: string) {
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

    const apiUrl = `${baseUrl}orders/${orderId}`;

    // Make a POST request to the API
    const response = await axios.post(
      apiUrl,
      { userAddress: walletAddress, cluster: process.env.CLUSTER },
      config,
    );

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

export async function settleOrderById(orderId: string) {
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

    const apiUrl = `${baseUrl}orders/${orderId}`;

    // Make a PUT request to the API
    const response = await axios.put(
      apiUrl,
      { userAddress: walletAddress, cluster: process.env.CLUSTER },
      config,
    );

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
