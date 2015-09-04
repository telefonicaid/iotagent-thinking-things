/*
 * Copyright 2013 Telefonica Investigación y Desarrollo, S.A.U
 *
 * This file is part of fiware-orion-pep
 *
 * fiware-orion-pep is free software: you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * fiware-orion-pep is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with fiware-orion-pep.
 * If not, seehttp://www.gnu.org/licenses/.
 *
 * For those usages not covered by the GNU Affero General Public License
 * please contact with::[daniel.moranjimenez@telefonica.com]
 */

'use strict';

var request = require('request'),
    config = require('../unit/config-test'),
    utils = require('../tools/utils'),
    should = require('should'),
    nock = require('nock'),
    contextBrokerMock = [],
    fs = require('fs');

function readExampleFile(name, raw) {
    var text = fs.readFileSync(name, 'UTF8');

    if (raw) {
        return text;
    } else {
        return JSON.parse(text);
    }
}

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

            for (var i = 0; i < contextBrokerMock.length; i++) {
                contextBrokerMock[i].done();
            }

            done();
        });
    };
}

function prepareMocks(request, response, path, code) {
    return function(done) {
        var realPath,
            realCode = 200 || code;

        if (path) {
            realPath = path;
        } else {
            nock.cleanAll();
            contextBrokerMock = [];
            realPath = '/v1/updateContext';
        }

        contextBrokerMock.push(nock('http://' + config.ngsi.contextBroker.host + ':1026')
            .matchHeader('fiware-service', 'smartGondor')
            .matchHeader('fiware-servicepath', '/gardens')
            .post(realPath,
            utils.readExampleFile(request))
            .reply(code, utils.readExampleFile(response)));

        done();
    };
}

exports.checkResponse = checkResponse;
exports.checkContextBroker = checkContextBroker;
exports.prepareMocks = prepareMocks;
exports.readExampleFile = readExampleFile;
exports.contextBrokerMock = contextBrokerMock;
