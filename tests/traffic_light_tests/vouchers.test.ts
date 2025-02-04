import { decodeAddress } from "@gear-js/api";
import type { HexString } from "@gear-js/api";
import { SailsCalls } from "../../src";
import { sailsCallsData } from "../utils";
import { GearKeyring } from "@gear-js/api";

const tokensForVoucher = 1;
const initialExpirationTime = 1200;

let sailsCalls: SailsCalls | null = null;
const vouchersId: HexString[] = [];
const usersId: HexString[] = [];

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

test('Voucher creation 1 - no contract set', async () => {
    const newKeyringPair = (await GearKeyring.create('test')).keyring;
    const keyringAddress = decodeAddress(newKeyringPair.address);
    usersId.push(keyringAddress);

    expect(sailsCalls).toBeInstanceOf(SailsCalls);

    if (!sailsCalls) return;

    const voucherId = await sailsCalls.createVoucher({
        userAddress: keyringAddress,
        initialExpiredTimeInBlocks: initialExpirationTime,
        initialTokensInVoucher: tokensForVoucher,
    });

    vouchersId.push(voucherId);
});

test('Voucher creation 2 - with contract name', async () => {
    const newKeyringPair = (await GearKeyring.create('test')).keyring;
    const keyringAddress = decodeAddress(newKeyringPair.address);
    usersId.push(keyringAddress);

    expect(sailsCalls).toBeInstanceOf(SailsCalls);

    if (!sailsCalls) return;

    const voucherId = await sailsCalls.createVoucher({
        contractToSetVoucher: 'traffic_light',
        userAddress: keyringAddress,
        initialExpiredTimeInBlocks: initialExpirationTime,
        initialTokensInVoucher: tokensForVoucher
    });

    vouchersId.push(voucherId);
});

test('Voucher creation 3 - with contract address', async () => {
    const newKeyringPair = (await GearKeyring.create('test')).keyring;
    const keyringAddress = decodeAddress(newKeyringPair.address);
    usersId.push(keyringAddress);

    expect(sailsCalls).toBeInstanceOf(SailsCalls);

    if (!sailsCalls) return;

    const voucherId = await sailsCalls.createVoucher({
        contractToSetVoucher: sailsCallsData.contractId,
        userAddress: keyringAddress,
        initialExpiredTimeInBlocks: initialExpirationTime,
        initialTokensInVoucher: tokensForVoucher
    });

    vouchersId.push(voucherId);
});

test('Voucher creation 4 - with array of contract address', async () => {
    const newKeyringPair = (await GearKeyring.create('test')).keyring;
    const keyringAddress = decodeAddress(newKeyringPair.address);
    usersId.push(keyringAddress);

    expect(sailsCalls).toBeInstanceOf(SailsCalls);

    if (!sailsCalls) return;

    const voucherId = await sailsCalls.createVoucher({
        contractToSetVoucher: [ sailsCallsData.contractId as HexString ],
        userAddress: keyringAddress,
        initialExpiredTimeInBlocks: initialExpirationTime,
        initialTokensInVoucher: tokensForVoucher
    });

    vouchersId.push(voucherId);
});

test('Correct vouchers creation 1 - without data', async () => {
    expect(sailsCalls).toBeInstanceOf(SailsCalls);
    expect(vouchersId.length).toBe(4);

    if (!sailsCalls) return;
    
    let contractVouchersId = await sailsCalls.vouchersInContract(
        usersId[0]
    );

    expect(vouchersId[0]).toBe(contractVouchersId[0]);
});

test('Correct vouchers creation 2 - with contract name', async () => {
    expect(sailsCalls).toBeInstanceOf(SailsCalls);
    expect(vouchersId.length).toBe(4);

    if (!sailsCalls) return;
    
    let contractVouchersId = await sailsCalls.vouchersInContract(
        usersId[1],
        'traffic_light'
    );

    expect(vouchersId[1]).toBe(contractVouchersId[0]);
});

test('Correct vouchers creation 2 - with contract name', async () => {
    expect(sailsCalls).toBeInstanceOf(SailsCalls);
    expect(vouchersId.length).toBe(4);

    if (!sailsCalls) return;
    
    let contractVouchersId = await sailsCalls.vouchersInContract(
        usersId[1],
        'traffic_light'
    );

    expect(vouchersId[1]).toBe(contractVouchersId[0]);
});

test('Correct vouchers creation 3 - with contract address', async () => {
    expect(sailsCalls).toBeInstanceOf(SailsCalls);
    expect(vouchersId.length).toBe(4);

    if (!sailsCalls) return;
    
    let contractVouchersId = await sailsCalls.vouchersInContract(
        usersId[2],
        sailsCallsData.contractId
    );

    expect(vouchersId[2]).toBe(contractVouchersId[0]);
});

test('Correct vouchers creation 4 - free last voucherId', async () => {
    expect(sailsCalls).toBeInstanceOf(SailsCalls);
    expect(vouchersId.length).toBe(4);

    if (!sailsCalls) return;
    
    let contractVouchersId = await sailsCalls.vouchersInContract(
        usersId[3],
    );

    expect(vouchersId[3]).toBe(contractVouchersId[0]);
});

