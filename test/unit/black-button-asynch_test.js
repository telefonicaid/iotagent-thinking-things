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
    should = require('should'),
    async = require('async'),
    idGenerator = require('../../lib/services/idGenerator'),
    utils = require('../tools/utils');

function mockedGenerateInternalId() {
    return 'AAAEE1111';
}

describe('Black button Asynchronous testing', function() {
    beforeEach(function(done) {
        ttAgent.start(config, done);
    });

    afterEach(function(done) {
        ttAgent.stop(done);
    });

    describe('When a creation operation arrives from the device: ', function() {
        var options = {
                url: 'http://localhost:' + config.thinkingThings.port + config.thinkingThings.root + '/Receive',
                method: 'POST',
                form: {
                    cadena: '#STACK1#0,BT,C,1,1234,0$'
                }
            },
            originalGenerateInternalId;

        beforeEach(function(done) {
            config.ngsi.plainFormat = true;

            originalGenerateInternalId = idGenerator.generateInternalId;
            idGenerator.generateInternalId = mockedGenerateInternalId;

            utils.prepareMocks(
                './test/unit/contextRequests/blackButtonCreationRequest.json',
                './test/unit/contextResponses/blackButtonCreationRequestSuccess.json')(done);
        });

        afterEach(function() {
            config.ngsi.plainFormat = false;
            idGenerator.generateInternalId = originalGenerateInternalId;
        });

        it('should update all the device data in the Context Broker entity', utils.checkContextBroker(options));

        it('should return the request id to the device:', function(done) {
            request(options, function(error, result, body) {
                should.not.exist(error);
                result.statusCode.should.equal(200);
                body.should.equal('#STACK1#0,BT,C,AAAEE1111,,,0$');
                done();
            });
        });
    });

    function generateAsynchOrionErrorCase(action, payload, cbRequest, errorFile, queryRequest, queryError) {
        return function() {
            var options = {
                    url: 'http://localhost:' + config.thinkingThings.port + config.thinkingThings.root + '/Receive',
                    method: 'POST',
                    form: {
                        cadena: payload
                    }
                },
                originalGenerateInternalId;

            beforeEach(function(done) {
                var mocks = [];

                config.ngsi.plainFormat = true;

                originalGenerateInternalId = idGenerator.generateInternalId;
                idGenerator.generateInternalId = mockedGenerateInternalId;

                if (queryRequest && queryError) {
                    mocks.push(utils.prepareMocks(
                        './test/unit/contextRequests/' + queryRequest,
                        './test/unit/contextResponses/' + queryError,
                        '/v1/queryContext'));
                }

                mocks.push(utils.prepareMocks(
                    './test/unit/contextRequests/' + cbRequest,
                    './test/unit/contextResponses/' + errorFile,
                    '/v1/updateContext'
                    ));

                async.series(mocks, done);
            });

            afterEach(function() {
                config.ngsi.plainFormat = false;
                idGenerator.generateInternalId = originalGenerateInternalId;
            });

            it('should return an explanation of the kind of error to the device', function(done) {
                request(options, function(error, result, body) {
                    should.not.exist(error);
                    result.statusCode.should.equal(200);
                    body.should.equal('#STACK1#0,BT,' + action + ',0,0:500,rgb-66CC00;t-2,0$');
                    done();
                });
            });
        };
    }

    function generateAsynchOrionTransportErrorCase(action, payload, cbRequest, errorFile, queryRequest, queryError) {
        return function() {
            var options = {
                    url: 'http://localhost:' + config.thinkingThings.port + config.thinkingThings.root + '/Receive',
                    method: 'POST',
                    form: {
                        cadena: payload
                    }
                },
                originalGenerateInternalId;

            beforeEach(function(done) {
                var mocks = [];

                config.ngsi.plainFormat = true;

                originalGenerateInternalId = idGenerator.generateInternalId;
                idGenerator.generateInternalId = mockedGenerateInternalId;

                if (queryRequest && queryError) {
                    mocks.push(utils.prepareMocks(
                        './test/unit/contextRequests/' + queryRequest,
                        './test/unit/contextResponses/' + queryError,
                        '/v1/queryContext',
                        502));

                    mocks.push(utils.prepareMocks(
                        './test/unit/contextRequests/' + cbRequest,
                        './test/unit/contextResponses/' + errorFile,
                        '/v1/updateContext'
                    ));
                } else {
                    mocks.push(utils.prepareMocks(
                        './test/unit/contextRequests/' + cbRequest,
                        './test/unit/contextResponses/' + errorFile,
                        '/v1/updateContext',
                        502
                    ));
                }


                async.series(mocks, done);
            });

            afterEach(function() {
                config.ngsi.plainFormat = false;
                idGenerator.generateInternalId = originalGenerateInternalId;
            });

            it('should return an explanation of the kind of error to the device', function(done) {
                request(options, function(error, result, body) {
                    should.not.exist(error);
                    result.statusCode.should.equal(200);
                    body.should.equal('#STACK1#0,BT,' + action + ',0,0:502,Error accesing entity data for device: ' +
                        'ThinkingThing:STACK1 of type: ThinkingThing,0$');
                    done();
                });
            });
        };
    }

    describe('When the asynchronous creation in the CB returns an application error: ',
        generateAsynchOrionErrorCase('C', '#STACK1#0,BT,C,1,1234,0$',
            'blackButtonCreationRequest.json',
            'blackButtonCreationRequestStatusCode500.json'));

    describe('When the creation in the CB returns a transport error: ',
        generateAsynchOrionTransportErrorCase('C', '#STACK1#0,BT,C,1,1234,0$',
            'blackButtonCreationRequest.json',
            'blackButtonCreationRequestSuccess.json'));

    describe('When the close operation in the CB returns an application error: ',
        generateAsynchOrionErrorCase('X', '#STACK1#0,BT,X,86,0$',
            'blackButtonCloseRequest.json',
            'blackButtonCloseRequestStatusCode500.json'));

    describe('When the close operation in the CB returns a transport error: ',
        generateAsynchOrionTransportErrorCase('X', '#STACK1#0,BT,X,86,0$',
            'blackButtonCloseRequest.json',
            'blackButtonCloseRequestSuccess.json'));

    describe('When the asynchronous polling in the CB returns an application error: ',
        generateAsynchOrionErrorCase('P', '#STACK1#0,BT,P,AAAEE1111,0$',
            'blackButtonPollingRequestUpdate.json',
            'blackButtonPollingRequestUpdateSuccess.json',
            'blackButtonPollingRequestQuery.json',
            'blackButtonPollingRequestQueryStatusCode500.json',
            '/v1/queryContext'));

    describe('When the asynchronous polling in the CB returns a transport error: ',
        generateAsynchOrionTransportErrorCase('P', '#STACK1#0,BT,P,AAAEE1111,0$',
            'blackButtonPollingRequestUpdate.json',
            'blackButtonPollingRequestUpdateSuccess.json',
            'blackButtonPollingRequestQuery.json',
            'blackButtonPollingRequestQuerySuccess.json',
            '/v1/queryContext'));

    describe('When a polling operation arrives from the device: ', function() {
        var options = {
                url: 'http://localhost:' + config.thinkingThings.port + config.thinkingThings.root + '/Receive',
                method: 'POST',
                form: {
                    cadena: '#STACK1#5,BT,P,AAAEE1111,0$'
                }
            },
            originalGenerateInternalId;

        beforeEach(function(done) {
            config.ngsi.plainFormat = true;

            originalGenerateInternalId = idGenerator.generateInternalId;
            idGenerator.generateInternalId = mockedGenerateInternalId;

            async.series([
                utils.prepareMocks(
                    './test/unit/contextRequests/blackButtonPollingRequestQuery.json',
                    './test/unit/contextResponses/blackButtonPollingRequestQuerySuccess.json',
                    '/v1/queryContext'),
                utils.prepareMocks(
                    './test/unit/contextRequests/blackButtonPollingRequestUpdate.json',
                    './test/unit/contextResponses/blackButtonPollingRequestUpdateSuccess.json',
                    '/v1/updateContext')
            ], done);
        });

        afterEach(function() {
            config.ngsi.plainFormat = false;
            idGenerator.generateInternalId = originalGenerateInternalId;
        });

        it('should query the Context Broker for the current state', utils.checkContextBroker(options));
        it('should return the extra data and state if available', function(done) {
            request(options, function(error, result, body) {
                should.not.exist(error);
                result.statusCode.should.equal(200);
                body.should.equal('#STACK1#5,BT,P,AAAEE1111:C.S:999999,0$');
                done();
            });
        });
    });

    describe('When a request close operation arrives from the device: #STACK1#1,BT,X,86,0$', function() {
        var options = {
                url: 'http://localhost:' + config.thinkingThings.port + config.thinkingThings.root + '/Receive',
                method: 'POST',
                form: {
                    cadena: '#STACK1#1,BT,X,86,0$'
                }
            },
            originalGenerateInternalId;

        beforeEach(function(done) {
            config.ngsi.plainFormat = true;

            originalGenerateInternalId = idGenerator.generateInternalId;
            idGenerator.generateInternalId = mockedGenerateInternalId;

            utils.prepareMocks(
                './test/unit/contextRequests/blackButtonCloseRequest.json',
                './test/unit/contextResponses/blackButtonCloseRequestSuccess.json')(done);
        });

        afterEach(function() {
            config.ngsi.plainFormat = false;
            idGenerator.generateInternalId = originalGenerateInternalId;
        });

        it('should update the status in the Context Broker', utils.checkContextBroker(options));
        it('should return the appropriate success message', function(done) {
            request(options, function(error, result, body) {
                should.not.exist(error);
                result.statusCode.should.equal(200);
                body.should.equal('#STACK1#1,BT,X,86,,0$');
                done();
            });
        });
    });
});
