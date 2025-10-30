const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const { env } = require('./config.cjs');
const { logger } = require('./logger.cjs');
const rateLimit = require('express-rate-limit');

const origins = env.CORS_ORIGINS.split(',').map(s=>s.trim()).filter(Boolean);
app.use(require('cors')({
  origin(origin, cb){
    if(!origin || origins.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(rateLimit({ windowMs: 60_000, max: 60 }));
app.use(express.json({ limit: '1mb' }));

const { randomUUID } = require('crypto');
app.use((req,res,next)=>{ req.traceId = randomUUID(); next(); });

app.get(['/healthz','/api/healthz'], (req,res)=> res.status(200).send('ok'));
app.get('/', (req,res)=> res.status(200).send('ok'));

const dataPath = path.join(__dirname, '..', 'secrets.json');
function readSecrets(){ try { return JSON.parse(fs.readFileSync(dataPath,'utf-8')); } catch { return {}; } }
function writeSecrets(payload){ fs.writeFileSync(dataPath, JSON.stringify(payload, null, 2)); }

app.post('/api/secrets/save', (req,res) => {
  const { endpoint, key, model } = req.body || {};
  const saved = { endpoint, key: key ? 'stored' : undefined, model };
  writeSecrets(saved);
  res.json({ ok:true, saved });
});

app.post('/api/secrets/test', async (req,res) => {
  const sec = readSecrets();
  const ok = !!sec.endpoint && !!sec.model;
  res.json({ ok, endpoint: sec.endpoint, model: sec.model });
});

const { runPipeline } = require('./plugins/pluginRunner.cjs');
const { createSSE } = require('./transports/sseTransport.cjs');
app.post('/api/llm/chat', async (req,res) => {
  const body = req.body || {};
  const persona = require('./personas.cjs').persona;
  const ctx = { messages: body.messages||[], params: body.params||{}, persona, traceId: req.traceId };
  const out = await runPipeline(ctx);
  const last = [...ctx.messages].reverse().find(m=>m.role==='user')?.content||'';
  const reply = `${ctx.tone||'温柔口吻'}：${ctx.weather?`现在${ctx.map?.location?.city||''}${ctx.weather.desc}，约${ctx.weather.temp}℃。`:''}${ctx.kbHint?` ${ctx.kbHint}`:''} 我听得出你有些疲惫，不如先深呼吸三次，我给你拉《起风了》。`;
  res.json({ ok:true, reply, meta: { vad: ctx.vad, params: ctx.params, map: ctx.map, results: ctx.results } });
});

// SSE 流式回复（mock），后续可替换为真实DeepSeek流
app.get('/api/llm/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const q = req.query.q ? JSON.parse(req.query.q) : {};
  const persona = require('./personas.cjs').persona;
  const ctx = { messages: q.messages||[], params: q.params||{}, persona, traceId: req.traceId };
  const transport = createSSE(res);
  // Support Last-Event-ID header for client resume
  const lastEventId = req.headers['last-event-id'] || req.get && req.get('Last-Event-ID');
  if (lastEventId) transport.start(lastEventId);
  try{
    await runPipeline(ctx);
    const preface = `${ctx.tone||'温柔口吻'}：`;
    const weatherStr = ctx.weather?`现在${ctx.map?.location?.city||''}${ctx.weather.desc}，约${ctx.weather.temp}℃。`:'';
    const kbStr = ctx.kbHint?` ${ctx.kbHint}`:'';
    const body = `我听得出你有些疲惫，不如先深呼吸三次，我给你拉《起风了》。`;
    const full = `${preface}${weatherStr}${kbStr} ${body}`;

    let i = 0;
    const step = 10;
    const timer = setInterval(() => {
      if (i >= full.length){
        clearInterval(timer);
        transport.sendMeta({ vad: ctx.vad, map: ctx.map, params: ctx.params });
        transport.end();
        return;
      }
      const chunk = full.slice(i, i+step);
      i += step;
      transport.sendDelta({ content: chunk });
    }, 80);

    req.on('close', () => { clearInterval(timer); transport.end(); });
  } catch(e){
    transport.sendError({ message: e.message||'stream error' });
    transport.end();
  }
});

const { persona } = require('./personas.cjs');
app.get('/api/personas', (req,res) => {
  res.json([persona]);
});

const port = Number(process.env.PORT || 8787);
app.listen(port, '0.0.0.0', () => console.log(`API server listening on http://0.0.0.0:${port}`));
