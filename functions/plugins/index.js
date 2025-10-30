exports.main = async (event, context) => {
  const start = Date.now();
  try {
    const { path } = event || {};
    console.log(JSON.stringify({ level:'info', msg:'plugins called', path }))
    return { statusCode: 200, body: JSON.stringify({ ok:true, plugin:path||'weather', result:'mock' }) };
  } catch (err) {
    console.error(JSON.stringify({ level:'error', msg:'plugins error', err: String(err) }))
    return { statusCode: 500, body: JSON.stringify({ ok:false, error:'internal_error' }) };
  } finally {
    console.log(JSON.stringify({ level:'info', msg:'plugins done', costMs: Date.now()-start }))
  }
};
