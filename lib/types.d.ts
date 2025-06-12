import type { GearApi, HexString } from "@gear-js/api";
import type { Signer } from "@polkadot/api/types";
import type { KeyringPair } from "@polkadot/keyring/types";
import type { Sails } from "sails-js";
export { SailsCalls } from "./SailsCalls";
export type GasLimitType = bigint | {
    extraGasInCalculatedGasFees: number;
};
export type ContractAddress = string | HexString | HexString[];
export interface ModifiedLockedKeyringPair {
    address: string;
    encoded: string;
}
/**
 * ## Formated keyring account for contract
 */
export interface IFormatedKeyring {
    address: string;
    encoded: string;
}
/**
 * ## Interface to store data of SailsIntances
 */
export interface SailsInstance {
    sailsInstance: Sails;
    data: ContractData;
}
/**
 * ## Interface to store contracts data in SailsCalls
 * This interface is used only for SailsCalls
 */
export interface SailsCallsContractsData {
    [key: string]: SailsInstance;
}
/**
 * ## Basic contract data
 * The interface store the address and the idl from a contract
 */
export interface ContractData {
    address: HexString;
    idl: string;
}
/**
 * ## Contract data to be stored
 * It extends the contract data and adds the name of the contract
 */
export interface NewContractData extends ContractData {
    contractName: string;
}
/**
 * ## Interface to create a new voucher
 */
export interface ICreateVoucher {
    /**
     * Contract or contracts to bind the voucher - OPTIONAL
     * You can set the contract or contracts to bind the voucher that you wil create, yo can do
     * this in four different ways:
     * - You can not set the contract to bind the voucher, SailsCalls will set the voucher to the first contract stored in the SailsCalls instance
     * (the saiuls instances are stored in an literal object)
     * - With contract name (string): SailsCalls will search the contract name in all the sails instances and create the voucher to it.
     * - Contract address: you can bind the voucher to an specified contract address
     * - Contract addresses: you can pass to the method an array of contracts id to bind the voucher that will be created.
     *
     * @example
     * // Set the voucher to a contract stored in SailsCalls instances by contract name
     * const voucherId: ICreateVoucher = {
     *     contractToSetVoucher: 'ContractName', // Contract name in SailsCalls instance
     *     // more options ...
     * };
     *
     * @example
     * // Set the voucher to a contract address
     * const voucherId: ICreateVoucher = {
     *     contractToSetVoucher: '0x...', // Contract address
     *     // more options ...
     * };
     *
     * @example
     * // Set the voucher to n contract address (more than one)
     * const voucherId: ICreateVoucher = {
     *     contractToSetVoucher: [
     *         '0x...', // first contract address to bind the voucher
     *         '0x...', // second contract address to bind the voucher
     *         // more contracts address
     *     ]
     * };
     *
     * @property {ContractAddress | string | string[]} [contractToSetVoucher] - The contract(s) to bind the voucher.
     */
    contractToSetVoucher?: ContractAddress;
    /**
     * ## User address to bind the voucher
     */
    userAddress: HexString;
    /**
     * ## Initial amount of tokens for voucher
     */
    initialTokensInVoucher: number;
    /**
     * ## Initial time expiration for voucher (in blocks)
     * Set the initial voucher expiration in blocks, one hour = 1200 blocks
     */
    initialExpiredTimeInBlocks: number;
    /**
     * ## Optional callbacks for voucher creation
     */
    callbacks?: SailsCallbacks;
    /**
     * ### Active some informative logs
     */
    enableLogs?: boolean;
}
/**
 * ## Basic update data for vouchers
 */
export interface IBasicUpdateVoucherData {
    /**
     * ### Useer addres that is linked to the voucher
     */
    userAddress: HexString;
    /**
     * ### Voucher id to add tokens
     */
    voucherId: string;
    /**
     * ### Enable some optional logs
     */
    enableLogs?: boolean;
    /**
     * Optional callbacks
     */
    callbacks?: SailsCallbacks;
}
/**
 * ## Interface to add tokens to a voucher
 */
export interface ITokensToAddToVoucher extends IBasicUpdateVoucherData {
    /**
     * ### Num of tokens to add to voucher
     */
    numOfTokens: number;
}
export interface IRenewVoucherAmountOfBlocks extends IBasicUpdateVoucherData {
    /**
     * ### Num of blocks to renew voucher
     */
    numOfBlocks: number;
}
/**
 * ## Inteface with optional initial values for Sails Calls
 */
