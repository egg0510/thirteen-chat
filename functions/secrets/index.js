// 保存DeepSeek密钥与端点（待接入数据库）
exports.main = async (event, context) => {
  const body = event.body ? JSON.parse(event.body) : {};
  // TODO: 写入 CloudBase 数据库 'secrets'
  return { statusCode: 200, body: JSON.stringify({ ok:true, saved: { endpoint: body.endpoint, key:'stored' } }) };
};
