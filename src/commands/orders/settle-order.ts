import { Command } from "commander";
import readline from "readline";
import { fundOrderById, settleOrderById } from "../../helpers/orders";
import { broadcastTransaction } from "../../helpers/utils";

export const settleOrderCommand = new Command("settle-order")
  .description("Settle RFQ order")
  .action(async () => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      "Please enter the response ID (Public Key): ",
      async (orderId) => {
        try {
          const base64Tx = await settleOrderById(orderId);

          // Broadcasting transaction on chain
          const signature = await broadcastTransaction(base64Tx);

          console.log("Order settled. Transaction signature:", signature);
        } catch (error: any) {
          console.error("An error occurred:", error);
        } finally {
          rl.close();
        }
      },
    );
  });
