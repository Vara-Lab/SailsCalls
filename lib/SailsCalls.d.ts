import { Sails } from "sails-js";
import type { KeyringPair, KeyringPair$Json } from '@polkadot/keyring/types';
import type { HexString } from "@gear-js/api/types";
import type { ISailsCommandOptions, ISailsQueryOptions, ISailsCalls, ICreateVoucher, IRenewVoucherAmountOfBlocks, ITokensToAddToVoucher, ICommandResponse, IFormatedKeyring } from "./types.js";
export declare class SailsCalls {
    private sailsInstances;
    private gearApi;
    private sailsParser;
    private accountToSignVouchers;
    private constructor();
    /**
     * ## Returs a new SailsCalls instance
     * - Static method that returns a new instance of SailsCalls
     * - The parameter is optional, and its attributes are optionals too:
     *     + newContractsData: Contracts data to store in the SailsCalls instance to be used later
     *     + network: Network to connect the api
     *     + voucherSignerData: sponsor name and mnemonic that will be used to sign the vouchers, etc (only for vouchers - gasless purpose)
     * @param data Optional parameter to set initial contracts data, network and sponsor
     * @returns SailsCalls instance
     * @example
     * // Returns SailsCalls instance with no contracts data.
     * // With network: ws://localhost:9944
     * const sailsCalls = await SailsCalls.new();
     *
     * // Returns SailsCalls instance with no contracts data.
     * // With Network: wss://testnet.vara.network
     * const sailsCalls = await SailsCalls.new({
     *     network: 'wss://testnet.vara.network'
     * });
     *
     * // Returns SailsCalls instance with no contracts data.
     * // With voucher signer and Network: wss://testnet.vara.network
     * const sailsCalls = await SailsCalls.new({
     *     network: 'wss://testnet.vara.network',
     *     voucherSignerData: {
     *         sponsorName: 'Name',
     *         sponsorMnemonic: 'strong void ...'
     *     }
     * });
     *
     * // Returns SailsCalls instance with one contract data.
     * // With network: wss://testnet.vara.network
     * const sailsCalls = await SailsCalls.new({
     *     network: 'wss://testnet.vara.network',
     *     newContractsData: [
     *         {
     *             contractName: "PingContract",
     *             address: '0x...',
     *             idl: `...`
     *         }
     *     ]
     * });
     *
     * // Returns SailsCalls instance with one contract data.
     * // With voucher signer and network: ws://localhost:9944
     * const sailsCalls = await SailsCalls.new({
     *     voucherSignerData: {
     *         sponsorName: 'Name',
     *         sponsorMnemonic: 'strong void ...'
     *     },
     *     newContractsData: [
     *         {
     *             contractName: "PingContract",
     *             address: '0x...',
     *             idl: `...`
     *         }
     *     ]
     * });
     *
     * // Returns SailsCalls instance with one contract data
     * // With voucher signer and Network: wss://testnet.vara.network
     * const sailsCalls = await SailsCalls.new({
     *     network: 'wss://testnet.vara.network',
     *     voucherSignerData: {
     *         sponsorName: 'Name',
     *         sponsorMnemonic: 'strong void ...'
     *     },
     *     newContractsData: [
     *         {
     *             contractName: "PingContract",
     *             address: '0x...',
     *             idl: `...`
     *         },
     *         {
     *             // Contract data
     *         },
     *         // More contracts
     *     ]
     * });
     */
    static new: (data?: ISailsCalls) => Promise<SailsCalls>;
    /**
     * ## SailsCalls command
     * Method to call a command in the contract (to change state).
     *
     * @param url Url form of the method: 'ContractId/Service/Method' or 'Service/Method'
     * in case that contract id is set in SailsCalls instance
     * @param signerData Signer that will sign the extrinsic (with wallet or KeyringPair)
     * @param options Optional, arguments for method and callbacks for each state of extrinsic
     * @returns Promise with response of the method
     * @example
     * const contractId = '0xc234d08426b...b03b83afc4d2fd';
     * const voucherId = '0xc0403jdj03...jfi39gn32l2fw';
     * const sailsCalls = await SailsCalls.new({
     *     network: 'wss://testnet.vara.network',
     *     idl: CONTRACT.idl // String idl
     * });
     *
     * // Call with 'wallet' signer
     * const { signer } = await web3FromSource(account.meta.source);
     *
     * const response = await sailsCalls.command(
     *     `${contractId}/ServiceName/MethodName`,
     *     {
     *         userAddress: account.decodedAddress,
     *         signer
     *     }
     * );
     *
     * // Call with KeyringPair
     * const accountName = 'WalletName';
     * const mnemonic = "strong word ...";
     * const keyringPair = await GearKeyring.fromMnemonic(
     *     sponsorMnemonic,
     *     sponsorName
     * );
     *
     * const response = await sailsCalls.command(
     *     `${contractId}/ServiceName/MethodName`,
     *     keyringPair
     * );
     *
     * // Call with contract id set
     * // If it is not specified, it will throw an error
     * sailsCalls.withContractId('0xsjiqw...');
     * const response = await sailsCalls.command(
     *     `ServiceName/MethodName`,
     *     keyringPair
     * );
     *
     * // call using voucher
     * const response = await sailsCalls.command(
     *     `ServiceName/MethodName`,
     *     keyringPair,
     *     {
     *         voucherId
     *     }
     * );
     *
     * // call with associated value
     * // It is necessary that the account has tokens available
     * const response = await sailsCalls.command(
     *     `${contractId}/ServiceName/MethodName`,
     *     {
     *         userAddress: account.decodedAddress,
     *         signer
     *     },
     *     {
     *         // Send one token
     *         tokensToSend: 1_000_000_000_000n,
     *     }
     * );
     *
     * // Call with all callbacks (all are optionals)
     * // It includes async-await calls
     * const response = await sailsCalls.commamd(
     *     `ServiceName/MethodName`,
     *     keyringPair,
     *     {
     *         callbacks: {
     *             onLoad() {
     *                 console.log('Message to send is loading');
     *             },
     *             onLoadAsync() {
     *                 return new Promise(async resolve => {
     *                     console.log('Loading message with async');
     *                     resolve();
     *                 });
     *             },
     *             onBlock(blockHash) {
     *                 console.log(`Block: ${blockHash}`);
     *             },
     *             onBlockAsync(blockHash) {
     *                 return new Promise(async resolve => {
     *                     console.log(`Block async: ${blockHash}`);
     *                     resolve();
     *                 });
     *             },
     *             onSuccess() {
     *                 console.log('Message send successfully!');
     *             },
     *             onSuccessAsync() {
     *                 return new Promise(async resolve => {
     *                     console.log('Message send!, with async');
     *                     resolve();
     *                 });
     *             },
     *             onError() {
     *                 console.log('An error ocurred!');
     *             },
     *             onErrorAsync() {
     *                 return new Promise(async resolve => {
     *                     console.log('An error ocurred!, with async');
     *                     resolve();
     *                 });
     *             }
     *         }
     *     }
     * );
     *
     * // Call with arguments
     * const response = await sailsCalls.command(
     *     `${contractId}/ServiceName/MethodName`,
     *     keyringPair,
     *     {
     *         callArguments: [
     *             "Hello!",
     *             {
     *                 name: "DAVID",
     *                 age: 22
     *             }
     *             // More arguments
     *         ]
     *     }
     * );
     *
     * // A call with all options
     * const response = await sailsCalls.commamd(
     *     `${contractId}/ServiceName/MethodName`,
     *     {
     *         userAddress: account.decodedAddress,
     *         signer
     *     },
     *     {
     *         voucherId,
     *         tokensToSend: 1_000_000_000_000n,
     *         callArguments: [
     *             "Hello!",
     *             {
     *                 name: "DAVID",
     *                 age: 22
     *             }
     *             // More arguments
     *         ],
     *         callbacks: {
     *             onLoad() {
     *                 console.log('Message to send is loading');
     *             },
     *             onLoadAsync() {
     *                 return new Promise(async resolve => {
     *                     console.log('Loading message with async');
     *                     resolve();
     *                 });
     *             },
     *             onBlock(blockHash) {
     *                 console.log(`Block: ${blockHash}`);
     *             },
     *             onBlockAsync(blockHash) {
     *                 return new Promise(async resolve => {
     *                     console.log(`Block async: ${blockHash}`);
     *                     resolve();
     *                 });
     *             },
     *             onSuccess() {
     *                 console.log('Message send successfully!');
     *             },
     *             onSuccessAsync() {
     *                 return new Promise(async resolve => {
     *                     console.log('Message send!, with async');
     *                     resolve();
     *                 });
     *             },
     *             onError() {
     *                 console.log('An error ocurred!');
     *             },
     *             onErrorAsync() {
     *                 return new Promise(async resolve => {
     *                     console.log('An error ocurred!, with async');
     *                     resolve();
     *                 });
     *             }
     *         }
     *     }
     * );
     */
    command: (options: ISailsCommandOptions) => Promise<ICommandResponse>;
    /**
     * ## SailsCalls query
     * Method to call a query in the contract (read state)
     * @param url Url form of the method: 'ContractId/Service/Method' or 'Service/Method'
     * in case that contract id is set in SailsCalls instance
     * @param options arguments for query and callbacks for each state of query, the user address is optional
     * @returns Promise with response of the query
     * @example
     * const contractId = '0xc234d08426b...b03b83afc4d2fd';
     * const sailsCalls = await SailsCalls.new({
     *     network: 'wss://testnet.vara.network',
     *     idl: CONTRACT.idl // String idl
     * });
     *
     * // Simple query
     * // The addres that SailsCalls will use is the 'zero' address
     * // because userId is not specified
     * const response = await sailsCalls.query(
     *     `${contractId}/ServiceName/MethodName`
     * );
     *
     * // Simple query with user id
     * const response = await sailsCalls.query(
     *     `${contractId}/ServiceName/MethodName`,
     *     {
     *         userId: account.decodedAddress
     *     }
     * );
     *
     * // Query with contract id set
     * // If it is not specified, it will throw an error
     * sailsCalls..withContractId('0xsjiqw...');
     * const response = await sailsCalls.query(
     *     `ServiceName/MethodName`,
     *     {
     *         userId: account.decodedAddress
     *     }
     * );
     *
     * // Query with arguments
     * const response = await sailsCalls.query(
     *     `ServiceName/MethodName`,
     *     {
     *         userId: account.decodedAddress,
     *         callArguments: [
     *             "Hello",
     *             {
     *                 name: 'David',
     *                 age: 22,
     *             },
     *             // etc
     *         ]
     *     }
     * );
     *
     * // Query with callbacks
     * const response = await sailsCalls.query(
     *     `ServiceName/MethodName`,
     *     {
     *         userId: account.decodedAddress,
     *         callbacks: {
     *             onLoad() {
     *                 console.log('Message to send is loading');
     *             },
     *             onLoadAsync() {
     *                 return new Promise(async resolve => {
     *                     console.log('Loading message with async');
     *                     resolve();
     *                 });
     *             },
     *             onSuccess() {
     *                 console.log('Message send successfully!');
     *             },
     *             onSuccessAsync() {
     *                 return new Promise(async resolve => {
     *                     console.log('Message send!, with async');
     *                     resolve();
     *                 });
     *             },
     *             onError() {
     *                 console.log('An error ocurred!');
     *             },
     *             onErrorAsync() {
     *                 return new Promise(async resolve => {
     *                     console.log('An error ocurred!, with async');
     *                     resolve();
     *                 });
     *             }
     *         }
     *     }
     * );
     *
     *
     * // Query with all options:
     * const response = await sailsCalls.query(
     *     `ServiceName/MethodName`,
     *     {
     *         userId: account.decodedAddress,
     *         callArguments: [
     *             "Hello",
     *             {
     *                 name: 'David',
     *                 age: 22,
     *             },
     *             // etc
     *         ],
     *         callbacks: {
     *             onLoad() {
     *                 console.log('Message to send is loading');
     *             },
     *             onLoadAsync() {
     *                 return new Promise(async resolve => {
     *                     console.log('Loading message with async');
     *                     resolve();
     *                 });
     *             },
     *             onSuccess() {
     *                 console.log('Message send successfully!');
     *             },
     *             onSuccessAsync() {
     *                 return new Promise(async resolve => {
     *                     console.log('Message send!, with async');
     *                     resolve();
     *                 });
     *             },
     *             onError() {
     *                 console.log('An error ocurred!');
     *             },
     *             onErrorAsync() {
     *                 return new Promise(async resolve => {
     *                     console.log('An error ocurred!, with async');
     *                     resolve();
     *                 });
     *             }
     *         }
     *     }
     * );
     *
     */
    query: (options: ISailsQueryOptions) => Promise<any>;
    /**
     * ## Set account to sign feature vouchers
     * @param sponsorMnemonic Sponsor mnemonic to sign vouchers
     * @param sponsorName Sponsor name to sign vouchers
     * @returns void that indicates that signer was set
     * @example
     * const sails = awais SailsCalls.new();
     * await sails.withAccountToSignVouchers({
     *     sponsorName: 'SponsorName',
     *     sponsorMnemonic: 'strong await ...'
     * });
     */
    withAccountToSignVouchers: (sponsorMnemonic: string, sponsorName: string) => Promise<void>;
    /**
     * ## Creates a new voucher
     * Create a new voucher for an address to the stored contract id
     * The instance need to have the contract id "stored" to be able to do this action
     * @param address User address to afiliate voucher
     * @param initialTokensInVoucher initial tokens for the voucher
     * @param initialExpiredTimeInBlocks initial time expiration in blocks
     * @param callbacks callback for each state of the voucher action
     * @returns issued voucher id
     * @example
     * const userAddress = account.decodedAddress; // 0xjfm2...
     * const contractId = '0xeejnf2...';
     * // You can set the contract id at start of SailsCalls
     * const sails = await SailsCalls.new({
     *     contractId
     * });
     *
     * sails.withContractId(contractId); // or later with its method
     *
     * const voucherId = await sails.createVoucher(
     *     userAddress,
     *     3, // 3 Varas
     *     1_200, // Expiration time in blocks (one hour)
     *     { // All callbacks are optionals
     *         onLoad() {
     *             console.log('Voucher will be created');
     *         },
     *         onLoadAsync() {
     *             return new Promise(async resolve => {
     *                 console.log('Async actions');
     *                 console.log('Voucher will be created');
     *                 resolve();
     *             }
     *         },
     *         onSuccess() {
     *             console.log('Voucher created!');
     *         },
     *         onSuccessAsync() {
     *             return new Promise(async resolve => {
     *                 console.log('Async actions');
     *                 console.log('Voucher created!');
     *                 resolve();
     *             }
     *         },
     *         onError() {
     *             console.log('Error while creating voucher');
     *         },
     *         onErrorAsync() {
     *             return new Promise(async resolve => {
     *                 console.log('Async actions');
     *                 console.log('Error while creating voucher');
     *                 resolve();
     *             }
     *         }
     *     }
     * );
     *
     */
    createVoucher: (options: ICreateVoucher) => Promise<HexString>;
    /**
    * ## Creates a new voucher
    * Create a new voucher for an address to specified contracts id
    * The function create a voucher for an user address and specified contracts id
    * @param address User address to afiliate voucher
    * @param contractsId Contracts id to afilliate the voucher
    * @param initialTokensInVoucher initial tokens for the voucher
    * @param initialExpiredTimeInBlocks initial time expiration in blocks
    * @param callbacks callback for each state of the voucher action
    * @returns issued voucher id
    * @example
    * const userAddress = account.decodedAddress; // 0xjfm2...
    * const contractId = '0xeejnf2...';
    * // You can set the contract id at start of SailsCalls
    * const sails = await SailsCalls.new();
    *
    * const voucherId = await sails.createVoucherWithContractId(
    *     userAddress,
    *     [contractId],
    *     3, // 3 Varas
    *     1_200, // Expiration time in blocks (one hour)
    *     { // All callbacks are optionals
    *         onLoad() {
    *             console.log('Voucher will be created');
    *         },
    *         onLoadAsync() {
    *             return new Promise(async resolve => {
    *                 console.log('Async actions');
    *                 console.log('Voucher will be created');
    *                 resolve();
    *             }
    *         },
    *         onSuccess() {
    *             console.log('Voucher created!');
    *         },
    *         onSuccessAsync() {
    *             return new Promise(async resolve => {
    *                 console.log('Async actions');
    *                 console.log('Voucher created!');
    *                 resolve();
    *             }
    *         },
    *         onError() {
    *             console.log('Error while creating voucher');
    *         },
    *         onErrorAsync() {
    *             return new Promise(async resolve => {
    *                 console.log('Async actions');
    *                 console.log('Error while creating voucher');
    *                 resolve();
    *             }
    *         }
    *     }
    * );
    *
    */
    private generateVoucher;
    /**
     * ## Renew a voucher at specified blocks
     * @param userAddress address affiliated with the voucher
     * @param voucherId voucher id to renew
     * @param numOfBlocks number of blocks (min 20)
     * @param callbacks optional callbacks to each state of the voucher action
     * @returns void
     * @example
     * const userAddress = account.decodedAddress; // 0xjfm2...
     * const contractId = '0xeejnf2...';
     * const sails = await SailsCalls.new();
     *
     * await sails.renewVoucherAmountOfBlocks(
     *     userAddress,
     *     contractId,
     *     1_200, // 1200 blocks = an hour
     *     { // All callbacks are optionals
     *         onLoad() {
     *             console.log('Voucher will be renewed');
     *         },
     *         onLoadAsync() {
     *             return new Promise(async resolve => {
     *                 console.log('Async actions');
     *                 console.log('Voucher will be renewed');
     *                 resolve();
     *             }
     *         },
     *         onSuccess() {
     *             console.log('Voucher will be renewed');
     *         },
     *         onSuccessAsync() {
     *             return new Promise(async resolve => {
     *                 console.log('Async actions');
     *                 console.log('Voucher will be renewed');
     *                 resolve();
     *             }
     *         },
     *         onError() {
     *             console.log('Voucher will be renewed');
     *         },
     *         onErrorAsync() {
     *             return new Promise(async resolve => {
     *                 console.log('Async actions');
     *                 console.log('Voucher will be renewed');
     *                 resolve();
     *             }
     *         }
     *     }
     * );
     */
    renewVoucherAmountOfBlocks: (options: IRenewVoucherAmountOfBlocks) => Promise<void>;
    /**
     * ## Adds tokens to a voucher
     * @param userAddress address associated with the voucher id
     * @param voucherId voucher id to add the tokens
     * @param numOfTokens address associated with the voucher id
     * @param callbacks optional callbacks to each state of the voucher action
     * @returns void
     * @example
     * const userAddress = account.decodedAddress; // 0xjfm2...
     * const voucherId = '0xeejnf2...';
     * const sails = await SailsCalls.new();
     *
     * await sails.addTokensToVoucher(
     *     userAddress,
     *     voucherId,
     *     2, // Two tokens
     *     { // All callbacks are optionals
     *         onLoad() {
     *             console.log('Will add tokens to voucher');
     *         },
     *         onLoadAsync() {
     *             return new Promise(async resolve => {
     *                 console.log('Async actions');
     *                 console.log('Will add tokens to voucher');
     *                 resolve();
     *             }
     *         },
     *         onSuccess() {
     *             console.log('Tokens added to voucher!');
     *         },
     *         onSuccessAsync() {
     *             return new Promise(async resolve => {
     *                 console.log('Async actions');
     *                 console.log('Tokens added to voucher!');
     *                 resolve();
     *             }
     *         },
     *         onError() {
     *             console.log('Error while adding tokens to voucher');
     *         },
     *         onErrorAsync() {
     *             return new Promise(async resolve => {
     *                 console.log('Async actions');
     *                 console.log('Error while adding tokens to voucher');
     *                 resolve();
     *             }
     *         }
     *     }
     * );
     */
    addTokensToVoucher: (options: ITokensToAddToVoucher) => Promise<void>;
    /**
     * ## Obtain all vouchers from an account in a contract
     * @param userAddress user address associated with the voucher
     * @param contractId Optional, contract id of the contract, if not specified, stored contract id will be used
     * @returns list of vouchers id asociated with the user address and contract id.
     * @example
     * const userAddress = account.decodedAddress; // 0xjfm2...
     * const contractId = '0xeejnf2...';
     * const sails = await SailsCalls.new({
     *     contractId
     * });
     * // Will get vouchers from a contract id
     * const vouchersId = await sails.vouchersInContract(
     *     userAddress,
     *     contractId
     * );
     *
     * // Will get vouchers from stored contract id
     * const vouchersId = await sails.vouchersInContract(
     *     userAddress
     * );
     *
     * console.log(vouchersId);
     */
    vouchersInContract: (userAddress: HexString, contractId?: string | HexString) => Promise<HexString[]>;
    /**
     * ## Method to know if a voucher has expired
     * @param userAddress user address associated with the voucher
     * @param voucherId voucher id to check
     * @returns Boolean value to check if the voucher is expired
     * @example
     * const userAddress = account.decodedAddress; // 0xjfm2...
     * const contractId = '0xeejnf2...';
     * const sails = await SailsCalls.new();
     *
     * const expired = await sails.voucherIsExpired(
     *     userAddress,
     *     contractId
     * );
     *
     * if (expired) console.log('Voucher expired!');
     */
    voucherIsExpired: (userAddress: HexString, voucherId: HexString) => Promise<boolean>;
    /**
     * ## Get the balance from a voucher
     * Gets the balance (num of tokens) from a voucher
     * @param voucherId voucher id
     * @returns balance of the voucher
     * @example
     * const voucherId = '0xeejnf2...';
     * const sails = await SailsCalls.new();
     *
     * const voucherBalance = await sails.voucherBalance(voucherId);
     *
     * // prints 'Voucher balance: 5'
     * console.log(`Voucher balance: ${voucherBalance}`);
     */
    voucherBalance: (voucherId: HexString) => Promise<number>;
    private signVoucherAction;
    /**
     * ## Create a new signless account
     * @returns New KeyringPair (Signless account)
     * @example
     * const name = 'CustomName';
     * const sails = await SailsCalls.new();
     * // KeyringPair name will be: signlessPair
     * const signlessAccount = await sails.createNewPairAddress();
     *
     * // KeyringPair name will be: CustomName
     * const signlessAccount = await sails.createNewPairAddress(name);
     */
    createNewKeyringPair: (nameOfSignlessAccount?: string) => Promise<KeyringPair>;
    /**
     * ## Lock a keyringPair
     * Function to obtain the "locked" version of the signless account
     * @param pair KeyringPair of signless account to lock
     * @param password String to be used to lock the KeyringPair of the signless account
     * @returns a KeyringPair$Json from a locked signless account
     * @example
     * const sails = await SailsCalls.new();
     * const signlessAccount = await sails.createNewPairAddress();
     * const locketKeyringPair = sails.lockeyringPair(
     *     signlessAccount,
     *     "password"
     * );
     */
    lockkeyringPair: (pair: KeyringPair, password: string) => KeyringPair$Json;
    /**
     * ##  Unlocks a locker KeyringPair
     * Function to unlock the "locked" version of the signless account (a "try" is needed in case the password is incorrect)
     * @param pair Locked signless account
     * @param password string that was previously used to block the signless account
     * @returns The KeyringPair of the locked signless account
     * @example
     * const sails = await SailsCalls.new();
     * const signlessAccount = await sails.createNewPairAddress();
     * const lockedKeyringPair = sails.lockeyringPair(
     *     signlessAccount,
     *     "password"
     * );
     * const unlockedKeyringPair = sails.unlockKeyringPair(
     *     lockedKeyringPair,
     *     'password'
     * );
     */
    unlockKeyringPair: (pair: KeyringPair$Json, password: string) => KeyringPair;
    /**
     * ## Format keyringPair from contract
     * Gives a correct format to the blocked signless account that was obtained from the contract, so that it can be unblocked
     * @param signlessData Account blocked from giving the correct format
     * @returns Correct signless account (KeyringPair) for later use
     * @example
     * const contractId = '0xdf234...';
     * const noWalletAddress = '0x7d7dw2...';
     * const idl = '...';
     * const sails = await SailsCalls.new({
     *     contractId,
     *     idl
     * });
     *
     * // Note: Usage example if is used the contract format for signless accounts
     *
     * const keyringPairFromContract = await sails.query(
     *     'QueryService/SignlessAccountData', // Service and method example
     *     {
     *         callArguments: [
     *             noWalletAddress
     *         ]
     *     }
     * );
     *
     * const { signlessAccountData } = contractState;
     *
     * const lockedSignlessData = sails.formatContractSignlessData(
     *     signlessAccountData,
     *     'AccountName'
     * );
     *
     * console.log('Locked signless account');
     * console.log(lockedSignlessData);
     */
    formatContractSignlessData: (signlessData: any, signlessName: string) => KeyringPair$Json;
    /**
     * ## Modify locked KeyringPair
     * Gives the correct format to the information of a locked signless account to send it to the contract
     * @param pair locked signless account to format it
     * @returns locked signless account with the correct format
     * @example
     * const sails = await SailsCalls.new();
     * const keyringPair = await sails.createNewKeyringPair();
     * const lockedKeyringPair = await sails.lockkeyringPair(
     *     keyringPair,
     *     'password'
     * );
     *
     * // It contains the correct locked KeyringPair format for contract
     * const modifiedLockedKeyringPair = sails.modifyPairToContract(lockedKeyringPair);
     *
     * console.log(modifiedLockedKeyringPair);
     */
    modifyPairToContract: (pair: KeyringPair$Json) => IFormatedKeyring;
    disconnectGearApi: () => Promise<void>;
    /**
     * ## Change network for SailsCalls instance
     * Set a network for a SailsCalls instance
     * @param network Network to connect
     * @example
     * const sails = await SailsCalls.new();
     * sails.withNetwork('wss://testnet.vara.network');s
     */
    servicesFromSailsInstance: (sailsInstance: Sails) => string[];
    serviceFunctionNamesFromSailsInstance: (sailsInstance: Sails, serviceName: string, functionsFrom: "queries" | "functions") => string[];
    private processCallBack;
}
