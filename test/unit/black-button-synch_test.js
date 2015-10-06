/*
 * Copyright 2015 Telefonica Investigación y Desarrollo, S.A.U
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
    request = require('request'),
    ttAgent = require('../../lib/iotagent-thinking-things'),
    iotagentNodeLib = require('iotagent-node-lib'),
    should = require('should'),
    nock = require('nock'),
    idGenerator = require('../../lib/services/idGenerator'),
    utils = require('../tools/utils'),
    originalGenerateInternalId,
    oldPlainFormat;

function mockedGenerateInternalId() {
    return 'AAAEE1111';
}

describe('Black button Synchronous testing', function() {
    beforeEach(function(done) {
        ttAgent.start(config, done);
    });

    afterEach(function(done) {
        ttAgent.stop(done);
    });

    function sendUpdateLazyAttributes(payload) {
        var lazyAttributeUpdate = {
            url: 'http://localhost:' + config.ngsi.server.port + '/v1/updateContext',
            method: 'POST',
            json: utils.readExampleFile(payload)
        };

        request(lazyAttributeUpdate, function(error, response, body) {
            should.not.exist(error);
            response.statusCode.should.equal(200);
        });
    }

    function registerDevice(callback) {
        var registerOptions = {
            url: 'http://localhost:' + config.ngsi.server.port + '/iot/devices',
            method: 'POST',
            json: utils.readExampleFile('./test/unit/provision/synchronousButtonProvision.json'),
            headers: {
                'fiware-service': 'smartGondor',
                'fiware-servicepath': '/gardens'
            }
        };

        request(registerOptions, function(error, response, body) {
            should.not.exist(error);
            response.statusCode.should.equal(201);
            callback();
        });
    }

    function prepareMocksForSynch(request, response, code, lazyResponse) {
        return function(done) {
            nock.cleanAll();

            oldPlainFormat = config.ngsi.plainFormat;
            config.ngsi.plainFormat = true;

            originalGenerateInternalId = idGenerator.generateInternalId;
            idGenerator.generateInternalId = mockedGenerateInternalId;

            utils.contextBrokerMock.push(nock('http://' + config.ngsi.contextBroker.host + ':1026')
                .matchHeader('fiware-service', 'smartGondor')
                .matchHeader('fiware-servicepath', '/gardens')
                .post('/v1/updateContext')
                .reply(200,
                utils.readExampleFile('./test/unit/contextResponses/blackButtonSynchronousRequestSuccess.json')
            ));

            utils.contextBrokerMock.push(nock('http://' + config.ngsi.contextBroker.host + ':1026')
                .matchHeader('fiware-service', 'smartGondor')
                .matchHeader('fiware-servicepath', '/gardens')
                .post('/v1/updateContext', utils.readExampleFile(request))
                .reply(function(uri, requestBody, cb) {
                    setTimeout(sendUpdateLazyAttributes
                        .bind(null, lazyResponse), 500);

                    cb(null, [code, utils.readExampleFile(response)]);
                }));

            utils.contextBrokerMock.push(nock('http://' + config.ngsi.contextBroker.host + ':1026')
                .matchHeader('fiware-service', 'smartGondor')
                .matchHeader('fiware-servicepath', '/gardens')
                .post('/NGSI9/registerContext')
                .reply(200,
                utils.readExampleFile('./test/unit/contextAvailabilityResponses/registerDeviceSuccess.json')));

            registerDevice(done);
        };
    }

    function cleanUpMocksAfterSynch() {
        return function(done) {
            config.ngsi.plainFormat = oldPlainFormat;

            idGenerator.generateInternalId = originalGenerateInternalId;

            utils.contextBrokerMock.push(nock('http://' + config.ngsi.contextBroker.host + ':1026')
                .matchHeader('fiware-service', 'smartGondor')
                .matchHeader('fiware-servicepath', '/gardens')
                .post('/NGSI9/registerContext')
                .reply(200,
                utils.readExampleFile('./test/unit/contextAvailabilityResponses/registerDeviceSuccess.json')));

            iotagentNodeLib.unregister('STACK1', function() {
                nock.cleanAll();
                done();
            });
        };
    }

    describe('When a synchronous call operation arrives from the device:', function() {
        var options = {
                url: 'http://localhost:' + config.thinkingThings.port + config.thinkingThings.root + '/Receive',
                method: 'POST',
                form: {
                    cadena: '#STACK1#0,BT,S,6,FFE876AE,0$'
                }
            };

        beforeEach(prepareMocksForSynch(
            './test/unit/contextRequests/blackButtonSynchronousRequest.json',
            './test/unit/contextResponses/blackButtonSynchronousRequestSuccess.json',
            200,
            './test/unit/contextRequests/blackButtonSynchLazyRequest.json'));

        afterEach(cleanUpMocksAfterSynch());

        it('should update the status in the Context Broker', utils.checkContextBroker(options));
        it('should return the appropriate success message', function(done) {
            request(options, function(error, result, body) {
                should.not.exist(error);
                result.statusCode.should.equal(200);
                body.should.equal('#STACK1#0,BT,S,6,ThisIsTheResult,0$');
                done();
            });
        });
    });

    describe('When a synchronous call operation arrives from the device and the result is codified', function() {
        var options = {
                url: 'http://localhost:' + config.thinkingThings.port + config.thinkingThings.root + '/Receive',
                method: 'POST',
                form: {
                    cadena: '#STACK1#0,BT,S,6,FFE876AE,0$'
                }
            };

        beforeEach(prepareMocksForSynch(
            './test/unit/contextRequests/blackButtonSynchronousRequest.json',
            './test/unit/contextResponses/blackButtonSynchronousRequestSuccess.json',
            200,
            './test/unit/contextRequests/blackButtonSynchLazyRequestCodified.json'));

        afterEach(cleanUpMocksAfterSynch());

        it('should return the decoded success message', function(done) {
            request(options, function(error, result, body) {
                should.not.exist(error);
                result.statusCode.should.equal(200);
                body.should.equal('#STACK1#0,BT,S,6,This=Is"TheResult",0$');
                done();
            });
        });
    });

    describe('When the Context Broker returns an application error for a synchronous operation', function() {
        var options = {
            url: 'http://localhost:' + config.thinkingThings.port + config.thinkingThings.root + '/Receive',
            method: 'POST',
            form: {
                cadena: '#STACK1#0,BT,S,6,FFE876AE,0$'
            }
        };

        beforeEach(prepareMocksForSynch(
            './test/unit/contextRequests/blackButtonSynchronousRequest.json',
            './test/unit/contextResponses/blackButtonSynchronousStatusCode500.json',
            200,
            './test/unit/contextRequests/blackButtonSynchLazyRequest.json'));

        afterEach(cleanUpMocksAfterSynch());

        it('should return an explanation the appropriate error code', function(done) {
            request(options, function(error, result, body) {
                should.not.exist(error);
                result.statusCode.should.equal(200);
                body.should.equal('#STACK1#0,BT,S,0,0:500,rgb-66CC00;t-2,0$');
                done();
            });
        });
    });

    describe('When the connection with the CB throws a transport error for a synchronous operation', function() {
        var options = {
                url: 'http://localhost:' + config.thinkingThings.port + config.thinkingThings.root + '/Receive',
                method: 'POST',
                form: {
                    cadena: '#STACK1#0,BT,S,6,FFE876AE,0$'
                }
            };

        beforeEach(prepareMocksForSynch(
            './test/unit/contextRequests/blackButtonSynchronousRequest.json',
            './test/unit/contextResponses/blackButtonSynchronousStatusCode500.json',
            502,
            './test/unit/contextRequests/blackButtonSynchLazyRequest.json'));

        afterEach(cleanUpMocksAfterSynch());

        it('should return an explanation the appropriate error code', function(done) {
            request(options, function(error, result, body) {
                should.not.exist(error);
                result.statusCode.should.equal(200);
                body.should.equal('#STACK1#0,BT,S,0,0:502,,0$');
                done();
            });
        });
    });

});
