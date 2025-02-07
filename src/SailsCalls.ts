/* eslint-disable @typescript-eslint/semi */
import { Sails, ZERO_ADDRESS } from "sails-js";
import { SailsIdlParser } from "sails-js-parser";
import type { KeyringPair, KeyringPair$Json } from '@polkadot/keyring/types';
import { GearApi, GearKeyring } from "@gear-js/api";
import type { HexString } from "@gear-js/api/types";
import type { 
    CallbackType, 
    SailsCallbacks, 
    ISailsCommandOptions, 
    ISailsQueryOptions,
    ISailsCalls,
    WalletSigner,
    SailsCallsError,
    NewContractData,
    SailsCallsContractsData,
    ICreateVoucher,
    IRenewVoucherAmountOfBlocks,
    ITokensToAddToVoucher,
    ICommandResponse,
    IFormatedKeyring,
} from "./types.js";
import type { IKeyringPair } from "@polkadot/types/types";

export class SailsCalls {
    private sailsInstances: SailsCallsContractsData;
    private gearApi: GearApi;
    private sailsParser: SailsIdlParser;
    // private network: string;
    private accountToSignVouchers: KeyringPair | null;

    private constructor(
        api: GearApi,
        parser: SailsIdlParser,
        newContractsData: NewContractData[],
        // network: string,
        accountToSignVouchers: KeyringPair | null
    ) {
        this.gearApi = api;
        this.sailsParser = parser;
        this.sailsInstances = {};
        // this.network = network;
        this.accountToSignVouchers = accountToSignVouchers;

        for (const newContractData of newContractsData) {
            const {
                contractName,
                address,
                idl
            } = newContractData;
            const sailsInstance = new Sails(parser);

            if (contractName.length > 1 && contractName.substring(0, 2) == '0x') {
                this.gearApi.disconnect();
                throw new Error(`Cant set contract name: invalid name ${contractName}`);
            }

            if (idl.trim() == '') {
                this.gearApi.disconnect();
                throw new Error('IDL cant be empty');
            }

            try {
                sailsInstance.setApi(api);
                sailsInstance.setProgramId(address);
                sailsInstance.parseIdl(idl);
            } catch (e) {
                console.error(`Contract data not set for: ${contractName}`);
                this.gearApi.disconnect();
                throw new Error((e as Error).message);
            }

            this.sailsInstances[contractName] = {
                sailsInstance,
                data: newContractData
            };
        }
    }

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
    static new = (data?: ISailsCalls): Promise<SailsCalls> => {
        return new Promise(async (resolve, reject) => {
            const {
                newContractsData = [],
                network = 'ws://localhost:9944',
                voucherSignerData
            } = data || {};

            let voucherSigner: KeyringPair | null = null;

            if (voucherSignerData) {
                const { sponsorName, sponsorMnemonic } = voucherSignerData;
                try {
                    voucherSigner = await GearKeyring.fromMnemonic(sponsorMnemonic, sponsorName);
                } catch (e) {
                    const error: SailsCallsError = {
                        sailsCallsError: 'Error while set signer account, voucher signer not set',
                        gearError: (e as Error).message
                    };
    
                    reject(error);
                    return;
                }
            }

            const api = await GearApi.create({ 
                providerAddress: network 
            });

            const sailsParser = await SailsIdlParser.new();
            try {
                const sailsInstance = new SailsCalls(
                    api, 
                    sailsParser, 
                    newContractsData, 
                    // network,    
                    voucherSigner
                )

                resolve(sailsInstance);
            } catch (e) {
                const error = (e as Error).message;
                reject(error);
            }
        });
    }

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
    // command = (url: string, , options?: SailsCommandOptions): Promise<any> => {
    command = (options: ISailsCommandOptions): Promise<ICommandResponse> => {
        return new Promise(async (resolve, reject) => {
            const {
                signerData,
                contractToCall,
                serviceName,
                methodName,
                callArguments,
                tokensToSend = 0n,
                voucherId,
                gasLimit,
                callbacks
            } = options;

            let contractSailsInstance: Sails;

            if (contractToCall) {
                if (typeof contractToCall === 'string') {
                    const temp = this.sailsInstances[contractToCall];
                    if (!temp) {
                        const error: SailsCallsError = {
                            sailsCallsError: `Contract name '${contractToCall}' is not set in SailsCalls instance`
                        };
        
                        reject(error);
                        return;
                    }

                    contractSailsInstance = temp.sailsInstance;
                } else {
                    contractSailsInstance = new Sails(this.sailsParser);
                    try {
                        contractSailsInstance.setApi(this.gearApi);
                        contractSailsInstance.parseIdl(contractToCall.idl);
                        contractSailsInstance.setProgramId(contractToCall.address);
                    } catch (e) {
                        const error: SailsCallsError = {
                            sailsError: (e as Error).message
                        };
        
                        reject(error);
                        return;
                    }
                }
            } else {
                const contractNames = Object.keys(this.sailsInstances);

                if (contractNames.length < 1) {
                    const error: SailsCallsError = {
                        sailsCallsError: 'No contracts stored in SailsCalls instance'
                    };

                    reject(error);
                    return;
                }

                contractSailsInstance = this.sailsInstances[contractNames[0]].sailsInstance;
            }

            const serviceNames = this.servicesFromSailsInstance(contractSailsInstance);

            if (!serviceNames.includes(serviceName)) {
                const error: SailsCallsError = {
                    sailsCallsError: `Service name '${serviceName}' does not exists in contract.\nServices: [${serviceNames}]`
                };

                reject(error);
                return;
            }

            const functionsNames = this.serviceFunctionNamesFromSailsInstance(
                contractSailsInstance, 
                serviceName, 
                'functions'
            );

            if (!functionsNames.includes(methodName)) {
                const error: SailsCallsError = {
                    sailsCallsError: `Function name '${methodName}' does not exists in service '${serviceName}'.\nFunctions: [${functionsNames}]`
                };

                reject(error);
                return;
            }

            await this.processCallBack('asynconload', callbacks);
            this.processCallBack('onload', callbacks);

            const temp = contractSailsInstance
                .services[serviceName]
                .functions[methodName];

            const transaction = callArguments 
                ? temp(...callArguments) 
                : temp();

            try  {
                if (gasLimit) {
                    if (typeof gasLimit === 'object') {
                        await transaction.calculateGas(
                            false,
                            gasLimit.extraGasInCalculatedGasFees
                        );
                    } else {
                        transaction.withGas(gasLimit);
                    }
                } else {
                    await transaction.calculateGas(false, 10);
                }

                if (voucherId) transaction.withVoucher(voucherId);

                if ('signer' in signerData) {
                    const { userAddress, signer } = signerData as WalletSigner;
                    transaction.withAccount(userAddress, { signer });
                } else {
                    const keyringPair = signerData as IKeyringPair;
                    transaction.withAccount(keyringPair);
                }

                transaction.withValue(tokensToSend);

                const sailsResponse = await transaction.signAndSend();

                await this.processCallBack('asynconblock', callbacks, sailsResponse.blockHash);
                this.processCallBack('onblock', callbacks, sailsResponse.blockHash);
                
                const serviceResponse = await sailsResponse.response();

                await this.processCallBack('asynconsuccess', callbacks);
                this.processCallBack('onsuccess', callbacks);

                resolve({
                    ...sailsResponse,
                    response: serviceResponse
                });
            } catch (e) {
                const sailsError = (e as Error).message;
                const error: SailsCallsError = {
                    sailsCallsError: 'error while sending message',
                    sailsError: sailsError
                };

                reject(error);
            }
        });
    }
    
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
    query = (options: ISailsQueryOptions): Promise<any> => {
        return new Promise(async (resolve, reject) => {
            const {
                contractToCall,
                serviceName,
                methodName,
                userAddress = ZERO_ADDRESS,
                callArguments = [],
                callbacks
            } = options;

            let contractSailsInstance: Sails;

            if (contractToCall) {
                if (typeof contractToCall === 'string') {
                    const temp = this.sailsInstances[contractToCall];
                    if (!temp) {
                        const error: SailsCallsError = {
                            sailsCallsError: `Contract name '${contractToCall}' is not set in SailsCalls instance`,
                        };

                        reject(error);
                        return;
                    }

                    contractSailsInstance = temp.sailsInstance;
                } else {
                    contractSailsInstance = new Sails(this.sailsParser);
                    try {
                        contractSailsInstance.setApi(this.gearApi);
                        contractSailsInstance.parseIdl(contractToCall.idl);
                        contractSailsInstance.setProgramId(contractToCall.address);
                    } catch (e) {
                        const error: SailsCallsError = {
                            sailsError: (e as Error).message
                        };

                        reject(error);
                        return;
                    }
                }
            } else {
                const contractNames = Object.keys(this.sailsInstances);

                if (contractNames.length < 1) {
                    const error: SailsCallsError = {
                        sailsCallsError: 'No contracts stored in SailsCalls instance'
                    };

                    reject(error);
                    return;
                }

                contractSailsInstance = this.sailsInstances[contractNames[0]].sailsInstance;
            }

            const serviceNames = this.servicesFromSailsInstance(contractSailsInstance);

            if (!serviceNames.includes(serviceName)) {
                const error: SailsCallsError = {
                    sailsCallsError: `Service name '${serviceName}' does not exists in contract.\nServices: [${serviceNames}]`
                };

                reject(error);
                return;
            }

            const functionsNames = this.serviceFunctionNamesFromSailsInstance(
                contractSailsInstance, 
                serviceName, 
                'queries'
            );

            if (!functionsNames.includes(methodName)) {
                const error: SailsCallsError = {
                    sailsCallsError: `Query name '${methodName}' does not exists in service '${serviceName}'.\nQueries: [${functionsNames}]`
                };

                reject(error);
                return;
            }

            await this.processCallBack('asynconload', callbacks);
            this.processCallBack('onload', callbacks);

            const queryMethod = contractSailsInstance
                .services[serviceName]
                .queries[methodName];

            try {
                const queryResponse = await queryMethod(
                    userAddress, 
                    undefined, 
                    undefined, 
                    ...callArguments
                );

                await this.processCallBack('asynconsuccess', callbacks);
                this.processCallBack('onsuccess', callbacks);

                resolve(queryResponse);
            } catch(e) {
                await this.processCallBack('asynconerror', callbacks);
                this.processCallBack('onerror', callbacks);

                const error: SailsCallsError = {
                    sailsCallsError: 'Error while calling query method',
                    sailsError: (e as Error).message
                };

                reject(error);
            }
        });
    }

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
    withAccountToSignVouchers = (
        sponsorMnemonic: string,
        sponsorName: string
    ): Promise<void> => {
        return new Promise(async (resolve, reject) => {
            try {
                const voucherSigner = await GearKeyring.fromMnemonic(
                    sponsorMnemonic, 
                    sponsorName
                );
                this.accountToSignVouchers = voucherSigner;

                resolve();
            } catch (e) {
                const error: SailsCallsError = {
                    sailsCallsError: 'Error while set signer account, voucher signer not set',
                    gearError: (e as Error).message
                };

                reject(error);
            } 
        });
    }

    

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
    // createVoucher = (
    //     userAddress: HexString,
    //     initialTokensInVoucher: number,
    //     initialExpiredTimeInBlocks: number,
    //     callbacks?: SailsCallbacks
    // ): Promise<HexString> => {
    createVoucher = (options: ICreateVoucher): Promise<HexString> => {
        const {
            contractToSetVoucher,
            userAddress,
            initialTokensInVoucher,
            initialExpiredTimeInBlocks,
            enableLogs = false,
            callbacks
        } = options;

        return new Promise(async (resolve, reject) => {
            const contractsId: HexString[] = [];

            if (contractToSetVoucher) {
                if (typeof contractToSetVoucher !== 'object') {
                    if (contractToSetVoucher.substring(0, 2) != '0x') {
                        const temp = this.sailsInstances[contractToSetVoucher];

                        if (!temp) {
                            const error: SailsCallsError = {
                                sailsCallsError: `Contract name '${contractToSetVoucher}' does not exists`
                            };
                            reject(error);
                            return;
                        }

                        contractsId.push(temp.data.address);
                    } else {
                        contractsId.push(contractToSetVoucher as HexString);
                    }
                } else {
                    contractsId.push(...contractToSetVoucher);
                }
            } else {
                const contractNames = Object.keys(this.sailsInstances);

                if (contractNames.length < 1) {
                    const error: SailsCallsError = {
                        sailsCallsError: 'No contracts stored in SailsCalls instance'
                    };

                    reject(error);
                    return;
                }

                const contractName = contractNames[0];
                const contractAddress = this.sailsInstances[contractName].data.address;
                contractsId.push(contractAddress);
            }

            try {
                const voucherId = this.generateVoucher(
                    userAddress,
                    contractsId,
                    initialTokensInVoucher,
                    initialExpiredTimeInBlocks,
                    enableLogs,
                    callbacks
                );

                resolve(voucherId);
            } catch (e) {
                reject(e);
            }   
        });
    }

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
    // createVoucherWithContractsId = (
    //     userAddress: HexString,
    //     contractsId: HexString[],
    //     initialTokensInVoucher: number,
    //     initialExpiredTimeInBlocks: number,
    //     callbacks?: SailsCallbacks
    // ): Promise<HexString> => {
    //     return new Promise(async (resolve, reject) => {
    //         try {
    //             const voucherId = this.generateVoucher(
    //                 userAddress,
    //                 contractsId,
    //                 initialTokensInVoucher,
    //                 initialExpiredTimeInBlocks,
    //                 callbacks
    //             );

