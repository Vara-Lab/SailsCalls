import { SailsIdlParser } from 'sails-js-parser';
import { SailsCalls } from '../../src';
import { Sails } from 'sails-js';

let sailsCalls: SailsCalls | null = null;

beforeAll(async () => {
    const x = await SailsIdlParser.new();
    new  Sails(x);
    sailsCalls = await SailsCalls.new({
        network: 'wss://testnet.vara.network',
    });
    // sailsCalls = await SailsCalls.new();
    // await waitReady();
    // sailsCalls = await SailsCalls.new({
    //     network: 'wss://testnet.vara.network',
    //     voucherSignerData: {
    //         sponsorName: '',
    //         sponsorMnemonic: ''
    //     },
    //     newContractsData: [
    //         {
    //             contractName: 'PingContract',
    //             address: '0x...',
    //             idl: `...`
    //         },
    //         {
    //             contractName: 'TrafficContract',
    //             address: '0x...',
    //             idl: `...`
    //         }
    //     ]
    // });
}, 40000);

afterAll(async () => {
    if (sailsCalls) {
        await sailsCalls.disconnectGearApi();
        console.debug('Api disconnected');
    }
}, 40000);

describe('queries', () => {
    test('hello world', () => {
        const x = 'hello';

        expect(sailsCalls).toBeInstanceOf(SailsCalls);

        expect(x).toBe('hello');
    });
});