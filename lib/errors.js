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

module.exports = {
    BadPayload: function(payload) {
        this.name = 'BAD_PAYLOAD';
        this.message = 'The request payload [' + payload + '] could not be parsed';
        this.code = 400;
    },
    UnsupportedModule: function(payload) {
        this.name = 'UNSUPPORTED_MODULE';
        this.message = 'The module in request [' + payload + '] is not supported';
        this.code = 500;
    },
    UnknownDevice: function() {
        this.name = 'UNKNOWN_DEVICE';
        this.message = 'Could not find a registration or service for the device.';
        this.code = 404;
    }
};
