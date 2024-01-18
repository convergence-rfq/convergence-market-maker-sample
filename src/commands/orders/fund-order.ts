import { Command } from "commander";
import readline from "readline";
import { fundOrderById } from "../../helpers/orders";
import { broadcastTransaction } from "../../helpers/utils";

export const fundOrderCommand = new Command("fund-order")
  .description("Fund to RFQ order")
  .action(async () => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      "Please enter the response ID (Public Key): ",
      async (orderId) => {
        try {
          const base64Tx = await fundOrderById(orderId);

          // Broadcasting transaction on chain
          const signature = await broadcastTransaction(base64Tx);

          console.log("Order funded. Transaction signature:", signature);
        } catch (error: any) {
          console.error("An error occurred:", error);
        } finally {
          rl.close();
        }
      },
    );
  });
