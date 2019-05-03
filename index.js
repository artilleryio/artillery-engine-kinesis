/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const sqs = require('aws-sdk/clients/sqs');
const debug = require('debug')('engine:sqs');
const A = require('async');

const _ = require('lodash');

const stepHandlers = require('./stepHandlers');

let engineUtil, script, ee;

function SqsEngine (_script, _ee, _engineUtil) {
  engineUtil = _engineUtil;
  script = _script;
  ee = _ee;

  return this;
}

SqsEngine.prototype.createScenario = function createScenario (scenarioSpec, ee) {
  const tasks = scenarioSpec.flow.map(rs => this.step(rs, ee));
  return this.compile(tasks, scenarioSpec.flow, ee);
};

SqsEngine.prototype.step = function step (rs, ee) {
  const handlers = stepHandlers({
    engineUtil,
    script,
    rs,
    ee
  });

  if (rs.loop) {
    return handlers.createLoopHandler(this.step);
  }

  if (rs.log) {
    return handlers.createLogHandler(this.step);
  }

  if (rs.think) {
    return handlers.createThinkHandler(this.step);
  }

  if (rs.function) {
    return handlers.createFunctionHandler(this.step);
  }

  if (rs.sendMessage) {
    return handlers.createSendMessageHandler(this.step);
  }

  return function (context, callback) {
    return callback(null, context);
  };
};

SqsEngine.prototype.compile = function compile (tasks, scenarioSpec, ee) {
  return function scenario (initialContext, callback) {
    const init = function init (next) {
      let opts = {
        region: script.config.sqs.region || 'us-east-1'
      };

      initialContext.sqs = new sqs(opts);
      ee.emit('started');
      return next(null, initialContext);
    };

    const steps = [init].concat(tasks);

    A.waterfall(
      steps,
      function done (err, context) {
        if (err) {
          debug(err);
        }

        return callback(err, context);
      });
  };
};

module.exports = SqsEngine;
