const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
// 信任一层反向代理，修复 X-Forwarded-For 校验错误（rate-limit 依赖 req.ip）
app.set('trust proxy', 1);
const { env } = require('./config.cjs');
const { logger } = require('./logger.cjs');
const rateLimit = require('express-rate-limit');

const allowAll = (env.CORS_ORIGINS || '*').trim() === '*';
const origins = (env.CORS_ORIGINS || '').split(',').map(s=>s.trim()).filter(Boolean);
app.use(require('cors')({
  origin(origin, cb){
    if (!origin) return cb(null, true); // 非浏览器/同源简单请求
    if (allowAll) return cb(null, true);
    if (origins.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: allowAll ? false : true
}));

app.use(rateLimit({ windowMs: 60_000, max: 60 }));
app.use(express.json({ limit: '1mb' }));

// 静态托管打包产物（确保构建阶段生成 dist）
const distDir = path.join(__dirname, '..', 'dist');
app.use(express.static(distDir));

const { randomUUID } = require('crypto');
app.use((req,res,next)=>{ req.traceId = randomUUID(); next(); });

app.get(['/healthz','/api/healthz'], (req,res)=> res.status(200).send('ok'));

const dataPath = path.join(__dirname, '..', 'secrets.json');
function readSecrets(){ try { return JSON.parse(fs.readFileSync(dataPath,'utf-8')); } catch { return {}; } }
function writeSecrets(payload){ fs.writeFileSync(dataPath, JSON.stringify(payload, null, 2)); }

app.post('/api/secrets/save', (req,res) => {
  const { endpoint, key, model } = req.body || {};
  // 安全起见仅保存在服务器本地文件中，不回显 key；若未传 key 则保留旧值
  const prev = readSecrets();
  const toSave = { endpoint: endpoint || prev.endpoint, key: key || prev.key, model: model || prev.model };
  writeSecrets(toSave);
  res.json({ ok:true, saved: { endpoint: toSave.endpoint, model: toSave.model, key: !!toSave.key ? 'stored' : undefined } });
});

app.post('/api/secrets/test', async (req,res) => {
  const sec = readSecrets();
  try{
    const { quickProbe } = require('./services/deepseek.cjs');
    const ok = await quickProbe(sec);
    res.json({ ok, endpoint: sec.endpoint, model: sec.model });
  } catch(e){
    res.status(500).json({ ok:false, error: String(e.message||e) });
  }
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

// SSE 流式回复（DeepSeek 代理）
app.get('/api/llm/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const q = req.query.q ? JSON.parse(req.query.q) : {};
  const transport = createSSE(res);
  try{
    const sec = readSecrets();
    // 将前端消息直接转为 DeepSeek 兼容参数
    const payload = { model: sec.model || 'deepseek-chat', messages: q.messages || [], temperature: 0.7 };
    const { chatCompletionStream } = require('./services/deepseek.cjs');
    const upstream = await chatCompletionStream(sec, payload, { timeoutMs: 120_000 });

    // 读取 DeepSeek SSE 并转发为 delta/done 事件（OpenAI 兼容格式）
    const reader = upstream.body.getReader ? upstream.body.getReader() : null;
    const decoder = new TextDecoder();

    async function readStream(){
      if (reader){
        while(true){
          const { value, done } = await reader.read();
          if (done) break;
          handleChunk(decoder.decode(value, { stream: true }));
        }
      } else {
        for await (const chunk of upstream.body){
          handleChunk(Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk));
        }
      }
      transport.sendMeta({ done: true });
      transport.end();
    }

    function handleChunk(text){
      const lines = text.split(/\n/);
      for (const line of lines){
        const l = line.trim();
        if (!l || !l.startsWith('data:')) continue;
        const data = l.slice(5).trim();
        if (data === '[DONE]'){ continue; }
        try{
          const json = JSON.parse(data);
          const content = json.choices?.[0]?.delta?.content || '';
          if (content) transport.sendDelta({ content });
        } catch(e){ /* ignore parse errors */ }
      }
    }

    readStream().catch(err=>{
      transport.sendError({ message: err.message||String(err) });
      transport.end();
    });

    req.on('close', () => { transport.end(); });
  } catch(e){
    transport.sendError({ message: e.message||'stream error' });
    transport.end();
  }
});

const { persona } = require('./personas.cjs');
app.get('/api/personas', (req,res) => {
  res.json([persona]);
});

// SPA 兜底：非 /api/* 的路由回到 index.html，避免前端路由刷新 404
app.get(/^(?!\/api\/).*/, (req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

const port = Number(process.env.PORT || 8787);
app.listen(port, '0.0.0.0', () => console.log(`API server listening on http://0.0.0.0:${port}`));
