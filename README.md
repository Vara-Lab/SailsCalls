# SailsCalls

SailsCalls is a library that works on top of sails-js library.

You can use it in the client or in the server side.

This library contains the next features:

- Commands: SailsCalls can send messages to the contracts specified in each instance or to the contract specified when sending a message.
- Queries: SailsCalls can send queries to the contracts specified in the instance or at the time of sending the query
- Vouchers: SailsCalls has several features to manage vouchers on Vara Network:
  - `Create vouchers`: you can create vouchers with the user and contract address that you set (createVoucher).
  - `Check expiration`: you can check if the specified voucher is expired (voucherIsExpired).
  - `Check voucher total tokens`: you can change the total balance of the specified voucher (voucherBalance).
  - `Renew voucher`: you can renew the specified voucher (renewVoucherAmountOfBlocks).
  - `Add tokens to voucher`: you can add an amount of tokens to the specified voucher (addTokensToVoucher).
  - `Get vouchers from contract`: you can get all vouchers from a contract that are linked to a user address (vouchersInContract).
- Signless: SailsCalls has options to implement subaccounts in which you can use together with the "keyring" service in smart contracts.
- Web3 Abstraction: SailsCalls has two special methods which it uses in conjunction with the "keyring" service to make use of the web3 abstraction

## Installation

The SailsCalls library requeries the `@gear-js/api` and `polkadot/api` package to be installed.

To install SailsCalls, run the following command:

```sh
# npm
npm install github:Vara-Lab/SailsCalls

# yarn
yarn add github:Vara-Lab/SailsCalls
```