import { Command } from "commander";
import { getOrders } from "../../helpers/orders";

export const getOrdersCommand = new Command("get-orders")
  .description("Get orders by wallet address")
  .action(async () => {
    try {
      const orders = await getOrders();
      console.log("Orders =>", orders);
    } catch (error: any) {
      console.error("An error occurred:", error);
    }
  });