    //             resolve(voucherId);
    //         } catch (e) {
    //             reject(e);
    //         }
    //     });
    // }


    private generateVoucher = (
        userAddress: HexString,
        contractsId: HexString[],
        initialTokensInVoucher: number,
        initialExpiredTimeInBlocks: number,
        enableLogs: boolean,
        callbacks?: SailsCallbacks
    ): Promise<HexString> => {
        return new Promise(async (resolve, reject) => {
            if (!this.accountToSignVouchers) {
                const error: SailsCallsError = {
                    sailsCallsError: 'Account to sign vouchers is not set'
                }
                reject(error);  
                return;
            }

            if (initialTokensInVoucher < 1) {
                const error: SailsCallsError = {
                    sailsCallsError: 'Min limit of initial tokens is 1'
                }
                reject(error);
                return;
            }

            if (initialExpiredTimeInBlocks < 20) {
                const error: SailsCallsError = {
                    sailsCallsError: `Min limit of blocks is 20, given: ${initialExpiredTimeInBlocks}`
                }
                reject(error);
                return;
            }

            const voucherIssued = await this.gearApi
                .voucher
                .issue(
                    userAddress,
                    1e12 * initialTokensInVoucher,
                    initialExpiredTimeInBlocks,
                    contractsId
                );

            try {
                await this.signVoucherAction(
                    voucherIssued.extrinsic,
                    enableLogs,
                    callbacks
                );

                resolve(voucherIssued.voucherId);
            } catch (e) {
                reject(e);
            }
        });
    }


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
    // renewVoucherAmountOfBlocks = (
    //     userAddress: HexString,
    //     voucherId: HexString,
    //     numOfBlocks: number,
    //     callbacks?: SailsCallbacks
    // ): Promise<void> => {
    renewVoucherAmountOfBlocks = (options: IRenewVoucherAmountOfBlocks): Promise<void> => {
        const {
            userAddress,
            voucherId,
            numOfBlocks,
            enableLogs = false,
            callbacks
        } = options;
        return new Promise(async (resolve, reject) => {
            if (numOfBlocks < 20) {
                const error: SailsCallsError = {
                    sailsCallsError: `Minimum block quantity is 20, ${numOfBlocks} were given`
                };

                reject(error);
                return;
            }

            const newVoucherData = { //: IUpdateVoucherParams = {
                prolongDuration: numOfBlocks,
            };

            const voucherUpdate = this.gearApi.voucher.update(userAddress, voucherId, newVoucherData);

            try {
                await this.signVoucherAction(
                    voucherUpdate,
                    enableLogs,
                    callbacks
                );

                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }


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
    // addTokensToVoucher = (
    //     userAddress: HexString,
    //     voucherId: string, 
    //     numOfTokens: number,
    //     callbacks?: SailsCallbacks
    // ): Promise<void> => {
    addTokensToVoucher = (options: ITokensToAddToVoucher): Promise<void> => {
        const {
            userAddress,
            voucherId,
            numOfTokens,
            enableLogs = false,
            callbacks
        } = options;
        return new Promise(async (resolve, reject) => {
            if (numOfTokens <= 0) {
                const error: SailsCallsError = {
                    sailsCallsError: `Cant add less than one token: ${numOfTokens} were given`
                };

                reject(error);
                return;
            }

            const newVoucherData = {
                balanceTopUp: 1e12 * numOfTokens
            };

            const voucherUpdate = this.gearApi.voucher.update(userAddress, voucherId, newVoucherData);

            try {
                await this.signVoucherAction(
                    voucherUpdate,
                    enableLogs,
                    callbacks
                );

                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }    


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
    vouchersInContract = (
        userAddress: HexString, 
        contractId?: string | HexString
    ): Promise<HexString[]> => {
        return new Promise(async (resolve, reject) => {
            let contractAddress: HexString;

            if (contractId) {
                if (contractId.substring(0, 2) != '0x') {
                    const temp = this.sailsInstances[contractId];

                    if (!temp) {
                        const error: SailsCallsError = {
                            sailsCallsError: 'Contract name does not exists'
                        };
                        reject(error);
                        return;
                    }

                    contractAddress = temp.data.address;
                } else {
                    contractAddress = contractId as HexString;
                }
            } else {
                const contractNames = Object.keys(this.sailsInstances)

                if (contractNames.length < 1) {
                    const error: SailsCallsError = {
                        sailsCallsError: 'No contracts stored in SailsCalls instance'
                    };

                    reject(error);
                    return;
                }

                const contractName = contractNames[0];
                const temp = this.sailsInstances[contractName].data.address;
                contractAddress = temp;
            }

            const vouchersData = await this
                .gearApi
                .voucher
                .getAllForAccount(
                    userAddress, 
                    contractAddress
                );
            const vouchersId = Object.keys(vouchersData);

            resolve(vouchersId as HexString[]);
        });
    }

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
    voucherIsExpired = (
        userAddress: HexString, 
        voucherId: HexString
    ): Promise<boolean> => {
        return new Promise(async resolve => {
            const voucherData = await this
                .gearApi
                .voucher
                .getDetails(userAddress, voucherId);
            const blockHash = await this
                .gearApi
                .blocks
                .getFinalizedHead();
            const blocks = await this
                .gearApi
                .blocks
                .getBlockNumber(blockHash as Uint8Array);

            resolve(blocks.toNumber() > voucherData.expiry);
        });
    }

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
    voucherBalance = (voucherId: HexString): Promise<number> => {
        return new Promise(async resolve => {
            const voucherBalance = await this.gearApi.balance.findOut(voucherId);
            const voucherBalanceFormated = Number(
                BigInt(voucherBalance.toString()) / 1_000_000_000_000n
            );

            resolve(voucherBalanceFormated);
        });
    }


    private signVoucherAction = (
        extrinsic: any, 
        enableLogs: boolean,
        callbacks?: SailsCallbacks
    ): Promise<void> => {
        return new Promise(async (resolve, reject) => {
            if (!this.accountToSignVouchers) {
                reject('Account to sign vouchers is not set');
                return;
            }

            this.processCallBack('onload', callbacks);
            await this.processCallBack('asynconload', callbacks);

            try {
                await extrinsic.signAndSend(this.accountToSignVouchers, async (event: any) => {
                    const eventHuman = event.toHuman();
                    if (enableLogs) console.log(eventHuman);
                    const extrinsicJSON: any = eventHuman;
                    if (extrinsicJSON && extrinsicJSON.status !== 'Ready') {
                        const objectKey = Object.keys(extrinsicJSON.status)[0];
                        if (objectKey === 'Finalized') {
                            this.processCallBack('onsuccess', callbacks);
                            await this.processCallBack('asynconsuccess', callbacks);
                            resolve();
                        }
                    }
                });
            } catch (e) {
                this.processCallBack('onerror', callbacks);
                await this.processCallBack('asynconerror', callbacks);

                const error: SailsCallsError = {
                    gearError: (e as Error).message
                };

                reject(error);
            }
        });
    }


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
    createNewKeyringPair = (nameOfSignlessAccount?: string): Promise<KeyringPair> => {
        return new Promise(async (resolve, reject) => {
            try {
                const name = nameOfSignlessAccount
                    ? nameOfSignlessAccount
                    : 'signlessPair';
                const newPair = await GearKeyring.create(name);
                resolve(newPair.keyring);
            } catch (e) {
                console.log("Error creating new account pair!");
                reject(e);
            }
        });
    }

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
    lockkeyringPair = (pair: KeyringPair, password: string): KeyringPair$Json => {
        return pair.toJson(password);
    }

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
    unlockKeyringPair = (pair: KeyringPair$Json, password: string): KeyringPair => {
        return GearKeyring.fromJson(pair, password);
    }

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
    formatContractSignlessData = (signlessData: any, signlessName: string): KeyringPair$Json => {
        const temp = {
            encoding: {
                content: ['pkcs8','sr25519'],
                type: ['scrypt','xsalsa20-poly1305'],
                version: '3'
            },
            meta: {
                name: signlessName
            }
        };

        const formatEncryptedSignlessData = Object.assign(signlessData, temp);

        return formatEncryptedSignlessData;
    }

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
    modifyPairToContract = (pair: KeyringPair$Json): IFormatedKeyring => {
        const signlessToSend = JSON.parse(JSON.stringify(pair));
        delete signlessToSend['encoding'];
        delete signlessToSend['meta'];
        
        return signlessToSend;
    }

    disconnectGearApi = async () => {
        await this.gearApi.disconnect();
    }

    /**
     * ## Change network for SailsCalls instance
     * Set a network for a SailsCalls instance
     * @param network Network to connect 
     * @example
     * const sails = await SailsCalls.new();
     * sails.withNetwork('wss://testnet.vara.network');s
     */
    // withNetwork = async (network: string) => {
    //     const api = await GearApi.create({ 
    //         providerAddress: network 
    //     });

    //     this.gearApi = api;
    //     this.network = network;
    // }

    // sailsInstanceWithObjectData = (contractId: HexString, idl: string): Sails => {
    //     const sailsInstance = new Sails(this.sailsParser);
    //     sailsInstance.
    // }

    servicesFromSailsInstance = (sailsInstance: Sails): string[] => {
        return Object.keys(sailsInstance.services);
    }

    serviceFunctionNamesFromSailsInstance = (
        sailsInstance: Sails,
        serviceName: string,
        functionsFrom: "queries" | "functions", 
    ): string[] => {
        return Object.keys(sailsInstance.services[serviceName][functionsFrom]);
    }

    private processCallBack = async (toCall: CallbackType, callbacks?: SailsCallbacks, block?: HexString) => {
        if (!callbacks) return;
        let callback: (() => void) | undefined;
        switch (toCall) {
            case 'onsuccess': 
                callback = callbacks.onSuccess;
                if (callback) callback();
                break;
            case 'onerror':
                callback = callbacks.onError;
                if (callback) callback();
                break;
            case 'onload':
                callback = callbacks.onLoad;
                if (callback) callback();
                break;
            case 'onblock':
                callback = callbacks.onBlock;
                if (callback) {
                    const func = callback as (blockHash?: HexString) => void;
                    func(block);
                }
                break;
            case 'asynconsuccess':
                callback = callbacks.onSuccessAsync;
                if (callback) await callback();
                break;
            case 'asynconerror':
                callback = callbacks.onErrorAsync;
                if (callback) await callback();
                return;
            case 'asynconload':
                callback = callbacks.onLoadAsync;
                if (callback) await callback();
                return;
            case 'asynconblock':
                callback = callbacks.onBlockAsync;
                if (callback) {
                    const func = callback as (blockHash?: HexString) => Promise<void>;
                    await func(block);
                }
                return;
        }
    }
    
}