test('Check all vouchers id balance', async () => {
    expect(sailsCalls).toBeInstanceOf(SailsCalls);
    expect(vouchersId.length).toBe(4);

    for (let i = 0; i < 4; i++) {
        const voucherBalance = await sailsCalls?.voucherBalance(
            vouchersId[i]
        );

        expect(voucherBalance).toBeDefined();
        expect(voucherBalance).toBe(tokensForVoucher);
    }
});

test('Add one token to voucher', async () => {
    expect(sailsCalls).toBeInstanceOf(SailsCalls);

    if (!sailsCalls) return;

    await sailsCalls.addTokensToVoucher({
        userAddress: usersId[0],
        voucherId: vouchersId[0],
        numOfTokens: 1
    });

    const voucherBalance = await sailsCalls.voucherBalance(
        vouchersId[0]
    );

    expect(voucherBalance).toBeDefined();
    expect(voucherBalance).toBe(2);
});

test('Error voucher creation 1 - sponsor not set', async () => {
    const sailsCallsInstance = await SailsCalls.new({
        network: sailsCallsData.network,
        newContractsData: [
            {
                contractName: 'test',
                address: sailsCallsData.contractId as HexString,
                idl: sailsCallsData.idl
            }
        ]
    });

    expect(sailsCallsInstance).toBeInstanceOf(SailsCalls);

    const temp = sailsCallsInstance.createVoucher({
        userAddress: '0x',
        initialExpiredTimeInBlocks: 1,
        initialTokensInVoucher: 1200
    });

    await expect(temp).rejects.toMatchObject({
        sailsCallsError: 'Account to sign vouchers is not set'
    });

    await sailsCallsInstance.disconnectGearApi();
});

test('Error voucher creation 2 - incorrect voucher initial tokens', async () => {
    expect(sailsCalls).toBeInstanceOf(SailsCalls);

    if (!sailsCalls) return;

    const temp = sailsCalls.createVoucher({
        userAddress: '0x',
        initialExpiredTimeInBlocks: 0,
        initialTokensInVoucher: 1200
    });

    await expect(temp).rejects.toMatchObject({
        sailsCallsError: 'Min limit of blocks is 20, given: 0'
    });
});

test('Error voucher creation 3 - incorrect voucher initial expiration blocks', async () => {
    expect(sailsCalls).toBeInstanceOf(SailsCalls);

    if (!sailsCalls) return;

    const temp = sailsCalls.createVoucher({
        userAddress: '0x',
        initialExpiredTimeInBlocks: 2,
        initialTokensInVoucher: 10
    });

    await expect(temp).rejects.toMatchObject({
        sailsCallsError: 'Min limit of blocks is 20, given: 2'
    });
});

test('Error voucher creation 4 - bad contract name', async () => {
    expect(sailsCalls).toBeInstanceOf(SailsCalls);

    if (!sailsCalls) return;

    await expect(sailsCalls.createVoucher(
        {
            contractToSetVoucher: 'Not_exists',
            userAddress: '0x',
            initialExpiredTimeInBlocks: 0,
            initialTokensInVoucher: 0
        }
    )).rejects.toMatchObject({
        sailsCallsError: `Contract name 'Not_exists' does not exists`
    });
});

test('Error voucher creation 5 - no contracts stored', async () => {
    const sailsCallsInstance = await SailsCalls.new({
        network: sailsCallsData.network
    });

    expect(sailsCallsInstance).toBeInstanceOf(SailsCalls);

    if (!sailsCallsInstance) return;

    await expect(sailsCallsInstance.createVoucher({
        userAddress: '0x',
        initialExpiredTimeInBlocks: 0,
        initialTokensInVoucher: 0
    })).rejects.toMatchObject({
        sailsCallsError: 'No contracts stored in SailsCalls instance'
    });

    await sailsCallsInstance.disconnectGearApi();
});

test('Error update voucher 1 - bad amout of blocks to renew', async () => {
    expect(sailsCalls).toBeInstanceOf(SailsCalls);

    if (!sailsCalls) return;

    const temp = sailsCalls.renewVoucherAmountOfBlocks({
        userAddress: '0x',
        voucherId: '0x',
        numOfBlocks: 10
    });

    await expect(temp).rejects.toMatchObject({
        sailsCallsError: 'Minimum block quantity is 20, 10 were given'
    })
});

test('Error update voucher 2 - bad amout of tokens to add', async () => {
    expect(sailsCalls).toBeInstanceOf(SailsCalls);

    if (!sailsCalls) return;

    const temp = sailsCalls.addTokensToVoucher({
        userAddress: '0x',
        voucherId: '0x',
        numOfTokens: 0
    });

    await expect(temp).rejects.toMatchObject({
        sailsCallsError: `Cant add less than one token: 0 were given`
    })
});