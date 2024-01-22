import axios from "axios";

const CONVERGENCE_API_KEY = process.env.CONVERGENCE_API_KEY;
const config = {
  headers: {
    Authorization: CONVERGENCE_API_KEY,
  },
};

export async function getInstruments() {
  try {
    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) {
      console.error("BASE_URL is not defined in the .env file.");
      process.exit(1);
    }

    const apiUrl = `${baseUrl}instruments`;

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
