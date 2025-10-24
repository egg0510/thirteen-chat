// CloudBase 云函数：DeepSeek 代理占位
exports.main = async (event, context) => {
  const body = event.body ? JSON.parse(event.body) : {};
  return { statusCode: 200, body: JSON.stringify({ ok: true, echo: body, note: 'Connect DeepSeek here via server-side key' }) };
};
