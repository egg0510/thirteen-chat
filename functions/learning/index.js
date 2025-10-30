exports.main = async (event, context) => {
  const start = Date.now();
  try {
    const body = event && event.body ? JSON.parse(event.body) : {};
    console.log(JSON.stringify({ level:'info', msg:'learning called', bodyPreview: JSON.stringify(body).slice(0,200) }))
    return { statusCode: 200, body: JSON.stringify({ edit_id:'mock123', status:'pending', ...body }) };
  } catch (err) {
    console.error(JSON.stringify({ level:'error', msg:'learning error', err: String(err) }))
    return { statusCode: 500, body: JSON.stringify({ ok:false, error:'internal_error' }) };
  } finally {
    console.log(JSON.stringify({ level:'info', msg:'learning done', costMs: Date.now()-start }))
  }
};
