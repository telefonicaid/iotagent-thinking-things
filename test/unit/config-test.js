var config = {};

config.thinkingThings = {
    logLevel: 'FATAL',
    port: 8000,
    root: '/thinkingthings',
    sleepTime: 300
};

config.ngsi = {
    logLevel: 'FATAL',
    defaultType: 'ThinkingThing',
    contextBroker: {
        host: '127.0.0.1',
        port: '1026'
    },
    server: {
        port: 4041
    },
    deviceRegistry: {
        type: 'memory'
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
    providerUrl: 'http://127.0.0.1:4041',
    deviceRegistrationDuration: 'P1M'
};

module.exports = config;
