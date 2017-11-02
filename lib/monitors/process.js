const { makeAsync, currentTime, elapsed } = require('../utils');

module.exports = {
  elapsedTime,
  upTime: makeAsync(process.uptime),
  memoryUsage: makeAsync(process.memoryUsage)
};

function elapsedTime(callback) {
  const now = currentTime();

  setImmediate(() => callback(null, elapsed(now)));
}
