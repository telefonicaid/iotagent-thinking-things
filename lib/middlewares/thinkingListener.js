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

var logger = require('logops'),
    _ = require('underscore'),
    thinkingParser = require('../services/thinkingParser'),
    responseGenerator = require('./responseGenerator').generateResponse,
    iotAgentLib = require('iotagent-node-lib'),
    config,
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
 * This middleware serves as a temporary patch to allow a Context Adapter to register as Context Provider for
 * certain attributes without removing them from the Context Broker. It should be removed in the future when the
 * Context Provider functionality in the Context Broker is revised.
 */
function duplicateAttributes(req, res, next) {
    var duplicatingAttributes = ['interaction_type', 'service_id'],
        newValue;

    if (req.deviceInformation.staticAttributes &&
        !(req.compoundValues && req.compoundValues.length === 1 && req.compoundValues[0].value === 'P')) {
        for (var i = 0; i < req.deviceInformation.staticAttributes.length; i++) {
            if (duplicatingAttributes.indexOf(req.deviceInformation.staticAttributes[i].name) >= 0) {
                newValue = _.clone(req.deviceInformation.staticAttributes[i]);
                newValue.name = 'aux_' + newValue.name;
                req.compoundValues.push(newValue);
            }
        }
    }

    next();
}

function updateValuesInCB(req, res, next) {
    iotAgentLib.update(req.entityId, req.type, '', req.compoundValues, req.deviceInformation, function(error) {
        if (error) {
            req.cbError = error;
        }

        next();
    });
}

function retrieveConfiguration(req, res, next) {
    function extractName(previous, item) {
        if (item.module && item.module === 'BT' && item.queries) {
            previous = previous.concat(item.queries);
        } else if (item.attributes && item.attributes.length === 1 && item.attributes[0].name) {
            var name = item.attributes[0].name;
            previous.push(name.substr(name.lastIndexOf('_') + 1));
        }

        return previous;
    }

    function extractConfigurationAttributes(item) {
        if (config.ngsi.plainFormat) {
            return item;

        } else {
            return {
                id: item.name,
                name: item.value[0].name,
                value: item.value[0].value
            };
        }
    }

    function hasAttributes(item) {
        if (config.ngsi.plainFormat) {
            return true;
        } else {
            return item && item.value && item.value.length === 1 && item.value[0].name && item.value[0].value;
        }
    }

    function toKeyMap(last, item) {
        if (config.ngsi.plainFormat) {
            last[item.name] = item;
        } else {
            last[item.id] = item;
        }

        return last;
    }

    if (req.configurations && req.configurations.length > 0) {

        var attributes = req.configurations.reduce(extractName, []);

        iotAgentLib.query(req.entityId, req.type, '', attributes, req.deviceInformation, function(error, value) {
            if (error) {
                req.cbError = error;
            } else {
                req.configurationValues = value.contextResponses[0].contextElement.attributes
                    .filter(hasAttributes)
                    .map(extractConfigurationAttributes)
                    .reduce(toKeyMap, {});
            }

            next();
        });
    } else {
        next();
    }
}

function extractDeviceInformation(req, res, next) {
    var compoundValues,
        configurations = [],
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

    function excludedModules(value) {
        return value.module !== 'AV' && value.module !== 'L1';
    }

    function isConfiguration(value) {
        return value.module === 'GC' || value.module === 'AV' || value.module === 'L1' ||
            (value.module === 'BT' && value.operation === 'P');
    }

    function isSynchronous(value) {
        return value.module === 'BT' && value.operation === 'S';
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
        compoundValues = req.parsedBody.modules
            .filter(excludedModules)
            .map(extractAttributeSet)
            .reduce(concatAttrs, [])
            .filter(notRepeated());

        if (core && core.sleep) {
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
        }
    } else {
        compoundValues = req.parsedBody.modules
            .filter(excludedModules)
            .map(extractModuleAttribute)
            .filter(hasAttributes);
    }

    configurations = req.parsedBody.modules.filter(isConfiguration);

    if (config.thinkingThings.idMapping && config.thinkingThings.idMapping[req.parsedBody.id]) {
        id = config.thinkingThings.idMapping[req.parsedBody.id].Identificador;
    } else {
        id = req.parsedBody.id;
    }

    req.entityId = id;
    req.isSynchronous = req.parsedBody.modules.filter(isSynchronous).length > 0;
    req.configurations = configurations;
    req.compoundValues = compoundValues;

    if (req.deviceInformation) {
        logger.debug(context, 'Sending information with preregistered device configuration');
        req.entityId = req.deviceInformation.name;
        req.type = req.deviceInformation.type;
        req.deviceInformation = req.deviceInformation;

    } else if (config.ngsi.types[config.ngsi.defaultType]) {
        logger.debug(context, 'Sending information based solely in the request');
        req.entityId = req.entityId + ':' + config.ngsi.defaultType;
        req.type = config.ngsi.defaultType;
        req.deviceInformation = config.ngsi.types[config.ngsi.defaultType];
    } else {
        logger.error(context, 'Couldn\'t determine the device type');
    }

    if (req.type) {
        next();
    } else {
        next('Couldn\'t determine the device type');
    }
}

function getStoredDevice(req, res, next) {
    var id;

    if (config.thinkingThings.idMapping && config.thinkingThings.idMapping[req.parsedBody.id]) {
        id = config.thinkingThings.idMapping[req.parsedBody.id].Identificador;
    } else {
        id = req.parsedBody.id;
    }

    logger.debug(context, 'Looking for device with id: %s', id);

    iotAgentLib.getDevice(id, function(error, device) {
        if (device) {
            logger.debug(context, 'Preregistered device information found: %j', device);
            req.deviceInformation = device;
        }

        next();
    });
}

/**
 * Loads the southbound routes associated with the Thinking Things IoT Agent.
 *
 * @param {Object} router       Express router where the routes will be added.
 * @param {Object} newConfig    New configuration for the listener.
 */
function loadContextRoutes(router, newConfig) {
    config = newConfig;
    thinkingParser.init(newConfig);
    logger.info(context, 'Loading NGSI Context server routes');
    router.post('/Receive',
        parseResponse,
        getStoredDevice,
        extractDeviceInformation,
        retrieveConfiguration,
        duplicateAttributes,
        updateValuesInCB,
        responseGenerator);
}

exports.loadContextRoutes = loadContextRoutes;
