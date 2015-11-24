var config = {};

config.thinkingThings = {
    logLevel: 'FATAL',
    port: 8000,
    root: '/thinkingthings',
    sleepTime: 300
};

config.ngsi = {
    logLevel: 'FATAL',
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
    types: {},
    service: 'smartGondor',
    subservice: '/gardens',
    providerUrl: 'http://127.0.0.1:4041',
    deviceRegistrationDuration: 'P1M'
};

module.exports = config;
