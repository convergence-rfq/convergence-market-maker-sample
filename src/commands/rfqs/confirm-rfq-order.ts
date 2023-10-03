import { Command } from "commander";
import readline from "readline";
import { broadcastTransaction } from "../../helpers/utils";
import { confirmOrder } from "../../helpers/rfq";

export const confirmOrderCommand = new Command("confirm-rfq-order")
  .description("Confirm RFQ order")
  .action(async () => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question("Please enter the RFQ ID (Public Key): ", async (rfqId) => {
      rl.question(
        "Please enter the response ID (Public Key): ",
        async (responseAccount) => {
          rl.question(
            "Please enter response side [bid, ask]: ",
            async (responseSide) => {
              try {
                const base64Tx = await confirmOrder(
                  rfqId,
                  responseAccount,
                  responseSide,
                );

                // Broadcasting transaction on chain
                const signature = await broadcastTransaction(base64Tx);

                console.log(
                  "Order confirmed. Transaction signature:",
                  signature,
                );
              } catch (error: any) {
                console.error("An error occurred:", error);
              } finally {
                rl.close();
              }
            },
          );
        },
      );
    });
  });
