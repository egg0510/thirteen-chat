function createSSE(res){
  let started = false; let id = 0;
  function start(lastId){ if (started) return; started = true; res.flushHeaders && res.flushHeaders(); }
  function send(event, data){
    if (!started) start();
    id++;
    if (event) res.write(`event: ${event}\n`);
    res.write(`id: ${id}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }
  return {
    start,
    sendDelta(payload){ send('message', { type:'delta', ...payload }); },
    sendMeta(meta){ send('message', { type:'done', meta }); },
    sendError(err){ send('message', { type:'error', ...err }); },
    end(){ try{ res.end(); } catch{ /* noop */ } }
  };
}

module.exports = { createSSE };