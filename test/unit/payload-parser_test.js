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

function checkId(stackId, id, callback) {
    return function(error, result) {
        should.not.exist(error);
        should.exist(result);
        result.id.should.equal(stackId);
        should.exist(result.modules);
        should.exist(result.modules[0]);
        result.modules[0].id.should.equal(id);
        callback();
    };
}

function checkSleep(value, condition, callback) {
    return function(error, result) {
        should.not.exist(error);
        should.exist(result);
        should.exist(result.modules[0].sleep);
        should.exist(result.modules[0].sleep.value);
        should.exist(result.modules[0].sleep.condition);
        result.modules[0].sleep.value.should.equal(value);
        result.modules[0].sleep.condition.should.equal(condition);
        callback();
    };
}

describe('Thinking things payload parser', function() {
    describe('When a Humidity payload arrives: "#STACK01#953E78F,H1,27.37,963425.00,20$condition,"', function() {
        it('should fill the Device ID', function(done) {
            thinkingParser.parse('#STACK01#953E78F,H1,27.37,963425.00,20$condition,',
                checkId('STACK01', '953E78F', done));
        });
        it('should parse the temperature and resistance into the attributes object', function(done) {
            thinkingParser.parse('#STACK01#953E78F,H1,27.37,963425.00,20$condition,', function(error, result) {
                should.not.exist(error);
                should.exist(result);
                should.exist(result.id);
                should.exist(result.modules[0]);
                should.exist(result.modules[0].attributes);
                should.exist(result.modules[0].attributes[0]);
                should.exist(result.modules[0].attributes[1]);
                result.modules[0].attributes[0].name.should.equal('humidity');
                result.modules[0].attributes[0].value.should.equal('30');
                result.modules[0].attributes[0].type.should.equal('float');
                result.modules[0].attributes[1].name.should.equal('temperature');
                result.modules[0].attributes[1].value.should.equal('27.37');
                result.modules[0].attributes[1].type.should.equal('float');
                done();
            });
        });
        it('should extract the sleeping time and condition', function(done) {
            thinkingParser.parse('#STACK01#953E78F,H1,27.37,963425.00,20$condition,',
                checkSleep('20', 'condition', done));
        });
    });
    describe('When a humidity payload with not enough params arrive', function() {
        it('should return a BAD_REQUEST error', function(done) {
            thinkingParser.parse('#STACK01#953E78F,H1,28,20$condition', function(error, result) {
                should.exist(error);
                error.name.should.equal('BAD_PAYLOAD');
                done();
            });
        });
    });
    describe('When a temperature payload arrives: #673495,T1,17,2500$theCondition,', function() {
        it('should fill the Device ID', function(done) {
            thinkingParser.parse('#STACK01#673495,T1,17,2500$theCondition,', checkId('STACK01', '673495', done));
        });
        it('should parse the temperature value into the attributes object', function(done) {
            thinkingParser.parse('#STACK01#673495,T1,17,2500$theCondition,', function(error, result) {
                should.not.exist(error);
                should.exist(result);
                should.exist(result.modules[0].attributes);
                should.exist(result.modules[0].attributes[0]);
                result.modules[0].attributes[0].name.should.equal('temperature');
                result.modules[0].attributes[0].value.should.equal('17');
                result.modules[0].attributes[0].type.should.equal('float');
                done();
            });
        });
        it('should extract the sleeping time and condition', function(done) {
            thinkingParser.parse('#STACK01#673495,T1,17,2500$theCondition,', checkSleep('2500', 'theCondition', done));
        });
    });
    describe('When a GPS location payload arrives: #STACK01#5143,GPS,21.1,-9.4,12.3,0.64,127,12$cond1,', function() {
        it('should fill the Device ID', function(done) {
            thinkingParser.parse('#STACK01#5143,GPS,21.1,-9.4,12.3,0.64,127,12$cond1,',
                checkId('STACK01', '5143', done));
        });
        it('should parse all the location fields into the attributes object', function(done) {
            thinkingParser.parse('#STACK01#5143,GPS,21.1,-9.4,12.3,0.64,127,12$cond1,', function(error, result) {
                should.not.exist(error);
                should.exist(result);
                should.exist(result.id);
                should.exist(result.modules[0]);
                should.exist(result.modules[0].attributes);
                should.exist(result.modules[0].attributes[0]);
                result.modules[0].attributes[0].name.should.equal('position');
                result.modules[0].attributes[0].value.should.equal('21.1,-9.4');
                result.modules[0].attributes[0].type.should.equal('coords');
                should.exist(result.modules[0].attributes[0].metadatas);
                should.exist(result.modules[0].attributes[0].metadatas[0]);
                result.modules[0].attributes[0].metadatas[0].name.should.equal('location');
                result.modules[0].attributes[0].metadatas[0].type.should.equal('string');
                result.modules[0].attributes[0].metadatas[0].value.should.equal('WGS84');

                result.modules[0].attributes[1].name.should.equal('speed');
                result.modules[0].attributes[1].value.should.equal('12.3');
                result.modules[0].attributes[1].type.should.equal('float');
                result.modules[0].attributes[2].name.should.equal('orientation');
                result.modules[0].attributes[2].value.should.equal('0.64');
                result.modules[0].attributes[2].type.should.equal('float');
                result.modules[0].attributes[3].name.should.equal('altitude');
                result.modules[0].attributes[3].value.should.equal('127');
                result.modules[0].attributes[3].type.should.equal('float');
                done();
            });
        });
        it('should extract the sleeping time and condition', function(done) {
            thinkingParser.parse('#STACK01#5143,GPS,21.1,-9.4,12.3,N,127,12$cond1,', checkSleep('12', 'cond1', done));
        });
    });
    describe('When a Core module arrives: #STACK01#9,K1,​300$None,', function() {
        it('should fill the Device ID', function(done) {
            thinkingParser.parse('#STACK01#9,K1,​300$None,',
                checkId('STACK01', '9', done));
        });
        it('should extract the sleeping time and condition', function(done) {
            thinkingParser.parse('#STACK01#9,K1,300$None,', checkSleep('300', 'None', done));
        });
    });
    describe('When a Luminance module arrives: #STACK01#7,LU,12,600$,', function() {
        it('should fill the Device ID', function(done) {
            thinkingParser.parse('#STACK01#7,LU,12,600$,',
                checkId('STACK01', '7', done));
        });
        it('should parse all the location fields into the attributes object', function(done) {
            thinkingParser.parse('#STACK01#7,LU,12,600$,', function(error, result) {
                should.not.exist(error);
                should.exist(result);
                should.exist(result.modules[0].attributes);
                should.exist(result.modules[0].attributes[0]);
                result.modules[0].attributes[0].name.should.equal('luminance');
                result.modules[0].attributes[0].value.should.equal('12');
                result.modules[0].attributes[0].type.should.equal('float');
                done();
            });
        });
        it('should extract the sleeping time and condition', function(done) {
            thinkingParser.parse('#STACK01#7,LU,12,600$,', checkSleep('600', '', done));
        });
    });
    describe('When a GSM module arrives: #STACK07#4,P1,2345,7894,3434,364,6349,', function() {
        it('should fill the Device ID', function(done) {
            thinkingParser.parse('#STACK07#4,P1,2345,7894,3434,364,6349,',
                checkId('STACK07', '4', done));
        });
        it('should parse all the location fields into the attributes object', function(done) {
            thinkingParser.parse('#STACK07#4,P1,2345,7894,3434,364,6349,', function(error, result) {
                should.not.exist(error);
                should.exist(result);
                should.exist(result.modules[0].attributes);
                result.modules[0].attributes.length.should.equal(5);
                result.modules[0].attributes[0].name.should.equal('mcc');
                result.modules[0].attributes[0].value.should.equal('2345');
                result.modules[0].attributes[0].type.should.equal('integer');
                result.modules[0].attributes[1].name.should.equal('mnc');
                result.modules[0].attributes[1].value.should.equal('7894');
                result.modules[0].attributes[1].type.should.equal('integer');
                result.modules[0].attributes[2].name.should.equal('lac');
                result.modules[0].attributes[2].value.should.equal('3434');
                result.modules[0].attributes[2].type.should.equal('integer');
                result.modules[0].attributes[3].name.should.equal('cellid');
                result.modules[0].attributes[3].value.should.equal('364');
                result.modules[0].attributes[3].type.should.equal('string');
                result.modules[0].attributes[4].name.should.equal('dbm');
                result.modules[0].attributes[4].value.should.equal('6349');
                result.modules[0].attributes[4].type.should.equal('integer');
                done();
            });
        });
    });
    describe('When a Battery module arrives: #STACK07#3,B,4.70,1,1,1,1,0,-1$', function() {
        it('should fill the Device ID', function(done) {
            thinkingParser.parse('#STACK07#3,B,4.70,1,1,1,1,0,-1$',
                checkId('STACK07', '3', done));
        });
        it('should parse all the location fields into the attributes object', function(done) {
            thinkingParser.parse('#STACK07#3,B,4.70,1,2,4,5,0,-1$', function(error, result) {
                should.not.exist(error);
                should.exist(result);
                should.exist(result.modules[0].attributes);
                result.modules[0].attributes.length.should.equal(6);
                result.modules[0].attributes[0].name.should.equal('voltage');
                result.modules[0].attributes[0].value.should.equal('4.70');
                result.modules[0].attributes[0].type.should.equal('float');
                result.modules[0].attributes[1].name.should.equal('state');
                result.modules[0].attributes[1].value.should.equal('1');
                result.modules[0].attributes[1].type.should.equal('integer');
                result.modules[0].attributes[2].name.should.equal('charger');
                result.modules[0].attributes[2].value.should.equal('2');
                result.modules[0].attributes[2].type.should.equal('integer');
                result.modules[0].attributes[3].name.should.equal('charging');
                result.modules[0].attributes[3].value.should.equal('4');
                result.modules[0].attributes[3].type.should.equal('integer');
                result.modules[0].attributes[4].name.should.equal('mode');
                result.modules[0].attributes[4].value.should.equal('5');
                result.modules[0].attributes[4].type.should.equal('integer');
                result.modules[0].attributes[5].name.should.equal('desconnection');
                result.modules[0].attributes[5].value.should.equal('0');
                result.modules[0].attributes[5].type.should.equal('integer');
                done();
            });
        });
        it('should extract the sleeping time and condition', function(done) {
            thinkingParser.parse('#STACK07#3,B,4.70,1,2,4,5,0,-1$', checkSleep('-1', '', done));
        });
    });

    describe('When a Generic Configuration module arrives: #STACK01#0,GC,conf,33,600$,', function() {
        it('should fill the Device ID', function(done) {
            thinkingParser.parse('#STACK01#0,GC,conf,33,600$,',
                checkId('STACK01', '0', done));
        });
        it('should parse all the location fields into the attributes object', function(done) {
            thinkingParser.parse('#STACK01#0,GC,conf,33,600$,', function(error, result) {
                should.not.exist(error);
                should.exist(result);
                should.exist(result.modules[0].attributes);
                should.exist(result.modules[0].attributes[0]);
                result.modules[0].attributes[0].name.should.equal('_TTcurrent_conf');
                result.modules[0].attributes[0].value.should.equal('33');
                result.modules[0].attributes[0].type.should.equal('string');
                done();
            });
        });
        it('should extract the sleeping time and condition', function(done) {
            thinkingParser.parse('#STACK01#0,GC,conf,33,600$,', checkSleep('600', '', done));
        });
    });

    describe('When a Actuator module arrives: #STACK01#6,AV,,600$,', function() {
        it('should fill the Device ID', function(done) {
            thinkingParser.parse('#STACK01#6,AV,,600$,',
                checkId('STACK01', '6', done));
        });
        it('should parse all the location fields into the attributes object', function(done) {
            thinkingParser.parse('#STACK01#6,AV,,600$,', function(error, result) {
                should.not.exist(error);
                should.exist(result);
                should.exist(result.modules[0].attributes);
                should.exist(result.modules[0].attributes[0]);
                result.modules[0].attributes[0].name.should.equal('_TTcurrent_melody');
                result.modules[0].attributes[0].value.should.equal('');
                result.modules[0].attributes[0].type.should.equal('string');
                done();
            });
        });
        it('should extract the sleeping time and condition', function(done) {
            thinkingParser.parse('#STACK01#6,AV,,600$,', checkSleep('600', '', done));
        });
    });

    describe('When a LED module arrives: #STACK01#6,L1,R,G,B,600$,', function() {
        it('should fill the Device ID', function(done) {
            thinkingParser.parse('#STACK01#6,L1,R,G,B,600$,',
                checkId('STACK01', '6', done));
        });
        it('should parse all the location fields into the attributes object', function(done) {
            thinkingParser.parse('#STACK01#6,L1,R,G,B,600$,', function(error, result) {
                should.not.exist(error);
                should.exist(result);
                should.exist(result.modules[0].attributes);
                should.exist(result.modules[0].attributes[0]);
                result.modules[0].attributes[0].name.should.equal('_TTcurrent_color');
                result.modules[0].attributes[0].value.should.equal('');
                result.modules[0].attributes[0].type.should.equal('string');
                done();
            });
        });
        it('should extract the sleeping time and condition', function(done) {
            thinkingParser.parse('#STACK01#6,L1,R,G,B,600$,', checkSleep('600', '', done));
        });
    });

    describe('When a Generic module arrives: #STACK01#19,GM,attrName,32,600$,', function() {
        var payload = '#STACK01#19,GM,attrName,32,600$,';

        it('should fill the Module ID', function(done) {
            thinkingParser.parse(payload, checkId('STACK01', '19', done));
        });
        it('should parse all the location fields into the attributes object', function(done) {
            thinkingParser.parse(payload, function(error, result) {
                should.not.exist(error);
                should.exist(result);
                should.exist(result.modules[0].attributes);
                should.exist(result.modules[0].attributes[0]);
                result.modules[0].attributes[0].name.should.equal('attrName');
                result.modules[0].attributes[0].value.should.equal('32');
                result.modules[0].attributes[0].type.should.equal('string');
                done();
            });
        });
        it('should extract the sleeping time and condition', function(done) {
            thinkingParser.parse(payload, checkSleep('600', '', done));
        });
    });

    describe('When a BT module arrives with a synchronous operation: #STACK1#0,BT,S,6,FFE876AE,0$', function() {
        var payload = '#STACK1#0,BT,S,6,FFE876AE,0$';

        it('should fill the Module ID', function(done) {
            thinkingParser.parse(payload, checkId('STACK1', '0', done));
        });
        it('should parse all the location fields into the attributes object', function(done) {
            thinkingParser.parse(payload, function(error, result) {
                should.not.exist(error);
                should.exist(result);
                should.exist(result.modules[0].attributes);
                should.exist(result.modules[0].attributes[0]);
                result.modules[0].id.should.equal('0');
                result.modules[0].module.should.equal('BT');
                result.modules[0].attributes[0].name.should.equal('internal_id');
                result.modules[0].attributes[0].type.should.equal('string');
                result.modules[0].attributes[0].value.should.equal('STACK1');
                result.modules[0].attributes[1].name.should.equal('last_operation');
                result.modules[0].attributes[1].type.should.equal('string');
                result.modules[0].attributes[1].value.should.equal('S');
                result.modules[0].attributes[2].name.should.equal('op_action');
                result.modules[0].attributes[2].type.should.equal('string');
                result.modules[0].attributes[2].value.should.equal('6');
                result.modules[0].attributes[3].name.should.equal('op_extra');
                result.modules[0].attributes[3].type.should.equal('string');
                result.modules[0].attributes[3].value.should.equal('FFE876AE');

                done();
            });
        });
    });

    describe('When a Black Button module arrives with a creation operation: #STACK01#0,BT,C,1,1234,0$', function() {
        var payload = '#STACK01#0,BT,C,1,1234,0$';

        it('should fill the Module ID', function(done) {
            thinkingParser.parse(payload, checkId('STACK01', '0', done));
        });
        it('should parse all the location fields into the attributes object', function(done) {
            thinkingParser.parse(payload, function(error, result) {
                should.not.exist(error);
                should.exist(result);
                should.exist(result.modules[0].attributes);
                should.exist(result.modules[0].attributes[0]);
                result.modules[0].id.should.equal('0');
                result.modules[0].module.should.equal('BT');
                result.modules[0].attributes[0].name.should.equal('internal_id');
                result.modules[0].attributes[0].type.should.equal('string');
                result.modules[0].attributes[0].value.should.equal('STACK01');
                result.modules[0].attributes[1].name.should.equal('req_internal_id');
                result.modules[0].attributes[1].type.should.equal('string');
                result.modules[0].attributes[2].name.should.equal('last_operation');
                result.modules[0].attributes[2].type.should.equal('string');
                result.modules[0].attributes[2].value.should.equal('C');
                result.modules[0].attributes[3].name.should.equal('op_status');
                result.modules[0].attributes[3].type.should.equal('string');
                result.modules[0].attributes[3].value.should.equal('P');
                result.modules[0].attributes[4].name.should.equal('op_action');
                result.modules[0].attributes[4].type.should.equal('string');
                result.modules[0].attributes[4].value.should.equal('1');
                result.modules[0].attributes[5].name.should.equal('op_extra');
                result.modules[0].attributes[5].type.should.equal('string');
                result.modules[0].attributes[5].value.should.equal('1234');

                done();
            });
        });
    });

    describe('When a Black Button module arrives with a polling operation: #STACK01#5,BT,P,51236,0$', function() {
        var payload = '#STACK01#5,BT,P,51236,0$';

        it('should fill the Module ID', function(done) {
            thinkingParser.parse(payload, checkId('STACK01', '5', done));
        });
        it('should parse all the location fields into the attributes object', function(done) {
            thinkingParser.parse(payload, function(error, result) {
                should.not.exist(error);
                should.exist(result);
                should.exist(result.modules[0].queries);
                should.exist(result.modules[0].queries[0]);
                result.modules[0].id.should.equal('5');
                result.modules[0].module.should.equal('BT');
                result.modules[0].queries[0].should.equal('op_status');
                result.modules[0].queries[1].should.equal('op_result');
                done();
            });
        });
    });

    describe('When a Black Button module arrives with a close request operation: #STACK01#1,BT,X,869,0$', function() {
        var payload = '#STACK01#1,BT,X,869,0$';

        it('should fill the Module ID', function(done) {
            thinkingParser.parse(payload, checkId('STACK01', '1', done));
        });
        it('should parse all the location fields into the attributes object', function(done) {
            thinkingParser.parse(payload, function(error, result) {
                should.not.exist(error);

                should.exist(result);
                should.exist(result.modules[0].attributes);
                should.exist(result.modules[0].attributes[0]);
                result.modules[0].id.should.equal('1');
                result.modules[0].module.should.equal('BT');
                result.modules[0].attributes[0].name.should.equal('op_status');
                result.modules[0].attributes[0].type.should.equal('string');
                result.modules[0].attributes[0].value.should.equal('X');

                done();
            });
        });
    });

    describe('When an unknown module payload arrives: #STACK01#673495,QW9,93,510$theCondition,', function() {
        it('should return an UNSUPPORTED_MODULE error', function(done) {
            thinkingParser.parse('#STACK01#673495,QW9,93,510$theCondition,', function(error, result) {
                should.exist(error);
                error.name.should.equal('UNSUPPORTED_MODULE');
                done();
            });
        });
    });
});

