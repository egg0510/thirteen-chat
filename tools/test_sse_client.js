const http = require('http'); // keep as cjs; will rename and run as .cjs
const url = require('url');

const q = encodeURIComponent(JSON.stringify({ messages: [{ role: 'user', content: 'stream test' }] }));
const options = url.parse(`http://localhost:8787/api/llm/stream?q=${q}`);
options.headers = { 'Accept': 'text/event-stream' };

console.log('Connecting to', options.href || options.path);

const req = http.request(options, (res) => {
  res.setEncoding('utf8');
  let buffer = '';
  let events = 0;
  res.on('data', chunk => {
    buffer += chunk;
    let parts = buffer.split('\n\n');
    buffer = parts.pop();
    for (const part of parts) {
      if (!part.trim()) continue;
      const lines = part.split('\n');
      let ev = { event: 'message', data: '' };
      for (const line of lines) {
        if (line.startsWith('event:')) ev.event = line.replace(/^event:\s*/, '').trim();
        else if (line.startsWith('data:')) ev.data += line.replace(/^data:\s*/, '') + '\n';
      }
      ev.data = ev.data.replace(/\n$/,'');
      console.log('----EVENT----');
      console.log('event:', ev.event);
      try{ console.log('data:', JSON.parse(ev.data)); } catch(e){ console.log('data(raw):', ev.data); }
      events++;
      if (events >= 10 || ev.event === 'done') {
        console.log('Received', events, 'events; closing.');
        req.abort();
        process.exit(0);
      }
    }
  });
  res.on('end', () => { console.log('res end'); process.exit(0); });
});
req.on('error', (e)=>{ console.error('request error', e.message); process.exit(1); });
req.end();
