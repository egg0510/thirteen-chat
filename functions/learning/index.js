exports.main = async (event, context) => {
  const body = event.body ? JSON.parse(event.body) : {};
  return { statusCode: 200, body: JSON.stringify({ edit_id:'mock123', status:'pending', ...body }) };
};
