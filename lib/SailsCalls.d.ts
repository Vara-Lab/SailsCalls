import { Sails } from "sails-js";
import { GearApi } from "@gear-js/api";
import type { KeyringPair, KeyringPair$Json } from '@polkadot/keyring/types';
import type { HexString } from "@gear-js/api";
import type { ISailsCommandOptions, ISailsQueryOptions, ISailsCalls, SailsCallsError, ICreateVoucher, IRenewVoucherAmountOfBlocks, ITokensToAddToVoucher, ICommandResponse, IFormatedKeyring, ModifiedLockedKeyringPair, ISailsCallsSubscribe } from "./types.js";
export declare class SailsCalls {
    private sailsInstances;
    private gearApi;
    private sailsParser;
    private accountToSignVouchers;
    private lookedEvents;
    private constructor();
    /**
     * ## Returns the gear api of sailscalls instance
     */
    get sailsCallsGearApi(): GearApi;
    /**
     * ## Returns sailscalls provider keyring
     */
    get sponsorKeyring(): KeyringPair | null;
    static decodeAddress: (publicKey: string) => void;
    /**
     * ## Returns the sails instance of a contract
     * @param contractName OPTIONAL - Contract name set in sailscalls
     * @returns Sails instance of the contract
     */
    sailsInstanceOfContract(contractName?: string): Sails;
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
     * const sailsCalls = await SailsCalls.create();
     *
     * // Returns SailsCalls instance with no contracts data.
     * // With Network: wss://testnet.vara.network
     * const sailsCalls = await SailsCalls.create({
     *     network: 'wss://testnet.vara.network'
     * });
     *
     * // Returns SailsCalls instance with no contracts data.
     * // With voucher signer and Network: wss://testnet.vara.network
     * const sailsCalls = await SailsCalls.create({
     *     network: 'wss://testnet.vara.network',
     *     voucherSignerData: {
     *         sponsorName: 'Name',
     *         sponsorMnemonic: 'strong void ...'
     *     }
     * });
     *
     * // Returns SailsCalls instance with one contract data.
     * // With network: wss://testnet.vara.network
     * const sailsCalls = await SailsCalls.create({
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
     * const sailsCalls = await SailsCalls.create({
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
     * const sailsCalls = await SailsCalls.create({
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
    static create: (data?: ISailsCalls) => Promise<SailsCalls>;
    /**
     * @deprecated Use SailsCalls.create instead
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
    static readonly new: (data?: ISailsCalls) => Promise<SailsCalls>;
    private contractInstanceToCall;
    /**
     *
     * @param sailscallsEventSubscribe attributes for subscription:
     *  - `serviceName`: Name of the service to call in the contract
     *  - `eventName`: Event name to subscribe
     *  - `contractToCall`: **OPTIONAL**, contract to call with SailsCalls, you can omit it (SailsCalls will
     *    use the first one that you set when you create the instance), set the name of the contract to
     *    call that you put in the contract data, or with a new ContractData objet.
     *  - `onEventEmit`: Function that sailscalls will call when it detect that the contract emit an event, and
     *    will pass the payload received from the event, the callback can be an async function.
     * @returns Async function to unsubscribe manualy to the event
     * @example
     *
     * // Supose that the code contains a sailscalls instance
     *
     * // Subscribe to event - get the contract stored
     * const usubfunc = sailscalls.subscribeTo({
     *     serviceName: "ServiceName",
     *     eventName: "EventName",
     *     onEventEmit: (data) => {
     *         console.log("data from event:");
     *         console.log(data);
     *     }
     * });
     *
     * // Subscribe to event - set the contract name to call
     * const usubfunc = sailscalls.subscribeTo({
     *     contractToCall: "ContractName",
     *     serviceName: "ServiceName",
     *     eventName: "EventName",
     *     onEventEmit: (data) => {
     *         console.log("data from event:");
     *         console.log(data);
     *     }
     * });
     *
     * // Subscribe to event - set the contract data
     * const usubfunc = sailscalls.subscribeTo({
     *     contractToCall: {
     *         address: "0x...",
     *         idl: `...`
     *     },
     *     serviceName: "ServiceName",
     *     eventName: "EventName",
     *     onEventEmit: (data) => {
     *         console.log("data from event:");
     *         console.log(data);
     *     }
     * });
     */
    subscribeTo: ({ serviceName, eventName, contractToCall, onEventEmit }: ISailsCallsSubscribe) => (() => Promise<void>) | SailsCallsError;
    /**
     * ### Close all event listeners
     */
    unsubscribeAllEvents: () => Promise<void>;
    /**
     * ### Get the number of event listeners
     * @returns Number of active event listeners
     */
    numberOfEventListeners: () => number;
    /**
     * ## SailsCalls command
     * Method to call a command in the contract (to change state).
     * @param options Attributes for the command:
     *  - `signerData`: Signer that will sign the extrinsic (with wallet or KeyringPair)
     *  - `contractToCall`: **OPTIONAL**, contract to call with SailsCalls, you can omit it (SailsCalls will
     *    use the first one that you set when you create the instance), set the name of the contract to
     *    call that you put in the contract data, or with a new ContractData objet.
     *  - `serviceName`: Name of the service to call in the contract
     *  - `methodName`: Method from the service to call in the contract
     *  - `callArguments`: **OPTIONAL**, arguments to send in the message
     *  - `tokensToSend`: **OPTINAL**, tokens to send with the message
     *  - `voucherId`: **OPTIONAL**, voucher to bind in the message
     *  - `gasLimit`: **OPTIONAL**, gas to set in the message, percentage of extra gas from the calculated gas,
     *     or you can omit it
     *  - `callbacks`: **OPTIONAL**, optional callbacks that will be called in each state of the command
     *  - `enableLogs`: **OPTIONAL**, will execute some console.logs
     * @returns Promise with response of the method
     * @example
     *
     * // constants to use as example
     * const contractId = '0xc234d08426b...b03b83afc4d2fd';
     * const idl = `...`;
     * const network = 'wss://testnet.vara.network';
     *
     * // Keyring pair to use as example
     * const accountName = 'WalletName';
     * const mnemonic = "strong word ...";
     * const keyringPair = await GearKeyring.fromMnemonic(
     *     sponsorMnemonic,
     *     sponsorName
     * );
     *
     * // SailsCalls instance to use as example
     * const sailsCalls = await SailsCalls.new({
     *     network,
     *     newContractsData: [
     *         {
     *             contractName: 'traffic_light',
     *             address: contractId,
     *             idl
     *         },
     *         {
     *             contractName: 'ping_pong',
     *             address: '0x3423...',
     *             idl: `...`
     *         }
     *     ]
     * });
     *
     * // Call with 'wallet' signer
     * const { signer } = await web3FromSource(account.meta.source);
     *
     * const response = await sailsCalls.command({ // basic call
     *     signerData: signer,
     *     serviceName: 'ServiceName',
     *     methodName: 'MethodName'
     * });
     *
     * // Call with KeyringPair
     * const response = await sailsCalls.command({ // basic call
     *     signerData: keyringPair,
     *     serviceName: 'ServiceName',
     *     methodName: 'MethodName',
     * });
     *
     * // Different calls to the contract
     * // - If contract is not specified, it will
     * //   use the firt one that you set (in this case 'traffic_light') (optional attribute)
     * const response = await sailsCalls.command({
     *     signerData: keyringPair,
     *     serviceName: 'ServiceName',
     *     methodName: 'MethodName',
     * });
     *
     * // - Call using the name of the contract that is stored (optional attribute)
     * const response = await sailsCalls.command({
     *     signerData: keyringPair,
     *     contractToCall: 'ping_pong',
     *     serviceName: 'ServiceName',
     *     methodName: 'MethodName',
     * });
     *
     * // - call with a new temporary contract (optional attribute)
     * const response = await sailsCalls.command({
     *     signerData: keyringPair,
     *     contractToCall: {
     *         address: ``;
     *         idl: `...`;
     *     },
     *     serviceName: 'ServiceName',
     *     methodName: 'MethodName',
     * });
     *
     * // Call with arguments (optional attribute)
     * const response = await sailsCalls.command({ // basic call
     *     signerData: signer,
     *     serviceName: 'ServiceName',
     *     methodName: 'MethodName',
     *     callArguments: [
     *         'first argument',
     *         3, // second argument
     *         // more arguments
     *     ]
     * });
     *
     * // Call with linked tokens (optional attribute)
     * const response = await sailsCalls.command({ // basic call
     *     signerData: signer,
     *     serviceName: 'ServiceName',
     *     methodName: 'MethodName',
     *     tokensToSend: 1 // 1 VARA
     * });
     *
     * // Call with voucher (optional attribute)
     * const response = await sailsCalls.command({ // basic call
     *     signerData: signer,
     *     serviceName: 'ServiceName',
     *     methodName: 'MethodName',
     *     voucherId: '0xfj32...'
     * });
     *
     * // Call with gasLimit (optional attribute)
     * // In the previous examples, the gas fees were automatically calculated.
     * // - call with gas fees set by the user
     * const response = await sailsCalls.command({ // basic call
     *     signerData: signer,
     *     serviceName: 'ServiceName',
     *     methodName: 'MethodName',
     *     gasLimit: 1_000_000n // Set the gas limit to spend in the message
     * });
     *
     * // - Call that adds 10% extra gas fees to the calculated gas fees
     * const response = await sailsCalls.command({ // basic call
     *     signerData: signer,
     *     serviceName: 'ServiceName',
     *     methodName: 'MethodName',
     *     gasLimit: {
     *         extraGasInCalculatedGasFees: 10
     *     }
     * });
     *
     * // Call with callbacks (optional attribute)
     * const response = await sailsCalls.command({ // basic call
     *     signerData: signer,
     *     serviceName: 'ServiceName',
     *     methodName: 'MethodName',
     *     callbacks: {
     *         onLoad() {
     *             console.log('Message to send is loading');
     *         },
     *         onLoadAsync() {
     *             return new Promise(async resolve => {
     *                 console.log('Loading message with async');
     *                 resolve();
     *             });
     *         },
     *         onBlock(blockHash) {
     *             console.log(`Block: ${blockHash}`);
     *         },
     *         onBlockAsync(blockHash) {
     *             return new Promise(async resolve => {
     *                 console.log(`Block async: ${blockHash}`);
     *                 resolve();
     *             });
     *         },
     *         onSuccess() {
     *             console.log('Message send successfully!');
     *         },
     *         onSuccessAsync() {
     *             return new Promise(async resolve => {
     *                 console.log('Message send!, with async');
     *                 resolve();
     *             });
     *         },
     *         onError() {
     *             console.log('An error ocurred!');
     *         },
     *         onErrorAsync() {
     *             return new Promise(async resolve => {
     *                 console.log('An error ocurred!, with async');
     *                 resolve();
     *             });
     *         }
     *     }
     * });
     *
     * // Call with all arguments
     * const response = await sailsCalls.command({
     *     signerData: signer,
     *     contractToCall: {
     *         address: ``;
     *         idl: `...`;
     *     },
     *     serviceName: 'ServiceName',
     *     methodName: 'MethodName',
     *     callArguments: [
     *         'first argument',
     *         3, // second argument
     *         // more arguments
     *     ],
     *     tokensToSend: 1, // 1 VARA
     *     voucherId: '0xfj32...',
     *     gasLimit: {
     *         extraGasInCalculatedGasFees: 10
     *     },
     *     callbacks: {
     *         onLoad() {
     *             console.log('Message to send is loading');
     *         },
     *         onLoadAsync() {
     *             return new Promise(async resolve => {
     *                 console.log('Loading message with async');
     *                 resolve();
     *             });
     *         },
     *         onBlock(blockHash) {
     *             console.log(`Block: ${blockHash}`);
     *         },
     *         onBlockAsync(blockHash) {
     *             return new Promise(async resolve => {
     *                 console.log(`Block async: ${blockHash}`);
     *                 resolve();
     *             });
     *         },
     *         onSuccess() {
     *             console.log('Message send successfully!');
     *         },
     *         onSuccessAsync() {
     *             return new Promise(async resolve => {
     *                 console.log('Message send!, with async');
     *                 resolve();
     *             });
     *         },
     *         onError() {
     *             console.log('An error ocurred!');
     *         },
     *         onErrorAsync() {
     *             return new Promise(async resolve => {
     *                 console.log('An error ocurred!, with async');
     *                 resolve();
     *             });
     *         }
     *     },
     *     enableLogs: true
     * });
     */
    command: (options: ISailsCommandOptions) => Promise<ICommandResponse>;
    /**
     * ## SailsCalls query
     * Method to call a query in the contract (read state)
     * @param options Attributes for query call
     *  - `contractToCall`: **OPTIONAL**, contract to call with SailsCalls, you can omit it (SailsCalls will
     *    use the first one that you set when you create the instance), set the name of the contract to
     *    call that you put in the contract data, or with a new ContractData objet.
     *  - `serviceName`: Name of the service to call in the contract
     *  - `methodName`: Method from the service to call in the contract
     *  - `userAddress`: **OPTIONAL**, an address is required for queries, if it is not set, ZERO address
     *    will be sent
     * - `callArguments`: **OPTIONAL**, arguments to send in the message
     * - `callbacks`: **OPTIONAL**, optional callbacks that will be called in each state of the query
     * @returns Promise with response of the query
     * @example
     *
     * // constants to use as example
     * const contractId = '0xc234d08426b...b03b83afc4d2fd';
     * const idl = `...`;
     * const network = 'wss://testnet.vara.network';
     *
     * // SailsCalls instance to use as example
     * const sailsCalls = await SailsCalls.new({
     *     network,
     *     newContractsData: [
     *         {
     *             contractName: 'traffic_light',
     *             address: contractId,
     *             idl
     *         },
     *         {
     *             contractName: 'ping_pong',
     *             address: '0x3423...',
     *             idl: `...`
     *         }
     *     ]
     * });
     *
     * // Simple query
     * // The address that SailsCalls will use is the 'zero' address
     * // because userAddress ont specified
     * // SailsCalls will use the first contract that you specified
     * // in this case: traffic_light
     * const response = await sailscalls.query({
     *     serviceName: 'ServiceName',
     *     methodName: 'MethodName'
     * });
     *
     * // Simple query with user address (optional attribute)
     * const response = await sailscalls.query({
     *     serviceName: 'ServiceName',
     *     methodName: 'MethodName',
     *     userAddress: '0xjiw2...'
     * });
     *
     * // Query with different forms to call the contract (optional attribute)
     * // In the last calls, SailsCalls use the first contract stored in the
     * // instance
     * // - Call using the name of the contract that is stored
     * const response = await sailscalls.query({
     *     contractToCall: 'ping_pong',
     *     serviceName: 'ServiceName',
     *     methodName: 'MethodName',
     * });
     *
     * // - call with a new temporary contract
     * const response = await sailscalls.query({
     *     contractToCall: {
     *         address: '0xue82...';
     *         idl: `...`;
     *     },
     *     serviceName: 'ServiceName',
     *     methodName: 'MethodName',
     * });
     *
     * // Query with arguments
     * const response = await sailscalls.query({
     *     serviceName: 'ServiceName',
     *     methodName: 'MethodName',
     *     callArguments: [
     *         'first argument',
     *          2, // Second argument
     *          // more arguments
     *     ]
     * });
     *
     * // Query with callbacks
     * const response = await sailscalls.query({
     *     serviceName: 'ServiceName',
     *     methodName: 'MethodName',
     *     callbacks: {
     *         onLoad() {
     *             console.log('Message to send is loading');
     *         },
     *         onLoadAsync() {
     *             return new Promise(async resolve => {
     *                 console.log('Loading message with async');
     *                 resolve();
     *             });
     *         },
     *         onSuccess() {
     *             console.log('Message send successfully!');
     *         },
     *         onSuccessAsync() {
     *             return new Promise(async resolve => {
     *                 console.log('Message send!, with async');
     *                 resolve();
     *             });
     *         },
     *         onError() {
     *             console.log('An error ocurred!');
     *         },
     *         onErrorAsync() {
     *             return new Promise(async resolve => {
     *                 console.log('An error ocurred!, with async');
     *                 resolve();
     *             });
     *         }
     *     }
     * });
     *
     * // Query with all attributes
     * const response = await sailscalls.query({
     *     contractToCall: {
     *         address: '0xue82...';
     *         idl: `...`;
     *     },
     *     serviceName: 'ServiceName',
     *     methodName: 'MethodName',
     *     userAddress: '0xjiw2...',
     *     callArguments: [
     *         'first argument',
     *          2, // Second argument
     *          // more arguments
     *     ],
     *     callbacks: {
     *         onLoad() {
     *             console.log('Message to send is loading');
     *         },
     *         onLoadAsync() {
     *             return new Promise(async resolve => {
     *                 console.log('Loading message with async');
     *                 resolve();
     *             });
     *         },
     *         onSuccess() {
     *             console.log('Message send successfully!');
     *         },
     *         onSuccessAsync() {
     *             return new Promise(async resolve => {
     *                 console.log('Message send!, with async');
     *                 resolve();
     *             });
     *         },
     *         onError() {
     *             console.log('An error ocurred!');
     *         },
     *         onErrorAsync() {
     *             return new Promise(async resolve => {
     *                 console.log('An error ocurred!, with async');
     *                 resolve();
     *             });
     *         }
     *     }
     * });
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
     * @param options Attributes to create a new voucher
     *      - `contractToSetVoucher`: **OPTIONAL**, name of the contract that is stored in the SailsCalls instance, or the address to set
     *        the voucher.
     *      - `userAddress`: address from the user to bind the voucher
     *      - `initialTokensInVoucher`: initial amount of tokens for the voucher.
     *      - `initialExpiredTimeInBlocks`: initial amount in blocks for expiration time (1200 = 1 hour)
     *      - `callbacks`: **OPTIONAL**, optional callbacks that will be called in each state of the voucher creation
     *      - `enableLogs`: **OPTIONAL**, this attribute enable some logs in the method
     * @returns issued voucher id
     * @example
     *
     * // consts to use as example
     * const userAddress = '0xue7882...';
     * const contractId = '0xeejnf2...';
     *
     * const sailsCalls = await SailsCalls.new({
     *     network: 'wss://testnet.vara.network',
     *     newContractsData: [
     *         {
     *             contractName: "PingContract",
     *             address: '0x...',
     *             idl: `...`
     *         }
     *     ],
     *     // To create voucher you need a signer to pay the transactions
     *     voucherSignerData: {
     *         sponsorName: 'Name',
     *         sponsorMnemonic: 'strong void ...'
     *     }
     * });
     *
     * // Create voucher with necessary data
     * const voucherId = await sailsCalls.createVoucher({
     *     userAddress,
     *     initialTokensInVoucher: 1, // One Vara
     *     initialExpiredTimeInBlocks: 1_200 // one hour in blocks
     * });
     *
     * // Create a voucher with fixed and other not stored contract id
     * // - With the name of the contract that is stored in the SailsCaills instance
     * const voucherId = await sailsCalls.createVoucher({
     *     contractToSetVoucher: 'PingContract',
     *     userAddress,
     *     initialTokensInVoucher: 1, // One Vara
     *     initialExpiredTimeInBlocks: 1_200 // one hour in blocks
     * });
     *
     * // - With a contract id (it will bind the voucher to the address that you specify)
     * const voucherId = await sailsCalls.createVoucher({
     *     contractToSetVoucher: '0xjdk232...', // will bind the voucher to this contract
     *     userAddress,
     *     initialTokensInVoucher: 1, // One Vara
     *     initialExpiredTimeInBlocks: 1_200 // one hour in blocks
     * });
     *
     * // Creating voucher with callbacks in each state of the voucher
     * const voucherId = await sailsCalls.createVoucher({
     *     userAddress,
     *     initialTokensInVoucher: 1, // One Vara
     *     initialExpiredTimeInBlocks: 1_200, // one hour in blocks
     *     callbacks: {
     *         onLoad() {
     *             console.log('Voucher will be created');
     *         },
     *         onLoadAsync() {
     *             return new Promise(async resolve => {
     *                 console.log('Async actions');
     *                 console.log('Voucher will be created');
     *                 resolve();
     *             });
     *         },
     *         onSuccess() {
     *             console.log('Voucher created!');
     *         },
     *         onSuccessAsync() {
     *             return new Promise(async resolve => {
     *                 console.log('Async actions');
     *                 console.log('Voucher created!');
     *                 resolve();
     *             });
     *         },
     *         onError() {
     *             console.log('Error while creating voucher');
     *         },
     *         onErrorAsync() {
     *             return new Promise(async resolve => {
     *                 console.log('Async actions');
     *                 console.log('Error while creating voucher');
     *                 resolve();
     *             });
     *         }
     *     }
     * });
     *
     * // Enabling some logs in the call
     * const voucherId = await sailsCalls.createVoucher({
     *     userAddress,
     *     initialTokensInVoucher: 1, // One Vara
     *     initialExpiredTimeInBlocks: 1_200, // one hour in blocks
     *     enableLogs: true
     * });
     *
     * // Create a voucher with all attributes
     * const voucherId = await sailsCalls.createVoucher({
     *     contractToSetVoucher: '0xjdk232...', // will bind the voucher to this contract
     *     userAddress,
     *     initialTokensInVoucher: 1, // One Vara
     *     initialExpiredTimeInBlocks: 1_200, // one hour in blocks
     *     callbacks: {
     *         onLoad() {
     *             console.log('Voucher will be created');
     *         },
     *         onLoadAsync() {
     *             return new Promise(async resolve => {
     *                 console.log('Async actions');
     *                 console.log('Voucher will be created');
     *                 resolve();
     *             });
     *         },
     *         onSuccess() {
     *             console.log('Voucher created!');
     *         },
     *         onSuccessAsync() {
     *             return new Promise(async resolve => {
     *                 console.log('Async actions');
     *                 console.log('Voucher created!');
     *                 resolve();
     *             });
     *         },
     *         onError() {
     *             console.log('Error while creating voucher');
     *         },
     *         onErrorAsync() {
     *             return new Promise(async resolve => {
     *                 console.log('Async actions');
     *                 console.log('Error while creating voucher');
     *                 resolve();
     *             });
     *         }
     *     },
     *     enableLogs: true
     * });
     *
     */
    createVoucher: (options: ICreateVoucher) => Promise<HexString>;
    /**
     * ## Renew a voucher at specified blocks
     * @param options attributes to renew an existing voucher:
     *     - `userAddress`: user address that is linked to the voucher.
     *     - `voucherId`: voucher id that will be renewed
     *     - `numOfBlocks`: Num of blocks to renew the voucher
     *     - `callbacks`: **OPTIONAL**, callbacks to each state of the voucher action
     *     - `enableLogs`: **OPTINAL**, enable some logs in the method
     * @returns void
     * @example
     *
     * const userAddress = '0x384je...';
     * const contractId = '0xeejnf2...';
     * const voucherId = '0xhe7892...';
     *
     * const sailsCalls = await SailsCalls.new();
     *
     * // Renew voucher with necessary data
     * await sailsCalls.renewVoucherAmountOfBlocks({
     *     userAddress,
     *     voucherId,
     *     numOfBlocks: 1_200, // Renewed one hour
     * });
     *
     * // Renew voucher with callbacks in each state of the method (all calls are optional)
     * await sailsCalls.renewVoucherAmountOfBlocks({
     *     userAddress,
     *     voucherId,
     *     numOfBlocks: 1_200, // Renewed one hour
     *     callbacks: {
     *         onLoad() {
     *             console.log('Voucher will be renewed');
     *         },
     *         onLoadAsync() {
     *             return new Promise(async resolve => {
     *                 console.log('Async actions');
     *                 console.log('Voucher will be renewed');
     *                 resolve();
     *             });
     *         },
     *         onSuccess() {
     *             console.log('Voucher will be renewed');
     *         },
     *         onSuccessAsync() {
     *             return new Promise(async resolve => {
     *                 console.log('Async actions');
     *                 console.log('Voucher will be renewed');
     *                 resolve();
     *             });
     *         },
     *         onError() {
     *             console.log('Voucher will be renewed');
     *         },
     *         onErrorAsync() {
     *             return new Promise(async resolve => {
     *                 console.log('Async actions');
     *                 console.log('Voucher will be renewed');
     *                 resolve();
     *             });
     *         }
     *     }
     * });
     *
     * // Renew voucher with some logs in the method
     * await sailsCalls.renewVoucherAmountOfBlocks({
     *     userAddress,
     *     voucherId,
     *     numOfBlocks: 1_200, // Renewed one hour
     *     enableLogs: true
     * });
     *
     * // Renew voucher with all attributes
     * await sailsCalls.renewVoucherAmountOfBlocks({
     *     userAddress,
     *     voucherId,
     *     numOfBlocks: 1_200, // Renewed one hour
     *     callbacks: {
     *         onLoad() {
     *             console.log('Voucher will be renewed');
     *         },
     *         onLoadAsync() {
     *             return new Promise(async resolve => {
     *                 console.log('Async actions');
     *                 console.log('Voucher will be renewed');
     *                 resolve();
     *             });
     *         },
     *         onSuccess() {
     *             console.log('Voucher will be renewed');
     *         },
     *         onSuccessAsync() {
     *             return new Promise(async resolve => {
     *                 console.log('Async actions');
     *                 console.log('Voucher will be renewed');
     *                 resolve();
     *             });
     *         },
     *         onError() {
     *             console.log('Voucher will be renewed');
     *         },
     *         onErrorAsync() {
     *             return new Promise(async resolve => {
     *                 console.log('Async actions');
     *                 console.log('Voucher will be renewed');
     *                 resolve();
     *             });
     *         }
     *     },
     *     enableLogs: true
     * });
     *
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
     * Gives a correct format to the blocked keyring account that was obtained from the contract, so that it can be unblocked
     * @param keyringFromContract Account blocked from giving the correct format
     * @param keyringName name of the keyring pair
     * @returns Correct keyring account (KeyringPair) for later use
     * @example
     * const contractId = '0xdf234...';
     * const noWalletAddress = '0x7d7dw2...';
     * const idl = '...';
     *
     * const sails = await SailsCalls.new({
     *     newContractsData: [
     *         {
     *             contractName: 'PingPong',
     *             address: contractId,
     *             idl
     *         }
     *     ]
     * });
     *
     * // Note: Usage example if is used the contract format for keyring accounts
     *
     * const contractState = await sailsCalls.query({
     *     serviceName: 'QueryService', // service name example
     *     methodName: 'KeyringAccountData' // method name example
     *     callArguments: [
     *         noWalletAddress
     *     ]
     * });
     *
     * const { keyringAccountData } = contractState;
     *
     * const lockedSignlessData = sails.formatContractSignlessData(
     *     keyringAccountData,
     *     'AccountName'
     * );
     *
     * console.log('Locked signless account');
     * console.log(lockedSignlessData);
     */
    changeModifiedLockedKeyringPairToOriginalState: (keyringFromContract: ModifiedLockedKeyringPair, keyringName: string) => KeyringPair$Json;
    /**
     * ## Modify locked KeyringPair
     * Gives the correct format to the data of a locked keyring account to send it to the contract
     *
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
     * const modifiedLockedKeyringPair = sails.changeLockedKeyringPairForContract(lockedKeyringPair);
     *
     * console.log(modifiedLockedKeyringPair);
     */
    changeLockedKeyringPairForContract: (pair: KeyringPair$Json) => IFormatedKeyring;
    /**
     * ## Disconnect the gear api from SailsCalls instance
     */
    disconnectGearApi: () => Promise<void>;
    servicesFromSailsInstance: (sailsInstance: Sails) => string[];
    serviceFunctionNamesFromSailsInstance: (sailsInstance: Sails, serviceName: string, functionsFrom: "queries" | "functions" | "events") => string[];
    private generateVoucher;
    private signVoucherAction;
    private processCallBack;
}
