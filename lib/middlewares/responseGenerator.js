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

var config = require('../../config');

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
    var confAttribute = req.configurationValues[parsedBody.id].name,
        confName = confAttribute.substr(confAttribute.lastIndexOf('_') + 1);

    return parsedBody.id + ',' + parsedBody.module + ',' + confName + ',' +
        req.configurationValues[parsedBody.id].value + ',-1$,';
}

function blackButtonResponse(parsedBody, req) {
    return parsedBody.id + ',' + parsedBody.module + ',' + parsedBody.operation + ',' + parsedBody.requestId +
            ',,,0$'
}

/**
 * Generates the response for the current module, based in the parsedBody
 */
function generateResponse(req, res, next) {
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
            case 'GC':
                moduleAnswer = genericConfigurationResponse(module, req);
                break;
            case 'B':
                moduleAnswer = batteryResponse(module);
                break;
            case 'BT':
                moduleAnswer = blackButtonResponse(module, req);
        }

        return moduleAnswer;
    }

    function concatResponses(previous, current) {
        return previous + '#' + current;
    }

    var moduleResponse = '#' + req.parsedBody.id + req.parsedBody.modules
        .map(generateModuleResponse)
        .reduce(concatResponses, '');

    res.status(200).send(moduleResponse);
}

exports.generateResponse = generateResponse;
