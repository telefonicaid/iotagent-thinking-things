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

var humidityProcessor = require('../../lib/services/humidityProcessor'),
    should = require('should');

describe('Humidity Processor tests', function() {
    var cases = [
        [27.37, 963425.00, 30],
        [32.39, 2123390.00, 25]
    ];

    function testHumidity(temperature, rawValue, humidity) {
        describe('When a measure with temperature [' + temperature +
            '] and raw value [' + rawValue + '] arrives', function() {
            it('should give a humidity percentage of the [' + humidity + ']', function() {
                var targetValue = humidityProcessor.calculate(temperature, rawValue);

                should.exist(targetValue);
                targetValue.should.equal(humidity);
            });
        });
    }

    for (var i = 0; i < cases.length; i++) {
        testHumidity(cases[i][0], cases[i][1], cases[i][2]);
    }
});
