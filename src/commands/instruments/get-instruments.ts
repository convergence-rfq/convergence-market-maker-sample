import { Command } from "commander";
import { getInstruments } from "../../helpers/instruments";

export const getInstrumentsCommand = new Command("get-instruments")
  .description("Get instruments")
  .action(async () => {
    try {
      const instruments = await getInstruments();
      console.log("Instruments =>", instruments);
    } catch (error: any) {
      console.error("An error occurred:", error);
    }
  });
