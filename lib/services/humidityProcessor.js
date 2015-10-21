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

var temperatures = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60],
    matrix = [
    [20, 999999, 15000, 11000, 8200, 6300, 4900, 4000, 3300, 2800, 2500, 2200, 2100],
    [25, 10000, 7400, 5300, 3900, 3000, 2300, 1800, 1500, 1300, 1100, 1000, 920],
    [30, 4800, 3400, 2400, 1800, 1400, 1100, 870, 710, 600, 510, 450, 410],
    [35, 2100, 1500, 1100, 820, 630, 490, 390, 320, 270, 230, 200, 180],
    [40, 980, 700, 520, 400, 310, 240, 190, 160, 130, 110, 100, 91],
    [45, 480, 350, 260, 200, 160, 120, 100, 86, 73, 63, 55, 50],
    [50, 250, 190, 140, 110, 87, 74, 61, 51, 44, 38, 34, 30],
    [55, 130, 100, 80, 64, 49, 43, 36, 30, 26, 23, 21, 19],
    [60, 73, 57, 46, 37, 31, 26, 22, 19, 17, 15, 14, 13],
    [65, 41, 32, 27, 22, 19, 16, 14, 12, 11, 10, 9.2, 8.6],
    [70, 23, 19, 16, 14, 11.8, 10.2, 9.1, 8.2, 7.5, 6.9, 6.5, 6.1],
    [75, 13, 11, 9.5, 8.4, 7.5, 6.7, 6.1, 5.6, 5.2, 4.9, 4.6, 4.4],
    [80, 7.2, 6.4, 5.8, 5.2, 4.8, 4.4, 4.1, 3.8, 3.6, 3.4, 3.3, 3.2],
    [85, 4, 3.7, 3.5, 3.3, 3, 2.9, 2.8, 2.6, 2.5, 2.4, 2.4, 2.3],
    [90, 2.2, 2.2, 2.1, 2, 2, 1.9, 1.8, 1.8, 1.7, 1.7, 1.7, 1.6]];

/**
 * Returns the index for the first row of the matrix matching the temperature. The returned
 * index is the one with the closest value to the one passed as the parameter.
 *
 * @param {Number} temperature
 * @return {Number}                 The index in the temperature array.
 */
function getTempIndex(temperature) {
    var i;

    for (i = 0; i < temperatures.length; i++) {
        if (temperatures[i] > temperature) {
            break;
        }
    }

    return (i !== 0) ? i - 1 : 0;
}
/**
 * Returns the humidity given a raw value from the humidity sensor and the temperature.
 *
 * @param {Number} temperature
 * @param {Number} humidity
 * @return {Number}                 The resultant percentage of humidity.
 */
function calculateHumidity(temperature, humidity) {
    var value = humidity / 1000,
        temperatureIndex = getTempIndex(temperature),
        i;

    for (i = 0; i < matrix.length; i++) {
        if (Math.abs(matrix[i][temperatureIndex] < value)) {
            break;
        }
    }

    return matrix[(i !== 0) ? i - 1 : 0][0];
}

exports.calculate = calculateHumidity;
