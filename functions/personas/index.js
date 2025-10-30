exports.main = async (event, context) => {
  const start = Date.now();
  try {
    console.log(JSON.stringify({ level:'info', msg:'personas called', eventPreview: typeof event==='string'?event.slice(0,200):event }))
    return { statusCode: 200, body: JSON.stringify([{ name:'十三·默认', traits:['温暖','理性'], prompt_template:'你是十三...' }]) };
  } catch (err) {
    console.error(JSON.stringify({ level:'error', msg:'personas error', err: String(err) }))
    return { statusCode: 500, body: JSON.stringify({ ok:false, error:'internal_error' }) };
  } finally {
    console.log(JSON.stringify({ level:'info', msg:'personas done', costMs: Date.now()-start }))
  }
};
