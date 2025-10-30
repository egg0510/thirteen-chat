const { httpRequest } = require('../utils/httpClient.cjs');

function resolveBase(sec){
  return (sec && sec.endpoint) || process.env.DEEPSEEK_API_BASE || 'https://api.deepseek.com';
}

function headers(sec, stream=false){
  const key = (sec && sec.key) || process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error('Missing DeepSeek API key');
  return {
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    ...(stream ? { 'Accept': 'text/event-stream' } : {}),
  };
}

async function chatCompletion(sec, payload, { timeoutMs = 60_000 } = {}){
  const url = `${resolveBase(sec)}/v1/chat/completions`;
  const res = await httpRequest(url, {
    headers: headers(sec, false),
    body: JSON.stringify({ ...payload, stream: false }),
    timeoutMs
  });
  return res.json();
}

async function chatCompletionStream(sec, payload, { timeoutMs = 120_000 } = {}){
  const url = `${resolveBase(sec)}/v1/chat/completions`;
  const res = await httpRequest(url, {
    headers: headers(sec, true),
    body: JSON.stringify({ ...payload, stream: true }),
    timeoutMs
  });
  if (!res.body) throw new Error('No response body');
  return res;
}

async function quickProbe(sec){
  try{
    const data = await chatCompletion(sec, { model: (sec && sec.model) || 'deepseek-chat', messages: [{ role:'user', content:'ping' }] }, { timeoutMs: 10_000 });
    return !!data && (data.id || data.choices);
  } catch(e){ return false; }
}

module.exports = { chatCompletion, chatCompletionStream, quickProbe };