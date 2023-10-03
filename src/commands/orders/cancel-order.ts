import { Command } from "commander";
import { cancelOrderById } from "../../helpers/orders";
import readline from "readline";
import { broadcastTransaction } from "../../helpers/utils";

export const cancelOrderCommand = new Command("cancel-order")
  .description("Cancel order by id")
  .action(async () => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      "Please enter the order ID (Public Key) that needs to be canceled: ",
      async (orderId) => {
        try {
          const base64Tx = await cancelOrderById(orderId);

          // broadcasting transaction on chain
          const signature = await broadcastTransaction(base64Tx);

          console.log("Orders =>", signature);
        } catch (error: any) {
          console.error("An error occurred:", error);
        } finally {
          rl.close();
        }
      },
    );
  });
