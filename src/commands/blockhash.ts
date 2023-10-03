import { Command } from "commander";
import axios from "axios";

export const blockhashCommand = new Command("blockhash")
  .description("Get recent blockhash")
  .action(async () => {
    try {
      // Get the BASE_URL from environment variables
      const baseUrl = process.env.BASE_URL;

      if (!baseUrl) {
        console.error("BASE_URL is not defined in the .env file.");
        return;
      }

      const apiUrl = `${baseUrl}recent-blockhash`;

      // Make a GET request to the API
      const response = await axios.get(apiUrl);

      if (response.data.status === "success") {
        console.info(`Recent Blockhash: ${response.data.blockhash}`);
      } else {
        console.error("API request failed.", response);
      }
    } catch (error: any) {
      // Explicitly type the error
      console.error("An error occurred:", error);
    }
  });
