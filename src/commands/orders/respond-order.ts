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

    rl.question(
      "Please enter the order(rfq) ID (Public Key): ",
      async (orderId) => {
        rl.question("Please enter the amount: ", async (amount) => {
          try {
            const result = await respondOrder(orderId, parseFloat(amount));

            // Broadcasting transaction on chain
            const signature = await broadcastTransaction(result.txn);

            console.log("Order responded.\nTransaction signature:", signature);
            console.log("Response id:", result.responsePda);
          } catch (error: any) {
            console.error("An error occurred:", error);
          } finally {
            rl.close();
          }
        });
      },
    );
  });
