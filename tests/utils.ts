export const sailsCallsData = {
    network: 'wss://testnet.vara.network',
    contractId: '0xdea744c50dcba36996f6eb450c0dea4df4fb746267d98d44699a602884ea1ec4',
    idl: `
        type TrafficLightResponse = enum {
            Green,
            Yellow,
            Red,
        };

        type IoTrafficLightState = struct {
            current_light: str,
            all_users: vec struct { actor_id, str },
        };

        constructor {
            New : ();
        };

        service TrafficLight {
            Green : () -> TrafficLightResponse;
            Red : () -> TrafficLightResponse;
            Yellow : () -> TrafficLightResponse;
            query TrafficLight : () -> IoTrafficLightState;

            events {
                ChangedToGreen;
                ChangedToYellow;
                ChangedToRed;
            }
        };
    `,
    voucherSignerData: {
        sponsorName: 'davidadmin',
        sponsorMnemonic: 'strong orchard plastic arena pyramid lobster lonely rich stomach label clog rubber'
    }
};

