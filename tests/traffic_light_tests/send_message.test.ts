import { GearKeyring, type HexString } from "@gear-js/api";
import { SailsCalls } from "../../src";
import { sailsCallsData } from "../utils";
import { KeyringPair } from "@polkadot/keyring/types";

let sailsCalls: SailsCalls | null = null;
let sponsorKeyring: KeyringPair | null = null;

beforeAll(async () => {
    const { sponsorMnemonic, sponsorName } = sailsCallsData.voucherSignerData;
    sailsCalls = await SailsCalls.new({
        network: sailsCallsData.network,
        newContractsData: [
            {
                contractName: 'traffic_light',
                address: sailsCallsData.contractId as HexString,
                idl: sailsCallsData.idl
            }
        ]
    });
    sponsorKeyring = await GearKeyring.fromMnemonic(
        sponsorMnemonic,
        sponsorName
    );
});

afterAll(async () => {
    if (sailsCalls) {
        await sailsCalls.disconnectGearApi();
        console.log('Api disconnected');
    }
});

test('Error send message 1 - no contracts stored', async () => {
    const sailsCallsInstance = await SailsCalls.new({
        network: sailsCallsData.network
    });

    expect(sailsCallsInstance).toBeInstanceOf(SailsCalls);

    if (!sailsCallsInstance || !sponsorKeyring) return;

    const temp = sailsCallsInstance.command({
        signerData: sponsorKeyring,
        serviceName: '',
        methodName: ''
    });

    await expect(temp).rejects.toMatchObject({
        sailsCallsError: 'No contracts stored in SailsCalls instance'
    });

    await sailsCallsInstance.disconnectGearApi();
});

test('Error send message 2 - bad contract data', async () => {
    expect(sailsCalls).toBeInstanceOf(SailsCalls);

    if (!sailsCalls || !sponsorKeyring) return;

    const temp = sailsCalls.command({
        contractToCall: {
            address: '0x000',
            idl: 'testing'
        },
        signerData: sponsorKeyring,
        serviceName: '',
        methodName: ''
    });

    await expect(temp).rejects.toHaveProperty('sailsError');
});

test('Error send message 3 - bad contract name', async () => {
    expect(sailsCalls).toBeInstanceOf(SailsCalls);

    if (!sailsCalls || !sponsorKeyring) return;

    const temp = sailsCalls.command({
        contractToCall: 'testing',
        signerData: sponsorKeyring,
        serviceName: '',
        methodName: ''
    });

    await expect(temp).rejects.toMatchObject({
        sailsCallsError: `Contract name 'testing' is not set in SailsCalls instance`
    });
});

test('Error send message 4 - Service does not exists', async () => {
    expect(sailsCalls).toBeInstanceOf(SailsCalls);

    if (!sailsCalls || !sponsorKeyring) return;

    const temp = sailsCalls.command({
        signerData: sponsorKeyring,
        serviceName: 'test',
        methodName: ''
    });

    await expect(temp).rejects.toHaveProperty('sailsCallsError', `Service name 'test' does not exists in contract.\nServices: [TrafficLight]`);
});

test('Error send message 5 - method does not exists', async () => { 
    expect(sailsCalls).toBeInstanceOf(SailsCalls);

    if (!sailsCalls || !sponsorKeyring) return;

    const temp = sailsCalls.command({
        signerData: sponsorKeyring,
        serviceName: 'TrafficLight',
        methodName: 'test'
    });

    await expect(temp).rejects.toHaveProperty('sailsCallsError', `Function name 'test' does not exists in service 'TrafficLight'.\nFunctions: [Green,Red,Yellow]`)
});

test('Error send message 6 - Service does not exists in contract data', async () => {
    expect(sailsCalls).toBeInstanceOf(SailsCalls);

    if (!sailsCalls || !sponsorKeyring) return;

    const temp = sailsCalls.command({
        contractToCall: {
            address: sailsCallsData.contractId as HexString,
            idl: sailsCallsData.idl
        },
        signerData: sponsorKeyring,
        serviceName: 'test',
        methodName: ''
    });

    await expect(temp).rejects.toHaveProperty('sailsCallsError', `Service name 'test' does not exists in contract.\nServices: [TrafficLight]`);
});

test('Error send message 7 - method does not exists in contract data', async () => { 
    expect(sailsCalls).toBeInstanceOf(SailsCalls);

    if (!sailsCalls || !sponsorKeyring) return;

    const temp = sailsCalls.command({
        contractToCall: {
            address: sailsCallsData.contractId as HexString,
            idl: sailsCallsData.idl
        },
        signerData: sponsorKeyring,
        serviceName: 'TrafficLight',
        methodName: 'test'
    });

    await expect(temp).rejects.toHaveProperty('sailsCallsError', `Function name 'test' does not exists in service 'TrafficLight'.\nFunctions: [Green,Red,Yellow]`)
});

test('Send message 1 - correct response without data', async () => {
    expect(sailsCalls).toBeInstanceOf(SailsCalls);

    if (!sailsCalls || !sponsorKeyring) return;

    const response = await sailsCalls.command({
        signerData: sponsorKeyring,
        serviceName: 'TrafficLight',
        methodName: 'Green',
    }); 

    expect(response).toBeDefined();
    expect(response.response).toBe('Green');
});

test('Send message 2 - correct response with contract name', async () => {
    expect(sailsCalls).toBeInstanceOf(SailsCalls);

    if (!sailsCalls || !sponsorKeyring) return;

    const response = await sailsCalls.command({
        contractToCall: 'traffic_light',
        signerData: sponsorKeyring,
        serviceName: 'TrafficLight',
        methodName: 'Yellow',
    }); 

    expect(response).toBeDefined();
    expect(response.response).toBe('Yellow');
});

test('Send message 3 - correct response with contract data', async () => {
    expect(sailsCalls).toBeInstanceOf(SailsCalls);

    if (!sailsCalls || !sponsorKeyring) return;

    const response = await sailsCalls.command({
        contractToCall: {
            address: sailsCallsData.contractId as HexString,
            idl: sailsCallsData.idl
        },
        signerData: sponsorKeyring,
        serviceName: 'TrafficLight',
        methodName: 'Red',
    }); 

    expect(response).toBeDefined();
    expect(response.response).toBe('Red');
});