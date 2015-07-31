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

var errors = require('../errors'),
    async = require('async');

/**
 * Parse a Humidity module based on the module fields. The result object is passed by to the callback decorated with
 * the attributes of the module.
 *
 * @param {Array} fields            List of attributes of the module request.
 * @param {Object} result           Object representing the structured request.
 */

function parseHumidity(fields, result, callback) {
    if (fields.length >= 5) {
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

/**
 * Parse a GPS module based on the module fields. The result object is passed by to the callback decorated with
 * the attributes of the module.
 *
 * @param {Array} fields            List of attributes of the module request.
 * @param {Object} result           Object representing the structured request.
 */

function parseGPSLocation(fields, result, callback) {
    if (fields.length >= 8) {
        result.attributes.push({
            name: 'position',
            value: fields[2] + ',' + fields[3],
            type: 'coords',
            metadatas: [
                {
                    name: 'location',
                    type: 'string',
                    value: 'WGS84'
                }
            ]
        });

        result.attributes.push({
            name: 'speed',
            value: fields[4],
            type: 'float'
        });

        result.attributes.push({
            name: 'orientation',
            value: fields[5],
            type: 'float'
        });

        result.attributes.push({
            name: 'altitude',
            value: fields[6],
            type: 'float'
        });

        result.sleep.value = fields[7].substr(0, fields[7].indexOf('$'));
        result.sleep.condition = fields[7].substr(fields[7].indexOf('$') + 1);

        callback(null, result);
    } else {
        callback(new errors.BadPayload(JSON.stringify(fields)));
    }
}

/**
 * Parse a temperature module based on the module fields. The result object is passed by to the callback decorated with
 * the attributes of the module.
 *
 * @param {Array} fields            List of attributes of the module request.
 * @param {Object} result           Object representing the structured request.
 */
function parseTemperature(fields, result, callback) {
    if (fields.length >= 4) {
        result.attributes.push({
            name: 'temperature',
            value: fields[2],
            type: 'float'
        });
        result.sleep.value = fields[3].substr(0, fields[3].indexOf('$'));
        result.sleep.condition = fields[3].substr(fields[3].indexOf('$') + 1);

        callback(null, result);
    } else {
        callback(new errors.BadPayload(JSON.stringify(fields)));
    }
}

function parseCore(fields, result, callback) {
    if (fields.length >= 3) {
        result.sleep.value = fields[2].substr(0, fields[2].indexOf('$'));
        result.sleep.condition = fields[2].substr(fields[2].indexOf('$') + 1);

        callback(null, result);
    } else {
        callback(new errors.BadPayload(JSON.stringify(fields)));
    }
}

function parseGenericConfiguration(fields, result, callback) {
    if (fields.length >= 5) {
        result.attributes.push({
            name: '_TTcurrent_' + fields[2],
            value: fields[3],
            type: 'string'
        });

        result.sleep.value = fields[4].substr(0, fields[4].indexOf('$'));
        result.sleep.condition = fields[4].substr(fields[4].indexOf('$') + 1);

        callback(null, result);
    } else {
        callback(new errors.BadPayload(JSON.stringify(fields)));
    }
}

function parseLuminance(fields, result, callback) {
    if (fields.length >= 4) {
        result.attributes.push({
            name: 'luminance',
            value: fields[2],
            type: 'float'
        });
        result.sleep.value = fields[3].substr(0, fields[3].indexOf('$'));
        result.sleep.condition = fields[3].substr(fields[3].indexOf('$') + 1);

        callback(null, result);
    } else {
        callback(new errors.BadPayload(JSON.stringify(fields)));
    }
}

function parseGSM(fields, result, callback) {
    if (fields.length >= 7) {
        result.attributes.push({
            name: 'mcc',
            value: fields[2],
            type: 'integer'
        });
        result.attributes.push({
            name: 'mnc',
            value: fields[3],
            type: 'integer'
        });
        result.attributes.push({
            name: 'lac',
            value: fields[4],
            type: 'integer'
        });
        result.attributes.push({
            name: 'cellid',
            value: fields[5],
            type: 'string'
        });
        result.attributes.push({
            name: 'dbm',
            value: fields[6],
            type: 'integer'
        });

        callback(null, result);
    } else {
        callback(new errors.BadPayload(JSON.stringify(fields)));
    }
}

function parseBattery(fields, result, callback) {
    if (fields.length >= 9) {
        result.attributes.push({
            name: 'voltage',
            value: fields[2],
            type: 'float'
        });
        result.attributes.push({
            name: 'state',
            value: fields[3],
            type: 'integer'
        });
        result.attributes.push({
            name: 'charger',
            value: fields[4],
            type: 'integer'
        });
        result.attributes.push({
            name: 'charging',
            value: fields[5],
            type: 'integer'
        });
        result.attributes.push({
            name: 'mode',
            value: fields[6],
            type: 'integer'
        });
        result.attributes.push({
            name: 'desconnection',
            value: fields[7],
            type: 'integer'
        });

        result.sleep.value = fields[8].substr(0, fields[8].indexOf('$'));
        result.sleep.condition = fields[8].substr(fields[8].indexOf('$') + 1);

        callback(null, result);
    } else {
        callback(new errors.BadPayload(JSON.stringify(fields)));
    }
}

/**
 * Parse a string containing a thinking things payload, passing the result in the callback.
 *
 * @param {string} modulePayload          Contents to parse.
 */
function parseModule(modulePayload, callback) {
    var fields = modulePayload.split(','),
        result = {
            attributes: [],
            sleep: {}
        },
        module;

    result.id = fields[0];
    result.module = fields[1];

    switch (fields[1]) {
        case 'K1':
            module = parseCore;
            break;
        case 'LU':
            module = parseLuminance;
            break;
        case 'H1':
            module = parseHumidity;
            break;
        case 'GPS':
            module = parseGPSLocation;
            break;
        case 'P1':
            module = parseGSM;
            break;
        case 'T1':
            module = parseTemperature;
            break;
        case 'B':
            module = parseBattery;
            break;
        case 'GC':
            module = parseGenericConfiguration;
            break;
    }

    if (module) {
        module(fields, result, callback);
    } else {
        callback(new errors.UnsupportedModule(modulePayload));
    }
}

function parse(payload, callback) {
    var cleanString = payload.substr(1),
        firstSharp = cleanString.indexOf('#'),
        stackFields = cleanString.substr(0, firstSharp).split(','),
        modules = cleanString.substr(firstSharp + 1).split('#'),
        stackId;

    if (stackFields.length > 0) {
        stackId = stackFields[0];
    }

    function handleParsedModules(error, results) {
        if (error) {
            callback(error);
        } else {
            callback(null, {
                id: stackId,
                modules: results
            });
        }
    }

    async.map(modules, parseModule, handleParsedModules);
}

exports.parse = parse;
