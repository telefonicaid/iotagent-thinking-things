var config = {};

config.thinkingThings = {
    port: 8000,
    root: '/thinkingthings'
};

config.ngsi = {
    logLevel: 'DEBUG',
    defaultType: 'ThinkingThing',
    contextBroker: {
        host: '10.11.128.16',
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