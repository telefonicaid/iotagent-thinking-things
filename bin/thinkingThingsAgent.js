#!/usr/bin/env node

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

var iotAgent = require('../lib/iotagent-thinking-things'),
    context = {
        op: 'ThinkingT.Executable'
    },
    logger = require('logops');

function start() {
    var config;

    if (process.argv.length === 3) {
        config = require(process.argv[2]);
    } else {
        config = require('../config');
    }

    iotAgent.start(config, function (error) {
        if (error) {
            logger.error(context, 'Error starting Thinking Things Agent: [%s] Exiting process', error);
        } else {
            logger.info(context, 'Thinking Things Agent IoT Agent started');
        }
    });
}

start();