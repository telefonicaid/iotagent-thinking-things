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

var config = require('./config-error'),
    ttAgent = require('../../lib/iotagent-thinking-things'),
    request = require('request'),
    should = require('should'),
    utils = require('../tools/utils');

describe('Error management', function() {
    beforeEach(function(done) {
        ttAgent.start(config, done);
    });
    afterEach(function(done) {
        ttAgent.stop(done);
    });
    describe('When a measure arrives for an unregistered device with TTOpen measures', function() {
        var options = {
            url: 'http://localhost:' + config.thinkingThings.port + config.thinkingThings.root + '/Receive',
            method: 'POST',
            form: {
                cadena: '#STACK1#953E78F,H1,27.37,963425.00,20$condition,'
            }
        };

        beforeEach(utils.prepareMocks(
            './test/unit/contextRequests/updateContextHumidity.json',
            './test/unit/contextResponses/updateContextHumiditySuccess.json'));

        it('should return a 200 OK with the appropriate error response: ', function(done) {
            request(options, function(error, response, body) {
                should.not.exist(error);
                response.statusCode.should.equal(404);
                body.should.equal('#STACK1#953E78F,H1,-1$condition,');
                done();
            });
        });
    });
});
