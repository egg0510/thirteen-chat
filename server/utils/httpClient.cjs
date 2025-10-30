const https = require('node:https');

const agent = new https.Agent({ keepAlive: true, timeout: 30_000, maxSockets: 50 });

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

function isRetryable(status, err){
  if (err) return true; // 网络/超时/中断类错误
  return status === 429 || (status >= 500 && status < 600);
}

async function httpRequest(url, { method = 'POST', headers = {}, body, timeoutMs = 30_000, maxRetries = 2 } = {}){
  let attempt = 0; let lastErr;
  while (attempt <= maxRetries){
    const controller = new AbortController();
    const id = setTimeout(()=>controller.abort(), timeoutMs);
    try{
      const res = await fetch(url, { method, headers, body, signal: controller.signal, agent });
      clearTimeout(id);
      if (!res.ok){
        if (isRetryable(res.status)){
          const backoff = Math.min(1000 * (2 ** attempt), 5000) + Math.random()*200;
          attempt++; await sleep(backoff); continue;
        }
        const txt = await res.text().catch(()=> '');
        throw new Error(`HTTP ${res.status} ${res.statusText} ${txt}`);
      }
      return res;
    } catch(e){
      clearTimeout(id); lastErr = e;
      const backoff = Math.min(1000 * (2 ** attempt), 5000) + Math.random()*200;
      attempt++;
      if (attempt > maxRetries) break;
      await sleep(backoff);
    }
  }
  throw lastErr;
}

module.exports = { httpRequest };