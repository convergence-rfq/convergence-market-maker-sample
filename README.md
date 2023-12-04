# CLI Sample

This sample market maker script has been built around RFQ RESTful APIs.

## Using
1. **Clone the repository to your local drive.**
    ```
    https://github.com/convergence-rfq/convergence-market-maker-sample.git
    ```

2. **Rename the file "env.example" to ".env".**
   
    ```bash
    mv env.example .env
    ```

3. **Add both public and private keys to the ".env" file.**
   
    ```bash
    # Add your public and private keys in the .env file
    ```

4. **Update the JSON files in the 'api-input' folder to create the desired RFQ.**
   
    ```bash
    # Update the JSON files in the 'api-input' folder

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
