const numeral = require('numeral');

module.exports = {
  create,
  getResponseOverview,
  getRequests,
  reset,
  registerServerEvents
};

function create(server) {
  const monitor = {
    requests: {},
    responses: {},
    reset
  };

  monitor.getRequests = getRequests(monitor);
  monitor.getResponseOverview = getResponseOverview(monitor);

  registerServerEvents(monitor, server);

  return monitor;
}

function registerServerEvents(monitor, server) {
  server.on('request', (req, res) => {
    const { requests, responses } = monitor;
    const { port } = req.socket.address();

    requests[port] = requests[port] || { total: 0, disconnects: 0, statusCodes: {} };
    requests[port].total += 1;

    req.on('aborted', () => {
      requests[port].disconnects += 1;
    });

    res.on('finish', () => {
      const { statusCode } = res;
      const responseTime = numeral(res.get('X-Response-Time') || 0);

      responses[port] = responses[port] || { count: 0, total: 0, max: 0 };
      responses[port].count += 1;
      responses[port].total += responseTime.value();

      if (responses[port].max < responseTime.value()) {
        responses[port].max = responseTime.value();
      }

      requests[port].statusCodes[statusCode] = requests[port].statusCodes[statusCode] || 0;
      requests[port].statusCodes[statusCode] += 1;
    });
  });
}

function getResponseOverview(monitor) {
  return (callback) => {
    const { responses } = monitor;

    const ports = Object.keys(responses);
    const overview = {};

    for (let i = 0; i < ports.length; i += 1) {
      const port = ports[i];
      const count = responses[port].count || 1;
      const avg = numeral(responses[port].total / count);
      const max = numeral(responses[port].max);

      overview[port] = {
        avg: avg.format('0.0000'),
        max: max.format('0.0000')
      };
    }

    return callback(null, overview);
  };
}

function getRequests(monitor) {
  return (callback) => callback(null, monitor.requests);
}

function reset(monitor) {
  const resetMonitor = Object.assign({}, monitor);
  const { requests, responses } = resetMonitor;
  const ports = Object.keys(requests);

  for (let i = 0; i < ports.length; i += 1) {
    requests[ports[i]] = { total: 0, disconnects: 0, statusCodes: {} };
    responses[ports[i]] = { count: 0, total: 0, max: 0 };
  }

  return resetMonitor;
}
