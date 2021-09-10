# FlightSurety

FlightSurety is an application project for Udacity's Blockchain course.

## Install

This repository contains Smart Contract code in Solidity (using Truffle), tests (also using Truffle), dApp based in Udacity scaffolding (using HTML, CSS and JS) and server app scaffolding.

To install, download or clone the repo, then:

`npm install`
`truffle compile`

## Develop Client

To run truffle tests:

`truffle test ./test/flightSurety.js`
`truffle test ./test/oracles.js`

To use the dapp:
Execute ./ganache.sh in root project folder to start ganache with the appropiate config
`truffle migrate --reset`
`npm run dapp`

To view dapp:

`http://localhost:8000`

## Develop Server

`npm run server`
`truffle test ./test/oracles.js`

## Deploy

To build dapp for prod:
`npm run dapp:prod`

Deploy the contents of the ./dapp folder


## Migrations

During the migration, I'm funding the first Airline, registering 5 flights for this airline and registering a second Airline, funding it and registering another 5 flights for the second airline.

```
$ truffle migrate --reset

Compiling your contracts...
===========================
✔ Fetching solc version list from solc-bin. Attempt #1
> Everything is up to date, there is nothing to compile.



Starting migrations...
======================
> Network name:    'development'
> Network id:      1631277371328
> Block gas limit: 9999999999 (0x2540be3ff)


1_initial_migration.js
======================

   Deploying 'Migrations'
   ----------------------
   > transaction hash:    0xa0d38c48f0725b28a2bf88c363a48690bc637965db9fe53c7894b86dd626ef84
   > Blocks: 0            Seconds: 0
   > contract address:    0x8CdaF0CD259887258Bc13a92C0a6dA92698644C0
   > block number:        1
   > block timestamp:     1631277381
   > account:             0x627306090abaB3A6e1400e9345bC60c78a8BEf57
   > balance:             99.99549526
   > gas used:            225237 (0x36fd5)
   > gas price:           20 gwei
   > value sent:          0 ETH
   > total cost:          0.00450474 ETH


   > Saving migration to chain.
   > Saving artifacts
   -------------------------------------
   > Total cost:          0.00450474 ETH


2_deploy_contracts.js
=====================

   Deploying 'FlightSuretyData'
   ----------------------------
   > transaction hash:    0x3f5e7eeead14731a0600cc5fc9537fbe2b58dd10cd0044021ba7cd0df098600b
   > Blocks: 0            Seconds: 0
   > contract address:    0x345cA3e014Aaf5dcA488057592ee47305D9B3e10
   > block number:        3
   > block timestamp:     1631277381
   > account:             0x627306090abaB3A6e1400e9345bC60c78a8BEf57
   > balance:             99.93911242
   > gas used:            2776779 (0x2a5ecb)
   > gas price:           20 gwei
   > value sent:          0 ETH
   > total cost:          0.05553558 ETH


   Deploying 'FlightSuretyApp'
   ---------------------------
   > transaction hash:    0x89483997857cedfc4f5cb8f178246129f5742a9d06403eb37e921761c0be8e62
   > Blocks: 0            Seconds: 0
   > contract address:    0xf25186B5081Ff5cE73482AD761DB0eB0d25abfBF
   > block number:        4
   > block timestamp:     1631277382
   > account:             0x627306090abaB3A6e1400e9345bC60c78a8BEf57
   > balance:             99.87923872
   > gas used:            2993685 (0x2dae15)
   > gas price:           20 gwei
   > value sent:          0 ETH
   > total cost:          0.0598737 ETH


   > Saving migration to chain.
   > Saving artifacts
   -------------------------------------
   > Total cost:          0.11540928 ETH


Summary
=======
> Total deployments:   3
> Final cost:          0.11991402 ETH

```


## Unit tests (flightSurety)

```
$ truffle test ./test/flightSurety.js 
Using network 'development'.


Compiling your contracts...
===========================
✔ Fetching solc version list from solc-bin. Attempt #1
> Everything is up to date, there is nothing to compile.



  Contract: Flight Surety Tests
    ✓ (multiparty) has correct initial isOperational() value
    ✓ (multiparty) can block access to setOperatingStatus() for non-Contract Owner account (518ms)
    ✓ (multiparty) can allow access to setOperatingStatus() for Contract Owner account (56ms)
    ✓ (multiparty) can block access to functions using requireIsOperational when operating status is false (74ms)
    ✓ (airline) First airline is registered when contract is deployed (58ms)
    ✓ (airline) Airline can be registered, but does not participate in contract until it submits funding of 10 ether (65ms)
    ✓ (airline) check only registered airline can be funded (98ms)
    ✓ (airline) check only funded airline can add new airlines (153ms)
    ✓ (airline) only funded airline can vote for new airlines and no repeat voting is allowed (149ms)
    ✓ (airline) check Registration of fifth and subsequent airlines requires multi-party consensus of 50% of registered airlines (436ms)
    ✓ (airline) check if not funded airline can register flights (44ms)
    ✓ (airline) check if funded airline can register flights with less than 24 hours to depart (51ms)
    ✓ (passenger) check if passenger cant buy insurance from a not registered flight (45ms)
    ✓ (passenger) check if passenger can buy insurance (111ms)


  14 passing (2s)

```


