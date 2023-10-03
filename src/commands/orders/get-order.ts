import { Command } from "commander";
import { getOrderById } from "../../helpers/orders";
import readline from "readline";

export const getOrderCommand = new Command("get-order")
  .description("Get order by id")
  .action(async () => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      "Please enter the order ID (Public Key) that needs to be fetched: ",
      async (orderId) => {
        try {
          const order = await getOrderById(orderId);
          console.log("Order =>", order);
        } catch (error: any) {
          console.error("An error occurred:", error);
        } finally {
          rl.close();
        }
      },
    );
  });
