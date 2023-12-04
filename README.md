# CLI Sample

....

## Using

Rename the file "env.example" to ".env".
Add both public and private keys to the ".env" file.
Update the JSON files in the 'api-input' folder to create the desired RFQ.

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
cancel-order
respond-order

get-rfqs
create-rfq
get-rfq-orders
confirm-order
```
