import { GearKeyring, HexString } from '@gear-js/api';
import { SailsCalls } from '../../src';
import { KeyringPair } from "@polkadot/keyring/types";
import { sailsCallsData } from '../utils';

jest.setTimeout(40000);

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
        await sailsCalls.unsubscribeAllEvents();
        await sailsCalls.disconnectGearApi();
        console.log('Api disconnected');
    }
});

test('Error set event 1 - no contracts stored', async () => {
    const sailsCallsInstance = await SailsCalls.new({
        network: sailsCallsData.network
    });

    const result = sailsCallsInstance.subscribeTo({
        serviceName: "TrafficLight",
        eventName: "ChangedToGreen",
        onEventEmit: (data) => {}
    });

    expect(result).not.toBe((() => Promise<void>));
    expect(result).toMatchObject({
        sailsCallsError: 'No contracts stored in SailsCalls instance'
    });

    await sailsCallsInstance.disconnectGearApi();
});

test('Error set event 2 - bad contract name', () => {
    expect(sailsCalls).toBeInstanceOf(SailsCalls);

    const result = sailsCalls.subscribeTo({
        contractToCall: "Testing",
        serviceName: "TestService",
        eventName: "ChangedToGreen",
        onEventEmit: (data) => {}
    });
    expect(result).not.toBe((() => Promise<void>));
    expect(result).toMatchObject({
        sailsCallsError: `Contract name 'Testing' is not set in SailsCalls instance`
    });
});

test('Error set event 3 - bad service name', () => {
    expect(sailsCalls).toBeInstanceOf(SailsCalls);

    const result = sailsCalls.subscribeTo({
        serviceName: "TestService",
        eventName: "ChangedToGreen",
        onEventEmit: (data) => {}
    });
    expect(result).not.toBe((() => Promise<void>));
    expect(result).toMatchObject({
        sailsCallsError: `Service name 'TestService' does not exists in contract.\nServices: [TrafficLight]`
    });
});

test('Error set event 4 - bad event name', () => {
    expect(sailsCalls).toBeInstanceOf(SailsCalls);

    const result = sailsCalls.subscribeTo({
        serviceName: "TrafficLight",
        eventName: "TestEvent",
        onEventEmit: (data) => {}
    });
    expect(result).not.toBe((() => Promise<void>));
    expect(result).toMatchObject({
        sailsCallsError: `Event name 'TestEvent' does not exists in service 'TrafficLight'.\nEvents: [ChangedToGreen,ChangedToYellow,ChangedToRed]`
    });
});

test("HandleEvent 1 - unsubscribe all events", async () => {
    expect(sponsorKeyring).not.toBeNull();

    const sailsCallsInstance = await SailsCalls.new({
        network: sailsCallsData.network,
        newContractsData: [
            {
                contractName: 'traffic_light',
                address: sailsCallsData.contractId as HexString,
                idl: sailsCallsData.idl
            }
        ]
    });

    sailsCallsInstance.subscribeTo({
        serviceName: "TrafficLight",
        eventName: "ChangedToGreen",
        onEventEmit: () => {}
    });

    sailsCallsInstance.subscribeTo({
        serviceName: "TrafficLight",
        eventName: "ChangedToYellow",
        onEventEmit: () => {}
    });

    sailsCallsInstance.subscribeTo({
        serviceName: "TrafficLight",
        eventName: "ChangedToRed",
        onEventEmit: () => {}
    });

    const openListeners = sailsCallsInstance.numberOfEventListeners();

    expect(openListeners).toBe(3);

    await sailsCallsInstance.unsubscribeAllEvents();

    const currentOpentListeners = sailsCallsInstance.numberOfEventListeners();

    expect(currentOpentListeners).toBe(0);

    await sailsCallsInstance.disconnectGearApi();
});

test("HandleEvent 2 - catch green event", async () => {
    expect(sailsCalls).toBeInstanceOf(SailsCalls);
    expect(sponsorKeyring).not.toBeNull();

    const unsubCall = sailsCalls.subscribeTo({
        serviceName: "TrafficLight",
        eventName: "ChangedToGreen",
        onEventEmit: (data) => {
            expect(data).toBeNull();
        }
    });

    expect(unsubCall).not.toBe(Object);

    const response = await sailsCalls.command({
        signerData: sponsorKeyring,
        serviceName: 'TrafficLight',
        methodName: 'Green',
    }); 

    await (unsubCall as (() => Promise<void>))();
});