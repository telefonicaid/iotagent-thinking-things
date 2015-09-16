/*
 * Copyright 2014 Telefonica Investigación y Desarrollo, S.A.U
 *
 * This file is part of iotagent-thinking-things
 *
 * iotagent-thinking-things is free software: you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * iotagent-thinking-things is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with iotagent-thinking-things.
 * If not, seehttp://www.gnu.org/licenses/.
 *
 * For those usages not covered by the GNU Affero General Public License
 * please contact with::[iot_support@tid.es]
 */

'use strict';

var config = require('./config-test'),
    ttAgent = require('../../lib/iotagent-thinking-things'),
    responseGenerator = require('../../lib/middlewares/responseGenerator'),
    async = require('async'),
    apply = async.apply,
    utils = require('../tools/utils'),
    timekeeper = require('timekeeper');

describe('Southbound measure reporting', function() {
    beforeEach(function(done) {
        ttAgent.start(config, done);
    });
    afterEach(function(done) {
        ttAgent.stop(done);
    });
    describe('When a humidity measure arrives to the IoT Agent: #STACK1#953E78F,H1,28,0.330,20$condition,',
        function() {
        var options = {
            url: 'http://localhost:' + config.thinkingThings.port + config.thinkingThings.root + '/Receive',
            method: 'POST',
            form: {
                cadena: '#STACK1#953E78F,H1,28,0.330,20$condition,'
            }
        };

        beforeEach(utils.prepareMocks(
            './test/unit/contextRequests/updateContextHumidity.json',
            './test/unit/contextResponses/updateContextHumiditySuccess.json'));

        it('should update the device entity in the Context Broker with the humidity attribute',
            utils.checkContextBroker(options));

        it('should return a 200OK with the appropriate response: ',
            utils.checkResponse(options, '#STACK1#953E78F,H1,-1$condition,'));
    });

    describe('When a temperature measure arrives to the IoT Agent: #STACK1#673495,T1,17,2500$theCondition,',
        function() {
            var options = {
                url: 'http://localhost:' + config.thinkingThings.port + config.thinkingThings.root + '/Receive',
                method: 'POST',
                form: {
                    cadena: '#STACK1#673495,T1,17,2500$theCondition,'
                }
            };

            beforeEach(utils.prepareMocks(
                './test/unit/contextRequests/updateContextTemperature.json',
                './test/unit/contextResponses/updateContextTemperatureSuccess.json'));

            it('should update the device entity in the Context Broker with the humidity attribute',
                utils.checkContextBroker(options));

            it('should return a 200OK with the appropriate response: ',
                utils.checkResponse(options, '#STACK1#673495,T1,-1$theCondition,'));
    });
    describe('When a GPS measure arrives to the IoT Agent: #STACK1#5143,GPS,21.1,-9.4,12.3,0.64,127,12$cond1,',
        function() {
        var options = {
            url: 'http://localhost:' + config.thinkingThings.port + config.thinkingThings.root + '/Receive',
            method: 'POST',
            form: {
                cadena: '#STACK1#5143,GPS,21.1,-9.4,12.3,0.64,127,12$cond1,'
            }
        };

        beforeEach(utils.prepareMocks(
            './test/unit/contextRequests/updateContextGPS.json',
            './test/unit/contextResponses/updateContextGPSSuccess.json'));

        it('should update the device entity in the Context Broker with the humidity attribute',
            utils.checkContextBroker(options));

        it('should return a 200OK with the appropriate response: ',
            utils.checkResponse(options, '#STACK1#5143,GPS,-1$cond1,'));
    });
    describe('When a request arrives to the IoT Agent having two modules', function() {
        var options = {
            url: 'http://localhost:' + config.thinkingThings.port + config.thinkingThings.root + '/Receive',
            method: 'POST',
            form: {
                cadena: '#STACK1#5143,GPS,21.1,-9.4,12.3,0.64,127,12$cond1,#673495,T1,17,2500$theCondition,'
            }
        };

        beforeEach(utils.prepareMocks(
            './test/unit/contextRequests/updateContextMultipleModules.json',
            './test/unit/contextResponses/updateContextMultipleModulesSuccess.json'));

        it('should update the device entity in the Context Broker with both attributes',
            utils.checkContextBroker(options));
        it('should return a 200OK with the appropriate response',
            utils.checkResponse(options, '#STACK1#5143,GPS,-1$cond1,#673495,T1,-1$theCondition,'));
    });
    describe('When a request arrives to the IoT Agent having the Core Module', function() {
        var options = {
            url: 'http://localhost:' + config.thinkingThings.port + config.thinkingThings.root + '/Receive',
            method: 'POST',
            form: {
                cadena: '#STACK1#5143,GPS,21.1,-9.4,12.3,0.64,127,12$cond1,#673495,K1,2500$theCondition,'
            }
        };

        beforeEach(utils.prepareMocks(
            './test/unit/contextRequests/updateContextCore.json',
            './test/unit/contextResponses/updateContextCoreSuccess.json'));

        it('should update the device entity in the Context Broker with both attributes',
            utils.checkContextBroker(options));
        it('should return a 200OK with the configured sleep time in the core module',
            utils.checkResponse(options, '#STACK1#5143,GPS,-1$cond1,#673495,K1,300$theCondition,'));
    });

    describe('When a request arrives to the IoT Agent having Generic Configuration modules', function() {
        var options = {
                url: 'http://localhost:' + config.thinkingThings.port + config.thinkingThings.root + '/Receive',
                method: 'POST',
                form: {
                    cadena: '#STACK1#0,GC,conf,33,300$,#1,GC,conf2,123,300$,#673495,K1,2500$theCondition,'
                }
            },
            originalPlainFormat;

        beforeEach(function() {
            utils.contextBrokerMock = [];

            originalPlainFormat = config.ngsi.plainFormat;
            config.ngsi.plainFormat = false;

            async.series([
                utils.prepareMocks(
                    './test/unit/contextRequests/queryContextGenericConfiguration.json',
                    './test/unit/contextResponses/queryContextGenericConfigurationSuccess.json',
                    '/v1/queryContext'),
                utils.prepareMocks(
                    './test/unit/contextRequests/updateContextGenericConfiguration.json',
                    './test/unit/contextResponses/updateContextGenericConfigurationSuccess.json',
                    '/v1/updateContext'),
                ttAgent.stop,
                apply(responseGenerator.reloadConfig, config),
                apply(ttAgent.start, config)
            ]);
        });

        afterEach(function(done) {
            config.ngsi.plainFormat = originalPlainFormat;
            responseGenerator.reloadConfig(config, done);
        });

        it('should update the device entity in the Context Broker with both attributes',
            utils.checkContextBroker(options));
        it('should return a 200OK with the current value of the configuration parameter read from the CB',
            utils.checkResponse(options, '#STACK1#0,GC,conf,44,-1$,#1,GC,conf2,456,-1$,#673495,K1,300$theCondition,'));
    });

    describe('When a request arrives to the IoT Agent with plain format configuration modules', function() {
        var options = {
                url: 'http://localhost:' + config.thinkingThings.port + config.thinkingThings.root + '/Receive',
                method: 'POST',
                form: {
                    cadena: '#STACK1#0,GC,conf,33,600$,#1,GC,conf2,123,600$,#673495,K1,2500$theCondition,'
                }
            },
            originalPlainFormat;

        beforeEach(function(done) {
            utils.contextBrokerMock = [];

            originalPlainFormat = config.ngsi.plainFormat;
            config.ngsi.plainFormat = true;

            async.series([
                utils.prepareMocks(
                    './test/unit/contextRequests/queryContextGenericConfigurationPlain.json',
                    './test/unit/contextResponses/queryContextGenericConfigurationPlainSuccess.json',
                    '/v1/queryContext'),
                utils.prepareMocks(
                    './test/unit/contextRequests/updateContextGenericConfigurationPlain.json',
                    './test/unit/contextResponses/updateContextGenericConfigurationSuccess.json',
                    '/v1/updateContext'),
                ttAgent.stop,
                apply(responseGenerator.reloadConfig, config),
                apply(ttAgent.start, config)
            ], done);
        });

        afterEach(function() {
            config.ngsi.plainFormat = originalPlainFormat;
        });

        it('should update the device entity in the Context Broker with both attributes',
            utils.checkContextBroker(options));
        it('should return a 200OK with the current value of the configuration parameter read from the CB',
            utils.checkResponse(options, '#STACK1#0,GC,conf,44,-1$,#1,GC,conf2,456,-1$,#673495,K1,300$theCondition,'));
    });

    describe('When a request arrives to the IoT Agent having actuator modules', function() {
        var options = {
            url: 'http://localhost:' + config.thinkingThings.port + config.thinkingThings.root + '/Receive',
            method: 'POST',
            form: {
                cadena: '#STACK1#1,AV,,600$,#673495,K1,2500$theCondition,'
            }
        };

        beforeEach(function() {
            utils.contextBrokerMock = [];

            async.series([
                utils.prepareMocks(
                    './test/unit/contextRequests/queryContextMelody.json',
                    './test/unit/contextResponses/queryContextMelodySuccess.json',
                    '/v1/queryContext'),
                utils.prepareMocks(
                    './test/unit/contextRequests/updateContextMelody.json',
                    './test/unit/contextResponses/updateContextMelodySuccess.json',
                    '/v1/updateContext')
            ]);
        });

        it('should update the device entity in the Context Broker with both attributes',
            utils.checkContextBroker(options));
        it('should return a 200OK with the current value of the configuration parameter read from the CB',
            utils.checkResponse(options, '#STACK1#1,AV,2:5:1000:1Cb.C,-1$,#673495,K1,300$theCondition,'));
    });

    describe('When a request arrives to the IoT Agent having led modules', function() {
        var options = {
            url: 'http://localhost:' + config.thinkingThings.port + config.thinkingThings.root + '/Receive',
            method: 'POST',
            form: {
                cadena: '#STACK1#6,L1,R,G,B,600$,#673495,K1,2500$theCondition,'
            }
        };

        beforeEach(function() {
            utils.contextBrokerMock = [];

            async.series([
                utils.prepareMocks(
                    './test/unit/contextRequests/queryContextLED.json',
                    './test/unit/contextResponses/queryContextLEDSuccess.json',
                    '/v1/queryContext'),
                utils.prepareMocks(
                    './test/unit/contextRequests/updateContextLED.json',
                    './test/unit/contextResponses/updateContextLEDSuccess.json',
                    '/v1/updateContext')
            ]);
        });

        it('should update the device entity in the Context Broker with both attributes',
            utils.checkContextBroker(options));
        it('should return a 200OK with the current value of the configuration parameter read from the CB',
            utils.checkResponse(options, '#STACK1#6,L1,255,129,38,-1$,#673495,K1,300$theCondition,'));
    });

    describe('When a real example of the device request arrives', function() {
        var options = {
            url: 'http://localhost:' + config.thinkingThings.port + config.thinkingThings.root + '/Receive',
            method: 'POST',
            form: {
                'cadena': '#ITgAY,' +
                    '#0,P1,214,07,b00,444,-47,' +
                    '#0,K1,300$,' +
                    '#3,B,4.70,1,1,1,1,0,-1$' +
                    '#4,T1,31.48,0$' +
                    '#4,H1,31.48,1890512.00,0$' +
                    '#4,LU,142.86,0$'
            }
        };

        beforeEach(utils.prepareMocks(
            './test/unit/contextRequests/updateContextRealExample.json',
            './test/unit/contextResponses/updateContextRealExampleSuccess.json'));

        it('should update the device entity in the Context Broker with the humidity attribute',
            utils.checkContextBroker(options));

        it('should return a 200OK with the appropriate response: ',
            utils.checkResponse(options, '#ITgAY#0,P1,-1$,#0,K1,300$,#3,B,1,1,0,-1$,#4,T1,-1$,#4,H1,-1$,#4,LU,-1$,'));
    });
    describe('When the plainFormat configuration flag is set', function() {
        var options = {
            url: 'http://localhost:' + config.thinkingThings.port + config.thinkingThings.root + '/Receive',
            method: 'POST',
            form: {
                'cadena': '#ITgAY,' +
                '#0,P1,214,07,b00,444,-47,' +
                '#0,K1,300$,' +
                '#3,B,4.70,1,1,1,1,0,-1$' +
                '#4,T1,31.48,0$' +
                '#4,H1,31.48,1890512.00,0$' +
                '#4,LU,142.86,0$'
            }
        };

        beforeEach(function(done) {
            config.ngsi.plainFormat = true;
            utils.prepareMocks(
                './test/unit/contextRequests/updateContextPlainExample.json',
                './test/unit/contextResponses/updateContextPlainExampleSuccess.json')(done);
        });

        afterEach(function() {
            config.ngsi.plainFormat = false;
        });

        it('should update the device entity in the Context Broker with the humidity attribute',
            utils.checkContextBroker(options));

        it('should return a 200OK with the appropriate response: ',
            utils.checkResponse(options, '#ITgAY#0,P1,-1$,#0,K1,300$,#3,B,1,1,0,-1$,#4,T1,-1$,#4,H1,-1$,#4,LU,-1$,'));
    });

    describe('When the format is plain and the timestamp flag is on', function() {
        var options = {
            url: 'http://localhost:' + config.thinkingThings.port + config.thinkingThings.root + '/Receive',
            method: 'POST',
            form: {
                'cadena': '#ITgAY,' +
                '#0,P1,214,07,b00,444,-47,' +
                '#0,K1,300$,' +
                '#3,B,4.70,1,1,1,1,0,-1$' +
                '#4,T1,31.48,0$' +
                '#4,H1,31.48,1890512.00,0$' +
                '#4,LU,142.86,0$'
            }
        };

        beforeEach(function(done) {
            var time = new Date(1438760101468);

            config.ngsi.plainFormat = true;
            config.ngsi.timestamp = true;

            timekeeper.freeze(time);

            utils.prepareMocks(
                './test/unit/contextRequests/updateContextPlainTimestampExample.json',
                './test/unit/contextResponses/updateContextPlainTimestampExampleSuccess.json')(done);
        });

        afterEach(function() {
            config.ngsi.plainFormat = false;
            config.ngsi.timestamp = false;
        });

        it('should update the device entity in the Context Broker with the humidity attribute',
            utils.checkContextBroker(options));
    });

    describe('When the format is compound and the timestamp flag is on', function() {
        var options = {
            url: 'http://localhost:' + config.thinkingThings.port + config.thinkingThings.root + '/Receive',
            method: 'POST',
            form: {
                'cadena': '#STACK1#673495,T1,17,2500$theCondition,'
            }
        };

        beforeEach(function(done) {
            var time = new Date(1438760101468);

            config.ngsi.plainFormat = false;
            config.ngsi.timestamp = true;

            timekeeper.freeze(time);

            utils.prepareMocks(
                './test/unit/contextRequests/updateContextTemperatureTimestamp.json',
                './test/unit/contextResponses/updateContextTemperatureTimestampSuccess.json')(done);
        });

        afterEach(function() {
            config.ngsi.plainFormat = false;
            config.ngsi.timestamp = false;
        });

        it('should update the device entity in the Context Broker with the humidity attribute',
            utils.checkContextBroker(options));
    });

    describe('When there is an idMapping file available in the configuration', function() {
        var options = {
            url: 'http://localhost:' + config.thinkingThings.port + config.thinkingThings.root + '/Receive',
            method: 'POST',
            form: {
                'cadena': '#y1oBb,' +
                '#0,P1,214,07,b00,444,-47,' +
                '#0,K1,300$,' +
                '#3,B,4.70,1,1,1,1,0,-1$' +
                '#4,T1,31.48,0$' +
                '#4,H1,31.48,1890512.00,0$' +
                '#4,LU,142.86,0$'
            }
        };

        beforeEach(function(done) {
            config.ngsi.plainFormat = true;
            config.thinkingThings.mappingFile = 'thinkingThingsMapping.json';

            async.series([
                ttAgent.stop,
                apply(ttAgent.start, config)
            ], function() {
                utils.prepareMocks(
                    './test/unit/contextRequests/updateContextPlainMappedExample.json',
                    './test/unit/contextResponses/updateContextPlainMappedExampleSuccess.json')(done);
            });
        });

        afterEach(function() {
            config.ngsi.plainFormat = false;
            config.thinkingThings.mappingFile = null;
        });

        it('should map the internal id to the external one in the Context Broker', utils.checkContextBroker(options));
    });
});
