# Polkadot block header light client

## Description

Polkadot block header light client

## Getting started

Install the npm packages

```bash
$ npm install
```

Set up env vars:

1. create a file `.env` in the same level as `.env.example`
2. copy the contents of `.env.example` into `.env`
3. Change accordingly, if you wish
4. Run the app as described in the next sub-section

## Running the app

```bash
# watch mode (local nodejs process)
$ npm run start:dev

# production mode (inside docker container)
$ npm run start:prod
```

The latter will build a Docker image and start the app in a docker container.

## Considerations & assumptions

The project is developer with the assumption that the project is about listening to new block headers on the Polkadot blockchain and storing them in a merkle tree, rather than about implementing a merkle tree structure itself. That is why a 3rd party lib has been used for the merkle tree structure. This assumption is supported by the reasoning to keep the scope of the task small and concise.

There have been exposed a few REST API endpoints for getting a header by hash and by number and also for verifying a proof of inclusion of a header in the merkle tree.
The default limit for a batch of headers is 3, but feel free to change it in `.env`.

#### Endpoints:

`GET localhost:3000/client/get-by-hash?hash=<header_hash>`
get a header from the merkle tree by hash

`GET localhost:3000/client/get-by-number?number=<block_number>`

get a header from the merkle tree by number

`GET localhost:3000/client/verify-proof?hash=<header_hash>`

verify a proof of inclusion of a header in the merkle tree by header hash
