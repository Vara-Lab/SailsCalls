import { decodeAddress } from "@gear-js/api";
import type { HexString } from "@gear-js/api";
import { SailsCalls } from "../src";
import { sailsCallsData } from "./utils";
import { GearKeyring } from "@gear-js/api";

const tokensForVoucher = 1;
const initialExpirationTime = 1200;

let sailsCalls: SailsCalls | null = null;

const lockedAccount = {
    encoded: 's3u8RskRLztyH7VYLDWP1wnJFRbYd6hWcV3sF/muhj0AgAAAAQAAAAgAAADH63HmP0EYAsSHOV1yP3eUuLfkROIR21KL7iapxB+n2fEU5nl4MNYJVY2CfSfqWx7/9N0ZJcjRHZ0snF61x+XwKbwA4Vj7Ko91ZdPhK9jeFRTcZQWUQq+Egfv4dvLYQ4oSP1EIDXd6l5XbFaufGPudK3Wn4lN5XnTHjlqYUmcuuCDEbVXSUG4MFynV+bkhqvBtCRazZ4YSt6l3yStU',
    address: '5GEnkDema6jug4J8FqyrwM1FKi1uFUrhwMCNsueUDE7nFqit',
    password: 'password',
    voucherId: '0x7234cd25f741e92d5ada4db2531474fb84d5a1a918abeb5001a66ef4e6c3f1e7'
};

beforeAll(async () => {
    sailsCalls = await SailsCalls.new({
            network: sailsCallsData.network,
            voucherSignerData: sailsCallsData.voucherSignerData,
            newContractsData: [
                {
                    contractName: 'traffic_light',
                    address: sailsCallsData.contractId as HexString,
                    idl: sailsCallsData.idl
                }
            ]
        })
});

afterAll(async () => {
    if (sailsCalls) {
        await sailsCalls.disconnectGearApi();
        console.info('Api disconnected');
    }
});

test('Hello world', () => {
    console.log("Hello world!");
});

// test('Adding tokens if necessary', async () => {
    // if (!sailsCalls) {
    //     throw new Error("SailsCalls is not initialized");
    // }

//     const decodeddAddress = decodeAddress(lockedAccount.address);

    // await sailsCalls.addTokensToVoucher({
    //     numOfTokens: 1,
    //     voucherId: lockedAccount.voucherId,
    //     userAddress: decodeddAddress
    // });
// });


test('renew voucher if necessary', async () => {
    if (!sailsCalls) {
        throw new Error("SailsCalls is not initialized");
    }

    const decodeddAddress = decodeAddress(lockedAccount.address);

    await sailsCalls.renewVoucherAmountOfBlocks({
        numOfBlocks: 1_200, // one hour
        voucherId: lockedAccount.voucherId,
        userAddress: decodeddAddress
    });
});



// test('Send message', async () => {
//     expect(sailsCalls).toBeInstanceOf(SailsCalls);

//     if (!sailsCalls) return;

//     const voucherId = lockedAccount.voucherId as HexString;
//     const decodedAdress = decodeAddress(lockedAccount.address);
//     const formatedKeyring = sailsCalls.formatContractSignlessData({
//         encoded: lockedAccount.encoded,
//         address: lockedAccount.address
//     }, 'test');
//     const keyringPair = sailsCalls.unlockKeyringPair(formatedKeyring, lockedAccount.password);

//     const response = await sailsCalls.command({
//         contractToCall: 'traffic_light',
//         signerData: keyringPair,
//         voucherId: lockedAccount.voucherId as HexString,
//         serviceName: 'TrafficLight',
//         methodName: 'Yellow',
//     }); 

//     expect(response).toBeDefined();
//     expect(response.response).toBe('Yellow');
// }, 20000);


test('Voucher balance', async () => {
    expect(sailsCalls).toBeInstanceOf(SailsCalls);

    if (!sailsCalls) {
        throw new Error("sailsCalls is not set");
    }

    const voucherId = lockedAccount.voucherId as HexString;
    const decodedAdress = decodeAddress(lockedAccount.address);
    const formatedKeyring = sailsCalls.changeModifiedLockedKeyringPairToOriginalState({
        encoded: lockedAccount.encoded,
        address: lockedAccount.address
    }, 'test');
    const keyringPair = sailsCalls.unlockKeyringPair(formatedKeyring, lockedAccount.password);

    // const voucherIsExpired = await sailsCalls.voucherIsExpired(decodedAdress, voucherId);

    // if (voucherIsExpired) {
    //     await sailsCalls.renewVoucherAmountOfBlocks({
    //         numOfBlocks: 1200,
    //         userAddress: decodedAdress,
    //         voucherId
    //     });
    // }

    // const response = await sailsCalls.command({
    //     contractToCall: 'traffic_light',
    //     signerData: keyringPair,
    //     voucherId: lockedAccount.voucherId as HexString,
    //     serviceName: 'TrafficLight',
    //     methodName: 'Yellow',
    // }); 

    // expect(response).toBeDefined();
    // expect(response.response).toBe('Yellow');

    const voucherBalance = await sailsCalls.voucherBalance(voucherId);

    console.log("VoucherBalance");
    console.log(voucherBalance);
    console.log(typeof voucherBalance);
});