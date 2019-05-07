const debug = require('debug')('engine:sqs');
const sqs = require('aws-sdk/clients/sqs');
const A = require('async');

const stepper = require('./stepper');

let engineUtil, script, step;

const compile = (scenarioSpec, ee) => (initialContext, callback) => {
  const tasks = scenarioSpec.flow.map(rs => step(rs, ee));

  const init = function init (next) {
    let opts = {
      region: script.config.sqs.region || 'us-east-1'
    };

    initialContext.sqs = new sqs(opts);
    ee.emit('started');
    return next(null, initialContext);
  };

  const steps = [init].concat(tasks);

  const done = function done (err, context) {
    if (err) {
      debug(err);
    }

    return callback(err, context);
  };

  A.waterfall(steps, done);
};

module.exports = {
  create: (dependencies) => {
    engineUtil = dependencies.engineUtil;
    script = dependencies.script;
    step = stepper.create({ script, engineUtil });
    return compile;
  }
};
