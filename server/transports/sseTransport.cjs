function createSSE(res){
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  // Safely stringify data and escape newlines to keep SSE lines intact
  const safeJson = (obj) => {
    try{ return JSON.stringify(obj).replace(/\n/g, '\\n'); } catch(e){ return JSON.stringify({ error: String(e) }); }
  };
  let eventId = 0;
  const send = (event, data) => {
    eventId += 1;
    const idLine = `id: ${eventId}\n`;
    res.write(idLine + `event: ${event}\n` + `data: ${safeJson(data)}\n\n`);
  };
  const ping = setInterval(()=> send('ping', {}), 15000);
  res.flushHeaders && res.flushHeaders();
  res.on('close', ()=> clearInterval(ping));
  return {
    start(lastEventId){
      const n = Number(lastEventId);
      if (!Number.isNaN(n) && n >= 0) eventId = n;
    },
    sendDelta(d){ send('delta', d); },
    sendMeta(m){ send('meta', m); },
    sendError(e){ send('error', { message: e?.message || String(e) }); },
    end(){ clearInterval(ping); send('done', {}); try{ res.end(); }catch(e){} }
  };
}
module.exports = { createSSE };