export interface ISailsCalls {
    /**
     * ### Contracts data to be stored
     * Saves the contracts data in the SailsCalls instance
     */
    newContractsData?: NewContractData[];
    /**
     * ### Network that SailsCalls will use
     * if not provided, local network will be used
     */
    network?: string;
    /**
     * ### Sponsor data that will sign the voucher, voucher updates, etc
     * if not provided, vouchers feature cant be used
     */
    voucherSignerData?: SponsorData;
    /**
     * ### Gear API
     * if not provided, SailsCalls will create its own Gear API
     */
    gearApi?: GearApi;
}
/**
 * ## Sponsor data
 * name and mnemonic from sponsor that will sign the future vouchers
 */
export interface SponsorData {
    sponsorName: string;
    sponsorMnemonic: string;
}
/**
 * ## Errors from SailsCalls and sails-js
 */
export interface SailsCallsError {
    sailsCallsError?: string;
    sailsError?: string;
    gearError?: string;
}
/**
 * ## Query options
 */
export interface ISailsQueryOptions {
    /**
     * ### Contract to call - OPTIONAL
     * - If you dont pass to this attribute, SailsCalls will use the first
     *   contract data stored (SailsCalls stores contracts inside an object
     *    literal, with key being the name of the contract).
     * - If you give a string, SailsCalls will search to the stored
     *   contract to call, if not exists, it will notify to the user
     * - If you give contract data, SailsCalls will crate a temporary
     *   instance of Sails-js to send the menssage to the given contract
     * @example
     * // Example 1, give the name of the stored contract
     * const commandOptions: ISailsQueryOptions = {
     *     //attributes ...
     *     contractToCall: 'PingContract', // Set the name of the contract
     *     //attributes ...
     * }
     *
     * // Example 2, give the contract data to send the message
     * const commandOptions: ISailsQueryOptions = {
     *     //attributes ...
     *     contractToCall: { // Set the contract data to send the message
     *         address: '0x...', // Cotract id to send the message
     *         idl: `...` // Contract idl
     *     },
     *     //attributes ...
     * }
     */
    contractToCall?: ContractData | string;
    /**
     * ### Service name
     * Specify the name of the service to call
     */
    serviceName: string;
    /**
     * ### Service method name
     * Specify the name of the name from the service to call
     */
    methodName: string;
    /**
     * ## User address for the query
     * An address is required for queries, in this case,
     * the user address, if not specified, zero
     * address will be used
     */
    userAddress?: HexString;
    /**
     * ### Arguments, if any, for query method
     * Specify in the array all arguments for service method
     */
    callArguments?: any[];
    /**
     * ### Callbacks for each state of the command
     */
    callbacks?: SailsCallbacks;
}
/**
 * ## Command options
 *
 */
