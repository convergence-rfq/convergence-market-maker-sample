# CLI Sample

....

## Using

Add environment variables in .env file.
You may also need to update JSON files in the 'api-input' folder in order to create an RFQ.

Install dependencies by running

```
$ npm install
```

Then, build the project

```
$ npm run build
```

Then, run any command like this

```
$ node dist/index.js get-instruments
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
cancel-orders
respond-order

get-rfqs
create-rfq
get-rfq-orders
confirm-order
```
