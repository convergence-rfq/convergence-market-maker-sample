import { Command } from "commander";
import readline from "readline";
import { getOrdersByRFQId } from "../../helpers/rfq";

export const getRFQOrdersCommand = new Command("get-rfq-orders")
  .description("Get orders by RFQ id (Responses)")
  .action(async () => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question("Please enter the RFQ ID (Public Key): ", async (rfqId) => {
      try {
        const orders = await getOrdersByRFQId(rfqId);
        console.log("Orders =>", orders);
      } catch (error: any) {
        console.error("An error occurred:", error);
      } finally {
        rl.close();
      }
    });
  });
