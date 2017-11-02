const os = require('os');
const async = require('async');

const { EventEmitter } = require('events');

const osMonitor = require('./monitors/os');
const processMonitor = require('./monitors/process');
const networkMonitor = require('./monitors/network');

const { isValidInterval } = require('./utils');

function opsMonitor(app) {
  const host = os.hostname();
  const server = app;
  const network = networkMonitor.create(server);
  const tasks = {
    osload: osMonitor.avgLoad,
    osmem: osMonitor.memory,
    osup: osMonitor.upTime,
    psup: processMonitor.upTime,
    psmem: processMonitor.memoryUsage,
    pstime: processMonitor.elapsedTime,
    requests: network.getRequests,
    responses: network.getResponseOverview
  };

  let eventInterval;

  const monitor = { start, stop };
  EventEmitter.call(monitor);

  return Object.assign(monitor, EventEmitter.prototype);

  function start(interval) {
    if (!isValidInterval(interval)) {
      throw new Error('Interval must be less than 2147483647');
    }

    eventInterval = setupListenerIntervals(monitor, host, interval, tasks);
  }

  function stop() {
    clearInterval(eventInterval);
    monitor.emit('stop');
  }
}

function setupListenerIntervals(monitor, host, interval, tasks) {
  return setInterval(() => {
    async.parallel(tasks, (err, results) => {
      if (err) {
        monitor.emit('error');
      } else {
        const resultsClone = Object.assign({}, results);
        resultsClone.host = host;

        monitor.emit('ops', resultsClone);
      }
    });
  }, interval);
}

module.exports = opsMonitor;
