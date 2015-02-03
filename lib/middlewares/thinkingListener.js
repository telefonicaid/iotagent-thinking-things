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

var logger = require('fiware-node-logger'),
    thinkingParser = require('../services/thinkingParser'),
    responseGenerator = require('./responseGenerator').generateResponse,
    iotAgentLib = require('fiware-iotagent-lib'),
    config = require('../../config'),
    context = {
        op: 'TTAgent.Listener'
    };

/**
 * Parse the payload of the request and put its contents in the parsedBody attribute of the request.
 */
function parseResponse(req, res, next) {
    thinkingParser.parse(req.body.cadena, function(error, result) {
        req.parsedBody = result;
        next(error);
    });
}

/**
 *  Sends the measure identified by the request to the Context Broker, taking the information from the parsedBody
 *  attribute.
 */
function sendMeasure(req, res, next) {
    var compoundValues,
        core,
        id;

    function extractModuleAttribute(value) {
        var attribute = {
            name: value.id,
            type: 'compound',
            value: value.attributes,
            metadatas: [
                {
                    name: 'sleepcondition',
                    type: 'string',
                    value: value.sleep.condition || ''
                },
                {
                    name: 'sleeptime',
                    type: 'string',
                    value: value.sleep.value || '-1'
                }
            ]
        };

        return attribute;
    }

    function hasAttributes(element) {
        return element.value && element.value.length > 0;
    }

    function extractAttributeSet(value) {
        if (value.module === 'K1') {
            core = value;
        }

        return value.attributes;
    }

    function concatAttrs(previous, value) {
        return previous.concat(value);
    }

    function notRepeated() {
        var added = [];
        return function repeatHandler(value) {
            if (value.name && added.indexOf(value.name) < 0) {
                added.push(value.name);
                return true;
            } else {
                return false;
            }
        };
    }

    if (config.ngsi.plainFormat) {
        compoundValues = req.parsedBody.modules.map(extractAttributeSet).reduce(concatAttrs, []).filter(notRepeated());
        compoundValues.push({
                name: 'sleepcondition',
                type: 'string',
                value: core.sleep.condition || 'Wake'
            },
            {
                name: 'sleeptime',
                type: 'string',
                value: core.sleep.value || '-1'
            });
    } else {
        compoundValues = req.parsedBody.modules.map(extractModuleAttribute).filter(hasAttributes);
    }

    if (config.thinkingThings.idMapping && config.thinkingThings.idMapping[req.parsedBody.id]) {
        id = config.thinkingThings.idMapping[req.parsedBody.id].Identificador;
    } else {
        id = req.parsedBody.id;
    }
    iotAgentLib.update(
        id + ':' + config.ngsi.defaultType,
        config.ngsi.defaultType,
        compoundValues,
        next);
}

/**
 * Loads the southbound routes associated with the Thinking Things IoT Agent.
 *
 * @param {Object} router       Express router where the routes will be added.
 */
function loadContextRoutes(router) {
    logger.info(context, 'Loading NGSI Contect server routes');
    router.post('/Receive',
        parseResponse,
        sendMeasure,
        responseGenerator);
}

exports.loadContextRoutes = loadContextRoutes;
