module.exports = {
  name: 'KnowledgeBasePlugin', priority: 60,
  async run(ctx){
    const hint = Array.isArray(ctx.messages) && ctx.messages.some(m=>/天气|温度|下雨/.test(m.content)) ? '本周小镇多云有风，夜间气温偏低。' : '';
    ctx.kbHint = hint;
    return { ok:true, kbHint: hint };
  }
};
