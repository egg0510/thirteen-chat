exports.main = async (event, context) => {
  const { path } = event;
  return { statusCode: 200, body: JSON.stringify({ ok:true, plugin:path||'weather', result:'mock' }) };
};
