# CLI Sample

This sample market maker script has been built with Convergence RFQ REST APIs.

## How to Use

1. **Clone the repository to your local drive.**

   ```
   git clone https://github.com/convergence-rfq/convergence-market-maker-sample.git
   ```

2. **Rename the file "env.example" to ".env".**

   ```bash
   mv env.example .env
   ```

3. **Add both public and private keys to the ".env" file.**

   ```bash
   # Add your public and private keys in the .env file
   ```

Install dependencies by running

```
$ npm install
```

Then, build the project

```
$ npm run build
```

Then, execute commands like this

```
$ npm run exec -- get-instruments
```

List of commands

```
add-collateral
create-collateral-account
get-collateral-account
withdraw-collateral

get-instruments

get-orders
get-order
cancel-orders
cancel-order
respond-order

get-rfqs
create-rfq
get-rfq-orders
confirm-rfq-order
```

## How to create RFQ

1. Before creating an RFQ, ensure that you have SOL and USDC in your wallet.
2. Add collateral to your account using the add-collateral command (minimum 20 USDC). If you haven't added collateral before, run the following command:

```
$ npm run exec -- add-collateral
```

3. After adding collateral, you can now execute the create-rfq command:

```
$ npm run exec -- create-rfq
```

## How to Respond RFQ

1. Run the get-rfqs command to retrieve a list of RFQs. The command will prompt you to choose between your RFQs or all RFQs. Select "all."

```
$ npm run exec -- get-rfqs
```

2. Copy the public address of the RFQ to which you want to respond.
3. Execute the respond-order command, which will prompt you to provide the public key of the RFQ and the total amount of USDC you intend to spend.

```
$ npm run exec -- respond-order
```

## How to confrim RFQ response

1. Before confirming any response, you must have the RFQ and response public keys. Retrieve the response public key by running the following command:

```
$ npm run exec -- get-rfq-orders
```

2. Copy the response public address that you want to confirm.
3. Execute the confirm-order command. It will prompt you to enter the RFQ and response addresses, and it will confirm the response.

```
$ npm run exec -- confirm-rfq-order
```
