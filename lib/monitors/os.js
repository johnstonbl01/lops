const os = require('os');

const { makeAsync } = require('../utils');

module.exports = {
  memory: memoryUsage(),
  avgLoad: makeAsync(os.loadavg),
  upTime: makeAsync(os.uptime)
};

function memoryUsage() {
  return makeAsync(() => ({ total: os.totalmem(), free: os.freemem() }));
}
