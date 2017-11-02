module.exports = {
  makeAsync,
  currentTime,
  elapsed,
  isValidInterval
};

function makeAsync(predicate) {
  return (callback) => process.nextTick(callback, null, predicate());
}

function currentTime() {
  const ts = process.hrtime();
  return (ts[0] * 1e3) + (ts[1] / 1e6);
}

function elapsed(timestamp) {
  return currentTime() - timestamp;
}

function isValidInterval(interval) {
  return interval <= 2147483647;
}
