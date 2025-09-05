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

jest.setTimeout(40000);

beforeAll(async () => {
    sailsCalls = await SailsCalls.new({
        network: sailsCallsData.network,
    });
});

afterAll(async () => {
    if (sailsCalls) {
        await sailsCalls.disconnectGearApi();
        console.info('Api disconnected');
    }
});

test('Error voucher', async () => {
    try {
        await sailsCalls.voucherIsExpired(
            '0xb81fcd0615471a149917f9e0d2414aa40e280ef807e4b7733f853d50dcdf26eb',
            '0x53a13000394e338e98ea6b5cb4aad1c47cb5a96ca633f5d43380bce7e0cb7696'
        );
    } catch(e) {
        expect(e).toMatchObject({
            sailsCallsError: 'User is not the owner of the voucher' 
        });
    }
});