export interface ISailsCommandOptions {
    /**
     * ### Signer data
     * The account to sign can be obtained from the extension, by creating
     * a new keyringpair account or by obtaining it from the contract (in
     * case of storing it in it)
     */
    signerData: AccountSigner;
    /**
     * ### Contract to call - OPTIONAL
     * - If you dont pass to this attribute, SailsCalls will use the first
     *   contract data stored (SailsCalls stores contracts inside an object
     *    literal, with key being the name of the contract).
     * - If you give a string, SailsCalls will search to the stored
     *   contract to call, if not exists, it will notify to the user
     * - If you give contract data, SailsCalls will crate a temporary
     *   instance of Sails-js to send the menssage to the given contract
     * @example
     * // Example 1, give the name of the stored contract
     * const commandOptions: SailsCommandOptions = {
     *     //attributes ...
     *     contractToCall: 'PingContract', // Set the name of the contract
     *     //attributes ...
     * }
     *
     * // Example 2, give the contract data to send the message
     * const commandOptions: SailsCommandOptions = {
     *     //attributes ...
     *     contractToCall: { // Set the contract data to send the message
     *         address: '0x...', // Cotract id to send the message
     *         idl: `...` // Contract idl
     *     },
     *     //attributes ...
     * }
     */
    contractToCall?: ContractData | string;
    /**
     * ### Service name
     * Specify the name of the service to call
     */
    serviceName: string;
    /**
     * ### Service method name
     * Specify the name of the name from the service to call
     */
    methodName: string;
    /**
     * ### Arguments, if any, for command method - OPTIONAL
     * Specify in the array all arguments for service method
     *
     * The attribute is optional, can be discarded
     */
    callArguments?: any[];
    /**
     * ## Value (tokens) associated with the message - OPTIONAL
     *
     * The attribute is optional, can be discarded
     * @example
     * const options: SailsCommandOptions = {
     *     // One token
     *     tokensToSend: 1
     * };
     */
    tokensToSend?: number;
    /**
     * ### Voucher id that will be used in the current message - OPTIONAL
     * If voucher id is set, it will be used for current message (HexString).
     *
     * The attribute is optional, can be discarded
     */
    voucherId?: HexString;
    /**
     * ### Set the gas fees to spend in the message - OPTIONAL
     * If not provided, gas will be calculated automatically without extra gas fees.
     * You can set the gas limit in two ways:
     * - As a number, it will be the gas limit to spend in the message
     * - As an object, it will be the extra gas fees in porcentage to spend in the message
     *   that will be added in the calculated gas fees by SailsCalls for example, if you set 10,
     *   It will be 10% extra gas of the calculated gas plus the automatically calculated gas
     *
     * The attribute is optional, can be ommited
     *
     * @example
     * // 1- Set the gas limit to spend in the message
     * const options = SailsCommandOptions = {
     *     gasLimit: 1_000_000n // Set the gas limit to spend in the message
     * };
     *
     * // 2- Set extra gas fees in porcentage
     * const options = SailsCommandOptions = {
     *    gasLimit: {
     *        // adds 10% extra gas fees to the calculated gas fees
     *        extraGasInCalculatedGasFees: 10
     *    }
     * };
     */
    gasLimit?: GasLimitType;
    /**
     * ### Callbacks for each state of the command
     * Callback available:
     * - onSuccess
     * - onError
     * - onLoad
     * - onBlock
     * - onSuccessAsync
     * - onErrorAsync
     * - onLoadAsync
     * - onBlockAsync
     */
    callbacks?: SailsCallbacks;
    /**
     * ### Active some informative logs
     */
    enableLogs?: boolean;
}
export interface ICommandResponse {
    /**
     * ## The id of the sent message.
     */
    msgId: HexString;
    /**
     * ## The blockhash of the block that contains the transaction.
     */
    blockHash: HexString;
    /**
     * ## The transaction hash.
     */
    txHash: HexString;
    /**
     * ## Response of the contract
     *
     * This field gives you the contract response, you can see the contract IDL to check the contract response type
     */
    response: any;
}
/**
 * ## Signer from wallet extension (Web browser)
 */
export interface WalletSigner {
    userAddress: HexString;
    signer: Signer;
}
/**
 * ## Callbacks that SailsCalls calls in each state of transaction
 */
export interface SailsCallbacks {
    /**
     * ### On success callback
     * Will run this callback if the message was send successfully or
     * an action with vouchers execute successfully
     *
     * @returns void
     */
    onSuccess?: () => void;
    /**
     * ### On error callback
     * Will run this callback if something went wrong.
     *
     * @returns void
     */
    onError?: () => void;
    /**
     * ### On load callback
     * Will run this callback when the message or a voucher action
     * will be loaded.
     *
     * @returns void
     */
    onLoad?: () => void;
    /**
     * ### On block callback
     * Will run this callback when command get its blockhash.
     *
     * It does not work in queries and voucher actions
     *
     * @param blockHash Optional parameter, gives blockhash of transaction
     * @returns void
     */
    onBlock?: (blockHash?: HexString) => void;
    /**
     * ### On success async callback
     * Will run this callback when if the message was send successfully or
     * a voucher action execute successfully.
     * Will stop the execution of the command or query to execute the callback.
     *
     * @returns Promise that the command or query will execute
     */
    onSuccessAsync?: () => Promise<void>;
    /**
     * ### On error async callback
     * Will run this callback if something went wrong.
     * Will stop the execution of the command or query to execute the callback.
     *
     * @returns Promise that the command or query will execute
     */
    onErrorAsync?: () => Promise<void>;
    /**
     * ### On load async callback
     * Will run this callback when the message or a voucher action will be loaded.
     * Will stop the execution of the command or query to execute the callback.
     *
     * @returns Promise that the command or query will execute
     */
    onLoadAsync?: () => Promise<void>;
    /**
     * ### On block async callback
     * Will run this callback when command get its blockhash.
     * Will stop the execution of the command to execute the callback.
     *
     * It does not work in queries and voucher actions
     *
     * @param blockHash Optional parameter, gives blockhash of transaction
     * @returns Promise that the command will execute
     */
    onBlockAsync?: (blockHash?: HexString) => Promise<void>;
}
export type CallbackType = 'onsuccess' | 'asynconsuccess' | 'onerror' | 'asynconerror' | 'onload' | 'asynconload' | 'onblock' | 'asynconblock';
export type AccountSigner = KeyringPair | WalletSigner;
