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

var config = require('../../config'),
    synchronousRequests = {},
    events = require('events'),
    logger = require('logops'),
    context = {
        op: 'TTAgent.ResponseGenerator'
    },
    responseBus;

/**
 * Creates the body of the response for modules with no special values in the response.
 *
 * @param {Object} parsedBody   The data of the request in structured formate.
 * @return {string}            The body of the response for the module.
 */
function singleValueResponse(parsedBody) {
    var sleepTime,
        condition;

    if (parsedBody.module === 'K1') {
        sleepTime = config.thinkingThings.sleepTime;
    } else {
        sleepTime = '-1';
    }

    if (parsedBody.sleep.condition) {
        condition = parsedBody.sleep.condition;
    } else {
        parsedBody.sleep.condition = '';
    }

    return parsedBody.id + ',' +
        parsedBody.module + ',' +
        sleepTime + '$' +
        parsedBody.sleep.condition + ',';
}

function batteryResponse(parsedBody) {
        return parsedBody.id + ',' + parsedBody.module + ',' + parsedBody.attributes[1].value + ',' +
            parsedBody.attributes[4].value + ',' + parsedBody.attributes[5].value + ',-1$,';
}

function genericConfigurationResponse(parsedBody, req) {
    var confAttribute,
        confName,
        confValue;

    if (config.ngsi.plainFormat) {
        confAttribute = parsedBody.attributes[0].name;
        confName = confAttribute.substr(confAttribute.lastIndexOf('_') + 1);
        confValue = req.configurationValues[confName].value;
    } else {
        confAttribute = req.configurationValues[parsedBody.id].name;
        confName = confAttribute.substr(confAttribute.lastIndexOf('_') + 1);
        confValue = req.configurationValues[parsedBody.id].value;
    }

    return parsedBody.id + ',' + parsedBody.module + ',' + confName + ',' + confValue + ',-1$,';
}

function actuatorResponse(parsedBody, req) {
    if (config.ngsi.plainFormat) {
        var confAttribute = parsedBody.attributes[0].name,
            confName = confAttribute.substr(confAttribute.lastIndexOf('_') + 1);

        return parsedBody.id + ',' + parsedBody.module + ',' +
            req.configurationValues[confName].value + ',-1$,';
    } else {
        return parsedBody.id + ',' + parsedBody.module + ',' +
            req.configurationValues[parsedBody.id].value + ',-1$,';
    }
}

function decode(data) {
    return data
        .replace(/%3B/g, ';')
        .replace(/%3E/g, '>')
        .replace(/%22/g, '"')
        .replace(/%27/g, '\'')
        .replace(/%3D/g, '=')
        .replace(/%28/g, '(')
        .replace(/%29/g, ')')
        .replace(/%5C/g, '\\');
}

function blackButtonResponse(parsedBody, req) {
    /* jshint sub: true, camelcase: false */

    var payload,
        result = '',
        status;

    if (req.configurationValues) {
        status = (req.configurationValues.op_status) ? req.configurationValues.op_status.value : '';

        if (req.configurationValues.op_result) {
            if (typeof req.configurationValues.op_result.value === 'string') {
                result = JSON.parse(decode(req.configurationValues.op_result.value)).extra;
            } else {
                result = req.configurationValues.op_result.value.extra;
            }
        }
    }

    if (result) {
        result = decode(result);
    }

    switch (parsedBody.operation) {
        case 'P':
            payload = parsedBody.id + ',' + parsedBody.module + ',' + parsedBody.operation +
                ',' + parsedBody.requestId + ':' + status + ':' + result + ',0$';
            break;

        case 'X':
            payload = parsedBody.id + ',' + parsedBody.module + ',' + parsedBody.operation +
            ',' + parsedBody.requestId + ',,0$';
            break;

        case 'S':
            payload = parsedBody.id + ',' + parsedBody.module + ',' + parsedBody.operation +
            ',1,' + result + ',0$';
            break;

        default:
            payload = parsedBody.id + ',' + parsedBody.module + ',' + parsedBody.operation +
                ',' + parsedBody.requestId + ',,,0$';
    }

    return payload;
}

