const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
// 信任一层反向代理（Zeabur/云平台前通常有一层）
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());

// 静态托管打包产物（需要在构建阶段生成 dist）
const distDir = path.join(__dirname, '..', 'dist');
app.use(express.static(distDir));

// 健康检查
app.get(['/healthz','/api/healthz'], (req,res)=> res.status(200).send('ok'));

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
  // 这里进行真实DeepSeek连通性测试，占位返回
  const ok = !!sec.endpoint && !!sec.model;
  res.json({ ok, endpoint: sec.endpoint, model: sec.model });
});

const { runPipeline } = require('./plugins/pluginRunner');
app.post('/api/llm/chat', async (req,res) => {
  const body = req.body || {};
  const persona = require('./personas').persona;
  const ctx = { messages: body.messages||[], params: body.params||{}, persona };
  const out = await runPipeline(ctx);
  // Compose reply (mock LLM)
  const last = [...ctx.messages].reverse().find(m=>m.role==='user')?.content||'';
  const reply = `${ctx.tone||'温柔口吻'}：${ctx.weather?`现在${ctx.map.location.city}${ctx.weather.desc}，约${ctx.weather.temp}℃。`:''}${ctx.kbHint?` ${ctx.kbHint}`:''} 我听得出你有些疲惫，不如先深呼吸三次，我给你拉《起风了》。`;
  res.json({ ok:true, reply, meta: { vad: ctx.vad, params: ctx.params, map: ctx.map, results: ctx.results } });
});

// SSE 流式回复（mock），后续可替换为真实DeepSeek流
app.get('/api/llm/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const q = req.query.q ? JSON.parse(req.query.q) : {};
  const persona = require('./personas').persona;
  const ctx = { messages: q.messages||[], params: q.params||{}, persona };
  try{
    await runPipeline(ctx);
    const last = [...ctx.messages].reverse().find(m=>m.role==='user')?.content||'';
    const preface = `${ctx.tone||'温柔口吻'}：`;
    const weatherStr = ctx.weather?`现在${ctx.map?.location?.city||''}${ctx.weather.desc}，约${ctx.weather.temp}℃。`:'';
    const kbStr = ctx.kbHint?` ${ctx.kbHint}`:'';
    const body = `我听得出你有些疲惫，不如先深呼吸三次，我给你拉《起风了》。`;
    const full = `${preface}${weatherStr}${kbStr} ${body}`;

    let i = 0;
    const step = 10; // 每次推送字符数
    const timer = setInterval(() => {
      if (i >= full.length){
        clearInterval(timer);
        res.write(`data: ${JSON.stringify({ type:'done', meta: { vad: ctx.vad, map: ctx.map, params: ctx.params } })}\n\n`);
        res.end();
        return;
      }
      const chunk = full.slice(i, i+step);
      i += step;
      res.write(`data: ${JSON.stringify({ type:'delta', content: chunk })}\n\n`);
    }, 80);

    req.on('close', () => { clearInterval(timer); });
  } catch(e){
    res.write(`data: ${JSON.stringify({ type:'error', message: e.message||'stream error' })}\n\n`);
    res.end();
  }
});

const { persona } = require('./personas');
app.get('/api/personas', (req,res) => {
  res.json([persona]);
});

// SPA 兜底：非 /api/* 的路由回到 index.html，避免前端路由 404
app.get(/^(?!\/api\/).*/, (req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

const port = Number(process.env.PORT || 8787);
app.listen(port, '0.0.0.0', () => console.log(`API server listening on http://0.0.0.0:${port}`));
