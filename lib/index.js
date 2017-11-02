const bunyan = require('bunyan');
const numeral = require('numeral');

const createOpsMonitor = require('./ops');

module.exports = (server, logger, options) => {
  const settings = options || {};
  const log = logger || bunyan.createLogger({ name: 'Lops' });
  const level = settings.level || 'info';

  const ops = createOpsMonitor(server);

  ops.on('ops', (data) => {
    const memory = Math.round(data.psmem.rss / (1024 * 1024));
    const load1m = numeral(data.osload[0]).format('0.0000');
    const load5m = numeral(data.osload[1]).format('0.0000');
    const load15m = numeral(data.osload[2]).format('0.0000');

    const output = [
      {
        memory: `${memory}Mb`,
        uptime: `${data.psup}s`,
        load1m,
        load5m,
        load15m
      },
      '[ops]'
    ];

    log[level](...output);
  });

  ops.on('error', log.error);

  ops.start(7000);
};
