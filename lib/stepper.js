const util = require('./util');
const handlerFactory = require('./handlers');

let script, engineUtil, stepHandlers;

const step = (rs, ee) => {
  const injections = { rs, ee };

  const handlers = stepHandlers(injections);

  switch (util.getStepType(rs)) {
    case 'loop':
      return handlers.createLoopHandler();
    case 'log':
      return handlers.createLogHandler();
    case 'think':
      return handlers.createThinkHandler();
    case 'function':
      return handlers.createFunctionHandler();
    case 'sendMessage':
      return handlers.createSendMessageHandler();
    default:
      return handlers.createDefaultHandler();
  }
};

module.exports = {
  create: (dependencies) => {
    script = dependencies.script;
    engineUtil = dependencies.engineUtil;
    stepHandlers = handlerFactory.create({ script, engineUtil, step });
    return step;
  }
};
