import { Command } from "commander";
import readline from "readline";
import { cancelOrders } from "../../helpers/orders";
import { broadcastTransaction } from "../../helpers/utils";

export const cancelOrdersCommand = new Command("cancel-orders")
  .description("Cancel all orders")
  .action(async () => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      "Do you really want to cancel all your orders? Press Y for confirmation, N for cancel: ",
      async (answer) => {
        try {
          if (answer.toUpperCase() === "Y") {
            const base64Txs = await cancelOrders();

            for (const base64Tx of base64Txs) {
              // Broadcasting transaction on chain
              const signature = await broadcastTransaction(base64Tx);
              console.log("Orders canceled. Transaction signature:", signature);
            }
          } else {
            console.log("Canceled operation. No orders were canceled.");
          }
        } catch (error: any) {
          console.error("An error occurred:", error);
        } finally {
          rl.close();
        }
      },
    );
  });
