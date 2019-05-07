/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const compiler = require('./lib/compiler');

let compile;

function SqsEngine (script, ee, engineUtil) {
  compile = compiler.create({ script, engineUtil });
  return this;
}

SqsEngine.prototype.createScenario = function createScenario (scenarioSpec, ee) {
  return compile(scenarioSpec, ee);
};

module.exports = SqsEngine;
