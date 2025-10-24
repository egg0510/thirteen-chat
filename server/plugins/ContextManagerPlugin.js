module.exports = {
  name: 'ContextManagerPlugin', priority: 70,
  async run(ctx){
    // Trim context by token budget (mock)
    const max = ctx.params.maxContext || 8;
    ctx.context = ctx.messages.slice(-max);
    return { ok:true, contextLen: ctx.context.length };
  }
};
