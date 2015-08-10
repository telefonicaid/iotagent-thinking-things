/*
 * Copyright 2015 Telefonica Investigación y Desarrollo, S.A.U
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

describe('Black button testing', function() {
    describe('When a creation operation arrives from the device: ', function() {
        it('should update all the device data in the Context Broker entity');
    });
    describe('When a polling operation arrives from the device: ', function() {
        it('should return the current state');
        it('should return the extra data if available');
    });
    describe('When a polling operation arrives from the device and the request was failed: ', function() {
        it('should return the appropriate error code');
        it('should return the extra information if available');
    });
    describe('When a request close operation arrives from the device: ', function() {
        it('should update the status in the Context Broker');
    });
});
