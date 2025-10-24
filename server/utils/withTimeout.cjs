function withTimeout(promise, ms, name='task'){
  let t;
  const timeout = new Promise((_, rej) => { t = setTimeout(() => rej(new Error(`${name} timeout after ${ms}ms`)), ms); });
  return Promise.race([promise.finally(()=> clearTimeout(t)), timeout]);
}
module.exports = { withTimeout };