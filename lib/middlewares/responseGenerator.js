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

/**
 * Creates the body of the response for modules with no special values in the response.
 *
 * @param {Object} parsedBody   The data of the request in structured formate.
 * @returns {string}            The body of the response for the module.
 */
function singleValueResponse(parsedBody) {
    return '#' +
        parsedBody.id + ',' +
        parsedBody.module + ',' +
        parsedBody.sleep.value + '$' +
        parsedBody.sleep.condition + ',';
}

/**
 * Generates the response for the current module, based in the parsedBody
 * @param req
 * @param res
 * @param next
 */
function generateResponse(req, res, next) {
    var moduleResponse;

    switch (req.parsedBody.module) {
        case 'H1':
        case 'T1':
        case 'GPS':
            moduleResponse = singleValueResponse(req.parsedBody);
            break;
    }

    res.status(200).send(moduleResponse);
}

exports.generateResponse = generateResponse;
