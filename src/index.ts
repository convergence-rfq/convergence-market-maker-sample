import { Command } from "commander";
import dotenv from "dotenv";

dotenv.config();

const program = new Command();
program.version("1.0.0");

import { blockhashCommand } from "./commands/blockhash";
program.addCommand(blockhashCommand);

// RFQs
import { getRfqsCommand } from "./commands/rfqs/get-rfqs";
import { createRfqCommand } from "./commands/rfqs/create-rfq";
import { getRFQOrdersCommand } from "./commands/rfqs/get-rfq-orders";
import { confirmOrderCommand } from "./commands/rfqs/confirm-rfq-order";
program.addCommand(getRfqsCommand);
program.addCommand(createRfqCommand);
program.addCommand(getRFQOrdersCommand);
program.addCommand(confirmOrderCommand);

// Collateral
import { getCollateralCommand } from "./commands/collateral/get-collateral-account";
import { createCollateralCommand } from "./commands/collateral/create-collateral-account";
import { addCollateralFundCommand } from "./commands/collateral/add-collateral";
import { withdrawCollateralFundCommand } from "./commands/collateral/withdraw-collateral";
program.addCommand(getCollateralCommand);
program.addCommand(createCollateralCommand);
program.addCommand(addCollateralFundCommand);
program.addCommand(withdrawCollateralFundCommand);

// Orders
import { getOrdersCommand } from "./commands/orders/get-orderes";
import { getOrderCommand } from "./commands/orders/get-order";
import { cancelOrderCommand } from "./commands/orders/cancel-order";
import { cancelOrdersCommand } from "./commands/orders/cancel-orders";
import { respondOrderCommand } from "./commands/orders/respond-order";
program.addCommand(getOrdersCommand);
program.addCommand(getOrderCommand);
program.addCommand(cancelOrderCommand);
program.addCommand(cancelOrdersCommand);
program.addCommand(respondOrderCommand);

// Instruments
import { getInstrumentsCommand } from "./commands/instruments/get-instruments";
program.addCommand(getInstrumentsCommand);

program.parse(process.argv);