## Unit tests (Oracles)

```
$ truffle test ./test/oracles.js 
Using network 'development'.


Compiling your contracts...
===========================
✔ Fetching solc version list from solc-bin. Attempt #1
> Everything is up to date, there is nothing to compile.



  Contract: Oracles
Oracle Registered: 2, 8, 6
Oracle Registered: 8, 3, 6
Oracle Registered: 0, 1, 8
Oracle Registered: 0, 1, 2
Oracle Registered: 3, 0, 1
Oracle Registered: 2, 7, 6
Oracle Registered: 2, 5, 1
Oracle Registered: 1, 9, 6
Oracle Registered: 2, 4, 5
Oracle Registered: 7, 8, 2
Oracle Registered: 8, 7, 6
Oracle Registered: 8, 7, 4
Oracle Registered: 4, 0, 1
Oracle Registered: 3, 8, 6
Oracle Registered: 0, 8, 2
Oracle Registered: 2, 4, 9
Oracle Registered: 9, 7, 4
Oracle Registered: 3, 5, 8
Oracle Registered: 6, 2, 4
Oracle Registered: 6, 4, 2
Oracle Registered: 3, 6, 0
Oracle Registered: 7, 3, 5
Oracle Registered: 3, 6, 4
Oracle Registered: 0, 2, 7
Oracle Registered: 4, 3, 9
Oracle Registered: 4, 2, 7
Oracle Registered: 4, 7, 1
Oracle Registered: 9, 4, 1
Oracle Registered: 9, 4, 5
Oracle Registered: 9, 2, 0
Oracle Registered: 1, 5, 3
Oracle Registered: 9, 3, 1
Oracle Registered: 8, 6, 0
Oracle Registered: 9, 3, 1
Oracle Registered: 3, 5, 2
Oracle Registered: 7, 1, 4
Oracle Registered: 6, 3, 1
Oracle Registered: 5, 0, 9
Oracle Registered: 5, 7, 6
Oracle Registered: 6, 7, 2
Oracle Registered: 8, 4, 6
Oracle Registered: 5, 6, 3
Oracle Registered: 4, 7, 0
Oracle Registered: 2, 8, 5
Oracle Registered: 9, 7, 0
Oracle Registered: 3, 4, 7
Oracle Registered: 1, 0, 5
Oracle Registered: 2, 6, 9
Oracle Registered: 6, 2, 4
    ✓ can register oracles (5089ms)
Result {
  '0': <BN: 9>,
  '1': '0xf17f52151EbEF6C7334FAD080c5704D77216b732',
  '2': 'ND1309',
  '3': <BN: 613f46de>,
  __length__: 4,
  index: <BN: 9>,
  airline: '0xf17f52151EbEF6C7334FAD080c5704D77216b732',
  flight: 'ND1309',
  timestamp: <BN: 613f46de> }
OK 9 0xf17f52151EbEF6C7334FAD080c5704D77216b732 ND1309 1631536862 10
OK 9 0xf17f52151EbEF6C7334FAD080c5704D77216b732 ND1309 1631536862 10
OK 9 0xf17f52151EbEF6C7334FAD080c5704D77216b732 ND1309 1631536862 10
OK 9 0xf17f52151EbEF6C7334FAD080c5704D77216b732 ND1309 1631536862 10
OK 9 0xf17f52151EbEF6C7334FAD080c5704D77216b732 ND1309 1631536862 10
OK 9 0xf17f52151EbEF6C7334FAD080c5704D77216b732 ND1309 1631536862 10
OK 9 0xf17f52151EbEF6C7334FAD080c5704D77216b732 ND1309 1631536862 10
OK 9 0xf17f52151EbEF6C7334FAD080c5704D77216b732 ND1309 1631536862 10
OK 9 0xf17f52151EbEF6C7334FAD080c5704D77216b732 ND1309 1631536862 10
OK 9 0xf17f52151EbEF6C7334FAD080c5704D77216b732 ND1309 1631536862 10
OK 9 0xf17f52151EbEF6C7334FAD080c5704D77216b732 ND1309 1631536862 10
OK 9 0xf17f52151EbEF6C7334FAD080c5704D77216b732 ND1309 1631536862 10
    ✓ can request flight status (8570ms)


  2 passing (14s)

```

## Dapp

Dapp permits check the operational status of the contract, buy insurances of 10 flights of 2 airlines (each passenger can buy insurances of the same flight until reach 1 ether of inversion), check the status of the flight requesting Oracles, check user balance and withdraw.


## Resources

* [How does Ethereum work anyway?](https://medium.com/@preethikasireddy/how-does-ethereum-work-anyway-22d1df506369)
* [BIP39 Mnemonic Generator](https://iancoleman.io/bip39/)
* [Truffle Framework](http://truffleframework.com/)
* [Ganache Local Blockchain](http://truffleframework.com/ganache/)
* [Remix Solidity IDE](https://remix.ethereum.org/)
* [Solidity Language Reference](http://solidity.readthedocs.io/en/v0.4.24/)
* [Ethereum Blockchain Explorer](https://etherscan.io/)
* [Web3Js Reference](https://github.com/ethereum/wiki/wiki/JavaScript-API)
