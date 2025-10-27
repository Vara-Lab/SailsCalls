import { HexString } from '@gear-js/api';
import { SailsCalls } from '../../src';
import { sailsCallsData } from '../utils';

jest.setTimeout(40000);

let sailsCalls: SailsCalls | null = null;

beforeAll(async () => {
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
});

afterAll(async () => {
    if (sailsCalls) {
        await sailsCalls.disconnectGearApi();
        console.log('Api disconnected');
    }
});

describe('Read state tests', () => {
    // Errors
    test('Error 1 - No contracts stored', async () => {
        const sailsIntance = await SailsCalls.new({
            network: sailsCallsData.network
        });

        const temp = sailsIntance.query({
            serviceName: '',
            methodName: ''
        });

        await expect(temp).rejects.toMatchObject({
            sailsCallsError: 'No contracts stored in SailsCalls instance'
        });

        await sailsIntance.disconnectGearApi();
    });

    test('Error 2 - bad contract data', async () => {
        expect(sailsCalls).toBeInstanceOf(SailsCalls);
    
        if (!sailsCalls) return;
    
        const temp = sailsCalls.query({
            contractToCall: {
                address: '0x000',
                idl: 'testing'
            },
            serviceName: '',
            methodName: ''
        });
    
        await expect(temp).rejects.toHaveProperty('sailsError');
    });

    test('Error 3 - bad contract name', async () => {
        expect(sailsCalls).toBeInstanceOf(SailsCalls);
    
        if (!sailsCalls) return;
    
        const temp = sailsCalls.query({
            contractToCall: 'testing',
            serviceName: '',
            methodName: ''
        });
    
        await expect(temp).rejects.toMatchObject({
            sailsCallsError: `Contract name 'testing' is not set in SailsCalls instance`
        });
    });

    test('Error 4 - Service does not exists', async () => {
        expect(sailsCalls).toBeInstanceOf(SailsCalls);
    
        if (!sailsCalls) return;
    
        const temp = sailsCalls.query({
            serviceName: 'test',
            methodName: ''
        });
    
        await expect(temp).rejects.toHaveProperty('sailsCallsError', `Service name 'test' does not exists in contract.\nServices: [TrafficLight]`);
    });

    test('Error 5 - method does not exists', async () => { 
        expect(sailsCalls).toBeInstanceOf(SailsCalls);
    
        if (!sailsCalls) return;
    
        const temp = sailsCalls.query({
            serviceName: 'TrafficLight',
            methodName: 'test'
        });
    
        await expect(temp).rejects.toHaveProperty('sailsCallsError', `Query name 'test' does not exists in service 'TrafficLight'.\nQueries: [TrafficLight]`)
    });

    test('Error 6 - Service does not exists in contract data', async () => {
        expect(sailsCalls).toBeInstanceOf(SailsCalls);
    
        if (!sailsCalls) return;
    
        const temp = sailsCalls.query({
            contractToCall: {
                address: sailsCallsData.contractId as HexString,
                idl: sailsCallsData.idl
            },
            serviceName: 'test',
            methodName: ''
        });
    
        await expect(temp).rejects.toHaveProperty('sailsCallsError', `Service name 'test' does not exists in contract.\nServices: [TrafficLight]`);
    });
    
    test('Error 7 - method does not exists in contract data', async () => { 
        expect(sailsCalls).toBeInstanceOf(SailsCalls);
    
        if (!sailsCalls) return;
    
        const temp = sailsCalls.query({
            contractToCall: {
                address: sailsCallsData.contractId as HexString,
                idl: sailsCallsData.idl
            },
            serviceName: 'TrafficLight',
            methodName: 'test'
        });
    
        await expect(temp).rejects.toHaveProperty('sailsCallsError', `Query name 'test' does not exists in service 'TrafficLight'.\nQueries: [TrafficLight]`)
    });

    test('read state correct', async () => {
        expect(sailsCalls).toBeInstanceOf(SailsCalls);

        if (!sailsCalls) return;

        const response = await sailsCalls.query({
            serviceName: 'TrafficLight',
            methodName: 'TrafficLight'
        });

        expect(response).toBeInstanceOf(Object);
        expect(response).toHaveProperty('current_light');
        expect(response).toHaveProperty('all_users');
    });
});