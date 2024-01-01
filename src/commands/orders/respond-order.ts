import { Command } from "commander";
import readline from "readline";
import { respondOrder } from "../../helpers/orders";
import { broadcastTransaction } from "../../helpers/utils";

export const respondOrderCommand = new Command("respond-order")
  .description("Respond to RFQ order")
  .action(async () => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question("Please enter the order ID (Public Key): ", async (orderId) => {
      rl.question("Please enter the amount: ", async (amount) => {
        try {
          const base64Tx = await respondOrder(orderId, parseFloat(amount));

          // Broadcasting transaction on chain
          const signature = await broadcastTransaction(base64Tx);

          console.log("Order responded. Transaction signature:", signature);
        } catch (error: any) {
          console.error("An error occurred:", error);
        } finally {
          rl.close();
        }
      });
    });
  });
