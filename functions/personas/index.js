exports.main = async (event, context) => {
  return { statusCode: 200, body: JSON.stringify([{ name:'十三·默认', traits:['温暖','理性'], prompt_template:'你是十三...' }]) };
};
