import axios from "axios";

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

    const apiUrl = `${baseUrl}orders?address=${walletAddress}`;

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
      address: walletAddress,
    };

    // Make a GET request to the API
    const response = await axios.delete(apiUrl, { data: requestBody });
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

    const apiUrl = `${baseUrl}orders?address=${walletAddress}`;

    // Make a GET request to the API
    const response = await axios.delete(apiUrl);
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

    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) {
      console.error("BASE_URL is not defined in the .env file.");
      process.exit(1);
    }

    const apiUrl = `${baseUrl}orders/`;

    // Prepare the request body
    const requestBody = {
      address: walletAddress,
      rfq: orderId,
      amount,
    };

    // Make a GET request to the API
    const response = await axios.post(apiUrl, requestBody);
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