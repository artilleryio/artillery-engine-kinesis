const getStepType = (rs) => {
  if (rs.loop) {
    return 'loop';
  } else if (rs.log) {
    return 'log';
  }  else if (rs.think) {
    return 'think';
  } else if (rs.function) {
    return 'function';
  } else if (rs.sendMessage) {
    return 'sendMessage';
  } else {
    return 'default';
  }
};

module.exports = { getStepType };
