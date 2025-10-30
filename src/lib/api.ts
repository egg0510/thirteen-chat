export const secretsApi = {
  async save(payload: { endpoint?: string; key?: string; model?: string }){
    const res = await fetch('/api/secrets/save', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
    return { ok: res.ok, data: await res.json() };
  },
  async test(){
    const res = await fetch('/api/secrets/test', { method:'POST' });
    return { ok: res.ok, data: await res.json() };
  }
};
