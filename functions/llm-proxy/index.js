// CloudBase 云函数：DeepSeek 代理占位
exports.main = async (event, context) => {
  const start = Date.now();
  try {
    const body = event && event.body ? JSON.parse(event.body) : {};
    console.log(JSON.stringify({ level:'info', msg:'llm-proxy called', bodyPreview: JSON.stringify(body).slice(0,200) }))
    return { statusCode: 200, body: JSON.stringify({ ok: true, echo: body, note: 'Connect DeepSeek here via server-side key' }) };
  } catch (err) {
    console.error(JSON.stringify({ level:'error', msg:'llm-proxy error', err: String(err) }))
    return { statusCode: 500, body: JSON.stringify({ ok:false, error:'internal_error' }) };
  } finally {
    console.log(JSON.stringify({ level:'info', msg:'llm-proxy done', costMs: Date.now()-start }))
  }
};
