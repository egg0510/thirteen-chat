module.exports = {
  name: 'ContextManagerPlugin', priority: 70,
  async run(ctx){
    const max = (ctx.params && ctx.params.maxContext) || 8;
    ctx.context = Array.isArray(ctx.messages) ? ctx.messages.slice(-max) : [];
    return { ok:true, contextLen: ctx.context.length };
  }
};
