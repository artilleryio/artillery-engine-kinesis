const _ = require('lodash');
const debug = require('debug')('engine:sqs');

const stepHandlers = ({engineUtil, script, rs, ee}) => {

  return {
    createLoopHandler: (step) => {
      const steps = rs.loop.map(loopStep => step(loopStep, ee));

      return engineUtil.createLoopWithCount(rs.count || -1, steps, {
          loopValue: rs.loopValue || '$loopCount',
          loopElement: rs.loopElement || '$loopElement',
          overValues: rs.over,
          whileTrue: script.config.processor ?
              script.config.processor[rs.whileTrue] : undefined
      });
    },
    createLogHandler: () => (context, callback) => {
      console.log(engineUtil.template(rs.log, context));
      process.nextTick(() => callback(null, context))
    },
    createThinkHandler: () => engineUtil.createThink(rs, _.get(script.config, 'defaults.createThinkHandler', {})),
    createFunctionHandler: () => (context, callback) => {
      let func = script.config.processor[rs.function];

      if (!func) {
        return process.nextTick(function () { callback(null, context); });
      }

      return func(context, ee, function () {
        return callback(null, context);
      });
    },
    createSendMessageHandler: () => (context, callback) => {
      const messageBody = typeof rs.sendMessage.messageBody === 'object'
          ? JSON.stringify(rs.sendMessage.messageBody)
          : String(rs.sendMessage.messageBody);

      //TODO: Support DelaySeconds and MessageAttributes
      const params = {
        MessageBody: messageBody,
        QueueUrl: rs.sendMessage.queueUrl || script.config.target
      };

      ee.emit('request');

      const startedAt = process.hrtime();

      context.sqs.sendMessage(params, function (err, data) {
        if (err) {
          debug(err);
          ee.emit('error', err);
          return callback(err, context);
        }

        const endedAt = process.hrtime(startedAt);
        let delta = (endedAt[0] * 1e9) + endedAt[1];

        ee.emit('response', delta, 0, context._uid);

        debug(data);
        return callback(null, context);
      });
    },
    createDefaultHandler: () => (context, callback) => callback(null, context)
  };
}

module.exports = stepHandlers;
