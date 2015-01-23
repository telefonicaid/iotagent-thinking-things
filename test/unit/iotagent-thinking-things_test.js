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

var request = require('request'),
    config = require('./config-test'),
    ttAgent = require('../../lib/iotagent-thinking-things'),
    utils = require('../tools/utils'),
    should = require('should'),
    nock = require('nock'),
    contextBrokerMock;

function checkResponse(options, answer) {
    return function(done) {
        request(options, function(error, response, body) {
            should.not.exist(error);
            response.statusCode.should.equal(200);
            body.should.equal(answer);
            done();
        });
    };
}

function checkContextBroker(options) {
    return function(done) {
        request(options, function(error, response, body) {
            should.not.exist(error);
            contextBrokerMock.done();
            done();
        });
    };
}

function prepareMocks(request, response) {
    return function(done) {
        nock.cleanAll();

        contextBrokerMock = nock('http://' + config.ngsi.contextBroker.host + ':1026')
            .matchHeader('fiware-service', 'smartGondor')
            .matchHeader('fiware-servicepath', '/gardens')
            .post('/v1/updateContext',
                utils.readExampleFile(request))
            .reply(200, utils.readExampleFile(response));

        done();
    };
}

describe('Southbound measure reporting', function() {
    beforeEach(function(done) {
        ttAgent.start(done);
    });
    afterEach(function(done) {
        ttAgent.stop(done);
    });
    describe('When a humidity measure arrives to the IoT Agent: #STACK1#953E78F,H1,28,0.330,20$condition,',
        function() {
        var options = {
            url: 'http://localhost:' + config.thinkingThings.port + config.thinkingThings.root,
            method: 'POST',
            form: {
                cadena: '#STACK1#953E78F,H1,28,0.330,20$condition,'
            }
        };

        beforeEach(prepareMocks(
            './test/unit/contextRequests/updateContextHumidity.json',
            './test/unit/contextResponses/updateContextHumiditySuccess.json'));

        it('should update the device entity in the Context Broker with the humidity attribute',
            checkContextBroker(options));

        it('should return a 200OK with the appropriate response: ',
            checkResponse(options, '#STACK1#953E78F,H1,-1$condition,'));
    });

    describe('When a temperature measure arrives to the IoT Agent: #STACK1#673495,T1,17,2500$theCondition,',
        function() {
        var options = {
            url: 'http://localhost:' + config.thinkingThings.port + config.thinkingThings.root,
            method: 'POST',
            form: {
                cadena: '#STACK1#673495,T1,17,2500$theCondition,'
            }
        };

        beforeEach(prepareMocks(
            './test/unit/contextRequests/updateContextTemperature.json',
            './test/unit/contextResponses/updateContextTemperatureSuccess.json'));

        it('should update the device entity in the Context Broker with the humidity attribute',
            checkContextBroker(options));

        it('should return a 200OK with the appropriate response: ',
            checkResponse(options, '#STACK1#673495,T1,-1$theCondition,'));
    });
    describe('When a GPS measure arrives to the IoT Agent: #STACK1#5143,GPS,21.1,-9.4,12.3,0.64,127,12$cond1,',
        function() {
        var options = {
            url: 'http://localhost:' + config.thinkingThings.port + config.thinkingThings.root,
            method: 'POST',
            form: {
                cadena: '#STACK1#5143,GPS,21.1,-9.4,12.3,0.64,127,12$cond1,'
            }
        };

        beforeEach(prepareMocks(
            './test/unit/contextRequests/updateContextGPS.json',
            './test/unit/contextResponses/updateContextGPSSuccess.json'));

        it('should update the device entity in the Context Broker with the humidity attribute',
            checkContextBroker(options));

        it('should return a 200OK with the appropriate response: ',
            checkResponse(options, '#STACK1#5143,GPS,-1$cond1,'));
    });
    describe('When a request arrives to the IoT Agent having two modules', function() {
        var options = {
            url: 'http://localhost:' + config.thinkingThings.port + config.thinkingThings.root,
            method: 'POST',
            form: {
                cadena: '#STACK1#5143,GPS,21.1,-9.4,12.3,0.64,127,12$cond1,#673495,T1,17,2500$theCondition,'
            }
        };

        beforeEach(prepareMocks(
            './test/unit/contextRequests/updateContextMultipleModules.json',
            './test/unit/contextResponses/updateContextMultipleModulesSuccess.json'));

        it('should update the device entity in the Context Broker with both attributes',
            checkContextBroker(options));
        it('should return a 200OK with the appropriate response',
            checkResponse(options, '#STACK1#5143,GPS,-1$cond1,#673495,T1,-1$theCondition,'));
    });
    describe('When a request arrives to the IoT Agent having the Core Module', function() {
        var options = {
            url: 'http://localhost:' + config.thinkingThings.port + config.thinkingThings.root,
            method: 'POST',
            form: {
                cadena: '#STACK1#5143,GPS,21.1,-9.4,12.3,0.64,127,12$cond1,#673495,K1,2500$theCondition,'
            }
        };

        beforeEach(prepareMocks(
            './test/unit/contextRequests/updateContextCore.json',
            './test/unit/contextResponses/updateContextCoreSuccess.json'));

        it('should update the device entity in the Context Broker with both attributes',
            checkContextBroker(options));
        it('should return a 200OK with the configured sleep time in the core module',
            checkResponse(options, '#STACK1#5143,GPS,-1$cond1,#673495,K1,300$theCondition,'));
    });
    describe('When a real example of the device request arrives', function() {
            var options = {
                url: 'http://localhost:' + config.thinkingThings.port + config.thinkingThings.root,
                method: 'POST',
                form: {
                    "cadena": "#ITgAY," +
                        "#0,P1,214,07,b00,444,-47," +
                        "#0,K1,300$," +
                        "#3,B,4.70,1,1,1,1,0,-1$" +
                        "#4,T1,31.48,0$" +
                        "#4,H1,31.48,1890512.00,0$" +
                        "#4,LU,142.86,0$"
                }
            };

            beforeEach(prepareMocks(
                './test/unit/contextRequests/updateContextRealExample.json',
                './test/unit/contextResponses/updateContextRealExampleSuccess.json'));

            it('should update the device entity in the Context Broker with the humidity attribute',
                checkContextBroker(options));

            it('should return a 200OK with the appropriate response: ',
                checkResponse(options, '#ITgAY,#0,P1,-1$,#0,K1,300$,#3,B,1,1,0,-1$,#4,T1,-1$,#4,H1,-1$,#4,LU,-1$,'));
        });
});
