/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Kinesis = require('aws-sdk/clients/kinesis');
const debug = require('debug')('engine:kinesis');
const A = require('async');
const _ = require('lodash');

function KinesisEngine (script, ee, helpers) {
  this.script = script;
  this.ee = ee;
  this.helpers = helpers;

  return this;
}

KinesisEngine.prototype.createScenario = function createScenario (scenarioSpec, ee) {
  const tasks = scenarioSpec.flow.map(rs => this.step(rs, ee));

  return this.compile(tasks, scenarioSpec.flow, ee);
};

KinesisEngine.prototype.step = function step (rs, ee) {
  const self = this;

  if (rs.loop) {
    const steps = rs.loop.map(loopStep => this.step(loopStep, ee));

    return this.helpers.createLoopWithCount(rs.count || -1, steps);
  }

  if (rs.log) {
    return function log (context, callback) {
      return process.nextTick(function () { callback(null, context); });
    };
  }

  if (rs.think) {
    return this.helpers.createThink(rs, _.get(self.config, 'defaults.think', {}));
  }

  if (rs.function) {
    return function (context, callback) {
      let func = self.script.config.processor[rs.function];
      if (!func) {
        return process.nextTick(function () { callback(null, context); });
      }

      return func(context, ee, function () {
        return callback(null, context);
      });
    };
  }

  if (rs.putRecord) {
    return function putRecord (context, callback) {
      const data = typeof rs.putRecord.data === 'object'
            ? JSON.stringify(rs.putRecord.data)
            : String(rs.putRecord.data);

      const params = {
        Data: data,
        PartitionKey: rs.putRecord.partitionKey,
        StreamName: rs.putRecord.streamName || self.script.config.target,
        ExplicitHashKey: rs.putRecord.explicitHashKey,
        SequenceNumberForOrdering: rs.putRecord.sequenceNumberForOrdering
      };

      ee.emit('request');
      context.kinesis.putRecord(params, function (err, data) {
        if (err) {
          debug(err);
          ee.emit('error', err);
          return callback(err, context);
        }

        ee.emit('response', 0, 0, context._uid); // FIXME
        debug(data);
        return callback(null, context);
      });
    };
  }

  return function (context, callback) {
    return callback(null, context);
  };
};

KinesisEngine.prototype.compile = function compile (tasks, scenarioSpec, ee) {
  const self = this;
  return function scenario (initialContext, callback) {
    const init = function init (next) {
      let opts = {
        region: self.script.config.kinesis.region || 'us-east-1'
      };

      if (self.script.config.kinesis.endpoint) {
        opts.endpoint = self.script.config.kinesis.endpoint;
      }

      initialContext.kinesis = new Kinesis(opts);
      ee.emit('started');
      return next(null, initialContext);
    };

    let steps = [init].concat(tasks);

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

module.exports = KinesisEngine;
