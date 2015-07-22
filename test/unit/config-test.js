var config = {};

config.thinkingThings = {
    logLevel: 'ERROR',
    port: 8000,
    root: '/thinkingthings',
    sleepTime: 600
};

config.ngsi = {
    logLevel: 'ERROR',
    defaultType: 'ThinkingThing',
    contextBroker: {
        host: '192.168.56.101',
        port: '1026'
    },
    server: {
        port: 4041
    },
    deviceRegistry: {
        type: 'mongodb',
        host: 'localhost'
    },
    types: {
        'ThinkingThing': {
            service: 'smartGondor',
            subservice: '/gardens',
            type: 'ThinkingThing',
            commands: [],
            lazy: [],
            active: [
                {
                    name: 'humidity',
                    type: 'Number'
                }
            ]
        }
    },
    service: 'smartGondor',
    subservice: '/gardens',
    providerUrl: 'http://192.168.56.1:4041',
    deviceRegistrationDuration: 'P1M'
};

module.exports = config;
