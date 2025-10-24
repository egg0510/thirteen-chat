module.exports = {
  name: 'PerformanceOptimizerPlugin', priority: 50,
  async run(ctx){
    const type = (ctx.params && ctx.params.mode) || 'chat';
    const temp = type==='code' ? 0.1 : 0.7;
    const maxTokens = type==='code' ? 2048 : 1024;
    ctx.params = ctx.params || {};
    ctx.params.temperature = temp; ctx.params.max_tokens = maxTokens;
    return { ok:true, params: ctx.params };
  }
};
