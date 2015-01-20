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
    thinkingParser = require('./../services/thinkingParser'),
    iotAgentLib = require('fiware-iotagent-lib'),
    config = require('../../config'),
    context = {
        op: 'TTAgent.Listener'
    };

function parseResponse(req, res, next) {
    thinkingParser.parse(req.rawBody, function (error, result) {
        req.parsedBody = result;
        next(error);
    });
}

function handleMeasure(req, res, next) {
    iotAgentLib.update(
        req.parsedBody.id + ':' + config.ngsi.defaultType,
        config.ngsi.defaultType,
        req.parsedBody.attributes,
        next);
}

function loadContextRoutes(router) {
    logger.info(context, 'Loading NGSI Contect server routes');
    router.post('/',
        parseResponse,
        handleMeasure);
}

exports.loadContextRoutes = loadContextRoutes;
