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
    ttAgent = require('../../lib/iotagent-thinking-things'),
    utils = require('../tools/utils'),
    config = require('../../config'),
    should = require('should'),
    nock = require('nock'),
    contextBrokerMock;

describe('Southbound measure reporting', function() {
    beforeEach(function(done) {
        ttAgent.start(done);
    });
    afterEach(function(done) {
        ttAgent.stop(done);
    });
    describe.only('When a new Humidity measure arrives to the IoT Agent', function() {
        var options = {
            url: 'http://localhost:' + config.thinkingThings.port + config.thinkingThings.root,
            method: 'POST',
            body: '#953E78F,H1,28,0.330,20$condition,'
        };

        beforeEach(function(done) {
            nock.cleanAll();

            contextBrokerMock = nock('http://10.11.128.16:1026')
                .matchHeader('fiware-service', 'smartGondor')
                .matchHeader('fiware-servicepath', '/gardens')
                .post('/NGSI10/updateContext', utils.readExampleFile('./test/unit/contextRequests/updateContextHumidity.json'))
                .reply(200, utils.readExampleFile('./test/unit/contextResponses/updateContextHumiditySuccess.json'));

            done();
        });

        it('should update the device entity in the Context Broker with the humidity attribute', function(done) {
            request(options, function(error, response, body) {
                should.not.exist(error);
                contextBrokerMock.done();
                done();
            });
        });
    });
});
