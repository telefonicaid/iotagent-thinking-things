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
    http = require('http'),
    express = require('express'),
    thinkingListener = require('./middlewares/thinkingListener'),
    iotAgentLib = require('fiware-iotagent-lib'),
    async = require('async'),
    apply = async.apply,
    context = {
      op: 'IoTAgentTT.SouthBoundServer'
    },
    southboundServer,
    config = require('../config');

function traceRequest(req, res, next) {
  logger.debug(context, 'Request for path [%s] from [%s]', req.path, req.get('host'));

  if (req.headers['content-type'] === 'application/json') {
    logger.debug(context, 'Body:\n\n%s\n\n', JSON.stringify(req.body, null, 4));
  } else {
    logger.debug(context, 'Unrecognized body type', req.headers['content-type']);
  }

  next();
}

function handleError(error, req, res, next) {
  var code = 500;

  logger.debug(context, 'Error [%s] handing request: %s', error.name, error.message);

  if (error.code) {
    code = error.code;
  }
  res.status(code).json({
    name: error.name,
    message: error.message
  });
}

function rawBody(req, res, next) {
  var data = '';
  req.setEncoding('utf8');
  req.on('data', function(chunk) {
    data += chunk;
  });
  req.on('end', function() {
    req.rawBody = data;
    next();
  });
}

function startServer(callback) {
  var baseRoot = '/';

  if (config.thinkingThings.logLevel) {
    logger.setLevel(config.thinkingThings.logLevel);
  }

  southboundServer = {
    server: null,
    app: express(),
    router: express.Router()
  };

  logger.info(context, 'Starting IoT Agent listening on port [%s]', config.thinkingThings.port);
  logger.debug(context, 'Using config:\n\n%s\n', JSON.stringify(config, null, 4));

  southboundServer.app.set('port', config.thinkingThings.port);
  southboundServer.app.set('host', '0.0.0.0');
  southboundServer.app.use(rawBody);

  if (config.logLevel && config.logLevel === 'DEBUG') {
    southboundServer.app.use(traceRequest);
  }

  if (config.thinkingThings.root) {
    baseRoot = config.thinkingThings.root;
  }

  southboundServer.app.use(baseRoot, southboundServer.router);
  thinkingListener.loadContextRoutes(southboundServer.router);

  southboundServer.app.use(handleError);

  southboundServer.server = http.createServer(southboundServer.app);

  southboundServer.server.listen(southboundServer.app.get('port'), southboundServer.app.get('host'), callback);
}

function start(callback) {
  async.series([
      startServer,
      apply(iotAgentLib.activate, config.ngsi)
  ], callback);
}

function stop(callback) {
  logger.info(context, 'Stopping IoT Agent');

  iotAgentLib.deactivate(function() {
      southboundServer.server.close(callback);
  });
}

exports.start = start;
exports.stop = stop;
