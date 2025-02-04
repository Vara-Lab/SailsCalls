import type { HexString } from '@gear-js/api';
import { SailsCalls } from '../src';
import { sailsCallsData } from './utils';

describe('SailsCalls init test', () => {
    test('basic init - network', async () => {
        const sailsCallsInstance = await SailsCalls.new({
            network: sailsCallsData.network
        });

        expect(sailsCallsInstance).toBeInstanceOf(SailsCalls);

        await sailsCallsInstance.disconnectGearApi();
    });
    test('basic init - network, vouchers', async () => {
        const sailsCallsInstance = await SailsCalls.new({
            network: sailsCallsData.network,
            voucherSignerData: sailsCallsData.voucherSignerData
        });

        expect(sailsCallsInstance).toBeInstanceOf(SailsCalls);

        await sailsCallsInstance.disconnectGearApi();
    });
    test('basic init - network, contracts data', async () => {
        const sailsCallsInstance = await SailsCalls.new({
            network: sailsCallsData.network,
            newContractsData: [
                {
                    contractName: 'traffic-light',
                    address: sailsCallsData.contractId as HexString,
                    idl: sailsCallsData.idl
                }
            ]
        });

        expect(sailsCallsInstance).toBeInstanceOf(SailsCalls);

        await sailsCallsInstance.disconnectGearApi();
    });
    test('complete SailsCalls init', async () => {
        const sailsCallsInstance = await SailsCalls.new({
            network: sailsCallsData.network,
            voucherSignerData: sailsCallsData.voucherSignerData,
            newContractsData: [
                {
                    contractName: 'traffic-light',
                    address: sailsCallsData.contractId as HexString,
                    idl: sailsCallsData.idl
                }
            ]
        });

        expect(sailsCallsInstance).toBeInstanceOf(SailsCalls);

        await sailsCallsInstance.disconnectGearApi();
    });
});

describe('SailsCalls init test - Errors', () => {
    test('Error: set sponsor', async () => {
        try {
            const temp = await SailsCalls.new({
                voucherSignerData: {
                    sponsorMnemonic: '',
                    sponsorName: ''
                }
            });

            if (temp) {
                temp.disconnectGearApi();
            }
            expect(temp).toBeUndefined();
        } catch (e) {
            expect(e).toBeInstanceOf(Object);
            expect(e).toHaveProperty('sailsCallsError', 'Error while set signer account, voucher signer not set');
            expect(e).toHaveProperty('gearError');
        }
    });
    test('Error: bad contract name', async () => {
        const sailsInstance = SailsCalls.new({
            network: sailsCallsData.network,
            newContractsData: [
                {
                    contractName: '0x123',
                    address: '0x',
                    idl: ''
                }
            ]
        });

        await expect(sailsInstance).rejects.toBe('Cant set contract name: invalid name 0x123');
    });
    test('Error: bad contract idl', async () => {
        const sailsInstance = SailsCalls.new({
            network: sailsCallsData.network,
            newContractsData: [
                {
                    contractName: 'test',
                    address: '0x',
                    idl: ''
                }
            ]
        });

        await expect(sailsInstance).rejects.toBe('IDL cant be empty');
    });
});