function blackButtonError(parsedBody, req) {
    var payload,
        details,
        code,
        errorType;

    if (req.cbError) {
        code = req.cbError.code || (req.cbError.details && req.cbError.details.code) || 'UNK';
        errorType = 0;
        details = (req.cbError.details && req.cbError.details.reasonPhrase) ||
            (req.cbError.details && req.cbError.details.details) ||
            'Unknown error';
    }

    payload = parsedBody.id + ',' + parsedBody.module + ',' + parsedBody.operation +
    ',0,' + errorType + ':' + code + ',' + details + ',0$';

    req.cbError.code = 200;

    return payload;
}

function processAsynchronousRequest(req, res, next) {
    function generateModuleResponse(module) {
        var moduleAnswer;

        switch (module.module) {
            case 'K1':
            case 'LU':
            case 'H1':
            case 'T1':
            case 'P1':
            case 'GPS':
                moduleAnswer = singleValueResponse(module);
                break;
            case 'L1':
            case 'AV':
                moduleAnswer = actuatorResponse(module, req);
                break;
            case 'GC':
                moduleAnswer = genericConfigurationResponse(module, req);
                break;
            case 'B':
                moduleAnswer = batteryResponse(module);
                break;
            case 'BT':
                if (req.cbError) {
                    moduleAnswer = blackButtonError(module, req);
                } else {
                    moduleAnswer = blackButtonResponse(module, req);
                }
        }

        return moduleAnswer;
    }

    function concatResponses(previous, current) {
        return previous + '#' + current;
    }

    var moduleResponse = '#' + req.parsedBody.id + req.parsedBody.modules
            .map(generateModuleResponse)
            .reduce(concatResponses, '');

    logger.debug(context, 'Successfully returning the following answer: %s', moduleResponse);

    if (req.cbError && (req.cbError.code || req.cbError.details && req.cbError.details.code)) {
        res.status(req.cbError.code || req.cbError.details.code).send(moduleResponse);
    } else {
        res.status(200).send(moduleResponse);
    }
}

function manageIncomingResponse(id, value) {
    /* jshint sub: true, camelcase: false */

    var data = synchronousRequests[id];

    if (data && data.request && value && value.length === 1 && value[0].name && value[0].name === 'op_result') {
        try {
            var parsedValue = {
                name: value[0].name,
                value: JSON.parse(decode(value[0].value))
            };

            data.request.configurationValues = data.request.configurationValues || {};

            data.request.configurationValues.op_result = parsedValue;
            delete synchronousRequests[id];

            if (parsedValue.value.code !== '200') {
                data.request.cbError = {
                    details: {
                        code: parsedValue.value.code,
                        reasonPhrase: parsedValue.value.extra
                    }
                };
            }
        } catch (e) {
            data.request.cbError = {
                details: {
                    code: '501',
                    reasonPhrase: 'Parse error receiving CB response'
                }
            };
        }

        processAsynchronousRequest(data.request, data.response, data.callback);
    } else {
        logger.warn(
            context,
            'Incoming response not associated with previous synchronous Black Button operations for id [%s]. Ignoring',
            id
        );
    }
}

function initResponseBus() {
    if (!responseBus) {
        responseBus = new events.EventEmitter();
        responseBus.on('response', manageIncomingResponse);
    }
}

function queueSynchronousRequest(req, res, next) {
    initResponseBus();

    synchronousRequests[req.deviceInformation.name] = {
        request: req,
        response: res,
        callback: next
    };
}

/**
 * Generates the response for the current module, based in the parsedBody
 */
function generateResponse(req, res, next) {
    if (req.isSynchronous) {
        queueSynchronousRequest(req, res, next);
    } else {
        processAsynchronousRequest(req, res, next);
    }
}

function continueSynchOperation(id, value) {
    initResponseBus();
    responseBus.emit('response', id, value);
}

function reloadConfig(newConfig, callback) {
    config = newConfig;
    callback();
}

function errorHandler(error, req, res, next) {
    if (error.details) {
        req.cbError = error;
    } else {
        req.cbError = {
            details: {}
        };
    }

    if (!req.cbError.details.code) {
        req.cbError.details.code = error.code || 500;
    }

    if (!req.cbError.details.reasonPhrase) {
        req.cbError.details.reasonPhrase = req.cbError.details.details ||
            error.message ||
            error.name ||
            'UNKNOWN_ERROR';
    }

    processAsynchronousRequest(req, res, next);
}

exports.generateResponse = generateResponse;
exports.errorHandler = errorHandler;
exports.continueSynchOperation = continueSynchOperation;
exports.reloadConfig = reloadConfig;
