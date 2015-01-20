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

var errors = require('../errors');

function parseHumidity(fields, result, callback) {
    if (fields.length === 6) {
        result.attributes.push({
            name: 'humidity',
            value: fields[3],
            type: 'float'
        });
        result.attributes.push({
            name: 'temperature',
            value: fields[2],
            type: 'float'
        });
        result.sleep.value = fields[4].substr(0, fields[4].indexOf('$'));
        result.sleep.condition = fields[4].substr(fields[4].indexOf('$') + 1);

        callback(null, result);
    } else {
        callback(new errors.BadPayload(JSON.stringify(fields)));
    }
}

function parse(payload, callback) {
    var cleanString = payload.substr(1),
        fields = cleanString.split(','),
        result = {
            attributes: [],
            sleep: {}
        },
        module;

    result.id = fields[0];

    switch(fields[1]) {
        case 'H1':
            module = parseHumidity;
            break;
    }

    module(fields, result, callback);
}

exports.parse = parse;