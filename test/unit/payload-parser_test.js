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

var thinkingParser = require('../../lib/services/thinkingParser'),
    should = require('should');

function checkId(id, callback) {
    return function(error, result) {
        should.not.exist(error);
        should.exist(result);
        result.id.should.equal(id);
        callback();
    };
}

function checkSleep(value, condition, callback) {
    return function(error, result) {
        should.not.exist(error);
        should.exist(result);
        should.exist(result.sleep);
        should.exist(result.sleep.value);
        should.exist(result.sleep.condition);
        result.sleep.value.should.equal(value);
        result.sleep.condition.should.equal(condition);
        callback();
    };
}

describe.only('Thinking things payload parser', function() {
    describe('When a Humidity payload arrives: "#953E78F,H1,28,0.330,20$condition,"', function() {
        it('should fill the Device ID', function(done) {
            thinkingParser.parse('#953E78F,H1,28,0.330,20$condition,', checkId('953E78F', done));
        });
        it('should parse the temperature and resistance into the attributes object', function(done) {
            thinkingParser.parse('#953E78F,H1,28,0.330,20$condition,', function(error, result) {
                should.not.exist(error);
                should.exist(result);
                should.exist(result.attributes);
                should.exist(result.attributes[0]);
                should.exist(result.attributes[1]);
                result.attributes[0].name.should.equal('humidity');
                result.attributes[0].value.should.equal('0.330');
                result.attributes[0].type.should.equal('float');
                result.attributes[1].name.should.equal('temperature');
                result.attributes[1].value.should.equal('28');
                result.attributes[1].type.should.equal('float');
                done();
            });
        });
        it('should extract the sleeping time and condition', function(done) {
            thinkingParser.parse('#953E78F,H1,28,0.330,20$condition,', checkSleep('20', 'condition', done));
        });
    });
    describe('When a humidity payload with not enough params arrive', function() {
        it('should return a BAD_REQUEST error', function(done) {
            thinkingParser.parse('#953E78F,H1,28,20$condition,', function(error, result) {
                should.exist(error);
                error.name.should.equal('BAD_PAYLOAD');
                done();
            });
        });
    });
    describe('When a temperature payload arrives: #673495,T1,17,2500$theCondition,', function() {
        it('should fill the Device ID', function(done) {
            thinkingParser.parse('#673495,T1,17,2500$theCondition,', checkId('673495', done));
        });
        it('should parse the temperature value into the attributes object', function(done) {
            thinkingParser.parse('#673495,T1,17,2500$theCondition,', function(error, result) {
                should.not.exist(error);
                should.exist(result);
                should.exist(result.attributes);
                should.exist(result.attributes[0]);
                result.attributes[0].name.should.equal('temperature');
                result.attributes[0].value.should.equal('17');
                result.attributes[0].type.should.equal('float');
                done();
            });
        });
        it('should extract the sleeping time and condition', function(done) {
            thinkingParser.parse('#673495,T1,17,2500$theCondition,', checkSleep('2500', 'theCondition', done));
        });
    });
    describe('When a GPS location payload arrives: #5143,GPS,21.1,-9.4,12.3,0.64,127,12$cond1,', function() {
        it('should fill the Device ID', function(done) {
            thinkingParser.parse('#5143,GPS,21.1,-9.4,12.3,0.64,127,12$cond1,', checkId('5143', done));
        });
        it('should parse all the location fields into the attributes object', function(done) {
            thinkingParser.parse('#5143,GPS,21.1,-9.4,12.3,0.64,127,12$cond1,', function(error, result) {
                should.not.exist(error);
                should.exist(result);
                should.exist(result.attributes);
                should.exist(result.attributes[0]);
                result.attributes[0].name.should.equal('location');
                result.attributes[0].value.should.equal('21.1,-9.4');
                result.attributes[0].type.should.equal('float');
                result.attributes[1].name.should.equal('speed');
                result.attributes[1].value.should.equal('12.3');
                result.attributes[1].type.should.equal('float');
                result.attributes[2].name.should.equal('orientation');
                result.attributes[2].value.should.equal('0.64');
                result.attributes[2].type.should.equal('float');
                result.attributes[3].name.should.equal('altitude');
                result.attributes[3].value.should.equal('127');
                result.attributes[3].type.should.equal('float');
                done();
            });
        });
        it('should extract the sleeping time and condition', function(done) {
            thinkingParser.parse('#5143,GPS,21.1,-9.4,12.3,N,127,12$cond1,', checkSleep('12', 'cond1', done));
        });
    });
    describe('When an unknown module payload arrives: #673495,QW9,93,510$theCondition,', function() {
        it('should return an UNSUPPORTED_MODULE error', function(done) {
            thinkingParser.parse('#673495,QW9,93,510$theCondition,', function(error, result) {
                should.exist(error);
                error.name.should.equal('UNSUPPORTED_MODULE');
                done();
            });
        });
    });
});

