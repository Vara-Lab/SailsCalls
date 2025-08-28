export const sailsCallsData = {
    network: 'wss://testnet.vara.network',
    contractId: '0xe394faef158f507f7a46bf98bc1461ab906db114063e28a4c0880ef102cd6c0e',
    idl: `
        type TrafficLightEvent = enum {
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
            Green : () -> TrafficLightEvent;
            Red : () -> TrafficLightEvent;
            Yellow : () -> TrafficLightEvent;
            query TrafficLight : () -> IoTrafficLightState;
        };
    `,
    voucherSignerData: {
        sponsorName: '',
        sponsorMnemonic: ''
    }
};

